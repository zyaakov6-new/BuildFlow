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

const SYSTEM_PROMPT = `אתה מומחה לפעילויות הורים-ילדים למשפחות ישראליות. אתה יוצר הצעות פעילויות מותאמות אישית שהורים יכולים לעשות עם ילדיהם.

חוק ברזל — ריאליזם:
כל הפעילויות חייבות להיות ריאליסטיות לחלוטין — דברים שניתן לעשות בפועל בבית, בגינה, בפארק קרוב או בשכונה. אסור להמציא פעילויות דמיוניות או בלתי אפשריות.

כיצד להשתמש בתחומי עניין:
השתמש בתחומי העניין של הילד כנושא/תמה לפעילות ריאלית — לא כפשוטו.
דוגמאות נכונות:
- אוהב דינוזאורים → "בנו דינוזאור מפלסטלינה יחד", "קראו ספר על דינוזאורים", "צפו בסרט דינוזאורים" — לא "צאו לצוד דינוזאורים"
- אוהב כדורגל → "שחקו כדורגל בגינה", "צפו במשחק יחד", "עשו תחרות פנדלים" — לא "התנדבו לאימון מקצועי"
- אוהב מוזיקה → "נגנו על כלי נגינה ביתי", "רקדו יחד בסלון", "הכינו רשימת שירים אהובים"
- אוהב בישול → "אפו עוגיות יחד", "הכינו פיצה ביתית", "עשו שייק פירות"

כללים:
- פעילויות קצרות: 20–60 דקות, הכנה 0–15 דקות
- גיוון בין ימים ושעות (16:00–20:30)
- גיוון בין סוגי פעילויות: יצירה, ספורט, קריאה, בישול, משחק, שיחה
- כל הכותרות והתיאורים בעברית
- accent_color ו-bg_color בפורמט oklch

קטגוריות: lego, drawing, reading, music, outdoor, sports, cooking, boardgame, science, art, conversation, roleplay, building, nature, baby, tech, dance, holiday
activity_type: creative, calm, energetic, outdoor
ימים: ראשון, שני, שלישי, רביעי, חמישי, שישי, שבת

צבעים לפי קטגוריה:
- יצירתי/אומנות: "oklch(0.55 0.15 42)" / "oklch(0.92 0.06 60 / 0.15)"
- ספורט/חוץ: "oklch(0.55 0.14 140)" / "oklch(0.88 0.08 140 / 0.15)"
- קריאה/שקט: "oklch(0.52 0.18 255)" / "oklch(0.90 0.06 255 / 0.12)"
- מוזיקה/ריקוד: "oklch(0.52 0.18 320)" / "oklch(0.90 0.06 320 / 0.10)"
- בישול: "oklch(0.60 0.16 42)" / "oklch(0.93 0.07 60 / 0.15)"
- מדע: "oklch(0.55 0.14 140)" / "oklch(0.88 0.08 140 / 0.15)"`;

export async function generateAISuggestions(
  children: ChildProfile[],
  recentTitles: string[] = []
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

  const userPrompt = `צור 6 הצעות פעילויות מגוונות עבור הילדים הבאים:

${childrenDesc}${recentDesc}

חשוב מאוד:
- הפץ את ההצעות בין הילדים השונים (כל ילד מקבל ~3 הצעות)
- התאם כל פעילות לתחומי העניין הספציפיים של הילד
- גיוון בין ימים (ראשון עד שישי) ושעות (16:00-20:30)
- לפחות 2 פעילויות חוץ ו-2 פעילויות בבית

החזר JSON בלבד — מערך של בדיוק 6 אובייקטים עם המפתחות:
title, description, duration_min, prep_min, time_slot, day_label, category, activity_type, accent_color, bg_color, child_index

child_index הוא אינדקס הילד (0 עבור ילד ראשון, 1 עבור שני וכו').`;

  // Use the SDK directly in Node.js serverless — most reliable approach
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1000,
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
