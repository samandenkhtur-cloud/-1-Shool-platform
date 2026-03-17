const { AppError } = require("../../errors/AppError");
const { CourseRepository } = require("./course.repository");
const { publishEvent } = require("../../messaging/rabbitmq");
const crypto = require("crypto");

class CourseService {
  /**
   * @param {CourseRepository} repo
   */
  constructor(repo = new CourseRepository()) {
    this.repo = repo;
  }

  create(dto) {
    return this.repo.createCourse(dto);
  }

  async list() {
    const courses = await this.repo.listCourses();
    return courses.map((c) => ({
      ...c,
      enrollmentCount: c._count?.enrollments ?? 0,
      _count: undefined,
    }));
  }

  async getById(id) {
    const course = await this.repo.getCourseById(id);
    if (!course) throw AppError.notFound("Course not found");
    return {
      ...course,
      enrollmentCount: course._count?.enrollments ?? 0,
      _count: undefined,
    };
  }

  async update(id, dto) {
    await this.getById(id);
    return this.repo.updateCourse(id, dto);
  }

  async remove(id) {
    await this.getById(id);
    await this.repo.deleteCourse(id);
  }

  async enrollStudent(courseId, studentId) {
    await this.getById(courseId);

    const existing = await this.repo.getEnrollment(studentId, courseId);
    if (existing) throw AppError.conflict("Student already enrolled in this course");

    const enrollment = await this.repo.createEnrollment({ courseId, studentId });

    const event = {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      type: "course.enrolled",
      data: {
        id: enrollment.id,
        courseId,
        studentId,
        createdAt: enrollment.createdAt.toISOString(),
      },
    };
    await publishEvent("course.enrolled", event, { messageId: event.eventId });

    return enrollment;
  }
}

module.exports = { CourseService };

