"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Home, Calendar, Lightbulb, User, BarChart2,
  Bell, ChevronLeft, Clock, Blocks, BookOpen,
  CheckCircle2, TrendingUp, Sparkles, X, Pencil,
} from "lucide-react";
import ProfileSidebar from "./ProfileSidebar";
import { addToGoogleCalendar } from "@/lib/googleCalendar";
import SuggestionsScreen from "./SuggestionsScreen";
import CalendarScreen from "./CalendarScreen";
import ReportsScreen from "./ReportsScreen";
import SettingsScreen from "./SettingsScreen";

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
function ScoreRing({ score, delta }: { score: number; delta: number }) {
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
              +{delta} מהשבוע שעבר
            </span>
          </div>
        </div>
      </div>

      {/* Weekly dots */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: "oklch(0.68 0.03 255)" }}>ראשון</span>
        <div className="flex gap-1.5 items-center">
          {[true, true, false, true, false, false, false].map((done, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: done ? "oklch(0.65 0.14 140)" : "oklch(0.92 0.02 85)" }}
            >
              {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
            </div>
          ))}
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
const NAV_TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "home",        label: "בית",    Icon: Home },
  { id: "suggestions", label: "הצעות",  Icon: Lightbulb },
  { id: "calendar",    label: "יומן",   Icon: Calendar },
  { id: "reports",     label: "דוחות",  Icon: BarChart2 },
  { id: "profile",     label: "פרופיל", Icon: User },
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
        {NAV_TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
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

// ---- Main Dashboard ----
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("...");
  const [userInitial, setUserInitial] = useState<string>("?");
  const [weekScore, setWeekScore] = useState<number>(72);
  const [scoreDelta, setScoreDelta] = useState<number>(8);
  const [momentsCount, setMomentsCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);

  // ---- Load real data on mount ----
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        // 1. User profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();
          const name = profile?.full_name ?? user.email?.split("@")[0] ?? "משתמש";
          setUserName(name);
          setUserInitial(name[0] ?? "?");
        }

        // 2. Weekly score
        const { data: scores } = await supabase
          .from("weekly_scores")
          .select("score, moments_count")
          .eq("user_id", user?.id ?? "")
          .order("created_at", { ascending: false })
          .limit(2);
        if (scores && scores.length > 0) {
          setWeekScore(scores[0].score ?? 72);
          setMomentsCount(scores[0].moments_count ?? 0);
          if (scores.length > 1) {
            setScoreDelta((scores[0].score ?? 72) - (scores[1].score ?? 64));
          }
        }

        // 3. Suggestions from API
        const res = await fetch("/api/suggestions");
        if (res.ok) {
          const json = await res.json();
          const raw = json.suggestions ?? [];

          // Fetch children to get names/colors
          const { data: children } = await supabase
            .from("children")
            .select("id, name, age_group, avatar_color")
            .eq("user_id", user?.id ?? "");
          const childMap = new Map((children ?? []).map((c) => [c.id, c]));

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
          if (mapped.length > 0) setMomentsCount(mapped.filter((m) => m.blocked).length);
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

      // 1. Mark suggestion as saved in our DB
      const { data: suggestion } = await supabase
        .from("suggestions")
        .update({ status: "saved" })
        .eq("id", id)
        .select("title, duration_min, time_slot, day_label")
        .single();

      // 2. Try to add to Google Calendar if the user connected it
      const { data: { user } } = await supabase.auth.getUser();
      if (user && suggestion) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("google_calendar_token")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.google_calendar_token) {
          await addToGoogleCalendar({
            accessToken: profile.google_calendar_token,
            title: suggestion.title,
            durationMin: suggestion.duration_min,
            // scheduledAt left undefined — will default to tomorrow 17:00
          });
        }
      }
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

  const activeSuggestions = suggestions.filter((s) => !s.blocked);
  const firstSuggestion = activeSuggestions[0];

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
        className="sticky top-0 z-10 flex items-center gap-4 px-4 md:px-8 pt-4 pb-3"
        style={{
          background: "oklch(0.97 0.01 85 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.92 0.02 85)",
        }}
      >
        {/* Bell - DOM first = visual right in RTL */}
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
          style={{ background: "white", border: "1px solid oklch(0.92 0.02 85)" }}
        >
          <Bell className="w-4 h-4" style={{ color: "oklch(0.45 0.03 255)" }} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "oklch(0.72 0.18 42)" }} />
        </button>

        {/* Desktop nav - center */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id && id !== "profile";
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: isActive ? "oklch(0.88 0.08 140 / 0.2)" : "transparent",
                  color: isActive ? "oklch(0.42 0.14 140)" : "oklch(0.55 0.03 255)",
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.75} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Greeting + avatar - DOM last = visual left in RTL */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium" style={{ color: "oklch(0.6 0.03 255)" }}>שלום,</p>
            <p className="text-sm font-black leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>{userName}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 transition-opacity hover:opacity-85 active:scale-95"
            style={{ background: "oklch(0.65 0.14 140)" }}
          >
            {userInitial}
          </button>
        </div>
      </div>

      {/* ---- Screen routing ---- */}
      {activeTab === "suggestions" && <SuggestionsScreen />}
      {activeTab === "calendar"    && <CalendarScreen />}
      {activeTab === "reports"     && <ReportsScreen />}
      {activeTab === "profile"     && <SettingsScreen />}

      {/* ---- Home screen ---- */}
      {activeTab === "home" && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">

          {loadingData && (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-8 w-48 rounded-xl ms-auto" style={{ background: "oklch(0.91 0.02 85)" }} />
              <div className="h-32 rounded-3xl" style={{ background: "oklch(0.91 0.02 85)" }} />
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: "oklch(0.91 0.02 85)" }} />)}
              </div>
              <div className="h-40 rounded-2xl" style={{ background: "oklch(0.91 0.02 85)" }} />
            </div>
          )}
          {!loadingData && (
          <>
          {/* Welcome strip */}
          <div className="text-right mb-5">
            <p className="text-2xl font-black" style={{ color: "oklch(0.18 0.03 255)" }}>
              {greeting}, {loadingData ? "..." : userName}
            </p>
            <p className="text-sm mt-1" style={{ color: "oklch(0.55 0.03 255)" }}>
              {loadingData ? "טוען..." : `השבוע יש לך ${activeSuggestions.length} רגעים שמחכים לך.`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Score ring - now warm */}
              <ScoreRing score={weekScore} delta={scoreDelta} />

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
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: "oklch(0.58 0.14 140)" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    כל היומן
                  </button>
                  <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
                    הרגעים הקרובים
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <UpcomingCard
                    title="בניית לגו - רכבת הרים"
                    child="יואב" childInitial="י" childColor="oklch(0.72 0.18 42)"
                    time="שלישי 17:30"
                    Icon={Blocks} accentColor="oklch(0.55 0.14 140)" bgColor="oklch(0.88 0.08 140 / 0.15)"
                  />
                  <UpcomingCard
                    title="קריאה ביחד"
                    child="נועה" childInitial="נ" childColor="oklch(0.60 0.18 280)"
                    time="חמישי 20:00"
                    Icon={BookOpen} accentColor="oklch(0.55 0.18 255)" bgColor="oklch(0.90 0.06 255 / 0.12)"
                  />
                </div>
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

              {/* Week progress teaser */}
              <div
                className="rounded-2xl p-4 text-right border"
                style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
              >
                <div className="flex items-center gap-2 flex-row-reverse mb-2">
                  <BarChart2 className="w-4 h-4" style={{ color: "oklch(0.52 0.18 255)" }} />
                  <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>מגמה חיובית</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
                  +17 נקודות בחודש האחרון. אתה בדרך הנכונה.
                </p>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="mt-3 text-xs font-bold flex items-center gap-1 flex-row-reverse"
                  style={{ color: "oklch(0.52 0.14 140)" }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  ראה דוח מלא
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* ---- FAB - visible on home tab only ---- */}
      {activeTab === "home" && (
        <button
          onClick={() => setActiveTab("suggestions")}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.60 0.18 148))",
            boxShadow: "0 8px 32px oklch(0.65 0.14 140 / 0.45)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          מצא לי זמן משפחתי עכשיו
        </button>
      )}

      {/* ---- Mobile bottom nav ---- */}
      <BottomNav active={activeTab} setActive={handleTabClick} />
    </div>
  );
}
