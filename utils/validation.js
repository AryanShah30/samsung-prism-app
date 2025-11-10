/**
 * Input validation utilities.
 *
 * These functions perform shallow validation of inbound payloads from the client
 * prior to database operations. They return a simple shape
 * `{ isValid: boolean, errors: string[] }` instead of throwing.
 */
import { VALIDATION_RULES } from "./config";

/**
 * Validate create/update payload for FoodItem.
 * @param {Object} data
 * @returns {{isValid:boolean, errors:string[]}}
 */
export function validateFoodItem(data) {
  const errors = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required");
  } else {
    const trimmedName = data.name.trim();
    if (!VALIDATION_RULES.ITEM_NAME.PATTERN.test(trimmedName)) {
      errors.push(
        "Item name must contain only letters, numbers, spaces, hyphens, parentheses, and ampersands"
      );
    }

    if (trimmedName.length < VALIDATION_RULES.ITEM_NAME.MIN_LENGTH) {
      errors.push(
        `Item name must be at least ${VALIDATION_RULES.ITEM_NAME.MIN_LENGTH} characters long`
      );
    }

    if (trimmedName.length > VALIDATION_RULES.ITEM_NAME.MAX_LENGTH) {
      errors.push(
        `Item name must be less than ${VALIDATION_RULES.ITEM_NAME.MAX_LENGTH} characters`
      );
    }
  }

  // quantity (in grams by default)
  if (!('quantity' in data) || typeof data.quantity !== 'number' || data.quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  // unit is optional but if present must be a string (we default to 'g' on the server)
  if (data.unit !== undefined && typeof data.unit !== 'string') {
    errors.push('Unit must be a string');
  }

  if (!data.expiryDate || isNaN(Date.parse(data.expiryDate))) {
    errors.push("Valid expiry date is required");
  }

  if (
    !data.categoryId ||
    !Number.isInteger(Number(data.categoryId)) ||
    Number(data.categoryId) <= 0
  ) {
    errors.push("Valid category ID is required");
  }

  if (
    data.notes &&
    typeof data.notes === "string" &&
    data.notes.trim().length > 0
  ) {
    const trimmedNotes = data.notes.trim();
    if (!VALIDATION_RULES.NOTES.PATTERN.test(trimmedNotes)) {
      errors.push("Notes contain invalid characters");
    }
    if (trimmedNotes.length > VALIDATION_RULES.NOTES.MAX_LENGTH) {
      errors.push(
        `Notes must be less than ${VALIDATION_RULES.NOTES.MAX_LENGTH} characters`
      );
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate create/update payload for Category.
 * @param {Object} data
 * @returns {{isValid:boolean, errors:string[]}}
 */
export function validateCategory(data) {
  const errors = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Category name is required");
  } else {
    const trimmedName = data.name.trim();
    if (!VALIDATION_RULES.CATEGORY_NAME.PATTERN.test(trimmedName)) {
      errors.push(
        "Category name must contain only letters, spaces, and hyphens"
      );
    }
    if (trimmedName.length < VALIDATION_RULES.CATEGORY_NAME.MIN_LENGTH) {
      errors.push(
        `Category name must be at least ${VALIDATION_RULES.CATEGORY_NAME.MIN_LENGTH} characters long`
      );
    }
    if (trimmedName.length > VALIDATION_RULES.CATEGORY_NAME.MAX_LENGTH) {
      errors.push(
        `Category name must be less than ${VALIDATION_RULES.CATEGORY_NAME.MAX_LENGTH} characters`
      );
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate chat message payload.
 * @param {{message:string}} data
 * @returns {{isValid:boolean, errors:string[]}}
 */
export function validateChatMessage(data) {
  const errors = [];

  if (
    !data.message ||
    typeof data.message !== "string" ||
    data.message.trim().length === 0
  ) {
    errors.push("Message is required");
  }

  if (data.message && data.message.length > 1000) {
    errors.push("Message too long (max 1000 characters)");
  }

  return { isValid: errors.length === 0, errors };
}
