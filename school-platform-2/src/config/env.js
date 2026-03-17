const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  GATEWAY_PORT: z.coerce.number().int().positive().default(8080),

  AUTH_SERVICE_URL: z.string().min(1).default("http://localhost:3001"),
  STUDENT_SERVICE_URL: z.string().min(1).default("http://localhost:3002"),
  COURSE_SERVICE_URL: z.string().min(1).default("http://localhost:3003"),
  NOTIFICATION_SERVICE_URL: z.string().min(1).default("http://localhost:3004"),

  // Optional for non-DB processes (e.g. gateway, workers).
  DATABASE_URL: z.string().min(1).optional(),

  // Optional for processes that don't validate/issue JWTs (e.g. notification worker).
  JWT_ACCESS_SECRET: z.string().min(20).optional(),
  JWT_REFRESH_SECRET: z.string().min(20).optional(),
  JWT_ISSUER: z.string().min(1).default("school-platform"),
  JWT_AUDIENCE: z.string().min(1).default("school-platform-api"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("30d"),

  // Optional dev convenience: seed an initial admin user (auth-service only).
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  CORS_ORIGIN: z.string().min(1).default("*"),

  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),

  RABBITMQ_URL: z.string().min(1).default("amqp://guest:guest@localhost:5672"),
  RABBITMQ_EXCHANGE: z.string().min(1).default("school.events"),
  RABBITMQ_PREFETCH: z.coerce.number().int().positive().default(10),
  RABBITMQ_MAX_RETRIES: z.coerce.number().int().min(0).max(20).default(5),
  RABBITMQ_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(1000),

  NOTIFICATION_WORKER_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  NOTIFICATION_MAX_ITEMS: z.coerce.number().int().positive().default(200),

  SWAGGER_TITLE: z.string().default("Microservice Template API"),
  SWAGGER_VERSION: z.string().default("1.0.0"),

  ENABLE_METRICS: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  METRICS_PATH: z.string().min(1).default("/metrics"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

module.exports = { env };

