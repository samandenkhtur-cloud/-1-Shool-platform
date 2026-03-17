const { z } = require("zod");

const RegisterDto = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
});

const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RefreshDto = z.object({
  refreshToken: z.string().min(1),
});

module.exports = { RegisterDto, LoginDto, RefreshDto };

