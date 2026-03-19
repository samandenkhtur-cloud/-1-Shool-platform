// ════════════════════════════════════════════════════════════════
// userController.js
// ════════════════════════════════════════════════════════════════
const { User, Course, Enrollment, Progress } = require('../models');
const { Op } = require('sequelize');

exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role)   where.role  = role;
    if (search) where[Op.or] = [
      { name:  { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password','verifyToken','resetPasswordToken','resetPasswordExpiry'] },
      order: [['createdAt','DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: { users: rows, total: count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password','verifyToken','resetPasswordToken','resetPasswordExpiry'] },
      include: [{ model: Course, as: 'enrolledCourses', through: { attributes: [] } }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const progressRows = await Progress.findAll({ where: { userId: user.id, isCompleted: true } });
    user.dataValues.completedLessonsCount = progressRows.length;

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    await User.update({ isActive }, { where: { id: req.params.id } });
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'suspended'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const enrollments = await Enrollment.findAll({ where: { userId } });
    const completed   = await Progress.count({ where: { userId, isCompleted: true } });
    res.json({ success: true, data: { enrolledCourses: enrollments.length, completedLessons: completed } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// notificationController.js
// ════════════════════════════════════════════════════════════════
const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt','DESC']],
      limit: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotification = async (userId, type, title, message, link = null) => {
  try {
    await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

// ════════════════════════════════════════════════════════════════
// analyticsController.js
// ════════════════════════════════════════════════════════════════
const { sequelize } = require('../config/database');

exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers]    = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE is_active=1");
    const [totalCourses]  = await sequelize.query("SELECT COUNT(*) as count FROM courses WHERE is_published=1");
    const [totalEnroll]   = await sequelize.query("SELECT COUNT(*) as count FROM enrollments");
    const [totalStudents] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role='student' AND is_active=1");
    const [totalTeachers] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role='teacher' AND is_active=1");

    res.json({
      success: true,
      data: {
        totalUsers:    totalUsers[0].count,
        totalCourses:  totalCourses[0].count,
        totalEnrollments: totalEnroll[0].count,
        totalStudents: totalStudents[0].count,
        totalTeachers: totalTeachers[0].count,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCourseEngagement = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT c.id, c.title, c.students_count, c.rating,
             COUNT(DISTINCT p.user_id) as completedUsers,
             COUNT(DISTINCT l.id) as totalLessons
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN progress p ON p.course_id = c.id AND p.is_completed = 1
      WHERE c.is_published = 1
      GROUP BY c.id, c.title, c.students_count, c.rating
      ORDER BY c.students_count DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEnrollmentTrend = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT DATE_FORMAT(enrolled_at, '%Y-%m') as month, COUNT(*) as count
      FROM enrollments
      WHERE enrolled_at >= DATE_SUB(NOW(), INTERVAL 7 MONTH)
      GROUP BY month ORDER BY month
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// liveSessionController.js
// ════════════════════════════════════════════════════════════════
const { LiveSession } = require('../models');
const { sendLiveSessionReminder } = require('../services/emailService');

exports.getSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.findAll({
      include: [
        { model: Course, attributes: ['id','title'] },
        { model: User, as: 'teacher', attributes: ['id','name','avatar'] },
      ],
      order: [['scheduled_at','DESC']],
    });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { courseId, title, description, scheduledAt, duration, youtubeStreamId, maxAttendees } = req.body;
    const session = await LiveSession.create({
      courseId, teacherId: req.user.id,
      title, description, scheduledAt, duration, youtubeStreamId, maxAttendees,
    });

    // Get enrolled students and send reminder emails
    const enrollments = await Enrollment.findAll({ where: { courseId }, include: [{ model: User }] });
    enrollments.forEach(e => sendLiveSessionReminder(e.User, session).catch(console.error));

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await LiveSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    await session.update(req.body);
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await LiveSession.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  // user
  getUsers: exports.getUsers,
  getUser:  exports.getUser,
  updateUserStatus: exports.updateUserStatus,
  getStudentStats:  exports.getStudentStats,
  // notifications
  getNotifications: exports.getNotifications,
  markRead:         exports.markRead,
  markAllRead:      exports.markAllRead,
  createNotification: exports.createNotification,
  // analytics
  getPlatformStats:    exports.getPlatformStats,
  getCourseEngagement: exports.getCourseEngagement,
  getEnrollmentTrend:  exports.getEnrollmentTrend,
  // live sessions
  getSessions:   exports.getSessions,
  createSession: exports.createSession,
  updateSession: exports.updateSession,
  deleteSession: exports.deleteSession,
};
