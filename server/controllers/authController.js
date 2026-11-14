const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'givebridge-secret', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { 
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      city,
      area,
      state,
      pincode,
      latitude,
      longitude,
      reasonForRequest,
      assistanceType,
    } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin signup is not allowed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      city,
      area,
      state,
      pincode,
      reasonForRequest,
      assistanceType,
      location: {
        type: 'Point',
        coordinates: [
          longitude || 0,
          latitude || 0,
        ],
      },
      verificationStatus: role === 'donor' ? 'VERIFIED' : 'PENDING',
      isActive: true,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        city: user.city,
        area: user.area,
        state: user.state,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        city: user.city,
        area: user.area,
        state: user.state,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch profile' });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
