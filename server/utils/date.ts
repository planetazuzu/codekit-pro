/**
 * Date utility functions
 */

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Check if date is within last N days
 */
export function isWithinDays(date: Date | string, days: number): boolean {
  const targetDate = new Date(date);
  const daysAgo = getDaysAgo(days);
  return targetDate >= daysAgo;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(
  date: Date | string,
  locale: string = "es-ES"
): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

