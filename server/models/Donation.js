const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Food',
        'Clothes',
        'Books',
        'Electronics',
        'Furniture',
        'Medicines',
        'School Supplies',
        'Household Items',
        'Financial Assistance',
        'Other',
      ],
    },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    condition: { type: String, enum: ['New', 'Good', 'Used'], default: 'Good' },
    images: [{ type: String }],
    expiryDate: { type: Date },
    pickupPreference: { type: String, trim: true },
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'RESERVED', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

donationSchema.index({ location: '2dsphere' });

donationSchema.index({ donorId: 1, status: 1 });

module.exports = mongoose.model('Donation', donationSchema);
