function stableStringify(obj) {
  if (!obj || typeof obj !== "object") return String(obj);
  const keys = Object.keys(obj).sort();
  const sorted = {};
  for (const k of keys) sorted[k] = obj[k];
  return JSON.stringify(sorted);
}

/**
 * Default GET cache key builder.
 * Use `namespace` to avoid collisions across modules.
 */
function buildGetKey({ namespace, path, query }) {
  const ns = namespace ? `${namespace}:` : "";
  return `${ns}get:${path}:${stableStringify(query ?? {})}`;
}

module.exports = { stableStringify, buildGetKey };

