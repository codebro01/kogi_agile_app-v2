const publicHolidays = new Set([
  // Oct 2025
  '2025-10-01', '2025-10-29', '2025-10-30', '2025-10-31',
  // Dec 2025
  '2025-12-15', '2025-12-16', '2025-12-17', '2025-12-18', '2025-12-19',
  '2025-12-22', '2025-12-24', '2025-12-25', '2025-12-26', '2025-12-29',
  '2025-12-30', '2025-12-31',
  // Feb 2026
  '2026-02-04', '2026-02-05', '2026-02-06',
  // Mar 2026
  '2026-03-19', '2026-03-20',
  // Apr 2026
  '2026-04-03', '2026-04-06', '2026-04-20', '2026-04-21', '2026-04-22',
  '2026-04-23', '2026-04-24', '2026-04-27', '2026-04-28', '2026-04-29', '2026-04-30',
  // May 2026
  '2026-05-27', '2026-05-28',
  // Jun 2026
  '2026-06-18', '2026-06-19',
]);

const termRanges = {
  "First": { start: '2025-09-01', end: '2025-12-31' },
  "Second": { start: '2026-01-01', end: '2026-04-30' },
  "Third": { start: '2026-05-01', end: '2026-07-24' },
};

/**
 * Returns true if the given date string (YYYY-MM-DD) or Date object is a valid school day.
 */
export const isSchoolDay = (dateInput) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const dayOfWeek = date.getUTCDay();
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const dateString = `${yyyy}-${mm}-${dd}`;

  if (publicHolidays.has(dateString)) return false;

  return true;
};

/**
 * Get valid school days in a month.
 */
export const getValidSchoolDaysInMonth = (year, month) => {
  const m = Number(month) - 1; // 0-indexed for Date
  const y = Number(year);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let count = 0;

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(Date.UTC(y, m, i));
    if (isSchoolDay(d)) {
      count++;
    }
  }
  return count;
};

/**
 * Check if a date falls within a specific term based on our fixed terms.
 */
export const isDateInTerm = (dateInput, term) => {
  if (!termRanges[term]) return true; // If term is not First/Second/Third, ignore check
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const start = new Date(termRanges[term].start);
  const end = new Date(termRanges[term].end);
  return date >= start && date <= end;
};
