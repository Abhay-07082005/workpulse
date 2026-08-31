/**
 * Client-side date and time formatting utilities
 */

export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  if (startDate > endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

export function formatHours(hours: number): string {
  if (hours <= 0) return '0.00h';
  return `${hours.toFixed(2)}h`;
}
