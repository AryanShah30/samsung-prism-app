/**
 * Global configuration constants used by both server and client.
 */
export const EXPIRY_THRESHOLDS = {
  URGENT_DAYS: 3,
  SOON_DAYS: 7,
};

/**
 * Validation rules for categories, items, and notes.
 * Keep patterns permissive for common punctuation yet protective against injection.
 */
export const VALIDATION_RULES = {
  CATEGORY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z\s\-]+$/,
  },

  ITEM_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z\s\-]+$/,
  },
  QUANTITY: {
    MIN: 0.01,
  },

  NOTES: {
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-\(\)&.,!?]+$/,
  },
};
