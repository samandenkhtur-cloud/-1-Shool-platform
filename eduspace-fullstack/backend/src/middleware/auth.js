const jwt   = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// ── Token helpers ──────────────────────────────────────────────
const generateTokens = (userId, role) => {
  const access = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refresh = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { access, refresh };
};

const hashPassword  = (pw)      => bcrypt.hash(pw, 12);
const comparePasswords = (pw, hash) => bcrypt.compare(pw, hash);

// ── Middleware: authenticate ────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password','verifyToken','resetPasswordToken','resetPasswordExpiry'] },
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or disabled' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ── Middleware: authorize roles ─────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

module.exports = { generateTokens, hashPassword, comparePasswords, authenticate, authorize };
