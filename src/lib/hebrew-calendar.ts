/**
 * Hebrew-calendar holiday detection using the native Intl Hebrew calendar.
 *
 * Returns the currently-active Jewish holiday window (if any), plus a short
 * Hebrew seasonal context string to inject into AI prompts so suggestions
 * feel culturally relevant to Israeli families.
 *
 * Zero dependencies — works on Node + Edge runtimes.
 */

export interface HolidayContext {
  /** Short Hebrew name of the active holiday, e.g. "חנוכה" */
  name: string;
  /** One-line Hebrew description used in the AI prompt */
  hint: string;
}

interface HebrewDate {
  monthName: string; // e.g. "Nisan", "Kislev", "Adar", "Adar II"
  day: number;
}

function hebrewDateFromJS(date: Date): HebrewDate {
  const parts = new Intl.DateTimeFormat("en-u-ca-hebrew", {
    month: "long",
    day: "numeric",
  }).formatToParts(date);
  const monthName = parts.find((p) => p.type === "month")?.value ?? "";
  const dayStr = parts.find((p) => p.type === "day")?.value ?? "0";
  return { monthName, day: parseInt(dayStr, 10) };
}

export function getHolidayContext(date: Date = new Date()): HolidayContext | null {
  const { monthName, day } = hebrewDateFromJS(date);

  // Tishri
  if (monthName === "Tishri") {
    if (day <= 2) return { name: "ראש השנה", hint: "ראש השנה — רעיונות טעימים של דבש, תפוח, רימון, וסיפור שנה טובה." };
    if (day === 10) return { name: "יום כיפור", hint: "יום כיפור — פעילויות שקטות ורפלקטיביות, סיפור על סליחה וקשר." };
    if (day >= 15 && day <= 21) return { name: "סוכות", hint: "סוכות — קישוט סוכה, ארבעת המינים, ארוחה בסוכה עם הילד." };
    if (day === 22 || day === 23) return { name: "שמחת תורה", hint: "שמחת תורה — ריקוד עם דגל, שירים, חגיגיות של ספר תורה." };
  }

  // Kislev → Tevet (Hanukkah: Kislev 25 – Tevet 2 or 3)
  if (monthName === "Kislev" && day >= 25) return { name: "חנוכה", hint: "חנוכה — הדלקת נרות יחד, סופגניות, סביבונים, שירי חנוכה." };
  if (monthName === "Tevet" && day <= 3) return { name: "חנוכה", hint: "חנוכה — הדלקת נרות יחד, סופגניות, סביבונים, שירי חנוכה." };

  // Shevat
  if (monthName === "Shevat" && day === 15) return { name: "ט\"ו בשבט", hint: "ט\"ו בשבט — נטיעת צמח, טעימת פירות יבשים, סדר ט\"ו בשבט קצר." };

  // Adar / Adar II (Purim on Adar 14 in regular years, Adar II 14 in leap years)
  if ((monthName === "Adar" || monthName === "Adar II") && (day === 13 || day === 14 || day === 15)) {
    return { name: "פורים", hint: "פורים — תחפושות, רעשנים, אפיית אוזני המן, משלוחי מנות." };
  }

  // Nisan — Passover (15-21 in Israel); also Yom HaShoah (27)
  if (monthName === "Nisan") {
    if (day >= 14 && day <= 21) return { name: "פסח", hint: "פסח — אפיית מצות, הגדה של ילדים, חיפוש האפיקומן, סיפור יציאת מצריים." };
    if (day === 27) return { name: "יום השואה", hint: "יום השואה — פעילות שקטה, סיפור משפחתי, הדלקת נר." };
  }

  // Iyar — Yom HaZikaron (4), Yom HaAtzmaut (5), Lag BaOmer (18)
  if (monthName === "Iyar") {
    if (day === 4) return { name: "יום הזיכרון", hint: "יום הזיכרון — רגע של שקט משותף, סיפור על גבורה, הדלקת נר." };
    if (day === 5) return { name: "יום העצמאות", hint: "יום העצמאות — דגל כחול-לבן, מנגל, שירי ארץ ישראל, ציור דגל." };
    if (day === 18) return { name: "ל\"ג בעומר", hint: "ל\"ג בעומר — הכנת חץ וקשת, סיפור על רבי שמעון, מדורה קטנה ובטוחה." };
  }

  // Sivan — Shavuot (6-7)
  if (monthName === "Sivan" && (day === 6 || day === 7)) {
    return { name: "שבועות", hint: "שבועות — קישוט עם פרחים, אפיית גבינות, לילה לבן של סיפורים." };
  }

  // Av — Tisha B'Av (9)
  if (monthName === "Av" && day === 9) {
    return { name: "תשעה באב", hint: "תשעה באב — פעילות שקטה ורפלקטיבית, סיפור על ירושלים." };
  }

  return null;
}

export function currentSeason(date: Date = new Date()): "spring" | "summer" | "autumn" | "winter" {
  const m = date.getMonth() + 1; // 1..12
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

export function seasonHint(date: Date = new Date()): string {
  const s = currentSeason(date);
  if (s === "summer") return "קיץ ישראלי — חום, שעות אחר הצהריים חונקות; עדיפות לפעילויות מוצלות או במזגן.";
  if (s === "winter") return "חורף ישראלי — עדיפות לפעילויות בבית או לבושים חם.";
  if (s === "spring") return "אביב — מזג אוויר נעים, נפלא לפעילויות בחוץ.";
  return "סתיו — מזג אוויר נעים, מעבר בין קיץ לחורף.";
}
