const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');

router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalDonations, pendingRequests, completedDonations] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Request.countDocuments({ status: 'PENDING' }),
      Donation.countDocuments({ status: 'COMPLETED' }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalDonations,
        pendingRequests,
        completedDonations,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load admin dashboard' });
  }
});

router.get('/users', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
});

router.put('/users/:id/verify', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.verificationStatus = 'VERIFIED';
  await user.save();
  res.json({ user });
});

router.put('/users/:id/suspend', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.verificationStatus = 'SUSPENDED';
  user.isActive = false;
  await user.save();
  res.json({ user });
});

router.put('/users/:id/reactivate', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.verificationStatus = 'VERIFIED';
  user.isActive = true;
  await user.save();
  res.json({ user });
});

router.get('/donations', protect, authorize('admin'), async (req, res) => {
  const donations = await Donation.find().sort({ createdAt: -1 });
  res.json({ donations });
});

router.get('/requests', protect, authorize('admin'), async (req, res) => {
  const requests = await Request.find().populate('donationId').populate('receiverId');
  res.json({ requests });
});

module.exports = router;
