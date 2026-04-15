"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home, Calendar, Lightbulb, User, BarChart2,
  ChevronLeft, Clock, Blocks, BookOpen,
  CheckCircle2, TrendingUp, Sparkles, X, Pencil,
} from "lucide-react";
import ProfileSidebar from "./ProfileSidebar";
import FindActivityScreen from "./FindActivityScreen";
import CalendarScreen from "./CalendarScreen";
import ReportsScreen from "./ReportsScreen";
import SettingsScreen from "./SettingsScreen";
import InlineSpinner from "@/components/ui/inline-spinner";

// ---- Types ----
type Tab = "home" | "suggestions" | "calendar" | "reports" | "profile";

interface Suggestion {
  id: string;
  title: string;
  child: string;
  childInitial: string;
  childColor: string;
  childAge: number;
  timeSlot: string;
  duration: string;
  prepLevel: "אפס הכנה" | "הכנה קלה" | "קצת הכנה";
  IconComp: React.ElementType;
  accentColor: string;
  bgColor: string;
  blocked?: boolean;
}

// ---- Warm Score Ring ----
function ScoreRing({ score, delta, activeDays }: { score: number; delta: number; activeDays: number[] }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const gap = circ - filled;

  return (
    <div
      className="rounded-3xl p-5 border"
      style={{
        background: "white",
        borderColor: "oklch(0.91 0.03 85)",
        boxShadow: "0 4px 20px oklch(0 0 0 / 0.06)",
      }}
    >
      <div className="flex items-center gap-5">
        {/* SVG ring */}
        <div className="relative flex-shrink-0">
          <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
            <circle cx="56" cy="56" r={r} fill="none" stroke="oklch(0.92 0.02 85)" strokeWidth="8" />
            <circle
              cx="56" cy="56" r={r}
              fill="none"
              stroke="url(#warmGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${gap}`}
              strokeDashoffset="0"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
            <defs>
              <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.65 0.14 140)" />
                <stop offset="100%" stopColor="oklch(0.72 0.18 42)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black leading-none" style={{ color: "oklch(0.2 0.03 255)" }}>{score}</span>
            <span className="text-xs mt-0.5" style={{ color: "oklch(0.65 0.03 255)" }}>/100</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 text-right">
          <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "oklch(0.65 0.14 140)" }}>
            כמה אתה נוכח השבוע
          </p>
          <p className="text-lg font-black leading-snug mb-2" style={{ color: "oklch(0.18 0.03 255)" }}>
            אתה שם.<br />
            <span className="text-gradient">ממשיך כך.</span>
          </p>
          <div
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1"
            style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}
          >
            <TrendingUp className="w-3 h-3" style={{ color: "oklch(0.52 0.14 140)" }} />
            <span className="text-xs font-bold" style={{ color: "oklch(0.52 0.14 140)" }}>
              {delta >= 0 ? "+" : ""}{delta} מהשבוע שעבר
            </span>
          </div>
        </div>
      </div>

      {/* Weekly dots — real active days */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: "oklch(0.68 0.03 255)" }}>ראשון</span>
        <div className="flex gap-1.5 items-center">
          {[0,1,2,3,4,5,6].map((dayIdx) => {
            const done = activeDays.includes(dayIdx);
            return (
              <div
                key={dayIdx}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: done ? "oklch(0.65 0.14 140)" : "oklch(0.92 0.02 85)" }}
              >
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
              </div>
            );
          })}
        </div>
        <span className="text-xs" style={{ color: "oklch(0.68 0.03 255)" }}>שבת</span>
      </div>
    </div>
  );
}

