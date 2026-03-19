const express = require("express");

const { authJwt } = require("../../middleware/authJwt");
const { requireRoles } = require("../../middleware/rbac");
const { validate } = require("../../middleware/validate");
const {
  CourseCreateDto,
  CourseUpdateDto,
  CourseIdParamsDto,
  EnrollParamsDto,
  EnrollBodyDto,
} = require("./course.dto");

const { CourseService } = require("./course.service");
const { CourseController } = require("./course.controller");

const controller = new CourseController(new CourseService());
const courseRouter = express.Router();

courseRouter.get("/", authJwt, controller.list);
courseRouter.get("/:id", authJwt, validate({ params: CourseIdParamsDto }), controller.get);

// CRUD - you can tighten RBAC as needed; defaulting to ADMIN/TEACHER for write ops.
courseRouter.post("/", authJwt, requireRoles("ADMIN", "TEACHER"), validate({ body: CourseCreateDto }), controller.create);
courseRouter.patch(
  "/:id",
  authJwt,
  requireRoles("ADMIN", "TEACHER"),
  validate({ params: CourseIdParamsDto, body: CourseUpdateDto }),
  controller.update
);
courseRouter.delete(
  "/:id",
  authJwt,
  requireRoles("ADMIN", "TEACHER"),
  validate({ params: CourseIdParamsDto }),
  controller.remove
);

// Enroll (JWT protected). Student services typically allow STUDENT; adjust RBAC later.
courseRouter.post(
  "/:courseId/enroll",
  authJwt,
  validate({ params: EnrollParamsDto, body: EnrollBodyDto }),
  controller.enroll
);

module.exports = { courseRouter };

