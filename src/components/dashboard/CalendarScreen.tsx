"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Sparkles, CheckCircle2, Clock, Calendar, RefreshCw,
  AlertCircle, X, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/* ── constants ─────────────────────────────────────────────────────── */
const HEBREW_DAYS: Record<number, string> = {
  0: "ראשון", 1: "שני", 2: "שלישי", 3: "רביעי", 4: "חמישי", 5: "שישי", 6: "שבת",
};
const WEEK_SHORT = ["ר", "ב", "ג", "ד", "ה", "ו", "ש"];
const HEB_MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

// After-school / family hours per weekday (0=Sun … 6=Sat)
const FAMILY_HOURS: Record<number, { start: number; end: number }> = {
  0: { start: 16, end: 22 },
  1: { start: 16, end: 22 },
  2: { start: 16, end: 22 },
  3: { start: 16, end: 22 },
  4: { start: 16, end: 22 },
  5: { start: 14, end: 22 },
  6: { start: 9,  end: 22 },
};

/* ── helpers ────────────────────────────────────────────────────────── */
function toMin(h: number, m = 0) { return h * 60 + m; }
function minToStr(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function dayStart(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }

/* ── types ──────────────────────────────────────────────────────────── */
interface DayEvent {
  id: string;
  dbId: string | null;
  title: string;
  startMin: number;
  endMin: number;
  source: "google" | "bondflow";
  completed?: boolean;
  childName?: string;
  childInitial?: string;
  childColor?: string;
}

interface FreeSlot {
  key: string;
  startMin: number;
  endMin: number;
  durMin: number;
}

interface SugItem {
  id: string;
  title: string;
  childName: string;
  childInitial: string;
  childColor: string;
  durMin: number;
  childId: string | null;
}

type CalStatus = "loading" | "ready" | "no_token" | "expired";

/* ── component ──────────────────────────────────────────────────────── */
export default function CalendarScreen({
  onNavigateToSuggestions,
}: {
  onNavigateToSuggestions?: () => void;
}) {
  /* selected day */
  const [selectedDay, setSelectedDay] = useState<Date>(() => dayStart(new Date()));

  /* day data */
  const [dayEvents, setDayEvents] = useState<DayEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [calStatus, setCalStatus] = useState<CalStatus>("loading");

  /* suggestion pool */
  const [suggestions, setSuggestions] = useState<SugItem[]>([]);
  /* per-slot state */
  const [slotIdx,    setSlotIdx]    = useState<Record<string, number>>({});
  const [slotSaving, setSlotSaving] = useState<Record<string, boolean>>({});
  const [slotDone,   setSlotDone]   = useState<Record<string, boolean>>({});

  /* week strip — next 7 days */
  const next7 = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0,0,0,0);
      return { date: d, short: WEEK_SHORT[d.getDay()], num: d.getDate(), isToday: i === 0 };
    }), []);

  /* ── load suggestion pool once ──────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        const [{ data: kids }, { data: sug }] = await Promise.all([
          sb.from("children").select("id, name, avatar_color").eq("user_id", user.id),
          sb.from("suggestions")
            .select("id, title, child_id, duration_min, prep_min, accent_color, bg_color")
            .eq("user_id", user.id)
            .not("status", "in", '("saved","dismissed")')
            .limit(30),
        ]);
        const cMap = new Map((kids ?? []).map(c => [c.id, c]));
        setSuggestions(
          (sug ?? []).map(s => {
            const c = s.child_id ? cMap.get(s.child_id) : null;
            const n = c?.name ?? "הילד שלך";
            return { id: s.id, title: s.title, childName: n, childInitial: n[0] ?? "?",
                     childColor: c?.avatar_color ?? "oklch(0.72 0.18 42)",
                     durMin: s.duration_min ?? 30, childId: s.child_id ?? null };
          })
        );
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* ── load events for selected day ──────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setDayEvents([]);
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user || cancelled) return;

        const dStart = dayStart(selectedDay);
        const dEnd   = new Date(dStart); dEnd.setHours(23,59,59,999);

        /* BondFlow moments */
        const [{ data: saved }, { data: kids }] = await Promise.all([
          sb.from("saved_moments")
            .select("id, title, child_id, scheduled_at, duration_min, completed")
            .eq("user_id", user.id)
            .gte("scheduled_at", dStart.toISOString())
            .lte("scheduled_at", dEnd.toISOString())
            .order("scheduled_at", { ascending: true }),
          sb.from("children").select("id, name, avatar_color").eq("user_id", user.id),
        ]);
        const cMap = new Map((kids ?? []).map(c => [c.id, c]));

        const bondEvents: DayEvent[] = (saved ?? []).map(m => {
          const c  = m.child_id ? cMap.get(m.child_id) : null;
          const cn = c?.name ?? "הילד שלך";
          const d  = m.scheduled_at ? new Date(m.scheduled_at) : null;
          const sm = d ? toMin(d.getHours(), d.getMinutes()) : 0;
          return { id: `bf-${m.id}`, dbId: m.id, title: m.title,
                   startMin: sm, endMin: sm + (m.duration_min ?? 30),
                   source: "bondflow", completed: m.completed,
                   childName: cn, childInitial: cn[0] ?? "?",
                   childColor: c?.avatar_color ?? "oklch(0.65 0.14 140)" };
        });

        /* Google Calendar */
        let gcEvents: DayEvent[] = [];
        try {
          const res  = await fetch("/api/calendar/events");
          const data = await res.json() as {
            connected: boolean; expired?: boolean;
            events?: Array<{ id: string; summary?: string;
              start: { dateTime?: string; date?: string };
              end:   { dateTime?: string; date?: string } }>;
          };
          if (!data.connected) {
            if (!cancelled) setCalStatus("no_token");
          } else if (data.expired) {
            if (!cancelled) setCalStatus("expired");
          } else {
            if (!cancelled) setCalStatus("ready");
            gcEvents = (data.events ?? [])
              .filter(e => {
                const iso = e.start.dateTime ?? (e.start.date ? `${e.start.date}T00:00:00` : null);
                if (!iso) return false;
                return dayStart(new Date(iso)).getTime() === dStart.getTime();
              })
              .filter(e => e.summary)
              .map(e => {
                const sISO = e.start.dateTime ?? `${e.start.date}T00:00:00`;
                const eISO = e.end.dateTime   ?? `${e.end.date}T00:00:00`;
                const sd   = new Date(sISO);
                const ed   = new Date(eISO);
                const allD = !e.start.dateTime;
                return {
                  id: `gc-${e.id}`, dbId: null, title: e.summary ?? "",
                  startMin: allD ? 0 : toMin(sd.getHours(), sd.getMinutes()),
                  endMin:   allD ? 24*60 : toMin(ed.getHours(), ed.getMinutes()),
                  source: "google" as const,
                };
              });
          }
        } catch { if (!cancelled) setCalStatus("no_token"); }

        if (!cancelled) {
          setDayEvents([...bondEvents, ...gcEvents].sort((a,b) => a.startMin - b.startMin));
        }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [selectedDay]);

  /* ── free slots ─────────────────────────────────────────────────── */
  const freeSlots = useMemo<FreeSlot[]>(() => {
    const dow = selectedDay.getDay();
    const { start, end } = FAMILY_HOURS[dow];
    const winStart = toMin(start);
    const winEnd   = toMin(end);

    const blocking = dayEvents
      .filter(e => !(e.source === "bondflow" && e.completed))
      .sort((a,b) => a.startMin - b.startMin);

    const slots: FreeSlot[] = [];
    let cursor = winStart;

    for (const ev of blocking) {
      const es = Math.max(ev.startMin, winStart);
      const ee = Math.min(ev.endMin, winEnd);
      if (es > cursor && es - cursor >= 30) {
        slots.push({ key: `slot-${cursor}-${es}`, startMin: cursor, endMin: es, durMin: es - cursor });
      }
      cursor = Math.max(cursor, ee);
    }
    if (winEnd > cursor && winEnd - cursor >= 30) {
      slots.push({ key: `slot-${cursor}-${winEnd}`, startMin: cursor, endMin: winEnd, durMin: winEnd - cursor });
    }
    return slots;
  }, [dayEvents, selectedDay]);

  /* ── timeline merge ─────────────────────────────────────────────── */
  const timeline = useMemo(() => {
    const items: Array<
      { time: number; kind: "event"; ev: DayEvent } |
      { time: number; kind: "slot";  slot: FreeSlot }
    > = [
      ...dayEvents.map(ev   => ({ time: ev.startMin,   kind: "event" as const, ev })),
      ...freeSlots.filter(s => !slotDone[s.key])
                  .map(slot => ({ time: slot.startMin, kind: "slot"  as const, slot })),
    ];
    return items.sort((a,b) => a.time - b.time);
  }, [dayEvents, freeSlots, slotDone]);

  /* ── actions ────────────────────────────────────────────────────── */
  const connectGoogle = () => {
    createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleComplete = async (ev: DayEvent) => {
    if (!ev.dbId) return;
    setDayEvents(p => p.map(e => e.id === ev.id ? { ...e, completed: true } : e));
    await createClient().from("saved_moments").update({ completed: true }).eq("id", ev.dbId);
    toast.success("סומן כבוצע ✓");
  };

  const handleDelete = async (ev: DayEvent) => {
    if (!ev.dbId) return;
    setDayEvents(p => p.filter(e => e.id !== ev.id));
    await createClient().from("saved_moments").delete().eq("id", ev.dbId);
    toast("הרגע הוסר");
  };

  const handleApprove = async (slot: FreeSlot) => {
    if (!suggestions.length || slotSaving[slot.key]) return;
    const idx = slotIdx[slot.key] ?? 0;
    const sug = suggestions[idx % suggestions.length];
    setSlotSaving(p => ({ ...p, [slot.key]: true }));
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const schedAt = new Date(selectedDay);
      schedAt.setHours(Math.floor(slot.startMin / 60), slot.startMin % 60, 0, 0);
      const endAt = new Date(schedAt.getTime() + sug.durMin * 60_000);

      await sb.from("suggestions").update({ status: "saved" }).eq("id", sug.id);
      await sb.from("saved_moments").insert({
        user_id: user.id, suggestion_id: sug.id,
        child_id: sug.childId, title: sug.title,
        duration_min: sug.durMin, scheduled_at: schedAt.toISOString(), completed: false,
      });
      await fetch("/api/calendar/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sug.title, startISO: schedAt.toISOString(), endISO: endAt.toISOString() }),
      });

      setSlotDone(p => ({ ...p, [slot.key]: true }));
      setDayEvents(p => [...p, {
        id: `bf-new-${slot.key}`, dbId: null, title: sug.title,
        startMin: slot.startMin, endMin: slot.startMin + sug.durMin,
        source: "bondflow" as const, childName: sug.childName,
        childInitial: sug.childInitial, childColor: sug.childColor,
      }].sort((a,b) => a.startMin - b.startMin));
      toast.success("הרגע נשמר ונוסף ליומן ✓");
    } catch { toast.error("שגיאה, נסה שוב"); }
    finally { setSlotSaving(p => ({ ...p, [slot.key]: false })); }
  };

  const nextSuggestion = (key: string) =>
    setSlotIdx(p => ({ ...p, [key]: ((p[key] ?? 0) + 1) % Math.max(suggestions.length, 1) }));

  /* ── day label ──────────────────────────────────────────────────── */
  const dayLabel = `${HEBREW_DAYS[selectedDay.getDay()]}, ${selectedDay.getDate()} ב${HEB_MONTHS[selectedDay.getMonth()]}`;
  const gcCount  = dayEvents.filter(e => e.source === "google").length;
  const bfCount  = dayEvents.filter(e => e.source === "bondflow").length;

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {calStatus === "no_token" && (
            <button onClick={connectGoogle}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white"
              style={{ background: "oklch(0.52 0.14 255)" }}>
              <Calendar className="w-3.5 h-3.5" /> חבר Google Calendar
            </button>
          )}
          {calStatus === "expired" && (
            <button onClick={connectGoogle}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border"
              style={{ borderColor: "oklch(0.85 0.06 42)", color: "oklch(0.55 0.14 42)" }}>
              <RefreshCw className="w-3.5 h-3.5" /> חדש חיבור
            </button>
          )}
        </div>
        <h2 className="text-xl font-black" style={{ color: "oklch(0.2 0.03 255)" }}>היומן שלך</h2>
      </div>

      {/* Week strip */}
      <div className="overflow-x-auto mb-5 -mx-1 px-1">
        <div className="flex gap-2" style={{ minWidth: "max-content" }}>
          {next7.map(day => {
            const isSel = day.date.getTime() === selectedDay.getTime();
            return (
              <button key={day.date.toISOString()}
                onClick={() => setSelectedDay(day.date)}
                className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2.5 flex-shrink-0 transition-all"
                style={{
                  minWidth: "54px",
                  background: isSel ? "oklch(0.65 0.14 140)" : (day.isToday ? "oklch(0.88 0.08 140 / 0.2)" : "white"),
                  border: `1px solid ${isSel ? "transparent" : "oklch(0.93 0.02 85)"}`,
                  boxShadow: isSel ? "0 2px 8px oklch(0.65 0.14 140 / 0.3)" : "none",
                }}>
                <span className="text-xs font-bold" style={{ color: isSel ? "white" : "oklch(0.55 0.03 255)" }}>{day.short}</span>
                <span className="text-sm font-black" style={{ color: isSel ? "white" : "oklch(0.2 0.03 255)" }}>{day.num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day header */}
      <div className="text-right mb-4">
        <p className="text-base font-black" style={{ color: "oklch(0.2 0.03 255)" }}>{dayLabel}</p>
        {!loading && (
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>
            {gcCount > 0 && `${gcCount} אירועי Google`}
            {gcCount > 0 && bfCount > 0 && " · "}
            {bfCount > 0 && `${bfCount} רגעים משפחתיים`}
            {freeSlots.length > 0 && ` · ${freeSlots.length} חלונות פנויים`}
            {gcCount === 0 && bfCount === 0 && "אין אירועים מיובאים ליום זה"}
          </p>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-12 h-10 rounded-xl flex-shrink-0" style={{ background: "oklch(0.93 0.02 85)" }} />
              <div className="flex-1 h-16 rounded-2xl" style={{ background: "oklch(0.93 0.02 85)" }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && timeline.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}>
            <Calendar className="w-6 h-6" style={{ color: "oklch(0.65 0.14 140)" }} />
          </div>
          <p className="text-base font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
            {calStatus === "no_token" ? "Google Calendar לא מחובר" : "היום פנוי לחלוטין!"}
          </p>
          <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.03 255)" }}>
            {calStatus === "no_token"
              ? "חבר את Google Calendar כדי לראות חלונות זמן פנויים"
              : "אין אירועים. אולי זה הזמן לרגע משפחתי?"}
          </p>
          {calStatus === "no_token" ? (
            <button onClick={connectGoogle}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black text-white"
              style={{ background: "oklch(0.52 0.14 255)" }}>
              <Calendar className="w-4 h-4" /> חבר Google Calendar
            </button>
          ) : (
            <button onClick={onNavigateToSuggestions}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))" }}>
              <Sparkles className="w-4 h-4" /> מצא פעילות
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      {!loading && timeline.length > 0 && (
        <div className="flex flex-col gap-3">
          {timeline.map(item => {

            /* ── scheduled event ── */
            if (item.kind === "event") {
              const ev = item.ev;
              const isBF = ev.source === "bondflow";
              return (
                <div key={ev.id} className="flex items-start gap-3">
                  {/* Time label */}
                  <div className="w-12 flex-shrink-0 text-right pt-3.5">
                    <p className="text-xs font-black leading-none"
                      style={{ color: isBF ? "oklch(0.55 0.14 140)" : "oklch(0.52 0.14 255)" }}>
                      {minToStr(ev.startMin)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.7 0.03 255)" }}>
                      {minToStr(ev.endMin)}
                    </p>
                  </div>
                  {/* Block */}
                  <div className="flex-1 rounded-2xl border p-3.5"
                    style={{
                      background: "white",
                      borderColor: isBF ? "oklch(0.88 0.06 140 / 0.6)" : "oklch(0.88 0.06 255 / 0.5)",
                      borderLeftWidth: "3px",
                      borderLeftColor: isBF ? "oklch(0.65 0.14 140)" : "oklch(0.52 0.14 255)",
                    }}>
                    <div className="flex items-start gap-2">
                      {/* actions for bondflow only */}
                      {isBF && (
                        <div className="flex gap-1 flex-shrink-0">
                          {!ev.completed && (
                            <button onClick={() => handleComplete(ev)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[oklch(0.88_0.08_140_/_0.2)]"
                              style={{ color: "oklch(0.55 0.14 140)" }}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(ev)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[oklch(0.95_0.04_25)]"
                            style={{ color: "oklch(0.65 0.10 25)" }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {/* text */}
                      <div className="flex-1 text-right min-w-0">
                        <div className="flex items-center justify-end gap-1.5 mb-0.5">
                          {ev.completed && (
                            <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>✓ בוצע</span>
                          )}
                          <span className="text-xs font-bold rounded-full px-2 py-0.5"
                            style={{
                              background: isBF ? "oklch(0.88 0.08 140 / 0.2)" : "oklch(0.90 0.06 255 / 0.2)",
                              color:      isBF ? "oklch(0.48 0.14 140)"       : "oklch(0.45 0.14 255)",
                            }}>
                            {isBF ? "BondFlow" : "Google"}
                          </span>
                        </div>
                        <p className="font-black text-sm" style={{ color: "oklch(0.2 0.03 255)" }}>{ev.title}</p>
                        {ev.childName && isBF && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{ev.childName}</span>
                            <span className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center flex-shrink-0"
                              style={{ background: ev.childColor, fontSize: "9px" }}>
                              {ev.childInitial}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            /* ── free slot suggestion ── */
            if (item.kind === "slot") {
              const slot = item.slot;
              const idx  = slotIdx[slot.key] ?? 0;
              const sug  = suggestions.length > 0 ? suggestions[idx % suggestions.length] : null;
              const busy = slotSaving[slot.key] ?? false;

              return (
                <div key={slot.key} className="flex items-start gap-3">
                  {/* Time label */}
                  <div className="w-12 flex-shrink-0 text-right pt-3.5">
                    <p className="text-xs font-black leading-none" style={{ color: "oklch(0.58 0.14 140)" }}>
                      {minToStr(slot.startMin)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.7 0.03 255)" }}>{slot.durMin} דק'</p>
                  </div>
                  {/* Suggestion tile */}
                  <div className="flex-1 rounded-2xl p-3.5"
                    style={{
                      background: "oklch(0.97 0.02 140 / 0.5)",
                      border: "1.5px dashed oklch(0.72 0.10 140 / 0.55)",
                    }}>
                    {sug ? (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                            <Zap className="w-3 h-3" style={{ color: "oklch(0.62 0.14 140)" }} />
                            <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>זמן פנוי</span>
                          </div>
                          <div className="flex-1 text-right min-w-0">
                            <p className="font-black text-sm" style={{ color: "oklch(0.2 0.03 255)" }}>{sug.title}</p>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <span className="text-xs flex items-center gap-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>
                                <Clock className="w-3 h-3" />{sug.durMin} דק'
                              </span>
                              <span className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center flex-shrink-0"
                                style={{ background: sug.childColor, fontSize: "9px" }}>
                                {sug.childInitial}
                              </span>
                              <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{sug.childName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => nextSuggestion(slot.key)}
                            className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold border transition-all"
                            style={{ borderColor: "oklch(0.82 0.08 140)", color: "oklch(0.52 0.14 140)", background: "white" }}>
                            <RefreshCw className="w-3 h-3" /> אחרת
                          </button>
                          <button
                            onClick={() => handleApprove(slot)}
                            disabled={busy}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black text-white transition-all disabled:opacity-60 active:scale-[0.98]"
                            style={{
                              background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
                              boxShadow: "0 3px 8px oklch(0.65 0.14 140 / 0.3)",
                            }}>
                            {busy ? "שומר..." : <><CheckCircle2 className="w-3.5 h-3.5" /> אשר ולחסום ביומן</>}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button onClick={onNavigateToSuggestions}
                          className="text-xs font-bold flex items-center gap-1"
                          style={{ color: "oklch(0.52 0.14 140)" }}>
                          <Sparkles className="w-3.5 h-3.5" /> צור הצעה
                        </button>
                        <p className="text-sm font-bold text-right" style={{ color: "oklch(0.45 0.03 255)" }}>
                          חלון פנוי {minToStr(slot.startMin)}–{minToStr(slot.endMin)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Connect banner when events exist but calendar not linked */}
      {!loading && dayEvents.length > 0 && calStatus === "no_token" && (
        <div className="mt-5 rounded-2xl p-4 flex items-start gap-3 flex-row-reverse"
          style={{ background: "oklch(0.96 0.02 255 / 0.5)", border: "1px solid oklch(0.85 0.06 255 / 0.4)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.14 255)" }} />
          <div className="flex-1 text-right">
            <p className="text-xs font-bold mb-1" style={{ color: "oklch(0.38 0.12 255)" }}>
              חבר Google Calendar לראות חלונות פנויים אמיתיים
            </p>
            <button onClick={connectGoogle} className="text-xs font-black" style={{ color: "oklch(0.52 0.14 255)" }}>
              חבר עכשיו ←
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
