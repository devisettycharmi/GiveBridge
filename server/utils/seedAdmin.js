const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/givebridge');

    const existingAdmin = await User.findOne({ email: 'admin@givebridge.org' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('Admin@123', 10);

    await User.create({
      name: 'GiveBridge Admin',
      email: 'admin@givebridge.org',
      phone: '9999999999',
      password: passwordHash,
      role: 'admin',
      verificationStatus: 'VERIFIED',
      city: 'Warangal',
      area: 'Main City',
      state: 'Telangana',
      pincode: '506001',
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [79.58, 18.0],
      },
    });

    console.log('Admin seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
