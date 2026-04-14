"use client";

import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Clock, Plus, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const WEEK_DAYS = ["ר", "ב", "ג", "ד", "ה", "ו", "ש"];

const HEBREW_DAYS: Record<number, string> = {
  0: "ראשון", 1: "שני", 2: "שלישי", 3: "רביעי", 4: "חמישי", 5: "שישי", 6: "שבת",
};

function formatDate(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatTime(iso: string | null) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface ScheduledMoment {
  id: string;
  title: string;
  childName: string;
  childInitial: string;
  childColor: string;
  time: string;
  duration: string;
  day: string;
  date: string;
  dayIndex: number;
}

export default function CalendarScreen() {
  const [moments, setMoments] = useState<ScheduledMoment[]>([]);
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get saved moments (scheduled this week and next 7 days)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Sunday
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const { data: saved } = await supabase
        .from("saved_moments")
        .select("id, title, child_id, scheduled_at, duration_min, completed")
        .eq("user_id", user.id)
        .gte("scheduled_at", weekStart.toISOString())
        .lte("scheduled_at", weekEnd.toISOString())
        .order("scheduled_at", { ascending: true });

      // Get children for name/color mapping
      const { data: children } = await supabase
        .from("children")
        .select("id, name, avatar_color")
        .eq("user_id", user.id);
      const childMap = new Map((children ?? []).map((c) => [c.id, c]));

      const CHILD_COLORS = [
        "oklch(0.72 0.18 42)", "oklch(0.60 0.18 280)", "oklch(0.55 0.14 140)",
      ];

      const mapped: ScheduledMoment[] = (saved ?? []).map((m, idx) => {
        const child = m.child_id ? childMap.get(m.child_id) : null;
        const childName = child?.name ?? "הילד שלך";
        const childColor = child?.avatar_color ?? CHILD_COLORS[idx % CHILD_COLORS.length];
        const scheduled = m.scheduled_at ? new Date(m.scheduled_at) : null;
        const dayIndex = scheduled ? scheduled.getDay() : 0;
        return {
          id: m.id,
          title: m.title,
          childName,
          childInitial: childName[0] ?? "?",
          childColor,
          time: formatTime(m.scheduled_at),
          duration: m.duration_min ? `${m.duration_min} דק'` : "20 דק'",
          day: scheduled ? HEBREW_DAYS[dayIndex] ?? "" : "",
          date: scheduled ? formatDate(scheduled) : "",
          dayIndex,
        };
      });

      setMoments(mapped);
      setActiveDays([...new Set(mapped.map((m) => m.dayIndex))]);
      setLoading(false);
    }
    load();
  }, []);

  // Group by day
  const grouped = moments.reduce<Record<string, ScheduledMoment[]>>((acc, m) => {
    const key = m.day;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const weekNumber = (() => {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
          style={{ background: "oklch(0.65 0.14 140)" }}
        >
          <Plus className="w-4 h-4" />
          הוסף רגע
        </button>
        <h2 className="text-xl font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
          היומן שלך
        </h2>
      </div>

      {/* Week overview strip */}
      <div
        className="rounded-2xl p-4 mb-5 flex items-center justify-between"
        style={{ background: "white", border: "1px solid oklch(0.93 0.02 85)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.04)" }}
      >
        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>
          <CheckCircle2 className="w-4 h-4" />
          {moments.length} רגעים
        </div>
        <div className="flex gap-1.5">
          {WEEK_DAYS.map((d, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: activeDays.includes(i) ? "oklch(0.65 0.14 140)" : "oklch(0.93 0.02 85)",
                color: activeDays.includes(i) ? "white" : "oklch(0.62 0.03 255)",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <p className="text-xs font-bold" style={{ color: "oklch(0.55 0.03 255)" }}>שבוע {weekNumber}</p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: "oklch(0.93 0.02 85)" }} />
          ))}
        </div>
      )}

      {/* Day sections */}
      {!loading && moments.length > 0 && (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([day, dayMoments]) => (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-3 flex-row-reverse mb-2.5">
                <div
                  className="rounded-xl px-3 py-1 text-xs font-black text-white flex-shrink-0"
                  style={{ background: "oklch(0.65 0.14 140)" }}
                >
                  {day}
                </div>
                <p className="text-xs font-medium" style={{ color: "oklch(0.65 0.03 255)" }}>
                  {dayMoments[0]?.date}
                </p>
                <div className="flex-1 h-px" style={{ background: "oklch(0.91 0.02 85)" }} />
              </div>

              <div className="flex flex-col gap-2.5">
                {dayMoments.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border flex items-center gap-3 p-3.5"
                    style={{ background: "white", borderColor: "oklch(0.93 0.02 85)", boxShadow: "0 1px 6px oklch(0 0 0 / 0.04)" }}
                  >
                    {/* Saved badge */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.65 0.14 140)" }} />
                      <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>שמור</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-right min-w-0">
                      <p className="font-black text-sm truncate" style={{ color: "oklch(0.2 0.03 255)" }}>{m.title}</p>
                      <div className="flex items-center justify-end gap-2 mt-0.5">
                        <span className="text-xs flex items-center gap-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>
                          <Clock className="w-3 h-3" />
                          {m.duration}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center"
                            style={{ background: m.childColor, fontSize: "9px" }}
                          >
                            {m.childInitial}
                          </span>
                          <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{m.childName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time */}
                    <p className="text-sm font-black flex-shrink-0" style={{ color: "oklch(0.55 0.14 140)" }}>
                      {m.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Free slots CTA */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              border: "1.5px dashed oklch(0.80 0.07 140 / 0.6)",
              background: "oklch(0.97 0.02 140 / 0.4)",
            }}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.58 0.10 140)" }} />
            <p className="text-sm font-bold mb-1" style={{ color: "oklch(0.38 0.10 140)" }}>
              רוצה להוסיף עוד רגעים?
            </p>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "oklch(0.52 0.06 140)" }}>
              BondFlow ימצא לך חלונות זמן פנויים בשבוע הקרוב.
            </p>
            <button
              className="text-sm font-black px-5 py-2 rounded-xl text-white transition-opacity hover:opacity-85"
              style={{ background: "oklch(0.65 0.14 140)" }}
            >
              הראה לי הצעות
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && moments.length === 0 && (
        <div className="text-center py-12">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}
          >
            <Sparkles className="w-6 h-6" style={{ color: "oklch(0.65 0.14 140)" }} />
          </div>
          <p className="text-base font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
            עדיין אין רגעים השבוע
          </p>
          <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.03 255)" }}>
            שמור הצעות מהדשבורד כדי שיופיעו כאן
          </p>
        </div>
      )}
    </div>
  );
}
