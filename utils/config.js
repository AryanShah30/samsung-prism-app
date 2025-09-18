export const EXPIRY_THRESHOLDS = {
  URGENT_DAYS: 3,      
  SOON_DAYS: 7,       

  EXPIRING_SOON_DAYS: 3,  
};

export const VALIDATION_RULES = {
  CATEGORY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-]+$/
  },
  ITEM_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-\(\)&]+$/  
  },
  UNIT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z\s\-]+$/  
  },
  NOTES: {
    MAX_LENGTH: 500,
    PATTERN: /^[a-zA-Z0-9\s\-\(\)&.,!?]+$/  
  },
  QUANTITY: {
    MIN: 0.01
  }
};
