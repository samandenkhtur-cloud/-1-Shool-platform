const { EVENTS, isKnownEventName } = require("./events");
const { connectRabbit, publishEvent, publishJson } = require("./rabbitmq");
const { consumeJson, assertConsumerTopology, queueNames } = require("./consumer");

module.exports = {
  // Event naming convention
  EVENTS,
  isKnownEventName,

  // Connection manager + publisher
  connectRabbit,
  publishEvent,
  publishJson,

  // Consumer utility (retry + DLQ)
  consumeJson,
  assertConsumerTopology,
  queueNames,
};

