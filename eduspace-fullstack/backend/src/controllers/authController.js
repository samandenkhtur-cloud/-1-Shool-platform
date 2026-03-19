const { validationResult } = require('express-validator');
const { v4: uuidv4 }       = require('uuid');
const { OAuth2Client }     = require('google-auth-library');
const crypto               = require('crypto');
const { User }             = require('../models');
const { generateTokens, hashPassword, comparePasswords } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Register ───────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role = 'student' } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const verifyToken = uuidv4();

    const user = await User.create({ name, email, password: hashed, role, verifyToken });

    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await sendVerificationEmail(user, verifyToken);
        await sendWelcomeEmail(user);
      } else {
        console.warn('Email not configured; skipping verification/welcome emails.');
      }
    } catch (emailErr) {
      console.warn('Email send failed; continuing registration:', emailErr.message);
    }

    const { access, refresh } = generateTokens(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registered! Check your email to verify your account.',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
        token: access,
        refreshToken: refresh,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Login ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const valid = await comparePasswords(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    user.lastActive = new Date();
    await user.save();

    const { access, refresh } = generateTokens(user.id, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id, name: user.name, email: user.email,
          role: user.role, avatar: user.avatar, isVerified: user.isVerified,
        },
        token: access,
        refreshToken: refresh,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// â”€â”€ Google Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Missing Google credential' });
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google client not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) return res.status(400).json({ success: false, message: 'Google account email not available' });

    let user = await User.findOne({ where: { email } });
    if (user && !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account disabled' });
    }

    if (!user) {
      const randomPw = crypto.randomBytes(32).toString('hex');
      const hashed = await hashPassword(randomPw);
      user = await User.create({
        name: payload?.name || email.split('@')[0],
        email,
        password: hashed,
        role: 'student',
        avatar: payload?.picture || null,
        isVerified: true,
      });
    }

    user.lastActive = new Date();
    await user.save();

    const { access, refresh } = generateTokens(user.id, user.role);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id, name: user.name, email: user.email,
          role: user.role, avatar: user.avatar, isVerified: user.isVerified,
        },
        token: access,
        refreshToken: refresh,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Get profile ────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ── Verify email ───────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { verifyToken: token } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isVerified  = true;
    user.verifyToken = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Forgot password ────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success (don't reveal if email exists)
    if (!user) return res.json({ success: true, message: 'If the email exists, a reset link was sent.' });

    const token  = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.resetPasswordToken  = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    await sendPasswordResetEmail(user, token);
    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Reset password ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ where: { resetPasswordToken: token } });

    if (!user || user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    user.password            = await hashPassword(password);
    user.resetPasswordToken  = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Refresh token ──────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const { access, refresh } = generateTokens(user.id, user.role);
    res.json({ success: true, data: { token: access, refreshToken: refresh } });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// ── Update profile ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates  = {};
    if (name) updates.name = name;
    if (email) {
      const exists = await User.findOne({ where: { email } });
      if (exists && exists.id !== req.user.id) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      updates.email = email;
    }
    if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;

    await User.update(updates, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password','verifyToken','resetPasswordToken','resetPasswordExpiry'] },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Change password ────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await comparePasswords(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
