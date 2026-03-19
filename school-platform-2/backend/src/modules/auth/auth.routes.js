const express = require("express");
const { validate } = require("../../middleware/validate");
const { RegisterDto, LoginDto, RefreshDto } = require("./auth.dto");
const { AuthService } = require("./auth.service");
const { AuthController } = require("./auth.controller");

const service = new AuthService();
const controller = new AuthController(service);

const authRouter = express.Router();

// Simple info/health endpoint for the auth module (useful behind the gateway)
authRouter.get("/", (_req, res) => res.json({ status: "ok", module: "auth" }));

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [ADMIN, TEACHER, STUDENT] }
 *     responses:
 *       201:
 *         description: Created
 */
authRouter.post("/register", validate({ body: RegisterDto }), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post("/login", validate({ body: LoginDto }), controller.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token (rotates refresh token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post("/refresh", validate({ body: RefreshDto }), controller.refresh);

module.exports = { authRouter };

