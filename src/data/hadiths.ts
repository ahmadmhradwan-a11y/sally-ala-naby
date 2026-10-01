/**
 * Virtues of sending salawat upon the Prophet ﷺ — authenticated texts only.
 * The Quranic command, then hadiths from the Sahihain and Hasan-graded
 * narrations from Tirmidhi, Abu Dawud and al-Nasa'i. Every item carries
 * its source so nothing unauthenticated is displayed.
 */

export interface DhikrItem {
  text: string;
  source: string;
}

export const HADITHS: DhikrItem[] = [
  {
    text: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا",
    source: "سورة الأحزاب: ٥٦",
  },
  {
    text: "مَن صلَّى عليَّ صلاةً صلَّى اللهُ عليه بها عشرًا",
    source: "رواه البخاري ومسلم",
  },
  {
    text: "أولى الناسِ بي يومَ القيامةِ أكثرُهم عليَّ صلاةً",
    source: "رواه الترمذي وحسّنه",
  },
  {
    text: "البخيلُ الذي إذا ذُكرتُ عنده لم يُصلِّ عليَّ",
    source: "رواه الترمذي وحسّنه",
  },
  {
    text: "خيرُ أيامِكم يومُ الجمعةِ؛ فيه خُلق آدمُ وفيه قُبض، وفيه النفخةُ والصعقةُ، فأكثِروا عليَّ من الصلاةِ فيه؛ فإنّ صلاتَكم معروضةٌ عليَّ",
    source: "رواه أبو داود والنسائي وصححه الألباني",
  },
  {
    text: "إنَّ للهِ ملائكةً سيّاحين في الأرضِ يُبلِّغونني من أمَّتي السلامَ",
    source: "رواه النسائي وصححه الألباني",
  },
];
