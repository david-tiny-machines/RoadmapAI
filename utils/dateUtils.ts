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

export function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  return new Date(`${year}-${month}-01`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

export function getDefaultCapacity(): number {
  // Assuming 5 working days per week, ~4 weeks per month
  return 20;
} 