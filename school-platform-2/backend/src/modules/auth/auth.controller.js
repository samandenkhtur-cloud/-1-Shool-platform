const { BaseController } = require("../../common/base/Controller");
const { asyncHandler } = require("../../utils/asyncHandler");

class AuthController extends BaseController {
  /**
   * @param {import("./auth.service").AuthService} service
   */
  constructor(service) {
    super();
    this.service = service;

    this.register = asyncHandler(this.register.bind(this));
    this.login = asyncHandler(this.login.bind(this));
    this.refresh = asyncHandler(this.refresh.bind(this));
  }

  async register(req, res) {
    const result = await this.service.register(req.body);
    return this.created(res, result);
  }

  async login(req, res) {
    const result = await this.service.login(req.body);
    return this.ok(res, result);
  }

  async refresh(req, res) {
    const result = await this.service.refresh(req.body);
    return this.ok(res, result);
  }
}

module.exports = { AuthController };

