import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { generateAISuggestions } from "@/lib/generateSuggestions";
import { getCalendarFreeWindows } from "@/lib/googleCalendar";

// Haiku responds in 1-3 s — easily within the 10 s serverless limit
// No edge runtime needed; maxDuration helps on Vercel Pro if present
export const maxDuration = 60;

type ChildRow = Database["public"]["Tables"]["children"]["Row"];

// ---- Week number helper ----
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ---- Suggestion templates (in Hebrew) ----
interface Template {
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
  interests: string[];
  age_groups: string[];
}

// Seasons (month numbers): spring 3-5, summer 6-8, fall 9-11, winter 12-2
function currentSeason(): "spring" | "summer" | "fall" | "winter" {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "fall";
  return "winter";
}

const TEMPLATES: Template[] = [
  // ── Creative ──────────────────────────────────────────────
  {
    title: "בניית לגו ביחד",
    description: "שב על הרצפה ותן לילד להוביל את הבנייה. שום מסך, שום הכנה – רק שניכם.",
    duration_min: 20, prep_min: 0, time_slot: "17:30", day_label: "שלישי",
    category: "lego", activity_type: "creative",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["לגו", "מיינקראפט"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "ציור חופשי ביחד",
    description: "נייר לבן, צבעים, וחצי שעה בלי מסכות. הכי קל ומחבר שיש.",
    duration_min: 25, prep_min: 5, time_slot: "18:00", day_label: "שישי",
    category: "drawing", activity_type: "creative",
    accent_color: "oklch(0.55 0.15 42)", bg_color: "oklch(0.92 0.06 60 / 0.15)",
    interests: ["ציור", "אומנות"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "פלסטלינה ביחד",
    description: "תנו לילד להחליט מה בונים. אפילו עוגה מדומה עם שמחה אמיתית.",
    duration_min: 20, prep_min: 2, time_slot: "16:30", day_label: "שני",
    category: "art", activity_type: "creative",
    accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)",
    interests: ["ציור", "אומנות"], age_groups: ["0-2", "3-5", "6-8"],
  },
  {
    title: "עיצוב כרטיסי ברכה",
    description: "לסבא, לסבתא, לחבר. ילדים שכותבים מכתב מרגישים חשובים וקשורים.",
    duration_min: 20, prep_min: 5, time_slot: "18:30", day_label: "רביעי",
    category: "art", activity_type: "creative",
    accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)",
    interests: ["ציור", "אומנות", "ספרים"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "בנייה בקוביות עץ",
    description: "מגדל, גשר, בית – ותנו לו לנפץ אותו בסוף. זה הכי כיף.",
    duration_min: 15, prep_min: 0, time_slot: "17:00", day_label: "ראשון",
    category: "building", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["לגו"], age_groups: ["0-2", "3-5"],
  },

  // ── Reading & Stories ──────────────────────────────────────
  {
    title: "קריאה ביחד לפני שינה",
    description: "שכבו יחד על הספה ותנו לילד לבחור דף. רגע שקט שיוצר קרבה אמיתית.",
    duration_min: 20, prep_min: 0, time_slot: "20:00", day_label: "ראשון",
    category: "reading", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["ספרים", "אנימציה"], age_groups: ["0-2", "3-5", "6-8", "9-12"],
  },
  {
    title: "סיפור שממציאים ביחד",
    description: "אתה מתחיל משפט, הילד ממשיך. כל סיבוב מפתיע. 15 דקות של צחוק מובטח.",
    duration_min: 15, prep_min: 0, time_slot: "20:15", day_label: "שלישי",
    category: "storytelling", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["ספרים", "אנימציה"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "ספר שמע ביחד",
    description: "שכבו ותקשיבו לסיפור מוקלט. מרגיע ומחבר – אפילו לילדים שלא אוהבים לקרוא.",
    duration_min: 20, prep_min: 2, time_slot: "20:00", day_label: "חמישי",
    category: "reading", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["ספרים", "מוזיקה"], age_groups: ["3-5", "6-8", "9-12"],
  },

  // ── Music & Dance ──────────────────────────────────────────
  {
    title: "שירים ביחד – פלייליסט של הילד",
    description: "תנו לילד לבחור 3 שירים ותרקדו ביחד בסלון. 15 דקות של אנרגיה וחיוכים.",
    duration_min: 15, prep_min: 0, time_slot: "18:30", day_label: "רביעי",
    category: "music", activity_type: "energetic",
    accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)",
    interests: ["מוזיקה", "ריקוד"], age_groups: ["0-2", "3-5", "6-8", "9-12"],
  },
  {
    title: "קונצרט ביתי קטן",
    description: "כלי מטבח הופכים לתופים, כפות לחצוצרות. 15 דקות רועשות ומאושרות.",
    duration_min: 15, prep_min: 3, time_slot: "17:30", day_label: "שישי",
    category: "music", activity_type: "energetic",
    accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)",
    interests: ["מוזיקה", "ריקוד"], age_groups: ["0-2", "3-5", "6-8"],
  },
  {
    title: "ריקוד חופשי בסלון",
    description: "כבו את האורות, הדליקו מוזיקה ותנועו בלי חוקים. אפס הכנה, מקסימום כיף.",
    duration_min: 10, prep_min: 0, time_slot: "18:00", day_label: "שני",
    category: "dance", activity_type: "energetic",
    accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)",
    interests: ["ריקוד", "מוזיקה"], age_groups: ["0-2", "3-5", "6-8", "9-12"],
  },

  // ── Outdoor & Nature ───────────────────────────────────────
  {
    title: "סיבוב קצר בחוץ ביחד",
    description: "אפילו 15 דקות בחוץ עם ילדים יוצרת זיכרונות. תחפשו שלושה עלים שונים.",
    duration_min: 20, prep_min: 0, time_slot: "17:00", day_label: "שני",
    category: "nature", activity_type: "outdoor",
    accent_color: "oklch(0.48 0.16 148)", bg_color: "oklch(0.88 0.08 140 / 0.12)",
    interests: ["טבע", "טיולים", "מדע"], age_groups: ["0-2", "3-5", "6-8"],
  },
  {
    title: "ציד חרקים בגינה",
    description: "חפשו נמלים, חיפושיות, חילזונות. ילדים עם עניין במדע יתלהבו.",
    duration_min: 20, prep_min: 0, time_slot: "17:00", day_label: "שלישי",
    category: "nature", activity_type: "outdoor",
    accent_color: "oklch(0.48 0.16 148)", bg_color: "oklch(0.88 0.08 140 / 0.12)",
    interests: ["טבע", "מדע", "דינוזאורים"], age_groups: ["3-5", "6-8"],
  },
  {
    title: "גינון קטן ביחד",
    description: "שתלו זרע בעציץ. ילדים שגידלו משהו מרגישים אחריות ואהבה.",
    duration_min: 20, prep_min: 10, time_slot: "10:00", day_label: "שישי",
    category: "nature", activity_type: "outdoor",
    accent_color: "oklch(0.48 0.16 148)", bg_color: "oklch(0.88 0.08 140 / 0.12)",
    interests: ["טבע", "בישול", "מדע"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "תצפית כוכבים בלילה",
    description: "שכבו על שמיכה בחוץ וחפשו כוכבים. שאלות גדולות, רגע קטן ומיוחד.",
    duration_min: 20, prep_min: 0, time_slot: "20:30", day_label: "שישי",
    category: "nature", activity_type: "outdoor",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["מדע", "טבע"], age_groups: ["6-8", "9-12", "13+"],
  },

  // ── Sports ─────────────────────────────────────────────────
  {
    title: "20 דקות כדורגל בחצר",
    description: "כדור ושתי כתרות ויש לכם משחק. פשוט ואמיתי.",
    duration_min: 20, prep_min: 0, time_slot: "17:00", day_label: "שלישי",
    category: "sports", activity_type: "outdoor",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["כדורגל", "ספורט", "שחייה"], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "מסלול מכשולים בבית",
    description: "כריות, שמיכות, כיסאות – בנו מסלול ותתחרו. ילדים פעילים יתפוצצו מאושר.",
    duration_min: 20, prep_min: 5, time_slot: "17:30", day_label: "שני",
    category: "sports", activity_type: "energetic",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["כדורגל", "ספורט"], age_groups: ["3-5", "6-8"],
  },
  {
    title: "יוגה ילדים ביחד",
    description: "10 דקות של תנוחות כיפיות עם שמות של חיות. רגוע, מחבר ומצחיק.",
    duration_min: 15, prep_min: 0, time_slot: "07:30", day_label: "ראשון",
    category: "sports", activity_type: "calm",
    accent_color: "oklch(0.48 0.16 148)", bg_color: "oklch(0.88 0.08 140 / 0.12)",
    interests: ["ריקוד", "ספורט", "טבע"], age_groups: ["3-5", "6-8"],
  },
  {
    title: "שחייה חופשית בבריכה",
    description: "30 דקות של מים ומשחק. ילדים ששוחים עם הורה זוכרים את זה לכל החיים.",
    duration_min: 30, prep_min: 10, time_slot: "16:00", day_label: "שלישי",
    category: "sports", activity_type: "outdoor",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["שחייה", "ספורט", "טבע"], age_groups: ["0-2", "3-5", "6-8", "9-12"],
  },

  // ── Games ──────────────────────────────────────────────────
  {
    title: "משחק קופסא משפחתי",
    description: "בחרו משחק קצר שכולם מכירים ושחקו יחד. 20 דקות של צחוק ותחרות בריאה.",
    duration_min: 20, prep_min: 0, time_slot: "19:30", day_label: "שישי",
    category: "boardgame", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["משחקי קופסא"], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "חידונים ושאלות טריוויה",
    description: "שאלו שאלות מעולמות שהילד אוהב. ילדים בגיל 9+ יתחברו לזה מיד.",
    duration_min: 15, prep_min: 0, time_slot: "20:00", day_label: "שני",
    category: "boardgame", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["משחקי קופסא", "מדע"], age_groups: ["6-8", "9-12", "13+"],
  },
  {
    title: "קלפים – משחק Go Fish",
    description: "חפיסת קלפים = שעתיים של בידור. אפס הכנה, אפס עלות.",
    duration_min: 20, prep_min: 0, time_slot: "19:00", day_label: "רביעי",
    category: "boardgame", activity_type: "calm",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["משחקי קופסא"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "פאזל ביחד",
    description: "מצאו פאזל מתאים לגיל ועבדו עליו ביחד. 20 דקות של שקט ושיחה.",
    duration_min: 20, prep_min: 0, time_slot: "17:30", day_label: "ראשון",
    category: "boardgame", activity_type: "calm",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["משחקי קופסא", "לגו"], age_groups: ["3-5", "6-8", "9-12"],
  },

  // ── Cooking & Kitchen ──────────────────────────────────────
  {
    title: "בישול קל ביחד",
    description: "תנו לילד לערבב, לשפוך ולבחור. לא חשוב מה יוצא – חשוב שעשיתם ביחד.",
    duration_min: 20, prep_min: 10, time_slot: "16:30", day_label: "ראשון",
    category: "cooking", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "אפיית עוגיות ביחד",
    description: "מערבבים בצק, חותכים צורות, מקשטים. ריח הבית ממלא הכל. שווה כל רגע.",
    duration_min: 40, prep_min: 10, time_slot: "10:00", day_label: "שישי",
    category: "cooking", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "הכנת פיצה ביתית",
    description: "קנו בצק מוכן. כל ילד מקשט את הפיצה שלו. ארוחה שכולם אוהבים.",
    duration_min: 30, prep_min: 10, time_slot: "18:00", day_label: "שישי",
    category: "cooking", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול"], age_groups: ["6-8", "9-12", "13+"],
  },
  {
    title: "הכנת שייק פירות",
    description: "5 דקות, פירות, בלנדר. ילדים מתגאים במשהו שהכינו בעצמם.",
    duration_min: 10, prep_min: 5, time_slot: "16:00", day_label: "שני",
    category: "cooking", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול", "ספורט"], age_groups: ["3-5", "6-8", "9-12"],
  },

  // ── Science & Experiments ──────────────────────────────────
  {
    title: "ניסוי הר הגעש ביתי",
    description: "סודה לשתייה + חומץ = וולקאנו מהמם. ילדים אוהבי מדע יתלהבו.",
    duration_min: 20, prep_min: 10, time_slot: "17:00", day_label: "שלישי",
    category: "science", activity_type: "creative",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["מדע", "דינוזאורים", "טבע"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "ניסוי הסלים הצבעוניים",
    description: "פרחים לבנים במים עם צבע מאכל. לראות ביולוגיה בפעולה – מרתק.",
    duration_min: 15, prep_min: 5, time_slot: "16:30", day_label: "ראשון",
    category: "science", activity_type: "creative",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["מדע", "טבע"], age_groups: ["6-8", "9-12"],
  },
  {
    title: "בניית מצנח מניילון",
    description: "שקית ניילון, חוטים, חפץ קטן – ותשחרר מהמרפסת. פיזיקה אמיתית.",
    duration_min: 20, prep_min: 10, time_slot: "16:00", day_label: "רביעי",
    category: "science", activity_type: "creative",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["מדע", "לגו"], age_groups: ["6-8", "9-12", "13+"],
  },

  // ── Conversation & Bonding ─────────────────────────────────
  {
    title: "שיחת ערב אחד על אחד",
    description: "10 דקות לפני שינה – שאלו רק 'מה היה הכי כיף היום?' והקשיבו.",
    duration_min: 10, prep_min: 0, time_slot: "20:30", day_label: "שני",
    category: "conversation", activity_type: "calm",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: [], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "שיחה ברכב בדרך",
    description: "נסיעות הן הזדמנות זהב. שאלו שאלה אחת מעניינת ותקשיבו.",
    duration_min: 10, prep_min: 0, time_slot: "08:00", day_label: "ראשון",
    category: "conversation", activity_type: "calm",
    accent_color: "oklch(0.55 0.12 200)", bg_color: "oklch(0.90 0.05 200 / 0.12)",
    interests: [], age_groups: ["6-8", "9-12", "13+"],
  },
  {
    title: "ארוחה בלי מסכים",
    description: "ארוחת ערב אחת בלי טלפונים. שאלו שאלה אחת מעניינת ותראו מה קורה.",
    duration_min: 30, prep_min: 0, time_slot: "19:00", day_label: "שלישי",
    category: "conversation", activity_type: "calm",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: [], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "שאלות 'אם הייתי...'",
    description: "'אם הייתי בעל חיים מה הייתי?' – שאלות דמיון שפותחות שיחות עמוקות.",
    duration_min: 15, prep_min: 0, time_slot: "20:00", day_label: "חמישי",
    category: "conversation", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["ספרים", "אנימציה"], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },

  // ── Imagination & Role Play ────────────────────────────────
  {
    title: "משחק דינוזאורים קצר",
    description: "הניחו פסים על השטיח ותנו לדינוזאורים לספר סיפור. אפס הכנה, מקסימום כיף.",
    duration_min: 15, prep_min: 0, time_slot: "17:45", day_label: "חמישי",
    category: "dinos", activity_type: "creative",
    accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)",
    interests: ["דינוזאורים", "טבע"], age_groups: ["3-5", "6-8"],
  },
  {
    title: "משחק תפקידים – חנות",
    description: "הילד הוא המוכר, אתה הקונה. שטרות נייר, מחירים, עודף. מרתק לגילאי 3-6.",
    duration_min: 20, prep_min: 5, time_slot: "17:00", day_label: "ראשון",
    category: "roleplay", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול", "משחקי קופסא"], age_groups: ["3-5", "6-8"],
  },
  {
    title: "בנייה עם קרטונים ישנים",
    description: "אריזות ריקות הופכות לרכב, טירה, חללית. אפס עלות, מקסימום דמיון.",
    duration_min: 25, prep_min: 5, time_slot: "16:30", day_label: "שני",
    category: "building", activity_type: "creative",
    accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)",
    interests: ["לגו", "מיינקראפט"], age_groups: ["3-5", "6-8"],
  },

  // ── Teen-specific (13+) ────────────────────────────────────
  {
    title: "פרויקט YouTube קצר ביחד",
    description: "צלמו וידאו של 2 דקות על משהו שהילד אוהב. יוצרים ביחד – קשר אמיתי.",
    duration_min: 30, prep_min: 5, time_slot: "17:00", day_label: "שישי",
    category: "tech", activity_type: "creative",
    accent_color: "oklch(0.55 0.15 42)", bg_color: "oklch(0.92 0.06 60 / 0.15)",
    interests: ["מיינקראפט", "אנימציה"], age_groups: ["9-12", "13+"],
  },
  {
    title: "שיחת עתיד – מה אתה רוצה לעשות",
    description: "לא חקירה – סקרנות. שאלו על חלומות עם עניין אמיתי ובלי שיפוטיות.",
    duration_min: 20, prep_min: 0, time_slot: "21:00", day_label: "שישי",
    category: "conversation", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: [], age_groups: ["9-12", "13+"],
  },
  {
    title: "משחק וידאו ביחד – המצב של הילד",
    description: "תבקשו שילמד אתכם לשחק. ילדים שמלמדים הורים מרגישים מוערכים.",
    duration_min: 30, prep_min: 0, time_slot: "19:30", day_label: "שלישי",
    category: "tech", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["מיינקראפט", "אנימציה"], age_groups: ["9-12", "13+"],
  },
  {
    title: "בישול ארוחת ערב יחד",
    description: "הטיפוס מבשל, אתה עוזר. ממחישים שאתם צוות שווים.",
    duration_min: 30, prep_min: 10, time_slot: "17:30", day_label: "רביעי",
    category: "cooking", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול"], age_groups: ["9-12", "13+"],
  },

  // ── Toddler-specific (0-2) ─────────────────────────────────
  {
    title: "זמן בטן – שכיבה על הרצפה ביחד",
    description: "שכבו מולו על הרצפה ותחייכו. לתינוקות זה כל העולם.",
    duration_min: 10, prep_min: 0, time_slot: "09:30", day_label: "ראשון",
    category: "baby", activity_type: "calm",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: [], age_groups: ["0-2"],
  },
  {
    title: "שיר עם תנועות ביחד",
    description: "גלגל גלגל סביבוני, ידיים וכפות. ילדים קטנים מחכים לזה כל היום.",
    duration_min: 10, prep_min: 0, time_slot: "10:00", day_label: "שני",
    category: "baby", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)",
    interests: ["מוזיקה"], age_groups: ["0-2", "3-5"],
  },

  // ── Seasonal bonuses ───────────────────────────────────────
  {
    title: "הדלקת נרות חנוכה ביחד",
    description: "כל ילד מדליק נר, אתם שרים ביחד. מסורת שנשאית לכל החיים.",
    duration_min: 15, prep_min: 5, time_slot: "18:00", day_label: "ראשון",
    category: "holiday", activity_type: "calm",
    accent_color: "oklch(0.55 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: [], age_groups: ["0-2", "3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "הכנת משלוח מנות ביחד",
    description: "פורים – בחרו ביחד מה לשים, ארזו, ותנו ביחד. חינוך לנתינה בכיף.",
    duration_min: 30, prep_min: 15, time_slot: "10:00", day_label: "שישי",
    category: "holiday", activity_type: "creative",
    accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)",
    interests: ["בישול"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "ליקוט ועלים בסתיו",
    description: "אספו עלים צבעוניים ובנו קולאז' ביחד. טבע, אומנות, ושיחה – הכל ביחד.",
    duration_min: 25, prep_min: 0, time_slot: "16:30", day_label: "שני",
    category: "nature", activity_type: "outdoor",
    accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)",
    interests: ["טבע", "ציור", "אומנות"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "מים ושפריץ בגינה – יום קיץ",
    description: "צינור גינה + ילדים + שמש = קיץ מושלם. 20 דקות של שמחה טהורה.",
    duration_min: 20, prep_min: 2, time_slot: "17:00", day_label: "שלישי",
    category: "sports", activity_type: "outdoor",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["שחייה", "ספורט", "טבע"], age_groups: ["0-2", "3-5", "6-8"],
  },
];

