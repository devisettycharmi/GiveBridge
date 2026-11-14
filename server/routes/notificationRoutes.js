const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllNotificationsRead);
router.put('/:id/read', protect, markNotificationRead);

module.exports = router;
