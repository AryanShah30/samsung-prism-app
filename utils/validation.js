export function validateFoodItem(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!data.quantity || typeof data.quantity !== 'number' || data.quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }
  
  if (!data.unit || typeof data.unit !== 'string' || data.unit.trim().length === 0) {
    errors.push('Unit is required');
  }
  
  if (!data.expiryDate || isNaN(Date.parse(data.expiryDate))) {
    errors.push('Valid expiry date is required');
  }
  
  if (!data.categoryId || !Number.isInteger(Number(data.categoryId)) || Number(data.categoryId) <= 0) {
    errors.push('Valid category ID is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateChatMessage(data) {
  const errors = [];
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required');
  }
  
  if (data.message && data.message.length > 1000) {
    errors.push('Message too long (max 1000 characters)');
  }
  
  return { isValid: errors.length === 0, errors };
}
