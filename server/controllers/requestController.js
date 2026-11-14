const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Notification = require('../models/Notification');

exports.createRequest = async (req, res) => {
  try {
    const requestedQuantity = Number(req.body.requestedQuantity);
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || !req.body.reason?.trim()) {
      return res.status(400).json({ message: 'A valid quantity and reason are required' });
    }

    const donation = await Donation.findById(req.body.donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'AVAILABLE' || donation.remainingQuantity <= 0) {
      return res.status(400).json({ message: 'Donation is not available for request' });
    }

    if (requestedQuantity > donation.remainingQuantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds remaining quantity' });
    }

    const existingRequest = await Request.findOne({ donationId: donation._id, receiverId: req.user._id, status: { $in: ['PENDING', 'ACCEPTED'] } });
    if (existingRequest) {
      return res.status(409).json({ message: 'You already have an active request for this donation' });
    }

    const request = await Request.create({
      donationId: donation._id,
      receiverId: req.user._id,
      requestedQuantity,
      reason: req.body.reason,
      message: req.body.message,
      status: 'PENDING',
    });

    await Notification.create({
      userId: donation.donorId,
      title: 'New donation request',
      message: `${req.user.name} requested ${requestedQuantity} of ${donation.title}`,
      type: 'request',
      donationId: donation._id,
      requestId: request._id,
    });

    res.status(201).json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Could not create request' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.user._id })
      .populate({
        path: 'donationId',
        populate: {
          path: 'donorId',
          select: 'name email phone city area state pincode',
        },
      })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Could not load your requests' });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id }).select('_id');
    const donationIds = donations.map((d) => d._id);
    const requests = await Request.find({ donationId: { $in: donationIds } })
      .populate({
        path: 'receiverId',
        select: 'name email phone city area state pincode',
      })
      .populate({
        path: 'donationId',
        populate: {
          path: 'donorId',
          select: 'name email phone city area state pincode',
        },
      })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Could not load received requests' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const requestDoc = await Request.findById(req.params.id).populate('donationId');
    if (!requestDoc) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const donation = requestDoc.donationId;
    if (String(donation.donorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot manage this request' });
    }
    if (requestDoc.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be accepted' });
    }

    if (requestDoc.requestedQuantity > donation.remainingQuantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds remaining quantity' });
    }

    requestDoc.status = 'ACCEPTED';
    requestDoc.donorResponseDate = new Date();
    donation.status = 'RESERVED';
    await requestDoc.save();
    await donation.save();

    await Notification.create({
      userId: requestDoc.receiverId,
      title: 'Request accepted',
      message: `Your request for ${donation.title} was accepted.`,
      type: 'request-accepted',
      donationId: donation._id,
      requestId: requestDoc._id,
    });

    res.json({ request: requestDoc, donation });
  } catch (error) {
    res.status(500).json({ message: 'Could not accept request' });
  }
};

exports.declineRequest = async (req, res) => {
  try {
    const requestDoc = await Request.findById(req.params.id).populate('donationId');
    if (!requestDoc) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (String(requestDoc.donationId.donorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot manage this request' });
    }
    if (requestDoc.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be declined' });
    }

    requestDoc.status = 'DECLINED';
    await requestDoc.save();

    await Notification.create({
      userId: requestDoc.receiverId,
      title: 'Request declined',
      message: `Your request for ${requestDoc.donationId.title} was declined.`,
      type: 'request-declined',
      donationId: requestDoc.donationId._id,
      requestId: requestDoc._id,
    });

    res.json({ request: requestDoc });
  } catch (error) {
    res.status(500).json({ message: 'Could not decline request' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const requestDoc = await Request.findById(req.params.id);
    if (!requestDoc) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (String(requestDoc.receiverId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot cancel this request' });
    }
    if (!['PENDING', 'ACCEPTED'].includes(requestDoc.status)) {
      return res.status(400).json({ message: 'This request can no longer be cancelled' });
    }

    requestDoc.status = 'CANCELLED';
    await requestDoc.save();
    res.json({ request: requestDoc });
  } catch (error) {
    res.status(500).json({ message: 'Could not cancel request' });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const requestDoc = await Request.findById(req.params.id).populate('donationId');
    if (!requestDoc) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (String(requestDoc.receiverId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot complete this request' });
    }
    if (requestDoc.status !== 'ACCEPTED') {
      return res.status(400).json({ message: 'Only accepted requests can be completed' });
    }

    const donation = requestDoc.donationId;
    requestDoc.status = 'COMPLETED';
    requestDoc.completedAt = new Date();

    donation.remainingQuantity = Math.max(0, donation.remainingQuantity - requestDoc.requestedQuantity);
    donation.status = donation.remainingQuantity > 0 ? 'AVAILABLE' : 'COMPLETED';

    await requestDoc.save();
    await donation.save();

    await Notification.create({
      userId: donation.donorId,
      title: 'Donation completed',
      message: `${req.user.name} received ${requestDoc.requestedQuantity} of ${donation.title}.`,
      type: 'donation-completed',
      donationId: donation._id,
      requestId: requestDoc._id,
    });

    res.json({ request: requestDoc, donation });
  } catch (error) {
    res.status(500).json({ message: 'Could not complete request' });
  }
};
