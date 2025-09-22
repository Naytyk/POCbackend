const User = require('../models/User');
const tokenService = require('../services/tokenService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully. Account pending activation.',
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = { userId: user._id, email: user.email };
    const { accessToken, refreshToken } = tokenService.generateTokens(payload);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = { userId: user._id, email: user.email };
    const newAccessToken = tokenService.generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};