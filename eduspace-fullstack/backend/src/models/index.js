const { DataTypes } = require('sequelize');
const { sequelize }  = require('../config/database');

// ── User ────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:       { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password:   { type: DataTypes.STRING, allowNull: false },
  role:       { type: DataTypes.ENUM('student','teacher','admin'), defaultValue: 'student' },
  avatar:     { type: DataTypes.STRING, allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
  lastActive: { type: DataTypes.DATE, allowNull: true },
  verifyToken:       { type: DataTypes.STRING, allowNull: true },
  resetPasswordToken:{ type: DataTypes.STRING, allowNull: true },
  resetPasswordExpiry:{ type: DataTypes.DATE, allowNull: true },
}, { tableName: 'users' });

// ── Course ──────────────────────────────────────────────────────
const Course = sequelize.define('Course', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  teacherId:   { type: DataTypes.UUID, allowNull: false },
  category:    { type: DataTypes.ENUM('Mathematics','Programming','Humanities','Arts','Science','Languages'), allowNull: false },
  level:       { type: DataTypes.ENUM('Beginner','Intermediate','Advanced'), allowNull: false },
  duration:    { type: DataTypes.STRING(50) },
  thumbnail:   { type: DataTypes.STRING, allowNull: true },
  bgGradient:  { type: DataTypes.STRING, defaultValue: 'from-blue-500 to-indigo-600' },
  tags:        { type: DataTypes.JSON, defaultValue: [] },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  studentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating:      { type: DataTypes.FLOAT, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'courses' });

// ── Section ─────────────────────────────────────────────────────
const Section = sequelize.define('Section', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  courseId: { type: DataTypes.UUID, allowNull: false },
  title:    { type: DataTypes.STRING(200), allowNull: false },
  order:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'sections' });

// ── Lesson ──────────────────────────────────────────────────────
const Lesson = sequelize.define('Lesson', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sectionId:   { type: DataTypes.UUID, allowNull: false },
  courseId:    { type: DataTypes.UUID, allowNull: false },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  videoUrl:    { type: DataTypes.STRING, allowNull: true },
  videoType:   { type: DataTypes.ENUM('youtube','upload'), defaultValue: 'youtube' },
  duration:    { type: DataTypes.STRING(20) },
  order:       { type: DataTypes.INTEGER, defaultValue: 0 },
  isFree:      { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'lessons' });

// ── Material (lesson file) ──────────────────────────────────────
const Material = sequelize.define('Material', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  lessonId: { type: DataTypes.UUID, allowNull: false },
  name:     { type: DataTypes.STRING(200), allowNull: false },
  fileUrl:  { type: DataTypes.STRING, allowNull: false },
  fileType: { type: DataTypes.STRING(100) },
  fileSize: { type: DataTypes.INTEGER },
}, { tableName: 'materials' });

// ── Enrollment ──────────────────────────────────────────────────
const Enrollment = sequelize.define('Enrollment', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:     { type: DataTypes.UUID, allowNull: false },
  courseId:   { type: DataTypes.UUID, allowNull: false },
  enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'enrollments', indexes: [{ unique: true, fields: ['user_id','course_id'] }] });

// ── Progress ────────────────────────────────────────────────────
const Progress = sequelize.define('Progress', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  lessonId:    { type: DataTypes.UUID, allowNull: false },
  courseId:    { type: DataTypes.UUID, allowNull: false },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  watchedSecs: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'progress', indexes: [{ unique: true, fields: ['user_id','lesson_id'] }] });

// ── LiveSession ─────────────────────────────────────────────────
const LiveSession = sequelize.define('LiveSession', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  courseId:     { type: DataTypes.UUID, allowNull: false },
  teacherId:    { type: DataTypes.UUID, allowNull: false },
  title:        { type: DataTypes.STRING(200), allowNull: false },
  description:  { type: DataTypes.TEXT },
  scheduledAt:  { type: DataTypes.DATE, allowNull: false },
  duration:     { type: DataTypes.INTEGER, defaultValue: 60 },
  status:       { type: DataTypes.ENUM('upcoming','live','ended'), defaultValue: 'upcoming' },
  youtubeStreamId: { type: DataTypes.STRING, allowNull: true },
  maxAttendees: { type: DataTypes.INTEGER, defaultValue: 100 },
  attendees:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'live_sessions' });

// ── Notification ────────────────────────────────────────────────
const Notification = sequelize.define('Notification', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:  { type: DataTypes.UUID, allowNull: false },
  type:    { type: DataTypes.ENUM('enrollment','lesson','reminder','grade','system'), defaultValue: 'system' },
  title:   { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT },
  isRead:  { type: DataTypes.BOOLEAN, defaultValue: false },
  link:    { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'notifications' });

// ── Associations ────────────────────────────────────────────────
User.hasMany(Course,       { foreignKey: 'teacherId', as: 'taughtCourses' });
Course.belongsTo(User,     { foreignKey: 'teacherId', as: 'teacher' });

Course.hasMany(Section,    { foreignKey: 'courseId',  as: 'sections', onDelete: 'CASCADE' });
Section.belongsTo(Course,  { foreignKey: 'courseId' });

Section.hasMany(Lesson,    { foreignKey: 'sectionId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Section,  { foreignKey: 'sectionId' });
Lesson.belongsTo(Course,   { foreignKey: 'courseId' });

Lesson.hasMany(Material,   { foreignKey: 'lessonId',  as: 'materials', onDelete: 'CASCADE' });
Material.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.belongsToMany(Course, { through: Enrollment, foreignKey: 'userId',   as: 'enrolledCourses' });
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId', as: 'enrolledStudents' });

User.hasMany(Progress,     { foreignKey: 'userId' });
Progress.belongsTo(User,   { foreignKey: 'userId' });
Progress.belongsTo(Lesson, { foreignKey: 'lessonId' });

Course.hasMany(LiveSession,     { foreignKey: 'courseId', as: 'liveSessions' });
LiveSession.belongsTo(Course,   { foreignKey: 'courseId' });
LiveSession.belongsTo(User,     { foreignKey: 'teacherId', as: 'teacher' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Course, Section, Lesson, Material, Enrollment, Progress, LiveSession, Notification };
