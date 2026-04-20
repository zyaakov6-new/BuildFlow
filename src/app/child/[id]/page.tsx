import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, Heart, Sparkles, TrendingUp } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChildProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: child } = await supabase
    .from("children")
    .select("id, name, age_group, avatar_color, interests, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!child) notFound();

  const [{ data: moments }, { data: savedCount }] = await Promise.all([
    supabase
      .from("saved_moments")
      .select("id, title, scheduled_at, completed, rating, category")
      .eq("user_id", user.id)
      .eq("child_id", id)
      .order("scheduled_at", { ascending: false })
      .limit(50),
    supabase
      .from("saved_moments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("child_id", id)
      .eq("completed", true),
  ]);

  const allMoments = (moments ?? []) as Array<{
    id: string;
    title: string;
    scheduled_at: string | null;
    completed: boolean | null;
    rating: number | null;
    category: string | null;
  }>;

  const completedMoments = allMoments.filter((m) => m.completed);
  const lovedMoments = allMoments.filter((m) => (m.rating ?? 0) >= 3);
  const totalCompleted = (savedCount as unknown as { count?: number })?.count ?? completedMoments.length;

  // Top category
  const categoryCounts = new Map<string, number>();
  for (const m of completedMoments) {
    if (m.category) categoryCounts.set(m.category, (categoryCounts.get(m.category) ?? 0) + 1);
  }
  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  const CATEGORY_LABELS: Record<string, string> = {
    lego: "בנייה", drawing: "ציור", reading: "קריאה", nature: "טבע",
    music: "מוזיקה", dance: "ריקוד", cooking: "בישול", sports: "ספורט",
    science: "מדע", art: "אומנות", games: "משחקים", storytelling: "סיפורים",
    play: "משחק",
  };

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: "white", borderBottom: "1px solid oklch(0.92 0.02 85)" }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm font-bold"
          style={{ color: "oklch(0.55 0.03 255)" }}
        >
          <ChevronRight className="w-4 h-4" />
          חזרה
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div
          className="rounded-3xl p-6 text-center mb-5"
          style={{
            background: "white",
            boxShadow: "0 4px 24px oklch(0 0 0 / 0.06)",
            border: "1px solid oklch(0.93 0.02 85)",
          }}
        >
          <div
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl font-black text-white mb-4"
            style={{ background: child.avatar_color ?? "oklch(0.72 0.18 42)" }}
          >
            {child.name[0] ?? "?"}
          </div>
          <h1 className="text-2xl font-black mb-1" style={{ color: "oklch(0.18 0.03 255)" }}>
            {child.name}
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
            גיל {child.age_group}
          </p>

          {(child.interests?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {(child.interests ?? []).map((i: string) => (
                <span
                  key={i}
                  className="rounded-xl px-3 py-1 text-xs font-bold"
                  style={{ background: "oklch(0.88 0.08 140 / 0.18)", color: "oklch(0.48 0.14 140)" }}
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard
            icon={<Calendar className="w-4 h-4" style={{ color: "oklch(0.55 0.14 140)" }} />}
            label="רגעים"
            value={String(totalCompleted)}
          />
          <StatCard
            icon={<Heart className="w-4 h-4" style={{ color: "oklch(0.62 0.18 25)" }} />}
            label="אהובים"
            value={String(lovedMoments.length)}
          />
          <StatCard
            icon={<Sparkles className="w-4 h-4" style={{ color: "oklch(0.55 0.14 42)" }} />}
            label="מועדף"
            value={topCategory ? (CATEGORY_LABELS[topCategory] ?? topCategory) : "—"}
          />
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
              היסטוריית רגעים
            </p>
            <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.55 0.03 255)" }} />
          </div>

          {completedMoments.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center border"
              style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: "oklch(0.35 0.03 255)" }}>
                עוד אין רגעים מתועדים
              </p>
              <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>
                שמור וסמן הרגע הראשון שלכם ביחד
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {completedMoments.map((m) => (
                <MomentRow key={m.id} title={m.title} date={m.scheduled_at} rating={m.rating} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-3 text-center border"
      style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-black" style={{ color: "oklch(0.2 0.03 255)" }}>{value}</p>
      <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{label}</p>
    </div>
  );
}

function MomentRow({ title, date, rating }: { title: string; date: string | null; rating: number | null }) {
  const d = date ? new Date(date) : null;
  const dateStr = d ? d.toLocaleDateString("he-IL", { day: "numeric", month: "short" }) : "";
  const emoji = rating === 3 ? "😊" : rating === 2 ? "😐" : rating === 1 ? "😞" : null;

  return (
    <div
      className="rounded-2xl p-3.5 flex items-center gap-3 border"
      style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
    >
      {emoji && <span className="text-xl flex-shrink-0">{emoji}</span>}
      <div className="flex-1 text-right min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: "oklch(0.2 0.03 255)" }}>{title}</p>
        {dateStr && <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>{dateStr}</p>}
      </div>
    </div>
  );
}
