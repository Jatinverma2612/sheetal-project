export const validateJsonLd = (value) => {
  if (!value || !String(value).trim()) {
    return { valid: true, formatted: "" };
  }

  try {
    const parsed = JSON.parse(value);
    return {
      valid: true,
      formatted: JSON.stringify(parsed, null, 2),
    };
  } catch (error) {
    return {
      valid: false,
      error: "Schema must be valid JSON.",
    };
  }
};
