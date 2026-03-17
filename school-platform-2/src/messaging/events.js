/**
 * Event naming convention (topic routing keys):
 *   <domain>.<action>
 * Examples:
 *   student.created
 *   course.enrolled
 */

const EVENTS = Object.freeze({
  STUDENT_CREATED: "student.created",
  COURSE_ENROLLED: "course.enrolled",
});

function isKnownEventName(name) {
  return Object.values(EVENTS).includes(name);
}

module.exports = { EVENTS, isKnownEventName };

