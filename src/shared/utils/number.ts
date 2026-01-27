/**
 * Converts Persian digits (۰-۹) to English digits (0-9)
 * Also handles mixed input (both Persian and English digits)
 * @param input - String containing Persian and/or English digits
 * @returns String with all digits converted to English
 */
export function persianToEnglishNumber(input: nu): string {
  if (!input) return input;

  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = input;
  for (let i = 0; i < persianDigits.length; i++) {
    const persianDigit = persianDigits[i]!;
    const englishDigit = englishDigits[i]!;
    result = result.replace(new RegExp(persianDigit, 'g'), englishDigit);
  }

  return result;
}
