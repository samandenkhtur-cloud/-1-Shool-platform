const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const auth       = require('../controllers/authController');
const courses    = require('../controllers/courseController');
const lessons    = require('../controllers/lessonController');
const {
  getUsers, getUser, updateUserStatus, getStudentStats,
  getNotifications, markRead, markAllRead,
  getPlatformStats, getCourseEngagement, getEnrollmentTrend,
  getSessions, createSession, updateSession, deleteSession,
} = require('../controllers/otherControllers');

const { authenticate, authorize } = require('../middleware/auth');
const { uploadAvatar, uploadThumbnail, uploadVideo, uploadMaterial } = require('../middleware/upload');

// ── Rate limiter ───────────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' });

// ═══════════════════════════════════════════
// AUTH   /api/auth/*
// ═══════════════════════════════════════════
const authRouter = require('express').Router();

authRouter.post('/register', authLimiter,
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Min 8 chars'),
  auth.register
);
authRouter.post('/login', authLimiter,
  body('email').isEmail(),
  body('password').notEmpty(),
  auth.login
);
authRouter.post('/google', auth.googleLogin);
authRouter.post('/refresh',         auth.refreshToken);
authRouter.get('/verify/:token',    auth.verifyEmail);
authRouter.post('/forgot-password', authLimiter, auth.forgotPassword);
authRouter.post('/reset-password',  auth.resetPassword);
authRouter.get('/me',               authenticate, auth.getProfile);
authRouter.patch('/me',             authenticate, uploadAvatar.single('avatar'), auth.updateProfile);
authRouter.post('/change-password', authenticate, auth.changePassword);

// ═══════════════════════════════════════════
// COURSES  /api/courses/*
// ═══════════════════════════════════════════
const courseRouter = require('express').Router();

courseRouter.get('/',             courses.getCourses);
courseRouter.get('/enrolled',     authenticate, courses.getEnrolledCourses);
courseRouter.get('/:id',          courses.getCourse);
courseRouter.post('/',            authenticate, authorize('teacher','admin'), uploadThumbnail.single('thumbnail'), courses.createCourse);
courseRouter.patch('/:id',        authenticate, authorize('teacher','admin'), uploadThumbnail.single('thumbnail'), courses.updateCourse);
courseRouter.delete('/:id',       authenticate, authorize('admin'), courses.deleteCourse);
courseRouter.patch('/:id/publish',authenticate, authorize('teacher','admin'), courses.togglePublish);

// Enrollment
courseRouter.post('/:id/enroll',  authenticate, courses.enrollCourse);
courseRouter.delete('/:id/enroll',authenticate, courses.unenrollCourse);
courseRouter.get('/:id/progress', authenticate, courses.getCourseProgress);

// Lessons under course
courseRouter.get('/:courseId/lessons', authenticate, lessons.getLessons);

// ═══════════════════════════════════════════
// LESSONS  /api/lessons/*
// ═══════════════════════════════════════════
const lessonRouter = require('express').Router();

lessonRouter.get('/progress/all',        authenticate, lessons.getAllProgress);
lessonRouter.get('/:id',                  authenticate, lessons.getLesson);
lessonRouter.post('/',                    authenticate, authorize('teacher','admin'), uploadVideo.single('video'), lessons.createLesson);
lessonRouter.patch('/:id',               authenticate, authorize('teacher','admin'), uploadVideo.single('video'), lessons.updateLesson);
lessonRouter.delete('/:id',              authenticate, authorize('teacher','admin'), lessons.deleteLesson);
lessonRouter.post('/:id/complete',       authenticate, lessons.markComplete);
lessonRouter.post('/:id/materials',      authenticate, authorize('teacher','admin'), uploadMaterial.single('file'), lessons.uploadMaterial);

// ═══════════════════════════════════════════
// USERS  /api/users/*
// ═══════════════════════════════════════════
const userRouter = require('express').Router();

userRouter.get('/',              authenticate, authorize('admin'), getUsers);
userRouter.get('/stats',         authenticate, getStudentStats);
userRouter.get('/:id',           authenticate, authorize('teacher','admin'), getUser);
userRouter.patch('/:id/status',  authenticate, authorize('admin'), updateUserStatus);
userRouter.get('/:id/stats',     authenticate, authorize('teacher','admin'), getStudentStats);

// ═══════════════════════════════════════════
// NOTIFICATIONS  /api/notifications/*
// ═══════════════════════════════════════════
const notifRouter = require('express').Router();

notifRouter.get('/',             authenticate, getNotifications);
notifRouter.patch('/:id/read',   authenticate, markRead);
notifRouter.patch('/read-all',   authenticate, markAllRead);

// ═══════════════════════════════════════════
// ANALYTICS  /api/analytics/*
// ═══════════════════════════════════════════
const analyticsRouter = require('express').Router();

analyticsRouter.get('/platform',    authenticate, authorize('admin'), getPlatformStats);
analyticsRouter.get('/engagement',  authenticate, authorize('teacher','admin'), getCourseEngagement);
analyticsRouter.get('/enrollments', authenticate, authorize('teacher','admin'), getEnrollmentTrend);

// ═══════════════════════════════════════════
// LIVE SESSIONS  /api/live/*
// ═══════════════════════════════════════════
const liveRouter = require('express').Router();

liveRouter.get('/',          authenticate, getSessions);
liveRouter.post('/',         authenticate, authorize('teacher','admin'), createSession);
liveRouter.patch('/:id',     authenticate, authorize('teacher','admin'), updateSession);
liveRouter.delete('/:id',    authenticate, authorize('teacher','admin'), deleteSession);

// ── Mount all ──────────────────────────────────────────────────
router.use('/auth',          authRouter);
router.use('/courses',       courseRouter);
router.use('/lessons',       lessonRouter);
router.use('/users',         userRouter);
router.use('/notifications', notifRouter);
router.use('/analytics',     analyticsRouter);
router.use('/live',          liveRouter);

module.exports = router;
