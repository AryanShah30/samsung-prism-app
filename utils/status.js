export function calculateStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";
  if (diffDays <= 3) return "Expiring Soon";
  return "Fresh";
}

export function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateStatusAndDays(expiryDate) {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  const status = calculateStatus(expiryDate);
  return { status, daysUntilExpiry };
}