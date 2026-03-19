const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const users = [
  { email: "admin@example.com", name: "James Wilson", role: "ADMIN", password: "Admin123!" },
  { email: "sarah@teacher.edu", name: "Dr. Sarah Chen", role: "TEACHER", password: "Teacher123!" },
  { email: "lena@teacher.edu", name: "Prof. Lena Park", role: "TEACHER", password: "Teacher123!" },
  { email: "alex@student.edu", name: "Alex Morgan", role: "STUDENT", password: "Student123!" },
  { email: "priya@student.edu", name: "Priya Sharma", role: "STUDENT", password: "Student123!" },
  { email: "carlos@student.edu", name: "Carlos Rivera", role: "STUDENT", password: "Student123!" },
  { email: "emma@student.edu", name: "Emma Johnson", role: "STUDENT", password: "Student123!" },
  { email: "liu@student.edu", name: "Liu Wei", role: "STUDENT", password: "Student123!" },
  { email: "sofia@student.edu", name: "Sofia Martinez", role: "STUDENT", password: "Student123!" },
  { email: "jlee@student.edu", name: "James Lee", role: "STUDENT", password: "Student123!" },
  { email: "aisha@student.edu", name: "Aisha Patel", role: "STUDENT", password: "Student123!" },
];

const students = [
  { name: "Alex Morgan", email: "alex@student.edu", age: 18 },
  { name: "Priya Sharma", email: "priya@student.edu", age: 19 },
  { name: "Carlos Rivera", email: "carlos@student.edu", age: 20 },
  { name: "Emma Johnson", email: "emma@student.edu", age: 18 },
  { name: "Liu Wei", email: "liu@student.edu", age: 21 },
  { name: "Sofia Martinez", email: "sofia@student.edu", age: 22 },
  { name: "James Lee", email: "jlee@student.edu", age: 20 },
  { name: "Aisha Patel", email: "aisha@student.edu", age: 19 },
];

const courses = [
  {
    key: "c001",
    title: "Advanced Mathematics",
    description:
      "Calculus, linear algebra, and statistical methods for engineering students. Covering differential equations and multivariable calculus.",
  },
  {
    key: "c002",
    title: "Introduction to Python",
    description:
      "Learn Python from scratch. Variables, loops, functions, OOP, and practical projects for beginners and intermediate learners.",
  },
  {
    key: "c003",
    title: "World History and Culture",
    description:
      "An exploration of world civilizations, major historical events, and cultural developments from ancient times to the modern era.",
  },
  {
    key: "c004",
    title: "Digital Arts and Design",
    description:
      "Explore graphic design principles, color theory, typography, and digital illustration using industry-standard tools.",
  },
  {
    key: "c005",
    title: "Physics: Mechanics and Waves",
    description:
      "Classical mechanics, Newton's laws, energy, momentum, oscillations, and wave phenomena with lab simulations.",
  },
  {
    key: "c006",
    title: "English Literature",
    description:
      "Classic and contemporary literary works, critical analysis, essay writing, and exploring themes in modern literature.",
  },
];

const enrollmentMap = {
  alex: ["c001", "c002", "c004"],
  priya: ["c001", "c003"],
  carlos: ["c002", "c005"],
  emma: ["c004", "c006"],
  liu: ["c001", "c002", "c003"],
  sofia: ["c005"],
  jlee: ["c002", "c004"],
  aisha: ["c001", "c006"],
};

async function main() {
  const shouldReset = process.env.SEED_RESET === "true";
  if (shouldReset) {
    await prisma.enrollment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.student.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  }

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const password = await bcrypt.hash(u.password, 12);
      await prisma.user.create({
        data: { email: u.email, password, role: u.role },
      });
    }
  }

  for (const s of students) {
    const existing = await prisma.student.findUnique({ where: { email: s.email } });
    if (!existing) {
      await prisma.student.create({ data: s });
    }
  }

  const courseByKey = {};
  for (const c of courses) {
    let course = await prisma.course.findFirst({ where: { title: c.title } });
    if (!course) {
      course = await prisma.course.create({
        data: { title: c.title, description: c.description },
      });
    }
    courseByKey[c.key] = course;
  }

  const studentByEmail = new Map();
  for (const s of students) {
    const row = await prisma.student.findUnique({ where: { email: s.email } });
    if (row) studentByEmail.set(s.email, row);
  }

  const enrollments = [
    { email: "alex@student.edu", courseKeys: enrollmentMap.alex },
    { email: "priya@student.edu", courseKeys: enrollmentMap.priya },
    { email: "carlos@student.edu", courseKeys: enrollmentMap.carlos },
    { email: "emma@student.edu", courseKeys: enrollmentMap.emma },
    { email: "liu@student.edu", courseKeys: enrollmentMap.liu },
    { email: "sofia@student.edu", courseKeys: enrollmentMap.sofia },
    { email: "jlee@student.edu", courseKeys: enrollmentMap.jlee },
    { email: "aisha@student.edu", courseKeys: enrollmentMap.aisha },
  ];

  for (const e of enrollments) {
    const student = studentByEmail.get(e.email);
    if (!student) continue;
    for (const key of e.courseKeys) {
      const course = courseByKey[key];
      if (!course) continue;
      const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
      });
      if (!existing) {
        await prisma.enrollment.create({
          data: { studentId: student.id, courseId: course.id },
        });
      }
    }
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
