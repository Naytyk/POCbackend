const User = require('../models/User');
const tokenService = require('../services/tokenService');

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if it's the admin credentials
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Create or find admin user
    let admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        isActive: true
      });
      await admin.save();
    }

    const payload = { userId: admin._id, email: admin.email, role: 'admin' };
    const { accessToken, refreshToken } = tokenService.generateTokens(payload);

    admin.refreshToken = refreshToken;
    await admin.save();

    res.json({
      message: 'Admin login successful',
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name email isActive createdAt')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot modify admin user' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getUsers,
  toggleUserStatus
};