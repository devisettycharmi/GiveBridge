const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createRequest, getMyRequests, getReceivedRequests, acceptRequest, declineRequest, cancelRequest, completeRequest } = require('../controllers/requestController');

router.post('/', protect, authorize('receiver'), createRequest);
router.get('/my-requests', protect, authorize('receiver'), getMyRequests);
router.get('/received', protect, authorize('donor'), getReceivedRequests);
router.put('/:id/accept', protect, authorize('donor'), acceptRequest);
router.put('/:id/decline', protect, authorize('donor'), declineRequest);
router.put('/:id/cancel', protect, authorize('receiver'), cancelRequest);
router.put('/:id/complete', protect, authorize('receiver'), completeRequest);

module.exports = router;
