import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Flame, Heart, Sparkles, TrendingUp } from "lucide-react";

export const metadata = {
  title: "תובנות — BondFlow",
  description: "התובנות שלך על הקשר עם הילדים",
};

const CATEGORY_LABELS_HE: Record<string, string> = {
  cooking: "בישול",
  drawing: "ציור",
  reading: "קריאה",
  storytelling: "סיפורים",
  dance: "ריקוד",
  music: "מוזיקה",
  games: "משחקי קופסא",
  lego: "לגו",
  play: "משחק",
  sports: "ספורט",
  nature: "טבע",
  science: "מדע",
  outdoors: "בחוץ",
};

function cLabel(c: string): string {
  return CATEGORY_LABELS_HE[c] ?? c;
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: children }, { data: moments }] = await Promise.all([
    supabase
      .from("children")
      .select("id, name, avatar_color, avatar_emoji")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("saved_moments")
      .select("id, child_id, category, rating, completed, scheduled_at, created_at")
      .eq("user_id", user.id)
      .eq("completed", true),
  ]);

  const kids = (children ?? []) as Array<{ id: string; name: string; avatar_color: string | null; avatar_emoji: string | null }>;
  const all = (moments ?? []) as Array<{
    id: string;
    child_id: string | null;
    category: string | null;
    rating: number | null;
    completed: boolean | null;
    scheduled_at: string | null;
    created_at: string;
  }>;

  // Compute per-child insights
  const perChild = kids.map((k) => {
    const hers = all.filter((m) => m.child_id === k.id);
    const loved = hers.filter((m) => (m.rating ?? 0) >= 3);
    const catCounts = new Map<string, number>();
    const hourCounts = new Array<number>(24).fill(0);
    for (const m of hers) {
      if (m.category) catCounts.set(m.category, (catCounts.get(m.category) ?? 0) + 1);
      const d = m.scheduled_at ?? m.created_at;
      if (d) hourCounts[new Date(d).getHours()]++;
    }
    const topCat = Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    let bestHour: number | null = null;
    let bestHourCount = 0;
    for (let h = 0; h < 24; h++) {
      if (hourCounts[h] > bestHourCount) { bestHourCount = hourCounts[h]; bestHour = h; }
    }
    const lovedRate = hers.length > 0 ? Math.round((loved.length / hers.length) * 100) : 0;
    return {
      child: k,
      total: hers.length,
      lovedCount: loved.length,
      lovedRate,
      topCategory: topCat?.[0] ?? null,
      topCategoryCount: topCat?.[1] ?? 0,
      bestHour: bestHourCount >= 2 ? bestHour : null,
    };
  });

  // Streak across all moments
  const dateSet = new Set<string>();
  for (const m of all) {
    const d = m.scheduled_at ?? m.created_at;
    if (d) dateSet.add(new Date(d).toISOString().slice(0, 10));
  }
  let streak = 0;
  const today = new Date();
  const cur = new Date(today);
  const todayKey = today.toISOString().slice(0, 10);
  const yKey = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  if (dateSet.has(todayKey) || dateSet.has(yKey)) {
    if (!dateSet.has(todayKey)) cur.setDate(cur.getDate() - 1);
    while (dateSet.has(cur.toISOString().slice(0, 10))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
  }

  const totalMoments = all.length;
  const totalLoved = all.filter((m) => (m.rating ?? 0) >= 3).length;

  return (
    <main dir="rtl" className="min-h-screen pb-12" style={{ background: "oklch(0.97 0.01 85)" }}>
      {/* Header */}
      <header className="px-5 pt-6 pb-5 sticky top-0 z-10" style={{ background: "oklch(0.97 0.01 85)" }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold mb-3"
          style={{ color: "oklch(0.45 0.03 255)" }}
        >
          <ChevronRight className="w-4 h-4" />
          חזרה לדשבורד
        </Link>
        <h1 className="text-3xl font-black leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
          התובנות שלך
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.03 255)" }}>
          מה המספרים מראים על הקשר שלך עם הילדים
        </p>
      </header>

      <div className="px-5 space-y-4">
        {/* Top-level stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            icon={<Heart className="w-4 h-4" />}
            iconColor="oklch(0.55 0.18 25)"
            iconBg="oklch(0.92 0.05 25 / 0.35)"
            value={totalMoments}
            label="רגעים"
          />
          <StatCard
            icon={<Sparkles className="w-4 h-4" />}
            iconColor="oklch(0.55 0.15 42)"
            iconBg="oklch(0.92 0.06 60 / 0.35)"
            value={totalLoved}
            label="מוצלחים במיוחד"
          />
          <StatCard
            icon={<Flame className="w-4 h-4" />}
            iconColor="oklch(0.58 0.18 42)"
            iconBg="oklch(0.92 0.07 50 / 0.4)"
            value={streak}
            label="רצף ימים"
          />
        </div>

        {/* Empty state */}
        {totalMoments === 0 && (
          <div
            className="rounded-3xl p-8 text-center border"
            style={{
              background: "white",
              borderColor: "oklch(0.92 0.02 85)",
              boxShadow: "0 8px 24px oklch(0.28 0.05 255 / 0.06)",
            }}
          >
            <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.55 0.14 140)" }} />
            <p className="font-black text-lg mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>
              עוד אין מספיק מידע
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
              אחרי שתסמן כמה רגעים כבוצעו, נראה לך כאן מה עובד הכי טוב עם כל ילד.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 rounded-full px-5 py-2.5 text-sm font-black"
              style={{ background: "oklch(0.65 0.14 140)", color: "white" }}
            >
              קדימה לרגע הראשון
            </Link>
          </div>
        )}

        {/* Per-child insights */}
        {perChild.filter((p) => p.total > 0).map((p) => (
          <div
            key={p.child.id}
            className="rounded-3xl p-5 border"
            style={{
              background: "white",
              borderColor: "oklch(0.92 0.02 85)",
              boxShadow: "0 8px 24px oklch(0.28 0.05 255 / 0.06)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black ${p.child.avatar_emoji ? "text-2xl" : "text-lg text-white"}`}
                style={{ background: p.child.avatar_color ?? "oklch(0.65 0.14 140)" }}
              >
                {p.child.avatar_emoji ?? p.child.name[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-lg leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
                  {p.child.name}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>
                  {p.total} רגעים ביחד • {p.lovedCount} מהם היו מעולים
                </p>
              </div>
            </div>

            {p.topCategory && (
              <div
                className="rounded-2xl p-3.5 text-sm leading-relaxed font-semibold mb-2"
                style={{
                  background: "oklch(0.88 0.08 140 / 0.18)",
                  color: "oklch(0.35 0.1 140)",
                }}
              >
                אתה ו{p.child.name} הכי מחוברים דרך{" "}
                <span className="font-black">{cLabel(p.topCategory)}</span>
                {p.topCategoryCount >= 3 && ` — ${p.topCategoryCount} רגעים במיוחד`}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              {p.bestHour !== null && (
                <div
                  className="rounded-2xl p-3 text-xs font-semibold text-center"
                  style={{ background: "oklch(0.92 0.06 60 / 0.35)", color: "oklch(0.4 0.15 42)" }}
                >
                  שעת הזהב
                  <div className="text-lg font-black mt-0.5">{String(p.bestHour).padStart(2, "0")}:00</div>
                </div>
              )}
              {p.total >= 3 && (
                <div
                  className="rounded-2xl p-3 text-xs font-semibold text-center"
                  style={{ background: "oklch(0.92 0.05 25 / 0.35)", color: "oklch(0.4 0.15 25)" }}
                >
                  אחוז מוצלחים
                  <div className="text-lg font-black mt-0.5">{p.lovedRate}%</div>
                </div>
              )}
            </div>

            <Link
              href={`/child/${p.child.id}`}
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold"
              style={{ color: "oklch(0.55 0.14 140)" }}
            >
              עוד על {p.child.name}
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

function StatCard({
  icon, iconColor, iconBg, value, label,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  value: number;
  label: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 text-center border"
      style={{
        background: "white",
        borderColor: "oklch(0.92 0.02 85)",
        boxShadow: "0 4px 12px oklch(0.28 0.05 255 / 0.05)",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <p className="text-2xl font-black leading-none" style={{ color: "oklch(0.2 0.03 255)" }}>
        {value}
      </p>
      <p className="text-[11px] mt-1 font-semibold" style={{ color: "oklch(0.55 0.03 255)" }}>
        {label}
      </p>
    </div>
  );
}
