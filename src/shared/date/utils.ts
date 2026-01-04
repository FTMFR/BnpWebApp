import dayjs from './dayjs.config';

/**
 * Convert Gregorian date to Jalali (Persian) date
 */
export function toJalali(date: Date | string | number): string {
  return dayjs(date).calendar('jalali').format('YYYY/MM/DD');
}

/**
 * Convert Jalali date to Gregorian date
 */
export function fromJalali(jalaliDate: string): Date {
  return dayjs(jalaliDate, 'jYYYY/jMM/jDD').toDate();
}

/**
 * Format date in Persian format
 */
export function formatPersianDate(date: Date | string | number, format = 'jYYYY/jMM/jDD'): string {
  return dayjs(date).calendar('jalali').format(format);
}

/**
 * Get current date in Jalali format
 */
export function getCurrentJalaliDate(): string {
  return dayjs().calendar('jalali').format('YYYY/MM/DD');
}

