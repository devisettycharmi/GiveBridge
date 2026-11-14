const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['OPEN', 'RESOLVED', 'REJECTED'], default: 'OPEN' },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
