const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedQuantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
    donorResponseDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

requestSchema.index({ donationId: 1, receiverId: 1 }, { unique: true });
requestSchema.index({ donationId: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
