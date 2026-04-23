import Anthropic from "@anthropic-ai/sdk";

interface ChildProfile {
  id: string;
  name: string;
  age_group: string;
  interests: string[];
}

export interface GeneratedSuggestion {
  title: string;
  description: string;
  duration_min: number;
  prep_min: number;
  time_slot: string;
  day_label: string;
  category: string;
  activity_type: string;
  accent_color: string;
  bg_color: string;
  child_index: number;
}

// Map manual slot keys → Hebrew labels (fallback when no Google Calendar)
const MANUAL_SLOT_LABELS: Record<string, string> = {
  weekday_afternoon: "ימי חול אחה\"צ (15:30–17:00)",
  weekday_evening:   "ימי חול ערב (17:00–20:30)",
  friday_afternoon:  "יום שישי אחה\"צ (14:00–18:00)",
  friday_evening:    "יום שישי ערב (18:00–22:00)",
  saturday_morning:  "שבת בוקר (09:00–12:00)",
  saturday_afternoon:"שבת אחה\"צ (12:00–17:00)",
  saturday_evening:  "שבת ערב (17:00–21:00)",
};

function buildScheduleNote(calendarWindows: string[], manualSlots: string[]): string {
  // Calendar windows take priority (specific: "שלישי 17:00–19:30")
  if (calendarWindows.length > 0) {
    const lines = calendarWindows.map((w) => `• ${w}`).join("\n");
    return `\nחלונות זמן פנויים לפי היומן של המשפחה השבוע — תבחר time_slot ו-day_label שנכנסים באחד מהחלונות הבאים:\n${lines}\n`;
  }
  // Fall back to manual slot labels
  if (manualSlots.length > 0) {
    const labels = manualSlots.map((s) => MANUAL_SLOT_LABELS[s] ?? s).join(", ");
    return `\nזמני הפנאי המועדפים של המשפחה (תתאם את time_slot ו-day_label לחלונות הזמן האלו):\n${labels}\n`;
  }
  return "";
}

const SYSTEM_PROMPT = `אתה מומחה לפעילויות הורים-ילדים למשפחות ישראליות. אתה יוצר הצעות פעילויות מותאמות אישית שהורים יכולים לעשות עם ילדיהם.

━━━ חוק ברזל #1 — ריאליזם מוחלט ━━━
כל פעילות חייבת להיות דבר אמיתי שניתן לעשות היום בבית, בגינה, בפארק השכונתי, או ברחוב. אם ילד לא יכול לעשות את זה בעצמו עם הורה — לא מציעים.
✗ לא מתירים: "ציד דינוזאורים", "טיסה לירח", "בניית מגדל גורדי שחקים", "פיצוח קוד סודי עם מחשב ענן"
✓ מותר: "בנינו דינוזאור מפלסטלינה", "שיחקנו כדורגל בגינה", "אפינו עוגיות ביחד"

━━━ חוק ברזל #2 — תחומי עניין כנושא, לא כמציאות ━━━
תחומי העניין של הילד הם השראה לנושא הפעילות — לא הפעילות עצמה.
• אוהב דינוזאורים → "בנו דינוזאור מפלסטלינה", "קראו ספר דינוזאורים", "ציירו דינוזאור יחד" — לא "ציד דינוזאורים"
• אוהב כדורגל → "שיחקו כדורגל בגינה", "תחרות פנדלים", "צפו במשחק יחד" — לא "התנדבו לאימון מקצועי"
• אוהב מוזיקה → "רקדו יחד בסלון", "שרו שיר אהוב", "נגנו על כלי נגינה ביתי"
• אוהב בישול → "אפו עוגיות יחד", "הכינו שייק פירות", "פיצה ביתית"
• אוהב מיינקראפט → "בנו עיר מלגו", "ציירו מפה של עולם דמיוני", "בנו קרטון לרכב"

━━━ description — הסבר ברור ━━━
כל description חייב לענות על: מה עושים בדיוק? מה צריך (אם יש)? למה זה כיף?
דוגמה טובה: "מרדדים פלסטלינה ביחד ומפסלים דינוזאורים — אין צורך בחומרים מיוחדים, רק פלסטלינה. ילדים אוהבים לבחור את הצבעים ולהמציא שמות."
דוגמה גרועה: "פעילות יצירתית עם דינוזאורים" (לא ברור מה עושים)

━━━ כללים נוספים ━━━
• 20–60 דקות, הכנה 0–15 דקות
• כל כותרת ותיאור בעברית
• גיוון: לפחות פעילות אחת בחוץ ואחת בפנים
• accent_color ו-bg_color בפורמט oklch

קטגוריות: lego, drawing, reading, music, outdoor, sports, cooking, boardgame, science, art, conversation, roleplay, building, nature, baby, tech, dance, holiday
activity_type: creative, calm, energetic, outdoor
ימים: ראשון, שני, שלישי, רביעי, חמישי, שישי, שבת

צבעים לפי קטגוריה:
• יצירתי/אומנות: "oklch(0.55 0.15 42)" / "oklch(0.92 0.06 60 / 0.15)"
• ספורט/חוץ: "oklch(0.55 0.14 140)" / "oklch(0.88 0.08 140 / 0.15)"
• קריאה/שקט: "oklch(0.52 0.18 255)" / "oklch(0.90 0.06 255 / 0.12)"
• מוזיקה/ריקוד: "oklch(0.52 0.18 320)" / "oklch(0.90 0.06 320 / 0.10)"
• בישול: "oklch(0.60 0.16 42)" / "oklch(0.93 0.07 60 / 0.15)"
• מדע: "oklch(0.55 0.14 140)" / "oklch(0.88 0.08 140 / 0.15)"`;

