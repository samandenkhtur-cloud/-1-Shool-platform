const { z } = require("zod");

const CourseCreateDto = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
});

const CourseUpdateDto = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

const CourseIdParamsDto = z.object({
  id: z.string().uuid(),
});

const EnrollParamsDto = z.object({
  courseId: z.string().uuid(),
});

const EnrollBodyDto = z.object({
  studentId: z.string().uuid(),
});

module.exports = {
  CourseCreateDto,
  CourseUpdateDto,
  CourseIdParamsDto,
  EnrollParamsDto,
  EnrollBodyDto,
};

