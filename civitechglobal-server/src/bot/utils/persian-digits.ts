const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
const englishDigits = '0123456789';

export function normalizePersianDigits(input: string): string {
  return input
    .split('')
    .map((char) => {
      const persianIndex = persianDigits.indexOf(char);
      if (persianIndex !== -1) return englishDigits[persianIndex];

      const arabicIndex = arabicDigits.indexOf(char);
      if (arabicIndex !== -1) return englishDigits[arabicIndex];

      return char;
    })
    .join('');
}