export async function generateAISuggestions(
  children: ChildProfile[],
  recentTitles: string[] = [],
  freeTimeSlots: string[] = [],        // manual slot keys from Settings
  calendarWindows: string[] = [],      // specific windows from Google Calendar e.g. "שלישי 17:00–19:30"
  goldenHour: number | null = null,    // user's most-successful completion hour (0-23)
): Promise<GeneratedSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });

  const childrenDesc = children
    .map(
      (c, i) =>
        `ילד ${i + 1}: שם: ${c.name}, גיל: ${c.age_group || "לא צוין"}, תחומי עניין: ${
          c.interests.length > 0 ? c.interests.join(", ") : "כללי"
        }`
    )
    .join("\n");

  const recentDesc =
    recentTitles.length > 0
      ? `\nפעילויות שנעשו לאחרונה (אל תחזור עליהן):\n${recentTitles.slice(0, 10).join(", ")}`
      : "";

  const scheduleNote = buildScheduleNote(calendarWindows, freeTimeSlots);
  const goldenHourNote = goldenHour !== null
    ? `\nשעת הזהב של המשפחה (הזמן בו הם הכי בהצלחה מבצעים פעילויות): ${String(goldenHour).padStart(2, "0")}:00 — העדף time_slot סביב השעה הזו כשהדבר אפשרי.\n`
    : "";

  const userPrompt = `צור 6 הצעות פעילויות מגוונות עבור הילדים הבאים:

${childrenDesc}${recentDesc}${scheduleNote}${goldenHourNote}
חשוב מאוד:
- הפץ את ההצעות בין הילדים השונים (כל ילד מקבל ~3 הצעות)
- התאם כל פעילות לתחומי העניין הספציפיים של הילד
- אם צוינו זמני פנאי — השתמש רק בחלונות הזמן שצוינו עבור time_slot ו-day_label
- אם לא צוינו זמני פנאי — גוון בין ימים ושעות (16:00–20:30)
- לפחות פעילות אחת בחוץ ואחת בבית

החזר JSON בלבד — מערך של בדיוק 6 אובייקטים:
title, description, duration_min, prep_min, time_slot, day_label, category, activity_type, accent_color, bg_color, child_index

child_index הוא אינדקס הילד (0 עבור ילד ראשון, 1 עבור שני וכו').`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text block in Claude response");
  }

  let raw = textBlock.text.trim();
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) raw = fenceMatch[1].trim();
  const jsonStart = raw.search(/[\[{]/);
  if (jsonStart > 0) raw = raw.slice(jsonStart);

  const parsed = JSON.parse(raw) as
    | { suggestions: GeneratedSuggestion[] }
    | GeneratedSuggestion[];
  const suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions;

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error("Claude returned empty suggestions array");
  }

  return suggestions;
}