// ---- Upcoming card (horizontal, compact) ----
function UpcomingCard({
  title, child, childInitial, childColor, time, Icon, accentColor, bgColor,
}: {
  title: string; child: string; childInitial: string; childColor: string;
  time: string; Icon: React.ElementType; accentColor: string; bgColor: string;
}) {
  return (
    <div
      className="rounded-2xl border flex items-center gap-3 p-3.5"
      style={{ background: "white", borderColor: "oklch(0.93 0.02 85)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.04)" }}
    >
      <div className="flex-shrink-0">
        <p className="text-sm font-black text-center" style={{ color: "oklch(0.55 0.14 140)" }}>{time.split(" ")[1] ?? time}</p>
        <p className="text-xs text-center" style={{ color: "oklch(0.65 0.03 255)" }}>{time.split(" ")[0]}</p>
      </div>
      <div className="w-px self-stretch" style={{ background: "oklch(0.91 0.02 85)" }} />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bgColor }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 text-right min-w-0">
        <p className="font-black text-sm truncate" style={{ color: "oklch(0.2 0.03 255)" }}>{title}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{child}</span>
          <span
            className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center flex-shrink-0"
            style={{ background: childColor, fontSize: "9px" }}
          >
            {childInitial}
          </span>
        </div>
      </div>
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.65 0.14 140)" }} />
    </div>
  );
}

