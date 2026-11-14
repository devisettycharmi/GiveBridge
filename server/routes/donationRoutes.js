const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  updateDonation,
  deleteDonation,
  getNearbyDonations,
  getDonationRequests,
  getImpactStats,
} = require('../controllers/donationController');

router.route('/').post(protect, authorize('donor'), createDonation).get(getDonations);
router.get('/stats', getImpactStats);
router.get('/nearby', getNearbyDonations);
router.get('/my-donations', protect, authorize('donor'), getMyDonations);
router.get('/:id', getDonationById);
router.put('/:id', protect, authorize('donor'), updateDonation);
router.delete('/:id', protect, authorize('donor'), deleteDonation);
router.get('/:id/requests', protect, getDonationRequests);

module.exports = router;
