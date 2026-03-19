const express = require("express");

const { authJwt } = require("../../middleware/authJwt");
const { requireRoles } = require("../../middleware/rbac");
const { cacheResponse } = require("../../middleware/cacheResponse");
const { validate } = require("../../middleware/validate");
const { StudentCreateDto, StudentUpdateDto, StudentIdParamsDto, StudentListQueryDto } = require("./student.dto");
const { StudentRepository } = require("./student.repository");
const { StudentService } = require("./student.service");
const { StudentController } = require("./student.controller");

const repo = new StudentRepository();
const service = new StudentService(repo);
const controller = new StudentController(service);

const studentRouter = express.Router();

/**
 * @openapi
 * /students:
 *   get:
 *     summary: List students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
studentRouter.get(
  "/",
  authJwt,
  validate({ query: StudentListQueryDto }),
  cacheResponse({
    keyBuilder: (req) => `students:list:${JSON.stringify(req.query)}`,
  }),
  controller.list
);

/**
 * @openapi
 * /students:
 *   post:
 *     summary: Create student
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               status: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
studentRouter.post(
  "/",
  authJwt,
  validate({ body: StudentCreateDto }),
  controller.create
);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     summary: Get student by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
studentRouter.get(
  "/:id",
  authJwt,
  cacheResponse({
    keyBuilder: (req) => `students:id:${req.params.id}`,
  }),
  validate({ params: StudentIdParamsDto }),
  controller.get
);

studentRouter.patch(
  "/:id",
  authJwt,
  validate({ params: StudentIdParamsDto, body: StudentUpdateDto }),
  controller.update
);

studentRouter.delete(
  "/:id",
  authJwt,
  requireRoles("ADMIN"),
  validate({ params: StudentIdParamsDto }),
  controller.remove
);

module.exports = { studentRouter };

