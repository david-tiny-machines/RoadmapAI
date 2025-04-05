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
  currentDate.setDate(1); // Ensure we're at the start of the month
  
  for (let i = 0; i < n; i++) {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
}

/**
 * Generates an array of month strings for the previous N months
 * @param {number} n - Number of previous months to generate
 * @param {Date} [endDate=new Date()] - End date (defaults to current date)
 * @returns {string[]} Array of months in YYYY-MM format
 * 
 * @example
 * // Returns ['2025-03', '2025-02', '2025-01']
 * getPreviousNMonths(3, new Date('2025-04-01'))
 */
export function getPreviousNMonths(n: number, endDate: Date = new Date()): string[] {
  const months: string[] = [];
  const date = new Date(endDate);
  date.setDate(1); // Set to first day of month
  
  for (let i = 0; i < n; i++) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
    date.setMonth(date.getMonth() - 1);
  }
  
  return months;
}

/**
 * Formats a YYYY-MM date string into a more readable format
 * @param {string} dateStr - Date string in YYYY-MM format
 * @returns {string} Formatted date string (e.g., "Apr 2025")
 */
export function formatMonthYear(dateStr: string): string {
  if (!dateStr) return '';
  
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Converts a YYYY-MM string to a Date object set to the first day of that month
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {Date} Date object set to the first day of the month
 * 
 * @example
 * // Returns Date object for 2025-03-01
 * fromMonthString('2025-03')
 */
export function fromMonthString(monthStr: string): Date {
  if (!monthStr || typeof monthStr !== 'string' || !monthStr.includes('-')) {
     // Return an invalid date or handle error appropriately if input is bad
     return new Date(NaN); 
  }
  
  const parts = monthStr.split('-');
  if (parts.length !== 2) return new Date(NaN); // Invalid format

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  // Validate parts
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return new Date(NaN); // Invalid date parts
  }

  // Create Date object using UTC values
  // Note: month in Date constructor is 0-indexed (0=Jan, 1=Feb, ...)
  const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)); 
  return date;
}

/**
 * Formats a Date object to a user-friendly month and year string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string (e.g., "Apr 2025")
 * 
 * @example
 * // Returns "Mar 2025"
 * formatMonthYearFromDate(new Date(2025, 2, 15))
 */
export function formatMonthYearFromDate(date: Date): string {
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats a Date object or null into a YYYY-MM-DD string or null.
 * Uses UTC methods to avoid timezone-related date shifts.
 * @param {Date | null} date - Date object or null to format
 * @returns {string | null} Formatted date string (YYYY-MM-DD) or null
 */
export function formatDateToYYYYMMDD(date: Date | null): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  // Use UTC methods to prevent timezone shifts when extracting date parts
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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