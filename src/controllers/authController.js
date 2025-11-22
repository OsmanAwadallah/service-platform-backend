const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendMail } = require('../utils/mail');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password, role });
  const token = generateToken(user);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password required');
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const match = await user.comparePassword(password);
  if (!match) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = generateToken(user);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email required');
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(200).json({ message: 'If the email exists, a reset link will be sent' });
    return;
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}&id=${user._id}`;
  await sendMail({
    to: user.email,
    subject: 'Password reset',
    text: `Reset your password here: ${resetUrl}`,
    html: `<p>Reset your password here: <a href="${resetUrl}">Reset password</a></p>`
  });

  res.json({ message: 'Reset link sent if email exists' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, id, password } = req.body;
  if (!token || !id || !password) {
    res.status(400);
    throw new Error('Token, id and new password required');
  }
  const user = await User.findOne({ _id: id, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

module.exports = { register, login, logout, forgotPassword, resetPassword };