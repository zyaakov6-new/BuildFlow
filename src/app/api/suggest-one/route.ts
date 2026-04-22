import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getHolidayContext, seasonHint } from "@/lib/hebrew-calendar";
import { getWeather } from "@/lib/weather";
import { bumpAndCheckAIUsage, DAILY_CAP_FREE, DAILY_CAP_PREMIUM } from "@/lib/rate-limit";

interface Activity {
  title: string;
  description: string;
  duration_min: number;
  prep_min: number;
  category: string;
  accent_color: string;
  bg_color: string;
}

// Template pool — used as AI fallback
const TEMPLATES: (Activity & { interests: string[]; age_groups: string[] })[] = [
  { title: "בניית לגו ביחד", description: "שב על הרצפה ותן לילד להוביל את הבנייה. שום מסך, שום הכנה – רק שניכם.", duration_min: 20, prep_min: 0, category: "lego", accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)", interests: ["לגו", "מיינקראפט"], age_groups: ["3-5", "6-8", "9-12"] },
  { title: "ציור חופשי ביחד", description: "נייר לבן, צבעים, וחצי שעה בלי מסכות. הכי קל ומחבר שיש.", duration_min: 25, prep_min: 5, category: "drawing", accent_color: "oklch(0.55 0.15 42)", bg_color: "oklch(0.92 0.06 60 / 0.15)", interests: ["ציור", "אומנות"], age_groups: ["3-5", "6-8", "9-12"] },
  { title: "קריאה ביחד לפני שינה", description: "שכבו יחד על הספה ותנו לילד לבחור דף. רגע שקט שיוצר קרבה אמיתית.", duration_min: 20, prep_min: 0, category: "reading", accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)", interests: ["ספרים", "אנימציה"], age_groups: ["0-2", "3-5", "6-8", "9-12"] },
  { title: "סיפור שממציאים ביחד", description: "אתה מתחיל משפט, הילד ממשיך. כל סיבוב מפתיע. 15 דקות של צחוק מובטח.", duration_min: 15, prep_min: 0, category: "storytelling", accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)", interests: ["ספרים", "אנימציה"], age_groups: ["3-5", "6-8", "9-12"] },
  { title: "ריקוד חופשי בסלון", description: "כבו את האורות, הדליקו מוזיקה ותנועו בלי חוקים. אפס הכנה, מקסימום כיף.", duration_min: 10, prep_min: 0, category: "dance", accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)", interests: ["ריקוד", "מוזיקה"], age_groups: ["0-2", "3-5", "6-8", "9-12"] },
  { title: "שירים ביחד – פלייליסט של הילד", description: "תנו לילד לבחור 3 שירים ותרקדו ביחד בסלון. 15 דקות של אנרגיה וחיוכים.", duration_min: 15, prep_min: 0, category: "music", accent_color: "oklch(0.52 0.18 320)", bg_color: "oklch(0.90 0.06 320 / 0.10)", interests: ["מוזיקה", "ריקוד"], age_groups: ["0-2", "3-5", "6-8", "9-12"] },
  { title: "בישול יחד – מנה קלה", description: "ביצה, שקשוקה, פנקייקים – תנו לילד לערבב. השתתפות יוצרת גאווה ואחריות.", duration_min: 25, prep_min: 5, category: "cooking", accent_color: "oklch(0.58 0.16 42)", bg_color: "oklch(0.93 0.07 60 / 0.18)", interests: ["בישול", "מדע"], age_groups: ["3-5", "6-8", "9-12"] },
  { title: "סיבוב קצר בחוץ ביחד", description: "אפילו 15 דקות בחוץ עם ילדים יוצרת זיכרונות. תחפשו שלושה עלים שונים.", duration_min: 20, prep_min: 0, category: "nature", accent_color: "oklch(0.48 0.16 148)", bg_color: "oklch(0.88 0.08 140 / 0.12)", interests: ["טבע", "טיולים"], age_groups: ["0-2", "3-5", "6-8"] },
  { title: "משחק קופסא ביחד", description: "שחמט, שש-בש, מנצ'קין – כל משחק שיש בבית. ילדים שמשחקים עם הורים לומדים אסטרטגיה וסבלנות.", duration_min: 30, prep_min: 0, category: "games", accent_color: "oklch(0.60 0.18 280)", bg_color: "oklch(0.90 0.06 280 / 0.10)", interests: ["משחקי קופסא"], age_groups: ["3-5", "6-8", "9-12", "13+"] },
  { title: "אמבטיה משחקית", description: "צבעי אמבטיה, כוסות וצינורות – הופכים שגרה לאירוע. מתאים גם לערב עמוס.", duration_min: 20, prep_min: 2, category: "play", accent_color: "oklch(0.52 0.18 255)", bg_color: "oklch(0.90 0.06 255 / 0.12)", interests: [], age_groups: ["0-2", "3-5"] },
  { title: "כדורגל בחצר", description: "20 דקות בחוץ עם כדור. אין צורך בשערים – רק תתחילו לשחק.", duration_min: 20, prep_min: 0, category: "sports", accent_color: "oklch(0.55 0.14 140)", bg_color: "oklch(0.88 0.08 140 / 0.15)", interests: ["כדורגל", "ספורט"], age_groups: ["3-5", "6-8", "9-12", "13+"] },
  { title: "תצפית כוכבים", description: "צאו החוצה 20 דקות אחרי חשיכה. הורידו אפליקציית כוכבים וחפשו ביחד.", duration_min: 20, prep_min: 0, category: "science", accent_color: "oklch(0.45 0.16 255)", bg_color: "oklch(0.88 0.06 255 / 0.12)", interests: ["מדע", "דינוזאורים", "טבע"], age_groups: ["6-8", "9-12", "13+"] },
];

