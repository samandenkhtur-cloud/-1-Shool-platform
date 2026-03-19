const { Op }      = require('sequelize');
const { Course, Section, Lesson, Enrollment, Progress, User } = require('../models');
const { sendEnrollmentEmail } = require('../services/emailService');

// ── List courses ───────────────────────────────────────────────
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const where = { isPublished: true };

    if (category) where.category = category;
    if (level)    where.level    = level;
    if (search)   where[Op.or]   = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];

    const { rows: courses, count } = await Course.findAndCountAll({
      where,
      include: [{ model: User, as: 'teacher', attributes: ['id','name','avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ success: true, data: { courses, total: count, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get single course with sections & lessons ──────────────────
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User,    as: 'teacher',  attributes: ['id','name','avatar'] },
        {
          model: Section, as: 'sections',
          include: [{ model: Lesson, as: 'lessons', order: [['order','ASC']] }],
          order: [['order','ASC']],
        },
      ],
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Create course (teacher/admin) ──────────────────────────────
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, bgGradient, tags, sections } = req.body;
    const thumbnail = req.file ? `/uploads/thumbnails/${req.file.filename}` : null;

    const course = await Course.create({
      title, description, category, level, duration, bgGradient,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags || [],
      teacherId: req.user.id,
      thumbnail,
    });

    // Create sections and lessons if provided
    if (sections && Array.isArray(sections)) {
      for (let si = 0; si < sections.length; si++) {
        const sec = sections[si];
        const section = await Section.create({ courseId: course.id, title: sec.title, order: si });
        if (sec.lessons && Array.isArray(sec.lessons)) {
          for (let li = 0; li < sec.lessons.length; li++) {
            const les = sec.lessons[li];
            await Lesson.create({
              sectionId: section.id, courseId: course.id,
              title: les.title, description: les.description,
              videoUrl: les.videoUrl, videoType: les.videoType || 'youtube',
              duration: les.duration, order: li,
            });
          }
        }
      }
    }

    const full = await Course.findByPk(course.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id','name','avatar'] },
        { model: Section, as: 'sections', include: [{ model: Lesson, as: 'lessons' }] },
      ],
    });
    res.status(201).json({ success: true, data: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update course ──────────────────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.teacherId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const updates = { ...req.body };
    if (req.file) updates.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);

    await course.update(updates);
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete course (admin only) ─────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.destroy();
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Publish / unpublish ────────────────────────────────────────
exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update({ isPublished: !course.isPublished });
    res.json({ success: true, data: { isPublished: course.isPublished } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Enroll ─────────────────────────────────────────────────────
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: User, as: 'teacher', attributes: ['id','name'] }],
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { userId: req.user.id, courseId: req.params.id },
    });
    if (!created) return res.status(409).json({ success: false, message: 'Already enrolled' });

    await course.increment('studentsCount');

    // Send enrollment email (non-blocking)
    sendEnrollmentEmail(req.user, course).catch(console.error);

    res.status(201).json({ success: true, message: 'Enrolled successfully', data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Unenroll ───────────────────────────────────────────────────
exports.unenrollCourse = async (req, res) => {
  try {
    const deleted = await Enrollment.destroy({ where: { userId: req.user.id, courseId: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    const course = await Course.findByPk(req.params.id);
    if (course && course.studentsCount > 0) await course.decrement('studentsCount');

    res.json({ success: true, message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get enrolled courses ───────────────────────────────────────
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Course, as: 'enrolledCourses',
        include: [{ model: User, as: 'teacher', attributes: ['id','name','avatar'] }],
      }],
    });
    res.json({ success: true, data: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get course progress ────────────────────────────────────────
exports.getCourseProgress = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Section, as: 'sections', include: [{ model: Lesson, as: 'lessons' }] }],
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
    const completedCount = await Progress.count({
      where: { userId: req.user.id, courseId: req.params.id, isCompleted: true },
    });
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.json({ success: true, data: { courseId: req.params.id, totalLessons, completedLessons: completedCount, percentage } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
