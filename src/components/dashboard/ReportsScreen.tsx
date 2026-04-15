"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, TrendingUp, Share2, Sparkles, Crown, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function WeekBar({ label, score, isCurrent }: { label: string; score: number; isCurrent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-xs font-bold" style={{ color: isCurrent ? "oklch(0.48 0.14 140)" : "oklch(0.65 0.03 255)" }}>
        {score}
      </span>
      <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
        <div
          className="w-full max-w-[32px] rounded-t-lg transition-all duration-700"
          style={{
            height: `${Math.max(4, (score / 100) * 80)}px`,
            background: isCurrent
              ? "linear-gradient(180deg, oklch(0.65 0.14 140), oklch(0.72 0.18 42))"
              : "oklch(0.88 0.05 140 / 0.5)",
          }}
        />
      </div>
      <span className="text-xs text-center" style={{ color: "oklch(0.65 0.03 255)" }}>{label}</span>
    </div>
  );
}

interface WeekScore {
  week_number: number;
  score: number;
  moments_count: number;
  hours_total: number;
}

interface SavedMoment {
  id: string;
  title: string;
  scheduled_at: string | null;
  duration_min: number | null;
  child_name?: string;
  child_color?: string;
}

const MEDAL_COLORS = [
  "oklch(0.75 0.18 80)",
  "oklch(0.72 0.04 255)",
  "oklch(0.65 0.12 42)",
];

function getWeekLabel(weekNum: number, currentWeek: number): string {
  const diff = currentWeek - weekNum;
  if (diff === 0) return "השבוע";
  if (diff === 1) return "שבוע שעבר";
  return `שב' ${weekNum}`;
}

