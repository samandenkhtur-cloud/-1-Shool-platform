const { z } = require("zod");

const StudentCreateDto = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  age: z.coerce.number().int().min(1).max(150),
});

const StudentUpdateDto = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
    age: z.coerce.number().int().min(1).max(150).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

const StudentIdParamsDto = z.object({
  id: z.string().uuid(),
});

const StudentListQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().min(1).max(200).optional(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  minAge: z.coerce.number().int().min(1).max(150).optional(),
  maxAge: z.coerce.number().int().min(1).max(150).optional(),
});

module.exports = {
  StudentCreateDto,
  StudentUpdateDto,
  StudentIdParamsDto,
  StudentListQueryDto,
};

