export function normalizeText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeJsonParse(value, fallback = {}) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
