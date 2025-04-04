/**
 * Generates an array of month strings for the next N months
 * @param {number} n - Number of months to generate
 * @param {Date} [startDate=new Date()] - Starting date (defaults to current date)
 * @returns {string[]} Array of months in YYYY-MM format
 * 
 * @example
 * // Returns ['2025-04', '2025-05', '2025-06']
 * getNextNMonths(3, new Date('2025-04-01'))
 */
export function getNextNMonths(n: number, startDate: Date = new Date()): string[] {
  const months: string[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < n; i++) {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
}

/**
 * Formats a month string into a human-readable format
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {string} Formatted string in "MMM YYYY" format
 * 
 * @example
 * // Returns "Apr 2025"
 * formatMonthYear('2025-04')
 */
export function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  return new Date(`${year}-${month}-01`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Returns the default monthly capacity in working days
 * @returns {number} Default capacity (20 days)
 * 
 * @description
 * Calculated based on:
 * - 5 working days per week
 * - ~4 weeks per month
 * - Excluding public holidays
 */
export function getDefaultCapacity(): number {
  // Assuming 5 working days per week, ~4 weeks per month
  return 20;
} 