export function calculateStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";
  if (diffDays <= 3) return "Expiring Soon";
  return "Fresh";
}
