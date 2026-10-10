export const normalizeJsonLd = (value, fieldName = "Schema") => {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      const err = new Error(`${fieldName} must be valid JSON`);
      err.statusCode = 400;
      throw err;
    }
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    const err = new Error(`${fieldName} must be valid JSON`);
    err.statusCode = 400;
    throw err;
  }
};

export const parseJsonLd = (value) => {
  if (!value || typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
