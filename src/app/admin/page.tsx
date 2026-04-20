import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { Users, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  // Use service role for cross-user analytics (bypasses RLS)
  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const oneDayAgo   = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: newUsers24h },
    { count: completedOnboarding },
    { count: totalMoments },
    { count: completedMoments },
    { count: activeWeekly },
    { count: premiumUsers },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    admin.from("onboarding").select("user_id", { count: "exact", head: true }).eq("completed", true),
    admin.from("saved_moments").select("id", { count: "exact", head: true }),
    admin.from("saved_moments").select("id", { count: "exact", head: true }).eq("completed", true),
    admin.from("saved_moments").select("user_id", { count: "exact", head: true }).gte("created_at", sevenDayAgo),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "active"),
    admin.from("profiles").select("id, full_name, created_at, subscription_plan").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      <div
        className="px-5 py-4"
        style={{ background: "white", borderBottom: "1px solid oklch(0.92 0.02 85)" }}
      >
        <h1 className="text-xl font-black" style={{ color: "oklch(0.18 0.03 255)" }}>
          BondFlow · Admin
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 255)" }}>
          {user.email}
        </p>
      </div>

      <div className="max-w-5xl mx-auto p-5 flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={<Users className="w-4 h-4" />} label="סה&quot;כ משתמשים" value={totalUsers ?? 0} color="oklch(0.55 0.14 140)" />
          <KPI icon={<Sparkles className="w-4 h-4" />} label="משתמשים חדשים (24ש)" value={newUsers24h ?? 0} color="oklch(0.58 0.18 42)" />
          <KPI icon={<CheckCircle2 className="w-4 h-4" />} label="סיימו onboarding" value={completedOnboarding ?? 0} color="oklch(0.55 0.14 140)" />
          <KPI icon={<TrendingUp className="w-4 h-4" />} label="פרימיום" value={premiumUsers ?? 0} color="oklch(0.52 0.18 280)" />
          <KPI icon={<Sparkles className="w-4 h-4" />} label="רגעים שמורים" value={totalMoments ?? 0} color="oklch(0.55 0.14 140)" />
          <KPI icon={<CheckCircle2 className="w-4 h-4" />} label="רגעים שהושלמו" value={completedMoments ?? 0} color="oklch(0.48 0.16 148)" />
          <KPI icon={<TrendingUp className="w-4 h-4" />} label="פעילים (7י׳)" value={activeWeekly ?? 0} color="oklch(0.58 0.18 42)" />
          <KPI
            icon={<TrendingUp className="w-4 h-4" />}
            label="שיעור השלמה"
            value={totalMoments && totalMoments > 0 ? `${Math.round(((completedMoments ?? 0) / totalMoments) * 100)}%` : "—"}
            color="oklch(0.52 0.18 255)"
          />
        </div>

        {/* Recent signups */}
        <div
          className="rounded-2xl border"
          style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
        >
          <div className="p-4 border-b" style={{ borderColor: "oklch(0.93 0.02 85)" }}>
            <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
              10 ההרשמות האחרונות
            </p>
          </div>
          <div className="flex flex-col">
            {(recentUsers ?? []).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: "oklch(0.95 0.01 85)" }}
              >
                <span
                  className="rounded-lg px-2 py-0.5 text-xs font-bold"
                  style={{
                    background: u.subscription_plan && u.subscription_plan !== "free"
                      ? "oklch(0.88 0.08 140 / 0.2)"
                      : "oklch(0.95 0.01 85)",
                    color: u.subscription_plan && u.subscription_plan !== "free"
                      ? "oklch(0.48 0.14 140)"
                      : "oklch(0.55 0.03 255)",
                  }}
                >
                  {u.subscription_plan ?? "free"}
                </span>
                <div className="text-right flex-1 mr-3">
                  <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.03 255)" }}>
                    {u.full_name ?? "—"}
                  </p>
                  <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("he-IL") : ""}
                  </p>
                </div>
              </div>
            ))}
            {(recentUsers ?? []).length === 0 && (
              <p className="p-6 text-center text-sm" style={{ color: "oklch(0.6 0.03 255)" }}>
                אין משתמשים עדיין
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="text-2xl font-black" style={{ color: "oklch(0.18 0.03 255)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 255)" }}>{label}</p>
    </div>
  );
}
