const { Lesson, Section, Material, Progress, Notification, Enrollment } = require('../models');

// ── Get lessons for a course ───────────────────────────────────
exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      include: [{ model: Material, as: 'materials' }],
      order: [['order','ASC']],
    });
    if (req.user) {
      const progressRows = await Progress.findAll({
        where: { userId: req.user.id, courseId: req.params.courseId, isCompleted: true },
        attributes: ['lessonId'],
      });
      const completed = new Set(progressRows.map((r) => r.lessonId));
      lessons.forEach((l) => { l.dataValues.isCompleted = completed.has(l.id); });
    }
    res.json({ success: true, data: lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get single lesson ──────────────────────────────────────────
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: Material, as: 'materials' }],
    });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    // Attach completion status if user is authenticated
    if (req.user) {
      const progress = await Progress.findOne({ where: { userId: req.user.id, lessonId: lesson.id } });
      lesson.dataValues.isCompleted = progress?.isCompleted || false;
    }
    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Create lesson (teacher/admin) ──────────────────────────────
exports.createLesson = async (req, res) => {
  try {
    const { sectionId, courseId, title, description, videoUrl, videoType, duration, order, isFree } = req.body;

    // If video was uploaded
    const finalVideoUrl = req.file
      ? `/uploads/videos/${req.file.filename}`
      : videoUrl;
    const finalVideoType = req.file ? 'upload' : (videoType || 'youtube');

    const lesson = await Lesson.create({
      sectionId, courseId, title, description,
      videoUrl: finalVideoUrl, videoType: finalVideoType,
      duration, order: order || 0, isFree: isFree || false,
    });
    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update lesson ──────────────────────────────────────────────
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const updates = { ...req.body };
    if (req.file) { updates.videoUrl = `/uploads/videos/${req.file.filename}`; updates.videoType = 'upload'; }

    await lesson.update(updates);
    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete lesson ──────────────────────────────────────────────
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    await lesson.destroy();
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Upload material ────────────────────────────────────────────
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const material = await Material.create({
      lessonId: req.params.id,
      name:     req.file.originalname,
      fileUrl:  `/uploads/materials/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Mark lesson complete ───────────────────────────────────────
exports.markComplete = async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const [progress, created] = await Progress.findOrCreate({
      where: { userId: req.user.id, lessonId },
      defaults: { courseId: lesson.courseId, isCompleted: true, completedAt: new Date() },
    });
    if (!created) {
      await progress.update({ isCompleted: true, completedAt: new Date() });
    }
    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get all progress for a user ────────────────────────────────
exports.getAllProgress = async (req, res) => {
  try {
    const rows = await Progress.findAll({ where: { userId: req.user.id, isCompleted: true } });
    const completedByCourse = rows.reduce((acc, r) => {
      if (!acc[r.courseId]) acc[r.courseId] = 0;
      acc[r.courseId]++;
      return acc;
    }, {});

    const enrollments = await Enrollment.findAll({ where: { userId: req.user.id }, attributes: ['courseId'], raw: true });
    const enrolledIds = enrollments.map((e) => e.courseId);
    const courseIds = Array.from(new Set([...Object.keys(completedByCourse), ...enrolledIds]));
    if (courseIds.length === 0) return res.json({ success: true, data: {} });

    const totals = await Lesson.findAll({
      attributes: ['courseId', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalLessons']],
      where: { courseId: courseIds },
      group: ['courseId'],
      raw: true,
    });

    const totalsByCourse = totals.reduce((acc, r) => {
      acc[r.courseId] = parseInt(r.totalLessons, 10) || 0;
      return acc;
    }, {});

    const byCourse = courseIds.reduce((acc, courseId) => {
      const completedLessons = completedByCourse[courseId] || 0;
      const totalLessons = totalsByCourse[courseId] || 0;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      acc[courseId] = { courseId, completedLessons, totalLessons, percentage };
      return acc;
    }, {});

    res.json({ success: true, data: byCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
