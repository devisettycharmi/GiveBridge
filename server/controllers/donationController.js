const Donation = require('../models/Donation');
const Request = require('../models/Request');
const User = require('../models/User');

exports.createDonation = async (req, res) => {
  try {
    const { 
      title,
      category,
      description,
      quantity,
      unit,
      condition,
      expiryDate,
      pickupPreference,
      city,
      area,
      state,
      pincode,
      latitude,
      longitude,
    } = req.body;

    if (!title || !category || !description || !quantity || !unit || !city) {
      return res.status(400).json({ message: 'Please provide all required donation details' });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      title,
      category,
      description,
      quantity: Number(quantity),
      remainingQuantity: Number(quantity),
      unit,
      condition,
      expiryDate,
      pickupPreference,
      city,
      area,
      state,
      pincode,
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [Number(longitude || 0), Number(latitude || 0)],
      },
      images: req.body.images || [],
    });

    res.status(201).json({ donation });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Donation could not be created' });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const { city, area, category } = req.query;
    const filters = { status: 'AVAILABLE', remainingQuantity: { $gt: 0 } };

    if (city) filters.city = { $regex: String(city).trim(), $options: 'i' };
    if (area) filters.area = { $regex: String(area).trim(), $options: 'i' };
    if (category) filters.category = category;

    const donations = await Donation.find(filters).sort({ createdAt: -1 });
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ message: 'Could not load donations' });
  }
};

exports.getImpactStats = async (req, res) => {
  try {
    const activeDonationFilter = { status: { $ne: 'CANCELLED' } };
    const [totalDonations, helpedReceivers, activeDonors, communities] = await Promise.all([
      Donation.countDocuments(activeDonationFilter),
      Request.distinct('receiverId', { status: 'COMPLETED' }),
      User.countDocuments({ role: 'donor', isActive: true }),
      Donation.distinct('city', { ...activeDonationFilter, city: { $exists: true, $ne: '' } }),
    ]);

    res.json({
      stats: {
        totalDonations,
        receiversHelped: helpedReceivers.length,
        activeDonors,
        communitiesReached: communities.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load impact statistics' });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorId', 'name verificationStatus city area');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json({ donation });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch donation' });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ message: 'Could not load your donations' });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (String(donation.donorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only update your own donations' });
    }

    Object.assign(donation, req.body);
    if (donation.remainingQuantity <= 0) donation.status = 'COMPLETED';
    await donation.save();
    res.json({ donation });
  } catch (error) {
    res.status(500).json({ message: 'Donation update failed' });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (String(donation.donorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own donations' });
    }

    donation.status = 'CANCELLED';
    await donation.save();
    res.json({ message: 'Donation cancelled successfully', donation });
  } catch (error) {
    res.status(500).json({ message: 'Could not cancel donation' });
  }
};

exports.getNearbyDonations = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 50000 } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const donations = await Donation.find({
      status: 'AVAILABLE',
      remainingQuantity: { $gt: 0 },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(maxDistance),
        },
      },
    }).limit(20);

    res.json({ donations });
  } catch (error) {
    res.status(500).json({ message: 'Could not find nearby donations' });
  }
};

exports.getDonationRequests = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).select('donorId');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (String(donation.donorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only view requests for your donations' });
    }

    const requests = await Request.find({ donationId: req.params.id }).populate('receiverId', 'name city area verificationStatus');
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Could not load requests' });
  }
};
