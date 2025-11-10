/**
 * Expiry status utilities.
 *
 * Provides helper functions to derive user-facing status and days-until-expiry
 * values consistently across API routes and UI components.
 */
import { EXPIRY_THRESHOLDS } from "./config";

/**
 * Derive status label for an expiry date.
 * @param {Date|string} expiryDate - Target expiry (parsable).
 * @returns {"Expired"|"Expiring Soon"|"Fresh"}
 */
export function calculateStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";

  if (diffDays <= EXPIRY_THRESHOLDS.URGENT_DAYS) return "Expiring Soon";

  return "Fresh";
}

/**
 * Compute day difference (ceil) between today and expiry.
 * Negative value indicates already expired.
 * @param {Date|string} expiryDate
 * @returns {number}
 */
export function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Convenience to return both status and days.
 * @param {Date|string} expiryDate
 * @returns {{status:string, daysUntilExpiry:number}}
 */
export function calculateStatusAndDays(expiryDate) {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  const status = calculateStatus(expiryDate);
  return { status, daysUntilExpiry };
}
