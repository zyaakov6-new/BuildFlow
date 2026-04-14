import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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

const TEMPLATES: Template[] = [
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
    title: "קריאה ביחד לפני שינה",
    description: "שכבו יחד על הספה ותנו לילד לבחור דף. רגע שקט שיוצר קרבה אמיתית.",
    duration_min: 20, prep_min: 0, time_slot: "20:00", day_label: "ראשון",
    category: "reading", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["ספרים", "קריאה", "אנימציה"], age_groups: ["0-2", "3-5", "6-8", "9-12"],
  },
  {
    title: "שירים ביחד – פלייליסט של הילד",
    description: "תנו לילד לבחור 3 שירים ותרקדו ביחד בסלון. 15 דקות של אנרגיה וחיוכים.",
    duration_min: 15, prep_min: 0, time_slot: "18:30", day_label: "רביעי",
    category: "music", activity_type: "energetic",
    accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)",
    interests: ["מוזיקה", "ריקוד"], age_groups: ["0-2", "3-5", "6-8", "9-12"],
  },
  {
    title: "סיבוב קצר בחוץ ביחד",
    description: "אפילו 15 דקות בחוץ עם ילדים יוצרת זיכרונות. תחפשו שלושה עלים שונים.",
    duration_min: 20, prep_min: 0, time_slot: "17:00", day_label: "שני",
    category: "nature", activity_type: "outdoor",
    accent_color: "oklch(0.48 0.16 148)", bg_color: "oklch(0.88 0.08 140 / 0.12)",
    interests: ["טבע", "טיולים", "מדע"], age_groups: ["0-2", "3-5", "6-8"],
  },
  {
    title: "משחק דינוזאורים קצר",
    description: "הניחו פסים על השטיח ותנו לדינוזאורים לספר סיפור. אפס הכנה, מקסימום כיף.",
    duration_min: 15, prep_min: 0, time_slot: "17:45", day_label: "חמישי",
    category: "dinos", activity_type: "creative",
    accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)",
    interests: ["דינוזאורים", "טבע"], age_groups: ["3-5", "6-8"],
  },
  {
    title: "בישול קל ביחד",
    description: "תנו לילד לערבב, לשפוך ולבחור. לא חשוב מה יוצא – חשוב שעשיתם ביחד.",
    duration_min: 20, prep_min: 10, time_slot: "16:30", day_label: "ראשון",
    category: "cooking", activity_type: "creative",
    accent_color: "oklch(0.60 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.15)",
    interests: ["בישול"], age_groups: ["3-5", "6-8", "9-12"],
  },
  {
    title: "20 דקות כדורגל בחצר",
    description: "כדור ושתי כתרות ויש לכם משחק. פשוט ואמיתי.",
    duration_min: 20, prep_min: 0, time_slot: "17:00", day_label: "שלישי",
    category: "sports", activity_type: "outdoor",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: ["כדורגל", "שחייה", "ספורט"], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "משחק קופסא משפחתי",
    description: "בחרו משחק קצר שכולם מכירים ושחקו יחד. 20 דקות של צחוק ותחרות בריאה.",
    duration_min: 20, prep_min: 0, time_slot: "19:30", day_label: "שישי",
    category: "boardgame", activity_type: "calm",
    accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)",
    interests: ["משחקי קופסא"], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
  {
    title: "שיחת ערב אחד על אחד",
    description: "10 דקות לפני שינה – שאלו רק 'מה היה הכי כיף היום?' והקשיבו.",
    duration_min: 10, prep_min: 0, time_slot: "20:30", day_label: "שני",
    category: "conversation", activity_type: "calm",
    accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)",
    interests: [], age_groups: ["3-5", "6-8", "9-12", "13+"],
  },
];

// ---- Score template relevance for a list of children ----
function scoreTemplate(
  tmpl: Template,
  allInterests: string[],
  allAgeGroups: string[]
): number {
  let s = 0;
  allInterests.forEach((i) => { if (tmpl.interests.includes(i)) s += 3; });
  allAgeGroups.forEach((ag) => { if (tmpl.age_groups.includes(ag)) s += 2; });
  return s;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekNumber = getISOWeekNumber(new Date());
  const year = new Date().getFullYear();

  // Check for existing suggestions this week
  const { data: existing } = await supabase
    .from("suggestions")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_number", weekNumber)
    .neq("status", "dismissed");

  if (existing && existing.length > 0) {
    return Response.json({ suggestions: existing });
  }

  // Fetch the user's children
  const { data: rawChildren } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id);
  const children = rawChildren as ChildRow[] | null;

  // Gather interests + age groups across all children
  const allInterests = (children ?? []).flatMap((c) => c.interests ?? []);
  const allAgeGroups = (children ?? []).map((c) => c.age_group).filter(Boolean);

  // Rank and pick top 6 templates
  const ranked = [...TEMPLATES]
    .map((t) => ({ t, score: scoreTemplate(t, allInterests, allAgeGroups) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ t }) => t);

  // Build insert rows, attaching the first child where possible
  const firstChildId = children && children.length > 0 ? children[0].id : null;

  const toInsert = ranked.map((t) => ({
    user_id: user.id,
    child_id: firstChildId,
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

  const { data: inserted, error } = await supabase
    .from("suggestions")
    .insert(toInsert)
    .select();

  if (error) {
    // Return the unsaved objects so UI still works
    return Response.json({ suggestions: toInsert });
  }

  return Response.json({ suggestions: inserted });
}
