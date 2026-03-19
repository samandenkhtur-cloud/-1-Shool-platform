const { prisma } = require("../../config/prisma");

class CourseRepository {
  createCourse(data) {
    return prisma.course.create({ data });
  }

  listCourses() {
    // Avoid N+1 by aggregating enrollment counts in one query.
    return prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { enrollments: true } },
      },
    });
  }

  getCourseById(id) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
      },
    });
  }

  updateCourse(id, data) {
    return prisma.course.update({ where: { id }, data });
  }

  deleteCourse(id) {
    return prisma.course.delete({ where: { id } });
  }

  createEnrollment(data) {
    return prisma.enrollment.create({ data });
  }

  getEnrollment(studentId, courseId) {
    return prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });
  }
}

module.exports = { CourseRepository };

