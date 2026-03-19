const { BaseController } = require("../../common/base/Controller");
const { asyncHandler } = require("../../utils/asyncHandler");

class StudentController extends BaseController {
  /**
   * @param {import("./student.service").StudentService} service
   */
  constructor(service) {
    super();
    this.service = service;

    this.create = asyncHandler(this.create.bind(this));
    this.list = asyncHandler(this.list.bind(this));
    this.get = asyncHandler(this.get.bind(this));
    this.update = asyncHandler(this.update.bind(this));
    this.remove = asyncHandler(this.remove.bind(this));
  }

  async create(req, res) {
    const student = await this.service.create(req.body);
    return this.created(res, student);
  }

  async list(_req, res) {
    const result = await this.service.list(_req.query);
    return this.ok(res, result);
  }

  async get(req, res) {
    const student = await this.service.getById(req.params.id);
    return this.ok(res, student);
  }

  async update(req, res) {
    const student = await this.service.update(req.params.id, req.body);
    return this.ok(res, student);
  }

  async remove(req, res) {
    await this.service.remove(req.params.id);
    return this.noContent(res);
  }
}

module.exports = { StudentController };