// ---- Home suggestion card (single, featured) ----
function HomeSuggestionCard({
  s, onBlock, onDismiss,
}: {
  s: Suggestion; onBlock: (id: string) => void; onDismiss: (id: string) => void;
}) {
  const Icon = s.IconComp;
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ background: "white", borderColor: "oklch(0.93 0.02 85)", boxShadow: "0 2px 12px oklch(0 0 0 / 0.05)" }}
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${s.accentColor}, oklch(0.72 0.18 42))` }} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bgColor }}
          >
            <Icon className="w-5.5 h-5.5" style={{ color: s.accentColor }} />
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onDismiss(s.id)}
                className="p-0.5 rounded-lg flex-shrink-0 transition-colors hover:bg-[oklch(0.95_0.01_85)]"
                style={{ color: "oklch(0.72 0.02 255)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="font-black text-sm leading-snug" style={{ color: "oklch(0.2 0.03 255)" }}>
                {s.title}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>
                {s.child}, {s.childAge}
              </span>
              <span
                className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center"
                style={{ background: s.childColor, fontSize: "9px" }}
              >
                {s.childInitial}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs" style={{ color: "oklch(0.58 0.03 255)" }}>
          <span
            className="rounded-full px-2.5 py-0.5 font-semibold"
            style={{ background: `${s.accentColor}15`, color: s.accentColor }}
          >
            {s.prepLevel}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {s.duration} · {s.timeSlot}
          </span>
        </div>

        <button
          onClick={() => onBlock(s.id)}
          className="w-full rounded-xl py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
            boxShadow: "0 4px 12px oklch(0.65 0.14 140 / 0.3)",
          }}
        >
          שמור את הרגע הזה
        </button>
      </div>
    </div>
  );
}

// ---- Nav tabs config ----
// DOM order = visual RTL order (first = rightmost)
const NAV_TABS: { id: Tab; label: string; Icon: React.ElementType; primary?: boolean }[] = [
  { id: "home",        label: "בית",         Icon: Home },
  { id: "suggestions", label: "מצא פעילות",  Icon: Sparkles, primary: true },
  { id: "calendar",    label: "יומן",        Icon: Calendar },
];

// ---- Mobile Bottom Nav ----
function BottomNav({ active, setActive }: { active: Tab; setActive: (t: Tab) => void }) {
  return (
    <div
      className="md:hidden fixed bottom-0 right-0 left-0 z-20"
      style={{
        background: "white",
        borderTop: "1px solid oklch(0.93 0.02 85)",
        boxShadow: "0 -4px 24px oklch(0 0 0 / 0.07)",
      }}
    >
      <div className="flex items-center justify-around px-1 pb-safe">
        {NAV_TABS.map(({ id, label, Icon, primary }) => {
          const isActive = active === id;
          if (primary) {
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 transition-all active:scale-95"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all -mt-3"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, oklch(0.58 0.16 148), oklch(0.52 0.18 148))"
                      : "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
                    boxShadow: "0 4px 16px oklch(0.65 0.14 140 / 0.45)",
                  }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold" style={{ color: "oklch(0.48 0.14 140)" }}>
                  {label}
                </span>
              </button>
            );
          }
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex flex-col items-center gap-0.5 py-3 px-2 min-w-0 flex-1 transition-all active:scale-95"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: isActive ? "oklch(0.88 0.08 140 / 0.22)" : "transparent" }}
              >
                <Icon
                  className="w-4.5 h-4.5 transition-all"
                  style={{ color: isActive ? "oklch(0.48 0.14 140)" : "oklch(0.65 0.03 255)" }}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span
                className="text-xs font-semibold truncate max-w-full px-0.5"
                style={{ color: isActive ? "oklch(0.48 0.14 140)" : "oklch(0.65 0.03 255)" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Icon mapping by category ----
function iconForCategory(category: string | null): React.ElementType {
  switch (category) {
    case "lego": return Blocks;
    case "drawing": return Pencil;
    case "reading": return BookOpen;
    default: return Sparkles;
  }
}

// ---- Prep label from minutes ----
function prepLabel(mins: number | null): "אפס הכנה" | "הכנה קלה" | "קצת הכנה" {
  if (!mins || mins === 0) return "אפס הכנה";
  if (mins <= 10) return "הכנה קלה";
  return "קצת הכנה";
}

interface UpcomingMoment {
  id: string;
  title: string;
  childName: string;
  childInitial: string;
  childColor: string;
  time: string;
  accentColor: string;
  bgColor: string;
  IconComp: React.ElementType;
}

const HEBREW_DAYS_SHORT: Record<number, string> = {
  0: "ראשון", 1: "שני", 2: "שלישי", 3: "רביעי", 4: "חמישי", 5: "שישי", 6: "שבת",
};

const HEBREW_TO_DAY: Record<string, number> = {
  "ראשון": 0, "שני": 1, "שלישי": 2, "רביעי": 3, "חמישי": 4, "שישי": 5, "שבת": 6,
};

/** Returns the next Date that matches dayLabel (Hebrew) + timeSlot ("HH:MM") */
function getScheduledDate(dayLabel: string | null, timeSlot: string | null): Date {
  const [hStr, mStr] = (timeSlot ?? "17:00").split(":");
  const hours = parseInt(hStr) || 17;
  const mins  = parseInt(mStr) || 0;

  const now = new Date();
  const result = new Date(now);

  if (dayLabel && HEBREW_TO_DAY[dayLabel] !== undefined) {
    const target  = HEBREW_TO_DAY[dayLabel];
    const current = now.getDay();
    let diff = target - current;
    if (diff < 0) diff += 7;           // already past this week → next week
    if (diff === 0) {
      // same weekday — check if the time slot is still ahead today
      const candidate = new Date(now);
      candidate.setHours(hours, mins, 0, 0);
      if (candidate <= now) diff = 7;  // time passed → schedule next week
    }
    result.setDate(now.getDate() + diff);
  } else {
    result.setDate(now.getDate() + 1); // fallback: tomorrow
  }

  result.setHours(hours, mins, 0, 0);
  return result;
}

// ---- Main Dashboard ----
export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [upcomingMoments, setUpcomingMoments] = useState<UpcomingMoment[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("...");
  const [userInitial, setUserInitial] = useState<string>("?");
  const [weekScore, setWeekScore] = useState<number>(0);
  const [scoreDelta, setScoreDelta] = useState<number>(0);
  const [momentsCount, setMomentsCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);
  const [weekActiveDays, setWeekActiveDays] = useState<number[]>([]);
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);
  const [calendarConnectLoading, setCalendarConnectLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // ---- Load real data on mount ----
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        // 1. User + session (session has provider_token for Google Calendar)
        const [{ data: { user } }, { data: { session } }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getSession(),
        ]);
        if (!user) return;

        // 2. Profile name + persist Google Calendar token if present in session
        // @ts-ignore — subscription columns added via migration, not yet in generated types
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, google_calendar_token, subscription_status, subscription_plan")
          .eq("id", user.id)
          .maybeSingle() as unknown as { data: { full_name: string | null; google_calendar_token: string | null; subscription_status: string | null; subscription_plan: string | null } | null };
        const name = profile?.full_name ?? user.email?.split("@")[0] ?? "משתמש";
        setUserName(name);
        setUserInitial(name[0] ?? "?");
        setCalendarConnected(!!profile?.google_calendar_token);
        const subStatus = profile?.subscription_status ?? "free";
        const subPlan   = profile?.subscription_plan   ?? "free";
        setIsPremium(subStatus === "active" && subPlan !== "free");

        if (session?.provider_token) {
          await supabase.from("profiles").upsert({
            id: user.id,
            google_calendar_token: session.provider_token,
            google_calendar_refresh_token: session.provider_refresh_token ?? null,
          }, { onConflict: "id" });
        }

        // 3. Children (shared by suggestions + upcoming)
        const { data: children } = await supabase
          .from("children")
          .select("id, name, age_group, avatar_color")
          .eq("user_id", user.id);

        if (!children || children.length === 0) {
          router.replace("/onboarding");
          return;
        }

        const childMap = new Map((children ?? []).map((c) => [c.id, c]));

        // 4a. Active days this week (for score ring dots)
        const weekStart = new Date(); weekStart.setDate(new Date().getDate() - new Date().getDay()); weekStart.setHours(0,0,0,0);
        const weekEnd   = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
        const { data: weekMoments } = await supabase
          .from("saved_moments")
          .select("scheduled_at")
          .eq("user_id", user.id)
          .gte("scheduled_at", weekStart.toISOString())
          .lt("scheduled_at", weekEnd.toISOString());
        setWeekActiveDays([...new Set((weekMoments ?? []).map((m) => new Date(m.scheduled_at!).getDay()))]);

        // 4. Weekly score
        const { data: scores } = await supabase
          .from("weekly_scores")
          .select("score, moments_count")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2);
        if (scores && scores.length > 0) {
          setWeekScore(scores[0].score ?? 0);
          setMomentsCount(scores[0].moments_count ?? 0);
          if (scores.length > 1) {
            setScoreDelta((scores[0].score ?? 0) - (scores[1].score ?? 0));
          }
        }

        // 5. Upcoming saved moments (next 14 days, not completed)
        const now = new Date();
        const twoWeeksOut = new Date(now);
        twoWeeksOut.setDate(now.getDate() + 14);
        const { data: upcoming } = await supabase
          .from("saved_moments")
          .select("id, title, child_id, scheduled_at, duration_min")
          .eq("user_id", user.id)
          .eq("completed", false)
          .gte("scheduled_at", now.toISOString())
          .lte("scheduled_at", twoWeeksOut.toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(3);

        const mappedUpcoming: UpcomingMoment[] = (upcoming ?? []).map((m) => {
          const child = m.child_id ? childMap.get(m.child_id) : null;
          const childName = child?.name ?? "הילד שלך";
          const sched = m.scheduled_at ? new Date(m.scheduled_at) : null;
          const timeStr = sched
            ? `${HEBREW_DAYS_SHORT[sched.getDay()]} ${String(sched.getHours()).padStart(2, "0")}:${String(sched.getMinutes()).padStart(2, "0")}`
            : "";
          return {
            id: m.id,
            title: m.title,
            childName,
            childInitial: childName[0] ?? "?",
            childColor: child?.avatar_color ?? "oklch(0.72 0.18 42)",
            time: timeStr,
            accentColor: "oklch(0.55 0.14 140)",
            bgColor: "oklch(0.88 0.08 140 / 0.15)",
            IconComp: Sparkles,
          };
        });
        setUpcomingMoments(mappedUpcoming);

        // 6. Suggestions from API
        const res = await fetch("/api/suggestions");
        if (res.ok) {
          const json = await res.json();
          const raw = json.suggestions ?? [];
          const mapped: Suggestion[] = raw.map((s: {
            id: string; title: string; child_id?: string; duration_min?: number;
            time_slot?: string; day_label?: string; prep_min?: number;
            accent_color?: string; bg_color?: string; category?: string;
            status?: string;
          }) => {
            const child = s.child_id ? childMap.get(s.child_id) : null;
            const childName = child?.name ?? "הילד שלך";
            return {
              id: s.id,
              title: s.title,
              child: childName,
              childInitial: childName[0] ?? "?",
              childColor: child?.avatar_color ?? "oklch(0.72 0.18 42)",
              childAge: 0,
              timeSlot: `${s.day_label ?? ""} ${s.time_slot ?? ""}`.trim(),
              duration: s.duration_min ? `${s.duration_min} דק'` : "20 דק'",
              prepLevel: prepLabel(s.prep_min ?? null),
              IconComp: iconForCategory(s.category ?? null),
              accentColor: s.accent_color ?? "oklch(0.55 0.14 140)",
              bgColor: s.bg_color ?? "oklch(0.88 0.08 140 / 0.15)",
              blocked: s.status === "saved",
            };
          });
          setSuggestions(mapped);
          const savedCount = mapped.filter((m) => m.blocked).length;
          if (savedCount > 0) setMomentsCount(savedCount);
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  const handleTabClick = (id: Tab) => {
    if (id === "profile") {
      setSidebarOpen(true);
    } else {
      setActiveTab(id);
    }
  };

  const handleBlock = async (id: string) => {
    // Optimistic UI update
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, blocked: true } : s)));

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Mark suggestion as saved
      const { data: suggestion } = await supabase
        .from("suggestions")
        .update({ status: "saved" })
        .eq("id", id)
        .select("title, duration_min, child_id, time_slot, day_label")
        .single();

      if (!suggestion) return;

      // 2. Schedule at the suggestion's actual day+time, not "tomorrow 17:00"
      const scheduledAt = getScheduledDate(suggestion.day_label, suggestion.time_slot);

      await supabase.from("saved_moments").insert({
        user_id: user.id,
        suggestion_id: id,
        child_id: suggestion.child_id ?? null,
        title: suggestion.title,
        duration_min: suggestion.duration_min ?? 30,
        scheduled_at: scheduledAt.toISOString(),
        completed: false,
      });

      // 3. Push to Google Calendar via server-side route (handles token refresh)
      const endDate = new Date(scheduledAt.getTime() + (suggestion.duration_min ?? 30) * 60_000);
      await fetch("/api/calendar/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:    suggestion.title,
          startISO: scheduledAt.toISOString(),
          endISO:   endDate.toISOString(),
        }),
      });
    } catch (e) {
      console.error("Failed to save suggestion:", e);
    }
  };

  const handleDismiss = async (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    try {
      const supabase = createClient();
      await supabase.from("suggestions").update({ status: "dismissed" }).eq("id", id);
    } catch (e) {
      console.error("Failed to dismiss suggestion:", e);
    }
  };

  const connectGoogleCalendar = async () => {
    setCalendarConnectLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar.events",
          queryParams: { access_type: "offline", prompt: "consent" },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } finally {
      setCalendarConnectLoading(false);
    }
  };

  const activeSuggestions = suggestions.filter((s) => !s.blocked);
  const firstSuggestion = activeSuggestions[0];
  const isZeroActivity = momentsCount === 0 && weekActiveDays.length === 0;
  const homeSummary = isZeroActivity
    ? "השבוע עדיין פתוח. בחר רגע ראשון ונתחיל לזוז."
    : `השבוע יש לך ${activeSuggestions.length} רגעים שמחכים לך.`;
  const scoreHeadline = isZeroActivity ? "עוד לא התחלת השבוע." : "אתה שם.";
  const scoreSubline = isZeroActivity ? "שמור רגע אחד כדי לפתוח מומנטום." : "ממשיך כך.";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "בוקר טוב";
    if (h >= 12 && h < 17) return "צהריים טובים";
    if (h >= 17 && h < 21) return "ערב טוב";
    return "לילה טוב";
  })();

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "oklch(0.97 0.01 85)" }}>
      {/* Profile sidebar */}
      <ProfileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ---- Top bar ---- */}
      <div
        className="sticky top-0 z-10 flex items-center px-4 md:px-8 pt-4 pb-3"
        style={{
          background: "oklch(0.97 0.01 85 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.92 0.02 85)",
        }}
      >
        {/* Spacer - keeps avatar balanced on the left */}
        <div className="w-10 flex-shrink-0" />

        {/* Desktop nav - center (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center mx-4">
          {NAV_TABS.map(({ id, label, Icon, primary }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: primary
                    ? (isActive ? "oklch(0.58 0.16 148)" : "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))")
                    : (isActive ? "oklch(0.88 0.08 140 / 0.2)" : "transparent"),
                  color: primary ? "white" : (isActive ? "oklch(0.42 0.14 140)" : "oklch(0.55 0.03 255)"),
                  boxShadow: primary ? "0 3px 10px oklch(0.65 0.14 140 / 0.3)" : "none",
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={primary || isActive ? 2.5 : 1.75} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Mobile: app name centered */}
        <div className="flex-1 flex justify-center md:hidden">
          <span className="text-sm font-black" style={{ color: "oklch(0.35 0.05 255)" }}>BondFlow</span>
        </div>

        {/* Avatar button - DOM last = visual left in RTL (both mobile & desktop) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 transition-opacity hover:opacity-85 active:scale-95"
          style={{ background: "oklch(0.65 0.14 140)" }}
        >
          {userInitial}
        </button>
      </div>

      {/* ---- Screen routing ---- */}
      {activeTab === "suggestions" && <FindActivityScreen />}
      {activeTab === "calendar"    && <CalendarScreen onNavigateToSuggestions={() => setActiveTab("suggestions")} />}
      {activeTab === "reports"     && <ReportsScreen />}
      {activeTab === "profile"     && <SettingsScreen />}

      {/* ---- Home screen ---- */}
      {activeTab === "home" && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">

          {activeTab === "home" && loadingData && (
            <div className="flex flex-col gap-4 animate-pulse">
              {/* Greeting lines */}
              <div className="h-7 w-52 rounded-xl ms-auto" style={{ background: "oklch(0.86 0.02 85)" }} />
              <div className="h-4 w-72 rounded-lg ms-auto" style={{ background: "oklch(0.89 0.02 85)" }} />
              {/* Dark report card */}
              <div className="rounded-3xl h-48 w-full" style={{ background: "oklch(0.82 0.03 255)" }} />
              {/* 3 stat pills */}
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: "oklch(0.86 0.02 85)" }} />)}
              </div>
              {/* Upcoming card */}
              <div className="rounded-2xl h-16 w-full" style={{ background: "oklch(0.86 0.02 85)" }} />
              {/* Suggestion card */}
              <div className="rounded-2xl h-36 w-full" style={{ background: "oklch(0.86 0.02 85)" }} />
            </div>
          )}
          {!loadingData && (
          <>
          {/* Welcome strip */}
          <div className="text-right mb-5">
            <p className="text-2xl font-black" style={{ color: "oklch(0.18 0.03 255)" }}>
              {greeting}, {userName}
            </p>
            <p className="text-sm mt-1" style={{ color: "oklch(0.55 0.03 255)" }}>
              {homeSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Weekly Report Card — zero-activity gets a CTA instead */}
              {isZeroActivity ? (
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.62 0.16 148), oklch(0.56 0.18 155))",
                    boxShadow: "0 8px 40px oklch(0.60 0.16 148 / 0.4)",
                  }}
                >
                  <div className="relative p-6 text-center">
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "oklch(0.90 0.12 80)" }} />
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-white opacity-90" />
                    <p className="text-xl font-black text-white mb-1">{scoreHeadline}</p>
                    <p className="text-sm text-white opacity-80 mb-5">{scoreSubline}</p>
                    <button
                      onClick={() => setActiveTab("suggestions")}
                      className="rounded-2xl px-6 py-3 text-sm font-black transition-all hover:scale-105 active:scale-95"
                      style={{ background: "white", color: "oklch(0.52 0.16 148)" }}
                    >
                      שמור רגע ראשון →
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.28 0.05 255), oklch(0.32 0.08 265))",
                    boxShadow: "0 8px 40px oklch(0.28 0.05 255 / 0.35)",
                  }}
                >
                  <div className="relative p-5">
                    <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-15 blur-xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <button
                        onClick={() => setActiveTab("reports")}
                        className="text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-75"
                        style={{ color: "oklch(0.65 0.03 255)" }}
                      >
                        <ChevronLeft className="w-3 h-3" />
                        דוח מלא
                      </button>
                      <p className="text-sm font-black text-white">הציון השבועי שלך</p>
                    </div>

                    <div className="relative z-10 text-center mb-4">
                      <div className="inline-flex items-end gap-1.5">
                        <span className="text-6xl font-black text-white leading-none">{weekScore}</span>
                        <span className="text-xl font-bold mb-1" style={{ color: "oklch(0.65 0.03 255)" }}>/100</span>
                      </div>
                      <p className="text-sm font-bold mt-1" style={{ color: "oklch(0.65 0.14 140)" }}>ציון חיבור משפחתי</p>
                      {scoreDelta !== 0 && (
                        <p className="text-xs mt-0.5" style={{ color: scoreDelta > 0 ? "oklch(0.65 0.14 140)" : "oklch(0.65 0.08 25)" }}>
                          {scoreDelta > 0 ? `▲ +${scoreDelta}` : `▼ ${scoreDelta}`} משבוע שעבר
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
                      {[
                        { value: momentsCount, label: "רגעים שמורים" },
                        { value: activeSuggestions.length, label: "הצעות זמינות" },
                      ].map(({ value, label }, i) => (
                        <div key={i} className="rounded-2xl p-3 text-center" style={{ background: "oklch(1 0 0 / 0.1)" }}>
                          <p className="text-2xl font-black text-white">{value}</p>
                          <p className="text-xs" style={{ color: "oklch(0.7 0.03 255)" }}>{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="relative z-10 flex items-center justify-between rounded-2xl px-3 py-2.5" style={{ background: "oklch(1 0 0 / 0.08)" }}>
                      <span className="text-xs" style={{ color: "oklch(0.7 0.03 255)" }}>ראשון</span>
                      <div className="flex gap-1.5">
                        {[0,1,2,3,4,5,6].map((dayIdx) => {
                          const done = weekActiveDays.includes(dayIdx);
                          return (
                            <div key={dayIdx} className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ background: done ? "oklch(0.65 0.14 140)" : "oklch(1 0 0 / 0.15)" }}>
                              {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs" style={{ color: "oklch(0.7 0.03 255)" }}>שבת</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "רגעים", value: String(momentsCount), sub: "מתוך 5 יעד", color: "oklch(0.58 0.14 140)" },
                  { label: "הצעות", value: String(activeSuggestions.length), sub: "השבוע", color: "oklch(0.62 0.18 42)" },
                  { label: "ציון", value: String(weekScore), sub: "/100", color: "oklch(0.52 0.18 255)" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-3 text-center border"
                    style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
                  >
                    <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs font-bold leading-tight mt-0.5" style={{ color: "oklch(0.32 0.03 255)" }}>{stat.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.62 0.03 255)" }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming moments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  {/* Title on RIGHT (DOM first = visual right in RTL) */}
                  <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
                    הרגעים הקרובים
                  </p>
                  {/* Button on LEFT (DOM last = visual left in RTL) */}
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: "oklch(0.58 0.14 140)" }}
                  >
                    כל היומן
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
                {upcomingMoments.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {upcomingMoments.map((m) => (
                      <UpcomingCard
                        key={m.id}
                        title={m.title}
                        child={m.childName}
                        childInitial={m.childInitial}
                        childColor={m.childColor}
                        time={m.time}
                        Icon={m.IconComp}
                        accentColor={m.accentColor}
                        bgColor={m.bgColor}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-4 text-center border"
                    style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.55 0.03 255)" }}>
                      אין רגעים קרובים עדיין
                    </p>
                    <button
                      onClick={() => setActiveTab("suggestions")}
                      className="text-xs font-bold"
                      style={{ color: "oklch(0.58 0.14 140)" }}
                    >
                      שמור הצעה ראשונה ←
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Side column */}
            <div className="flex flex-col gap-5">
              {/* AI suggestion */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setActiveTab("suggestions")}
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: "oklch(0.58 0.14 140)" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    כל ההצעות
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                    <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>המלצה של BondFlow</p>
                  </div>
                </div>

                {firstSuggestion ? (
                  <HomeSuggestionCard
                    s={firstSuggestion}
                    onBlock={handleBlock}
                    onDismiss={handleDismiss}
                  />
                ) : suggestions.some((s) => s.blocked) ? (
                  /* All remaining were saved */
                  <div
                    className="rounded-2xl p-6 text-center border"
                    style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
                  >
                    <CheckCircle2 className="w-7 h-7 mx-auto mb-2" style={{ color: "oklch(0.65 0.14 140)" }} />
                    <p className="text-sm font-black mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>כל הרגעים נשמרו!</p>
                    <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>שבוע נהדר. תבדוק את היומן שלך.</p>
                  </div>
                ) : (
                  /* All were dismissed — offer more */
                  <div
                    className="rounded-2xl p-5 text-right border"
                    style={{
                      background: "white",
                      borderColor: "oklch(0.88 0.04 140 / 0.5)",
                      boxShadow: "0 2px 10px oklch(0.65 0.14 140 / 0.07)",
                    }}
                  >
                    <div className="flex items-start gap-3 flex-row-reverse mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}
                      >
                        <Sparkles className="w-4 h-4" style={{ color: "oklch(0.52 0.14 140)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-black mb-0.5" style={{ color: "oklch(0.2 0.03 255)" }}>
                          יש עוד הצעות בשבילך
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
                          לא מצאת משהו מתאים? יש לנו עוד רגעים שמחכים לך.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("suggestions")}
                      className="w-full rounded-xl py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
                        boxShadow: "0 4px 12px oklch(0.65 0.14 140 / 0.3)",
                      }}
                    >
                      גלה עוד הצעות
                    </button>
                  </div>
                )}
              </div>

              {/* Google Calendar connect card */}
              {calendarConnected === false && (
                <div
                  className="rounded-2xl p-4 text-right border"
                  style={{ background: "white", borderColor: "oklch(0.88 0.06 255 / 0.5)", boxShadow: "0 2px 10px oklch(0.52 0.14 255 / 0.08)" }}
                >
                  <div className="flex items-center gap-2 flex-row-reverse mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.88 0.06 255 / 0.15)" }}>
                      <Calendar className="w-4 h-4" style={{ color: "oklch(0.52 0.14 255)" }} />
                    </div>
                    <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>חבר Google Calendar</p>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "oklch(0.55 0.03 255)" }}>
                    חבר את היומן שלך כדי שנמצא לך זמן משפחתי אמיתי בין הפגישות
                  </p>
                  <button
                    onClick={connectGoogleCalendar}
                    className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                    style={{ background: "oklch(0.52 0.14 255)" }}
                  >
                    חבר עכשיו
                  </button>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      )}


      {/* ---- Mobile bottom nav ---- */}
      <BottomNav active={activeTab} setActive={handleTabClick} />
    </div>
  );
}