export default function ReportsScreen({
  isPremium = false,
  onUpgrade,
}: {
  isPremium?: boolean;
  onUpgrade?: () => void;
}) {
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<WeekScore[]>([]);
  const [topMoments, setTopMoments] = useState<SavedMoment[]>([]);
  const [userName, setUserName] = useState("...");

  const currentWeek = (() => {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  })();

  const currentScore = scores.find((s) => s.week_number === currentWeek) ?? { score: 0, moments_count: 0, hours_total: 0, week_number: currentWeek };
  const prevScore = scores.find((s) => s.week_number === currentWeek - 1);
  const delta = prevScore ? currentScore.score - prevScore.score : 0;

  const monthNames = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  const monthLabel = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile name
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setUserName(profile?.full_name ?? user.email?.split("@")[0] ?? "");

      // Last 4 weeks of scores
      const { data: weekScores } = await supabase
        .from("weekly_scores")
        .select("week_number, score, moments_count, hours_total")
        .eq("user_id", user.id)
        .order("week_number", { ascending: false })
        .limit(4);

      const scoresArr: WeekScore[] = (weekScores ?? []).map((s) => ({
        week_number: s.week_number,
        score: s.score ?? 0,
        moments_count: s.moments_count ?? 0,
        hours_total: Number(s.hours_total ?? 0),
      }));
      setScores(scoresArr.reverse()); // oldest → newest for chart

      // Children for name/color
      const { data: children } = await supabase.from("children").select("id, name, avatar_color").eq("user_id", user.id);
      const childMap = new Map((children ?? []).map((c) => [c.id, c]));

      // Top 3 moments this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: moments } = await supabase
        .from("saved_moments")
        .select("id, title, scheduled_at, duration_min, child_id")
        .eq("user_id", user.id)
        .gte("scheduled_at", weekStart.toISOString())
        .order("duration_min", { ascending: false })
        .limit(3);

      setTopMoments(
        (moments ?? []).map((m) => {
          const child = m.child_id ? childMap.get(m.child_id) : null;
          return {
            id: m.id,
            title: m.title,
            scheduled_at: m.scheduled_at,
            duration_min: m.duration_min,
            child_name: child?.name,
            child_color: child?.avatar_color ?? "oklch(0.65 0.14 140)",
          };
        })
      );

      setLoading(false);
    }
    load();
  }, []);

  function formatScheduled(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    const days = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
    return `${days[d.getDay()]} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  const trend = scores.length >= 2 ? (scores[scores.length - 1].score - scores[0].score) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium" style={{ color: "oklch(0.6 0.03 255)" }}>
          שבוע {currentWeek} - {monthLabel}
        </span>
        <h2 className="text-xl font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
          הדוח השבועי
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-5 animate-pulse">
          {/* Dark summary card */}
          <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: "oklch(0.82 0.03 255)" }}>
            <div className="h-5 w-40 rounded-lg ms-auto" style={{ background: "oklch(0.70 0.04 255)" }} />
            <div className="h-16 w-28 rounded-2xl mx-auto" style={{ background: "oklch(0.70 0.04 255)" }} />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 rounded-xl" style={{ background: "oklch(0.70 0.04 255)" }} />
              <div className="h-16 rounded-xl" style={{ background: "oklch(0.70 0.04 255)" }} />
            </div>
          </div>
          {/* Chart card */}
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "oklch(0.86 0.02 85)" }}>
            <div className="h-4 w-32 rounded-lg ms-auto" style={{ background: "oklch(0.80 0.02 85)" }} />
            <div className="flex items-end gap-2 h-28 px-2">
              {[60, 80, 45, 90, 70, 55, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: "oklch(0.80 0.04 140 / 0.6)" }} />
              ))}
            </div>
          </div>
          {/* Row stats */}
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl h-14 flex items-center px-4 justify-between" style={{ background: "oklch(0.86 0.02 85)" }}>
              <div className="h-5 w-16 rounded-lg" style={{ background: "oklch(0.80 0.02 85)" }} />
              <div className="h-4 w-28 rounded-lg" style={{ background: "oklch(0.80 0.02 85)" }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Shareable summary card */}
          <div
            className="rounded-3xl overflow-hidden mb-6"
            style={{
              background: "linear-gradient(135deg, oklch(0.28 0.05 255), oklch(0.32 0.08 265))",
              boxShadow: "0 8px 40px oklch(0.28 0.05 255 / 0.35)",
            }}
          >
            <div className="relative p-6">
              <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-15 blur-xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

              <div className="relative z-10 flex items-center justify-between mb-6">
                <p className="text-xs font-medium" style={{ color: "oklch(0.7 0.03 255)" }}>
                  שבוע {currentWeek} - {monthLabel}
                </p>
                <p className="text-sm font-black text-white">BondFlow</p>
              </div>

              <div className="relative z-10 text-center mb-6">
                <div className="inline-flex items-end gap-1.5">
                  <span className="text-7xl font-black text-white leading-none">{currentScore.score}</span>
                  <span className="text-2xl font-bold mb-2" style={{ color: "oklch(0.65 0.03 255)" }}>/100</span>
                </div>
                <p className="text-sm font-bold mt-1" style={{ color: "oklch(0.65 0.14 140)" }}>ציון חיבור משפחתי</p>
                {delta !== 0 && (
                  <p className="text-xs mt-1" style={{ color: delta > 0 ? "oklch(0.65 0.14 140)" : "oklch(0.65 0.08 25)" }}>
                    {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`} משבוע שעבר
                  </p>
                )}
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-3 mb-5">
                {[
                  { Icon: Clock, value: `${currentScore.hours_total.toFixed(1)} שעות`, label: "זמן איכות" },
                  { Icon: Calendar, value: `${currentScore.moments_count} רגעים`, label: "משפחתיים" },
                  { Icon: TrendingUp, value: `שבוע ${currentWeek}`, label: "בשנה" },
                ].map(({ Icon, value, label }, i) => (
                  <div key={i} className="text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                    <p className="text-sm font-black text-white">{value}</p>
                    <p className="text-xs" style={{ color: "oklch(0.68 0.03 255)" }}>{label}</p>
                  </div>
                ))}
              </div>

              <div className="relative z-10 rounded-2xl p-3.5 text-center" style={{ background: "oklch(1 0 0 / 0.08)" }}>
                <p className="text-sm font-bold text-white">
                  {currentScore.moments_count > 0
                    ? `${userName}, אתה שם. ממשיך כך.`
                    : `${userName}, השבוע מחכה לך. נתחיל?`}
                </p>
              </div>
            </div>

            <button
              onClick={() => { setShared(true); setTimeout(() => setShared(false), 2500); }}
              className="w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm transition-all"
              style={{
                background: shared ? "oklch(0.58 0.16 148 / 0.6)" : "oklch(1 0 0 / 0.08)",
                color: "white",
                borderTop: "1px solid oklch(1 0 0 / 0.1)",
              }}
            >
              <Share2 className="w-4 h-4" />
              {shared ? "הועתק - שתף בוואטסאפ" : "שתף את הכרטיס הזה"}
            </button>
          </div>

          {/* Top moments — premium only */}
          {isPremium ? (
            <>
              {topMoments.length > 0 && (
                <div className="mb-6">
                  <p className="text-base font-black text-right mb-3" style={{ color: "oklch(0.2 0.03 255)" }}>
                    הרגעים הטובים ביותר השבוע
                  </p>
                  <div className="flex flex-col gap-3">
                    {topMoments.map((m, idx) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border overflow-hidden"
                        style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
                      >
                        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${MEDAL_COLORS[idx]}, transparent)` }} />
                        <div className="p-4 flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                            style={{ background: MEDAL_COLORS[idx] }}
                          >
                            {idx + 1}
                          </div>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0"
                            style={{ background: m.child_color ?? "oklch(0.65 0.14 140)", fontSize: "14px" }}
                          >
                            {m.child_name?.[0] ?? "?"}
                          </div>
                          <div className="flex-1 text-right min-w-0">
                            <p className="font-black text-sm" style={{ color: "oklch(0.2 0.03 255)" }}>{m.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: "oklch(0.58 0.03 255)" }}>
                              {m.duration_min ? `${m.duration_min} דקות` : ""}
                              {m.child_name ? ` עם ${m.child_name}` : ""}
                            </p>
                          </div>
                          <p className="text-xs font-semibold flex-shrink-0" style={{ color: "oklch(0.55 0.14 140)" }}>
                            {formatScheduled(m.scheduled_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {topMoments.length === 0 && (
                <div className="rounded-2xl p-6 text-center mb-6 border" style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}>
                  <Sparkles className="w-7 h-7 mx-auto mb-2" style={{ color: "oklch(0.65 0.14 140)" }} />
                  <p className="text-sm font-black mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>עדיין אין רגעים השבוע</p>
                  <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>שמור הצעות מהדשבורד כדי שיופיעו כאן</p>
                </div>
              )}
            </>
          ) : (
            /* Free-tier: show upgrade prompt where the full report would be */
            <div className="mb-6 rounded-3xl overflow-hidden" style={{ border: "1.5px dashed oklch(0.72 0.18 42 / 0.5)" }}>
              {/* Blurred preview — decorative */}
              <div className="relative" style={{ background: "oklch(0.97 0.01 85)" }}>
                <div className="p-4 blur-[3px] pointer-events-none select-none opacity-50" aria-hidden>
                  <p className="text-sm font-black text-right mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>הרגעים הטובים ביותר השבוע</p>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl mb-2 overflow-hidden border" style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}>
                      <div className="h-0.5" style={{ background: `oklch(${0.72 - i * 0.05} 0.18 ${42 + i * 20})` }} />
                      <div className="p-3 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: MEDAL_COLORS[i - 1] }} />
                        <div className="flex-1">
                          <div className="h-3 rounded mb-1" style={{ background: "oklch(0.88 0.02 85)", width: `${60 + i * 10}%` }} />
                          <div className="h-2 rounded" style={{ background: "oklch(0.92 0.01 85)", width: "40%" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl mt-3 p-4" style={{ background: "white", border: "1px solid oklch(0.93 0.02 85)" }}>
                    <div className="flex items-end gap-2 h-16">
                      {[50, 70, 45, 85].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: "oklch(0.88 0.05 140 / 0.5)" }} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))" }}
                  >
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-base font-black text-center" style={{ color: "oklch(0.2 0.03 255)" }}>
                    הדוח המלא זמין בפרימיום
                  </p>
                  <p className="text-xs text-center leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
                    רגעים מובילים השבוע, גרף מגמה של 4 שבועות, וסיכום חודשי להדפסה.
                  </p>
                  <button
                    onClick={onUpgrade}
                    className="mt-1 rounded-xl px-5 py-2.5 text-sm font-black text-white gradient-cta transition-opacity hover:opacity-90 active:scale-[0.98]"
                    style={{ boxShadow: "0 4px 14px oklch(0.65 0.14 140 / 0.35)" }}
                  >
                    שדרג לפרימיום - ₪39/חודש
                  </button>
                  <p className="text-xs" style={{ color: "oklch(0.65 0.03 255)" }}>14 יום חינם, ביטול בכל זמן</p>
                </div>
              </div>
            </div>
          )}

          {/* Trend chart — premium only */}
          {isPremium && scores.length > 0 && (
            <div className="rounded-2xl border p-5 mb-6" style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}>
              <p className="text-sm font-black text-right mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
                מגמה – שבועות אחרונים
              </p>
              <div className="flex items-end gap-2 mb-3">
                {scores.map((s) => (
                  <WeekBar
                    key={s.week_number}
                    label={getWeekLabel(s.week_number, currentWeek)}
                    score={s.score}
                    isCurrent={s.week_number === currentWeek}
                  />
                ))}
              </div>
              {trend !== 0 && (
                <div className="rounded-xl p-3 text-center" style={{ background: "oklch(0.88 0.08 140 / 0.15)" }}>
                  <p className="text-xs font-bold" style={{ color: "oklch(0.42 0.12 140)" }}>
                    {trend > 0 ? `+${trend} נקודות בתקופה זו – כיוון נהדר` : `${trend} נקודות – נמשיך לשפר`}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
