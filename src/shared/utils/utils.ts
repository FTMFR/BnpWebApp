import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// @ts-expect-error - jalaliday doesn't have type definitions
import jalaliday from 'jalaliday';

// Load plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(jalaliday);

export default dayjs;

export function toJalali(date: Date | string | number): string {
  // @ts-expect-error - calendar method is added by jalaliday plugin
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
  // @ts-expect-error - calendar method is added by jalaliday plugin
  return dayjs(date).calendar('jalali').format(format);
}

/**
 * Get current date in Jalali format
 */
export function getCurrentJalaliDate(): string {
  // @ts-expect-error - calendar method is added by jalaliday plugin
  return dayjs().calendar('jalali').format('YYYY/MM/DD');
}

