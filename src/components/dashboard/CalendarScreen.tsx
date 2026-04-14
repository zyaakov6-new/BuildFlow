"use client";

import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Clock, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const WEEK_DAYS = ["ר", "ב", "ג", "ד", "ה", "ו", "ש"];

const HEBREW_DAYS: Record<number, string> = {
  0: "ראשון", 1: "שני", 2: "שלישי", 3: "רביעי", 4: "חמישי", 5: "שישי", 6: "שבת",
};

function fmtDate(d: Date) { return `${d.getDate()}/${d.getMonth() + 1}`; }

function fmtTime(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface UnifiedEvent {
  id: string;
  dbId: string | null;  // actual saved_moments row id (bondflow only)
  title: string;
  time: string;
  duration: string;
  day: string;
  date: string;
  sortKey: string;
  dayIndex: number;
  source: "bondflow" | "google";
  completed?: boolean;
  childName?: string;
  childInitial?: string;
  childColor?: string;
}

type CalendarStatus = "loading" | "ready" | "no_token" | "expired";

export default function CalendarScreen({ onNavigateToSuggestions }: { onNavigateToSuggestions?: () => void }) {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [calStatus, setCalStatus] = useState<CalendarStatus>("loading");

  const handleComplete = async (ev: UnifiedEvent) => {
    if (!ev.dbId) return;
    setEvents((prev) => prev.map((e) => e.id === ev.id ? { ...e, completed: true } : e));
    const supabase = createClient();
    await supabase.from("saved_moments").update({ completed: true }).eq("id", ev.dbId);
  };

  const handleDelete = async (ev: UnifiedEvent) => {
    if (!ev.dbId) return;
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    const supabase = createClient();
    await supabase.from("saved_moments").delete().eq("id", ev.dbId);
  };

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const CHILD_COLORS = [
          "oklch(0.72 0.18 42)", "oklch(0.60 0.18 280)", "oklch(0.55 0.14 140)",
        ];

        // --- 1. BondFlow saved moments ---
        const rangeStart = new Date(); rangeStart.setHours(0, 0, 0, 0); // today midnight
        const rangeEnd   = new Date(); rangeEnd.setDate(rangeEnd.getDate() + 7); rangeEnd.setHours(23, 59, 59, 999);

        const { data: saved } = await supabase
          .from("saved_moments")
          .select("id, title, child_id, scheduled_at, duration_min")
          .eq("user_id", user.id)
          .gte("scheduled_at", rangeStart.toISOString())
          .lte("scheduled_at", rangeEnd.toISOString())
          .order("scheduled_at", { ascending: true });

        const { data: children } = await supabase
          .from("children").select("id, name, avatar_color").eq("user_id", user.id);
        const childMap = new Map((children ?? []).map((c) => [c.id, c]));

        const bondflowEvents: UnifiedEvent[] = (saved ?? []).map((m, idx) => {
          const child    = m.child_id ? childMap.get(m.child_id) : null;
          const childName = child?.name ?? "הילד שלך";
          const sched    = m.scheduled_at ? new Date(m.scheduled_at) : null;
          const dayIndex = sched ? sched.getDay() : 0;
          return {
            id:           `bf-${m.id}`,
            dbId:         m.id,
            title:        m.title,
            time:         sched ? fmtTime(m.scheduled_at) : "",
            duration:     m.duration_min ? `${m.duration_min} דק'` : "20 דק'",
            day:          sched ? (HEBREW_DAYS[dayIndex] ?? "") : "",
            date:         sched ? fmtDate(sched) : "",
            sortKey:      m.scheduled_at ?? "",
            dayIndex,
            source:       "bondflow",
            childName,
            childInitial: childName[0] ?? "?",
            childColor:   child?.avatar_color ?? CHILD_COLORS[idx % CHILD_COLORS.length],
          };
        });

        // --- 2. Google Calendar events ---
        let googleEvents: UnifiedEvent[] = [];
        try {
          const gcalRes = await fetch("/api/calendar/events");
          const gcalData = await gcalRes.json() as {
            connected: boolean; expired?: boolean; events?: Array<{
              id: string; summary?: string;
              start: { dateTime?: string; date?: string };
              end:   { dateTime?: string; date?: string };
            }>;
          };

          if (!gcalData.connected) {
            setCalStatus("no_token");
          } else if (gcalData.expired) {
            setCalStatus("expired");
          } else {
            setCalStatus("ready");
            googleEvents = (gcalData.events ?? [])
              .filter((e) => e.summary) // skip untitled
              .map((e) => {
                const startISO = e.start.dateTime ?? (e.start.date ? `${e.start.date}T00:00:00` : null);
                const endISO   = e.end.dateTime   ?? (e.end.date   ? `${e.end.date}T00:00:00`   : null);
                const sched    = startISO ? new Date(startISO) : null;
                const endDate  = endISO   ? new Date(endISO)   : null;
                const allDay   = !e.start.dateTime;
                const dayIndex = sched ? sched.getDay() : 0;
                const durationMs = (sched && endDate) ? endDate.getTime() - sched.getTime() : 0;
                const durationMin = Math.round(durationMs / 60000);
                return {
                  id:       `gc-${e.id}`,
                  dbId:     null,
                  title:    e.summary ?? "",
                  time:     allDay ? "" : (sched ? fmtTime(startISO) : ""),
                  duration: allDay ? "כל היום" : (durationMin > 0 ? `${durationMin} דק'` : ""),
                  day:      sched ? (HEBREW_DAYS[dayIndex] ?? "") : "",
                  date:     sched ? fmtDate(sched) : "",
                  sortKey:  startISO ?? "",
                  dayIndex,
                  source:   "google" as const,
                };
              });
          }
        } catch {
          setCalStatus("no_token");
        }

        // --- 3. Merge and group ---
        const all = [...bondflowEvents, ...googleEvents]
          .filter((e) => e.day)
          .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        setEvents(all);
        setActiveDays([...new Set(all.filter((e) => e.source === "bondflow").map((e) => e.dayIndex))]);
        if (calStatus === "loading") setCalStatus("ready");
      } catch (e) {
        console.error("CalendarScreen error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group by date string "DD/M"
  const grouped = events.reduce<Record<string, UnifiedEvent[]>>((acc, e) => {
    const key = `${e.day} ${e.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const weekNumber = Math.ceil(
    ((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 +
      new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7
  );

  const bondflowCount = events.filter((e) => e.source === "bondflow").length;
  const googleCount   = events.filter((e) => e.source === "google").length;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {calStatus === "no_token" && (
            <button
              onClick={() => {
                const supabase = createClient();
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    scopes: "https://www.googleapis.com/auth/calendar.events",
                    queryParams: { access_type: "offline", prompt: "consent" },
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: "oklch(0.52 0.14 255)" }}
            >
              <Calendar className="w-3.5 h-3.5" />
              חבר Google Calendar
            </button>
          )}
          {calStatus === "expired" && (
            <button
              onClick={() => {
                const supabase = createClient();
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    scopes: "https://www.googleapis.com/auth/calendar.events",
                    queryParams: { access_type: "offline", prompt: "consent" },
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border transition-colors"
              style={{ borderColor: "oklch(0.85 0.06 42)", color: "oklch(0.55 0.14 42)" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              חדש חיבור
            </button>
          )}
        </div>
        <h2 className="text-xl font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
          היומן שלך
        </h2>
      </div>

      {/* Week overview strip */}
      <div
        className="rounded-2xl p-4 mb-5 flex items-center justify-between"
        style={{ background: "white", border: "1px solid oklch(0.93 0.02 85)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.04)" }}
      >
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {bondflowCount} רגעים שמורים
          </div>
          {googleCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "oklch(0.52 0.14 255)" }}>
              <Calendar className="w-3 h-3" />
              {googleCount} אירועי Google
            </div>
          )}
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

      {/* Legend */}
      {googleCount > 0 && bondflowCount > 0 && (
        <div className="flex items-center gap-4 mb-4 flex-row-reverse flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(0.65 0.14 140)" }} />
            <span className="text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>BondFlow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(0.52 0.14 255)" }} />
            <span className="text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>Google Calendar</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: "oklch(0.93 0.02 85)" }} />
          ))}
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([dayKey, dayEvents]) => (
            <div key={dayKey}>
              <div className="flex items-center gap-3 flex-row-reverse mb-2.5">
                <div
                  className="rounded-xl px-3 py-1 text-xs font-black text-white flex-shrink-0"
                  style={{ background: "oklch(0.65 0.14 140)" }}
                >
                  {dayEvents[0]?.day}
                </div>
                <p className="text-xs font-medium" style={{ color: "oklch(0.65 0.03 255)" }}>
                  {dayEvents[0]?.date}
                </p>
                <div className="flex-1 h-px" style={{ background: "oklch(0.91 0.02 85)" }} />
              </div>

              <div className="flex flex-col gap-2">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border flex items-center gap-3 p-3.5"
                    style={{
                      background: "white",
                      borderColor: ev.source === "bondflow"
                        ? "oklch(0.88 0.06 140 / 0.6)"
                        : "oklch(0.88 0.06 255 / 0.5)",
                      borderLeftWidth: "3px",
                      borderLeftColor: ev.source === "bondflow"
                        ? "oklch(0.65 0.14 140)"
                        : "oklch(0.52 0.14 255)",
                      boxShadow: "0 1px 6px oklch(0 0 0 / 0.04)",
                    }}
                  >
                    {/* Source badge */}
                    <div className="flex-shrink-0">
                      {ev.source === "bondflow" ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.65 0.14 140)" }} />
                      ) : (
                        <Calendar className="w-4 h-4" style={{ color: "oklch(0.52 0.14 255)" }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-right min-w-0">
                      <p className="font-black text-sm truncate" style={{ color: "oklch(0.2 0.03 255)" }}>
                        {ev.title}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-0.5">
                        {ev.duration && (
                          <span className="text-xs flex items-center gap-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>
                            <Clock className="w-3 h-3" />
                            {ev.duration}
                          </span>
                        )}
                        {ev.childName && ev.source === "bondflow" && (
                          <div className="flex items-center gap-1">
                            <span
                              className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center"
                              style={{ background: ev.childColor, fontSize: "9px" }}
                            >
                              {ev.childInitial}
                            </span>
                            <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{ev.childName}</span>
                          </div>
                        )}
                        {ev.source === "google" && (
                          <span className="text-xs font-semibold" style={{ color: "oklch(0.52 0.14 255)" }}>
                            Google
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {ev.time && (
                        <p
                          className="text-sm font-black"
                          style={{ color: ev.source === "bondflow" ? "oklch(0.55 0.14 140)" : "oklch(0.52 0.14 255)" }}
                        >
                          {ev.time}
                        </p>
                      )}
                      {!ev.time && (
                        <span className="text-xs font-semibold" style={{ color: "oklch(0.6 0.03 255)" }}>
                          כל היום
                        </span>
                      )}
                      {ev.source === "bondflow" && (
                        <div className="flex gap-1">
                          {!ev.completed && (
                            <button
                              onClick={() => handleComplete(ev)}
                              title="סמן כבוצע"
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[oklch(0.88_0.08_140_/_0.2)]"
                              style={{ color: "oklch(0.55 0.14 140)" }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {ev.completed && (
                            <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>✓ בוצע</span>
                          )}
                          <button
                            onClick={() => handleDelete(ev)}
                            title="הסר"
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[oklch(0.95_0.04_25)]"
                            style={{ color: "oklch(0.65 0.10 25)" }}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div className="text-center py-12">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}
          >
            {calStatus === "no_token"
              ? <Calendar className="w-6 h-6" style={{ color: "oklch(0.65 0.14 140)" }} />
              : <Sparkles className="w-6 h-6" style={{ color: "oklch(0.65 0.14 140)" }} />}
          </div>
          {calStatus === "no_token" ? (
            <>
              <p className="text-base font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
                Google Calendar לא מחובר
              </p>
              <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.03 255)" }}>
                חבר את Google Calendar כדי לראות את כל האירועים שלך כאן
              </p>
              <button
                onClick={() => {
                  const supabase = createClient();
                  supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      scopes: "https://www.googleapis.com/auth/calendar.events",
                      queryParams: { access_type: "offline", prompt: "consent" },
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                }}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black text-white"
                style={{ background: "oklch(0.52 0.14 255)" }}
              >
                <Calendar className="w-4 h-4" />
                חבר Google Calendar
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
                אין אירועים בטווח הזמן
              </p>
              <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
                שמור הצעה כדי שתופיע כאן
              </p>
            </>
          )}
        </div>
      )}

      {/* No token warning — events exist but calendar not connected */}
      {!loading && events.length > 0 && calStatus === "no_token" && (
        <div
          className="mt-5 rounded-2xl p-4 flex items-start gap-3 flex-row-reverse"
          style={{ background: "oklch(0.96 0.02 255 / 0.5)", border: "1px solid oklch(0.85 0.06 255 / 0.4)" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.14 255)" }} />
          <div className="flex-1 text-right">
            <p className="text-xs font-bold mb-1" style={{ color: "oklch(0.38 0.12 255)" }}>
              כדי לראות גם את אירועי Google Calendar שלך, חבר את החשבון
            </p>
            <button
              onClick={() => {
                const supabase = createClient();
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    scopes: "https://www.googleapis.com/auth/calendar.events",
                    queryParams: { access_type: "offline", prompt: "consent" },
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
              className="text-xs font-black"
              style={{ color: "oklch(0.52 0.14 255)" }}
            >
              חבר עכשיו ←
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