function pickTemplate(interests: string[], ageGroup: string, exclude: string[]): Activity {
  const scored = TEMPLATES
    .filter((t) => !exclude.includes(t.title))
    .map((t) => {
      let score = 0;
      interests.forEach((i) => { if (t.interests.includes(i)) score += 3; });
      if (t.age_groups.includes(ageGroup)) score += 2;
      // Small random tiebreaker so repeat calls give variety
      score += Math.random() * 0.5;
      return { t, score };
    })
    .sort((a, b) => b.score - a.score);

  const pick = scored[0]?.t ?? TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { interests: _i, age_groups: _a, ...activity } = pick;
  return activity;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- Free plan limit: 3 AI suggestions per week ---
  // @ts-ignore — subscription columns added via migration, not yet in generated types
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_plan")
    .eq("id", user.id)
    .single() as unknown as { data: { subscription_status: string | null; subscription_plan: string | null } | null };

  const isPremium =
    profile?.subscription_status === "active" &&
    profile?.subscription_plan &&
    profile.subscription_plan !== "free";

  if (!isPremium) {
    // Calculate start of current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("saved_moments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfWeek.toISOString());

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: "free_limit",
          message:
            "הגעת למגבלת 3 הצעות בשבוע. שדרג לפרימיום להצעות ללא הגבלה.",
        },
        { status: 429 }
      );
    }
  }

  const childId = req.nextUrl.searchParams.get("child_id");
  const excludeRaw = req.nextUrl.searchParams.get("exclude") ?? "";
  const exclude = excludeRaw ? excludeRaw.split(",") : [];

  if (!childId) return NextResponse.json({ error: "child_id required" }, { status: 400 });

  // Load child — verify ownership
  const { data: child } = await supabase
    .from("children")
    .select("name, age_group, interests")
    .eq("id", childId)
    .eq("user_id", user.id)
    .single();

  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const { name, age_group, interests } = child as { name: string; age_group: string; interests: string[] };

  // --- Personalization memory: pull loved / disliked / done activities for this child ---
  const [{ data: pastMoments }, { data: pastSuggestions }] = await Promise.all([
    supabase
      .from("saved_moments")
      .select("title, category, rating, completed")
      .eq("user_id", user.id)
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("suggestions")
      .select("title, status")
      .eq("user_id", user.id)
      .eq("child_id", childId)
      .order("generated_at", { ascending: false })
      .limit(30),
  ]);

  const moments = (pastMoments ?? []) as Array<{ title: string; category: string | null; rating: number | null; completed: boolean | null }>;
  const sugs = (pastSuggestions ?? []) as Array<{ title: string; status: string | null }>;

  const loved     = moments.filter((m) => (m.rating ?? 0) >= 3).map((m) => m.title);
  const disliked  = moments.filter((m) => (m.rating ?? 0) === 1).map((m) => m.title);
  const done      = moments.filter((m) => m.completed).map((m) => m.title);
  const dismissed = sugs.filter((s) => s.status === "dismissed").map((s) => s.title);
  const recentTitles = Array.from(new Set([...done, ...dismissed, ...exclude])).slice(0, 20);

  // --- Daily AI rate limit (abuse + cost protection) ---
  const cap = isPremium ? DAILY_CAP_PREMIUM : DAILY_CAP_FREE;
  const usage = await bumpAndCheckAIUsage(supabase, user.id, cap);
  if (!usage.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: `הגעת לתקרה היומית של ${usage.cap} הצעות. נסה שוב מחר.` },
      { status: 429 }
    );
  }

  // Try AI first
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey });

      const memoryLines: string[] = [];
      if (loved.length > 0)       memoryLines.push(`Activities they LOVED (lean toward similar themes): ${loved.join(", ")}`);
      if (disliked.length > 0)    memoryLines.push(`Activities they DISLIKED (avoid similar themes): ${disliked.join(", ")}`);
      if (recentTitles.length > 0) memoryLines.push(`Do NOT suggest any of these (recently shown or done): ${recentTitles.join(", ")}`);
      const memoryBlock = memoryLines.length > 0 ? `\n\nPersonalization memory:\n${memoryLines.join("\n")}` : "";

      // --- Cultural context: Jewish holiday + Israeli weather/season ---
      const holiday = getHolidayContext();
      const weather = await getWeather();
      const contextLines: string[] = [];
      if (holiday) contextLines.push(`Current Jewish holiday context: ${holiday.name}. ${holiday.hint} Lean into it if it fits naturally.`);
      if (weather) contextLines.push(`Weather right now: ${weather.hint}`);
      contextLines.push(`Season: ${seasonHint()}`);
      const contextBlock = contextLines.length > 0 ? `\n\nContextual signals:\n${contextLines.join("\n")}` : "";

      const prompt = `You are a warm Israeli family activity expert. Suggest ONE short family bonding activity in Hebrew for a parent and child.

Child: ${name}, age group: ${age_group}, interests: ${interests.length > 0 ? interests.join(", ") : "general"}${memoryBlock}${contextBlock}

Rules:
- Activity must be doable at home or nearby, in 10–30 minutes
- Zero or minimal prep
- Warm, specific, actionable description (2 sentences)
- Hebrew throughout
- Variety is important — don't suggest the same theme repeatedly
- If a Jewish holiday is active and it fits, reference it; don't force it.
- Respect the weather: if rainy/hot/cold, prefer indoor; if pleasant, outdoor is great.

Respond with ONLY valid JSON, no markdown:
{"title":"...","description":"...","duration_min":20,"prep_min":0,"category":"play","accent_color":"oklch(0.55 0.14 140)","bg_color":"oklch(0.88 0.08 140 / 0.15)"}`;

      const msg = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });

      const text = msg.content.find((b) => b.type === "text")?.text ?? "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Activity;
        if (parsed.title && parsed.description) {
          return NextResponse.json({ activity: parsed, source: "ai" });
        }
      }
    } catch (e) {
      console.error("[suggest-one] AI error:", e);
    }
  }

  // Fallback to template
  const activity = pickTemplate(interests, age_group, exclude);
  return NextResponse.json({ activity, source: "template" });
}
