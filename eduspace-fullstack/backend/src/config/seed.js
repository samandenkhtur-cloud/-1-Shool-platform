require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { sequelize, connectDB } = require('./database');
const { User, Course, Section, Lesson, Enrollment, Notification, Material, Progress } = require('../models');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const uploadsDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
const materialsDir = path.join(uploadsDir, 'materials');

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database...');
  await sequelize.sync({ force: true });

  // ── Users ──────────────────────────────────────────────────────
  const pw = await bcrypt.hash('password', 12);

  const admin = await User.create({
    name: 'James Wilson', email: 'james@admin.edu',
    password: pw, role: 'admin', isVerified: true, isActive: true,
  });
  const teacher1 = await User.create({
    name: 'Dr. Sarah Chen', email: 'sarah@teacher.edu',
    password: pw, role: 'teacher', isVerified: true, isActive: true,
  });
  const teacher2 = await User.create({
    name: 'Prof. Mike Torres', email: 'mike@teacher.edu',
    password: pw, role: 'teacher', isVerified: true, isActive: true,
  });
  const student = await User.create({
    name: 'Alex Morgan', email: 'alex@student.edu',
    password: pw, role: 'student', isVerified: true, isActive: true,
  });

  // ── Courses ────────────────────────────────────────────────────
  const course1 = await Course.create({
    title: 'Advanced Mathematics',
    description: 'Calculus, linear algebra, and statistical methods for engineering students.',
    teacherId: teacher1.id, category: 'Mathematics', level: 'Advanced',
    duration: '12 weeks', bgGradient: 'from-blue-500 to-indigo-600',
    tags: ['Calculus','Algebra','Statistics'], isPublished: true,
    studentsCount: 142, rating: 4.8, ratingCount: 89,
  });
  const course2 = await Course.create({
    title: 'Introduction to Python',
    description: 'Learn Python from scratch. Variables, loops, functions, OOP, and practical projects.',
    teacherId: teacher2.id, category: 'Programming', level: 'Beginner',
    duration: '8 weeks', bgGradient: 'from-emerald-500 to-teal-600',
    tags: ['Python','Programming','OOP'], isPublished: true,
    studentsCount: 389, rating: 4.9, ratingCount: 215,
  });
  const course3 = await Course.create({
    title: 'Digital Arts & Design',
    description: 'Explore graphic design principles, color theory, typography, and digital illustration.',
    teacherId: teacher1.id, category: 'Arts', level: 'Beginner',
    duration: '6 weeks', bgGradient: 'from-violet-500 to-purple-600',
    tags: ['Design','Art','Typography'], isPublished: true,
    studentsCount: 211, rating: 4.7, ratingCount: 134,
  });

  const course4 = await Course.create({
    title: 'Physics: Mechanics & Waves',
    description: 'Classical mechanics, energy, momentum, oscillations, and wave phenomena.',
    teacherId: teacher2.id, category: 'Science', level: 'Intermediate',
    duration: '10 weeks', bgGradient: 'from-pink-500 to-rose-600',
    tags: ['Physics','Mechanics','Waves'], isPublished: true,
    studentsCount: 176, rating: 4.5, ratingCount: 102,
  });
  const course5 = await Course.create({
    title: 'English Literature',
    description: 'Classic and contemporary works, critical analysis, and essay writing.',
    teacherId: teacher1.id, category: 'Languages', level: 'Intermediate',
    duration: '8 weeks', bgGradient: 'from-cyan-500 to-sky-600',
    tags: ['Literature','Writing','Analysis'], isPublished: true,
    studentsCount: 128, rating: 4.4, ratingCount: 77,
  });
  const course6 = await Course.create({
    title: 'World History & Culture',
    description: 'Major historical events and cultural developments across civilizations.',
    teacherId: teacher1.id, category: 'Humanities', level: 'Intermediate',
    duration: '9 weeks', bgGradient: 'from-amber-500 to-orange-600',
    tags: ['History','Culture'], isPublished: true,
    studentsCount: 95, rating: 4.6, ratingCount: 58,
  });
  const course7 = await Course.create({
    title: 'Data Science Fundamentals',
    description: 'Intro to data analysis, visualization, and basic ML concepts.',
    teacherId: teacher2.id, category: 'Programming', level: 'Beginner',
    duration: '7 weeks', bgGradient: 'from-emerald-500 to-teal-600',
    tags: ['Data','Python','ML'], isPublished: true,
    studentsCount: 204, rating: 4.7, ratingCount: 91,
  });
  const course8 = await Course.create({
    title: 'Creative Design Systems',
    description: 'Design systems, tokens, and scalable UI patterns.',
    teacherId: teacher1.id, category: 'Arts', level: 'Advanced',
    duration: '5 weeks', bgGradient: 'from-blue-500 to-indigo-600',
    tags: ['Design','Systems','UI'], isPublished: true,
    studentsCount: 64, rating: 4.8, ratingCount: 41,
  });

  // ── Sections & Lessons for course1 ────────────────────────────
  const sec1 = await Section.create({ courseId: course1.id, title: 'Differential Calculus', order: 0 });
  const sec2 = await Section.create({ courseId: course1.id, title: 'Integral Calculus',     order: 1 });

  const course1Lessons = await Lesson.bulkCreate([
    { sectionId: sec1.id, courseId: course1.id, title: 'Introduction to Derivatives',   duration: '45 min', videoUrl: 'WsQQvHm4lSw', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec1.id, courseId: course1.id, title: 'Chain Rule & Product Rule',      duration: '50 min', videoUrl: 'H-ybCx8gt-8', videoType: 'youtube', order: 1 },
    { sectionId: sec1.id, courseId: course1.id, title: 'Applications of Derivatives',   duration: '55 min', videoUrl: 'rAof9Ld5sOg', videoType: 'youtube', order: 2 },
    { sectionId: sec2.id, courseId: course1.id, title: 'Definite & Indefinite Integrals',duration: '48 min', videoUrl: 'rfG8ce4nNh0', videoType: 'youtube', order: 0 },
    { sectionId: sec2.id, courseId: course1.id, title: 'Integration by Parts',           duration: '42 min', videoUrl: 'JKVSBaFNqE4', videoType: 'youtube', order: 1 },
  ], { returning: true });

  // ── Sections & Lessons for course2 ────────────────────────────
  const sec3 = await Section.create({ courseId: course2.id, title: 'Python Basics',        order: 0 });
  const sec4 = await Section.create({ courseId: course2.id, title: 'Functions & Modules',  order: 1 });

  const course2Lessons = await Lesson.bulkCreate([
    { sectionId: sec3.id, courseId: course2.id, title: 'Variables & Data Types',  duration: '35 min', videoUrl: 'Z1Yd7upQIl0', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec3.id, courseId: course2.id, title: 'Control Flow & Loops',    duration: '40 min', videoUrl: 'eSttygYX7aU', videoType: 'youtube', order: 1 },
    { sectionId: sec3.id, courseId: course2.id, title: 'Lists, Tuples & Dicts',   duration: '50 min', videoUrl: 'W8KRzm-HUcc', videoType: 'youtube', order: 2 },
    { sectionId: sec4.id, courseId: course2.id, title: 'Defining Functions',      duration: '38 min', videoUrl: 'nrChhfGEA8Q', videoType: 'youtube', order: 0 },
    { sectionId: sec4.id, courseId: course2.id, title: 'Modules & Packages',      duration: '32 min', videoUrl: 'CqvZ3vGoGs0', videoType: 'youtube', order: 1 },
  ], { returning: true });

  const sec5 = await Section.create({ courseId: course3.id, title: 'Design Fundamentals', order: 0 });
  const course3Lessons = await Lesson.bulkCreate([
    { sectionId: sec5.id, courseId: course3.id, title: 'Color Theory Basics', duration: '32 min', videoUrl: 'AvgCkHrcj8w', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec5.id, courseId: course3.id, title: 'Typography Fundamentals', duration: '38 min', videoUrl: 'RXlLMFacuHA', videoType: 'youtube', order: 1 },
  ], { returning: true });

  const sec6 = await Section.create({ courseId: course4.id, title: 'Mechanics', order: 0 });
  const course4Lessons = await Lesson.bulkCreate([
    { sectionId: sec6.id, courseId: course4.id, title: 'Kinematics', duration: '40 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec6.id, courseId: course4.id, title: 'Dynamics', duration: '42 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 1 },
  ], { returning: true });

  const sec7 = await Section.create({ courseId: course5.id, title: 'Classic Literature', order: 0 });
  const course5Lessons = await Lesson.bulkCreate([
    { sectionId: sec7.id, courseId: course5.id, title: 'Shakespeare Overview', duration: '30 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec7.id, courseId: course5.id, title: 'Modern Fiction', duration: '35 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 1 },
  ], { returning: true });

  const sec8 = await Section.create({ courseId: course6.id, title: 'Ancient Civilizations', order: 0 });
  const course6Lessons = await Lesson.bulkCreate([
    { sectionId: sec8.id, courseId: course6.id, title: 'Mesopotamia', duration: '33 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec8.id, courseId: course6.id, title: 'Egypt', duration: '36 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 1 },
  ], { returning: true });

  const sec9 = await Section.create({ courseId: course7.id, title: 'Data Basics', order: 0 });
  const course7Lessons = await Lesson.bulkCreate([
    { sectionId: sec9.id, courseId: course7.id, title: 'Data Wrangling', duration: '34 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec9.id, courseId: course7.id, title: 'Visualization', duration: '29 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 1 },
  ], { returning: true });

  const sec10 = await Section.create({ courseId: course8.id, title: 'Design Systems', order: 0 });
  const course8Lessons = await Lesson.bulkCreate([
    { sectionId: sec10.id, courseId: course8.id, title: 'Tokens & Foundations', duration: '28 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 0, isFree: true },
    { sectionId: sec10.id, courseId: course8.id, title: 'Component Patterns', duration: '31 min', videoUrl: 'dQw4w9WgXcQ', videoType: 'youtube', order: 1 },
  ], { returning: true });

  // ── Enroll student ─────────────────────────────────────────────
  await Enrollment.bulkCreate([
    { userId: student.id, courseId: course1.id },
    { userId: student.id, courseId: course2.id },
    { userId: student.id, courseId: course3.id },
    { userId: student.id, courseId: course4.id },
  ]);

  // â”€â”€ Materials (PPT/DOC) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ensureDir(materialsDir);
  const makeMaterial = async (lesson, filename, content) => {
    const filePath = path.join(materialsDir, filename);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content);
    return Material.create({
      lessonId: lesson.id,
      name: filename,
      fileUrl: `/uploads/materials/${filename}`,
      fileType: filename.endsWith('.pptx') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: fs.statSync(filePath).size,
    });
  };

  await makeMaterial(course1Lessons[0], 'derivatives-notes.docx', 'Derivatives notes');
  await makeMaterial(course2Lessons[0], 'python-basics.pptx', 'Python basics slides');
  await makeMaterial(course3Lessons[0], 'design-fundamentals.pptx', 'Design fundamentals slides');

  // â”€â”€ Sample progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await Progress.create({ userId: student.id, lessonId: course1Lessons[0].id, courseId: course1.id, isCompleted: true, completedAt: new Date() });

  // ── Sample notifications ───────────────────────────────────────
  await Notification.bulkCreate([
    { userId: student.id, type: 'enrollment', title: 'Enrollment Confirmed', message: "You've been enrolled in Advanced Mathematics.", isRead: false },
    { userId: student.id, type: 'lesson',     title: 'New Lesson Available', message: 'Integration by Parts is now live in Advanced Mathematics.', isRead: false },
    { userId: student.id, type: 'reminder',   title: 'Assignment Due Tomorrow', message: 'Python Functions problem set is due soon.', isRead: true },
  ]);

  console.log('✅ Seed complete!');
  console.log('\n🔑 Demo accounts (password: "password"):');
  console.log('   Admin:   james@admin.edu');
  console.log('   Teacher: sarah@teacher.edu');
  console.log('   Student: alex@student.edu\n');

  await sequelize.close();
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