// ---- Score template relevance for a list of children ----
function scoreTemplate(
  tmpl: Template,
  allInterests: string[],
  allAgeGroups: string[],
  season: "spring" | "summer" | "fall" | "winter"
): number {
  let s = 0;
  allInterests.forEach((i) => { if (tmpl.interests.includes(i)) s += 3; });
  allAgeGroups.forEach((ag) => { if (tmpl.age_groups.includes(ag)) s += 2; });
  // Prefer shorter activities (more achievable)
  if (tmpl.duration_min <= 20) s += 1;
  // Seasonal bonus
  if (season === "summer" && tmpl.activity_type === "outdoor") s += 2;
  if (season === "winter" && tmpl.activity_type === "calm") s += 1;
  if (tmpl.category === "holiday") s += 1; // always slightly boost holidays
  // Universal activities get a slight bonus if no interests matched
  if (tmpl.interests.length === 0) s += 0.5;
  return s;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekNumber = getISOWeekNumber(new Date());
  const force = new URL(request.url).searchParams.get("force") === "true";

  // On force-refresh: wipe all non-saved suggestions for this week so we regenerate
  if (force) {
    await supabase
      .from("suggestions")
      .delete()
      .eq("user_id", user.id)
      .eq("week_number", weekNumber)
      .neq("status", "saved");
  }

  // Check for existing suggestions this week (skip when force)
  if (!force) {
    const { data: existing } = await supabase
      .from("suggestions")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_number", weekNumber)
      .eq("status", "pending");

    if (existing && existing.length > 0) {
      return Response.json({ suggestions: existing });
    }
  }

  // Fetch children + user profile (calendar token + manual slots) in parallel
  const [{ data: rawChildren }, { data: profile }] = await Promise.all([
    supabase.from("children").select("*").eq("user_id", user.id),
    supabase.from("profiles")
      .select("free_time_slots, google_calendar_token, google_calendar_refresh_token")
      .eq("id", user.id)
      .single(),
  ]);
  const children = rawChildren as ChildRow[] | null;
  const freeTimeSlots: string[] = (profile?.free_time_slots ?? []) as string[];

  // Try to get live free windows from Google Calendar
  let calendarWindows: string[] = [];
  if (profile?.google_calendar_token) {
    const { decryptToken } = await import("@/lib/encrypt");
    try {
      calendarWindows = await getCalendarFreeWindows(
        decryptToken(profile.google_calendar_token),
        profile.google_calendar_refresh_token ? decryptToken(profile.google_calendar_refresh_token) : null,
        async (newToken) => {
          // Persist refreshed token (re-encrypt before storing)
          const { encryptToken } = await import("@/lib/encrypt");
          await supabase
            .from("profiles")
            .update({ google_calendar_token: encryptToken(newToken) })
            .eq("id", user.id);
        },
      );
    } catch {
      // Calendar unavailable — proceed without schedule constraint
    }
  }

  if (!children || children.length === 0) {
    return Response.json({ suggestions: [] });
  }

  // Fetch recently completed/saved moments to avoid repeats
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 30);
  const { data: recentMoments } = await supabase
    .from("saved_moments")
    .select("title")
    .eq("user_id", user.id)
    .gte("created_at", recentCutoff.toISOString())
    .limit(15);
  const recentTitles = (recentMoments ?? []).map((m) => m.title).filter(Boolean);

  // Try AI generation, fall back to templates
  let toInsert: Array<{
    user_id: string;
    child_id: string | null;
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
    status: "pending";
    week_number: number;
  }>;

  let aiError: string | null = null;

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in Vercel environment variables");
    }

    const childProfiles = children.map((c) => ({
      id: c.id,
      name: c.name,
      age_group: c.age_group ?? "",
      interests: c.interests ?? [],
    }));

    const aiSuggestions = await generateAISuggestions(childProfiles, recentTitles, freeTimeSlots, calendarWindows);

    toInsert = aiSuggestions.map((s) => {
      const child = children[s.child_index] ?? children[0];
      return {
        user_id: user.id,
        child_id: child.id,
        title: s.title,
        description: s.description,
        duration_min: s.duration_min,
        prep_min: s.prep_min,
        time_slot: s.time_slot,
        day_label: s.day_label,
        category: s.category,
        activity_type: s.activity_type,
        accent_color: s.accent_color,
        bg_color: s.bg_color,
        status: "pending" as const,
        week_number: weekNumber,
      };
    });
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);
    console.error("[BondFlow] AI generation failed:", aiError);

    // Fallback: template system — shuffle so repeat refreshes vary
    const allInterests = children.flatMap((c) => c.interests ?? []);
    const allAgeGroups = children.map((c) => c.age_group).filter((g): g is string => !!g);

    const ranked = [...TEMPLATES]
      .map((t) => ({
        t,
        score: scoreTemplate(t, allInterests, allAgeGroups, currentSeason()) + Math.random() * 0.8,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ t }) => t);

    toInsert = ranked.map((t, i) => ({
      user_id: user.id,
      child_id: children[i % children.length].id,
      title: t.title,
      description: t.description,
      duration_min: t.duration_min,
      prep_min: t.prep_min,
      time_slot: t.time_slot,
      day_label: t.day_label,
      category: t.category,
      activity_type: t.activity_type,
      accent_color: t.accent_color,
      bg_color: t.bg_color,
      status: "pending" as const,
      week_number: weekNumber,
    }));
  }

  const { data: inserted, error } = await supabase
    .from("suggestions")
    .insert(toInsert)
    .select();

  const suggestions = error ? toInsert : inserted;

  if (process.env.NODE_ENV === "development") {
    console.debug("[suggestions] aiUsed:", aiError === null, "aiError:", aiError);
  }
  return Response.json({ suggestions });
}
