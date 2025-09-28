import { VALIDATION_RULES } from "./config";

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

  if (
    !data.quantity ||
    typeof data.quantity !== "number" ||
    data.quantity <= 0
  ) {
    errors.push("Quantity must be a positive number");
  }

  if (
    !data.unit ||
    typeof data.unit !== "string" ||
    data.unit.trim().length === 0
  ) {
    errors.push("Unit is required");
  } else {
    const trimmedUnit = data.unit.trim();
    if (!VALIDATION_RULES.UNIT.PATTERN.test(trimmedUnit)) {
      errors.push("Unit must contain only letters, spaces, and hyphens");
    }
    if (trimmedUnit.length < VALIDATION_RULES.UNIT.MIN_LENGTH) {
      errors.push(
        `Unit must be at least ${VALIDATION_RULES.UNIT.MIN_LENGTH} character long`
      );
    }
    if (trimmedUnit.length > VALIDATION_RULES.UNIT.MAX_LENGTH) {
      errors.push(
        `Unit must be less than ${VALIDATION_RULES.UNIT.MAX_LENGTH} characters`
      );
    }
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
