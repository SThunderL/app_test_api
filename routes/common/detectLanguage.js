module.exports = function (text) {
  if (!text || !text.trim()) return 'unknown';

  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  if (hasArabic) return 'ar';

  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  if (hasCyrillic) return 'ru'; // common Cyrillic language fallback

  const hasHan = /[\p{Script=Han}]/u.test(text);
  if (hasHan) return 'zh';

//   const hasHebrew = /[\u0590-\u05FF]/.test(text);
//   if (hasHebrew) return 'he';

  // If mostly ASCII letters, return 'en' as a reasonable default
  const latinRatio = (text.match(/[A-Za-z]/g) || []).length / Math.max(1, text.length);
  if (latinRatio > 0.3) return 'en';

  return 'unknown';
}