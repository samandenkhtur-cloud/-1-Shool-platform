const { env } = require("../config/env");
const { logger } = require("../utils/logger");
const { consumeJson } = require("../messaging/consumer");
const { addNotification, buildNotification } = require("../notifications/notification.store");

async function simulateEmail(to, subject, body) {
  // Simulate provider latency
  await new Promise((r) => setTimeout(r, 50));
  logger.info("EMAIL_SENT", { to, subject, bodyPreview: body.slice(0, 120) });
}

function pickRecipientFromStudentCreated(evt) {
  // In real life, route to guardian/admin/etc. For now we email the student address.
  return evt?.data?.email;
}

async function handleStudentCreated(event, meta) {
  logger.info("EVENT_RECEIVED", { ...meta, type: event.type, eventId: event.eventId });

  const to = pickRecipientFromStudentCreated(event);
  if (!to) throw new Error("Missing recipient email");

  await addNotification(
    buildNotification({
      type: "student.created",
      message: `Student ${event.data.name} created`,
      data: event.data,
    })
  );

  await simulateEmail(
    to,
    "Welcome to School Platform",
    `Hi ${event.data.name}, your student profile has been created.`
  );
}

async function handleCourseEnrolled(event, meta) {
  logger.info("EVENT_RECEIVED", { ...meta, type: event.type, eventId: event.eventId });

  // We only have IDs in the event; for now log a notification.
  // In a real implementation you'd look up course title and student contact via service calls/read model.
  await addNotification(
    buildNotification({
      type: "course.enrolled",
      message: `Student ${event.data.studentId} enrolled in course ${event.data.courseId}`,
      data: event.data,
    })
  );

  await simulateEmail(
    "notifications@local.test",
    "Student enrolled",
    `Student ${event.data.studentId} enrolled in course ${event.data.courseId}.`
  );
}

async function startNotificationWorker() {
  logger.info("Notification worker starting", {
    exchange: env.RABBITMQ_EXCHANGE,
    prefetch: env.RABBITMQ_PREFETCH,
    maxRetries: env.RABBITMQ_MAX_RETRIES,
  });

  await Promise.all([
    consumeJson({
      queueName: "notification.student.created",
      routingKeys: ["student.created"],
      handler: handleStudentCreated,
    }),
    consumeJson({
      queueName: "notification.course.enrolled",
      routingKeys: ["course.enrolled"],
      handler: handleCourseEnrolled,
    }),
  ]);
}

module.exports = { startNotificationWorker };

if (require.main === module) {
  startNotificationWorker().catch((e) => {
    logger.error("Notification worker crashed", { message: e.message });
    process.exit(1);
  });
}

