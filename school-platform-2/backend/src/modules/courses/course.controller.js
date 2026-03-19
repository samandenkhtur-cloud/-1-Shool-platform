const { BaseController } = require("../../common/base/Controller");
const { asyncHandler } = require("../../utils/asyncHandler");

class CourseController extends BaseController {
  /**
   * @param {import("./course.service").CourseService} service
   */
  constructor(service) {
    super();
    this.service = service;

    this.create = asyncHandler(this.create.bind(this));
    this.list = asyncHandler(this.list.bind(this));
    this.get = asyncHandler(this.get.bind(this));
    this.update = asyncHandler(this.update.bind(this));
    this.remove = asyncHandler(this.remove.bind(this));
    this.enroll = asyncHandler(this.enroll.bind(this));
  }

  async create(req, res) {
    const course = await this.service.create(req.body);
    return this.created(res, course);
  }

  async list(_req, res) {
    const courses = await this.service.list();
    return this.ok(res, courses);
  }

  async get(req, res) {
    const course = await this.service.getById(req.params.id);
    return this.ok(res, course);
  }

  async update(req, res) {
    const course = await this.service.update(req.params.id, req.body);
    return this.ok(res, course);
  }

  async remove(req, res) {
    await this.service.remove(req.params.id);
    return this.noContent(res);
  }

  async enroll(req, res) {
    const enrollment = await this.service.enrollStudent(req.params.courseId, req.body.studentId);
    return this.created(res, enrollment);
  }
}

module.exports = { CourseController };

