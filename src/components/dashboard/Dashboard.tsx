"use client";

import { useState } from "react";
import {
  Home,
  Calendar,
  Lightbulb,
  User,
  Bell,
  ChevronLeft,
  Clock,
  Blocks,
  BookOpen,
  Pencil,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";

// ---- Types ----
type Tab = "home" | "calendar" | "suggestions" | "profile";

interface Suggestion {
  id: number;
  title: string;
  child: string;
  childAge: number;
  timeSlot: string;
  duration: string;
  prepLevel: "אפס הכנה" | "הכנה קלה" | "קצת הכנה";
  IconComp: React.ElementType;
  accentColor: string;
  bgColor: string;
  blocked?: boolean;
}

// ---- Score Ring ----
function ScoreRing({ score, delta }: { score: number; delta: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const gap = circ - filled;

  return (
    <div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{ background: "oklch(0.28 0.05 255)" }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-8 -left-8 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: "oklch(0.65 0.14 140)" }}
      />
      <div
        className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ background: "oklch(0.72 0.18 42)" }}
      />

      <div className="relative z-10 flex items-center gap-5">
        {/* SVG ring */}
        <div className="relative flex-shrink-0">
          <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
            {/* Track */}
            <circle
              cx="68" cy="68" r={r}
              fill="none"
              stroke="oklch(1 0 0 / 0.08)"
              strokeWidth="10"
            />
            {/* Progress */}
            <circle
              cx="68" cy="68" r={r}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${gap}`}
              strokeDashoffset="0"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.65 0.14 140)" />
                <stop offset="100%" stopColor="oklch(0.72 0.18 42)" />
              </linearGradient>
            </defs>
          </svg>
          {/* Inner score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white leading-none">{score}</span>
            <span className="text-xs font-medium mt-0.5" style={{ color: "oklch(0.7 0.05 255)" }}>/ 100</span>
          </div>
        </div>

        {/* Text side */}
        <div className="flex-1 text-right">
          <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "oklch(0.65 0.14 140)" }}>
            ציון חיבור משפחתי
          </p>
          <p className="text-xl font-black text-white leading-tight mb-2">
            השבוע אתה<br />
            <span className="text-gradient">מופיע.</span>
          </p>
          <div
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1"
            style={{ background: "oklch(0.65 0.14 140 / 0.2)" }}
          >
            <TrendingUp className="w-3 h-3" style={{ color: "oklch(0.75 0.14 140)" }} />
            <span className="text-xs font-bold" style={{ color: "oklch(0.75 0.14 140)" }}>
              +{delta} מהשבוע שעבר
            </span>
          </div>
        </div>
      </div>

      {/* Weekly dots */}
      <div className="relative z-10 mt-5 flex items-center justify-between">
        <span className="text-xs" style={{ color: "oklch(0.55 0.05 255)" }}>ראשון</span>
        <div className="flex gap-2 items-center">
          {[true, true, false, true, false, false, false].map((done, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: done ? "oklch(0.65 0.14 140)" : "oklch(1 0 0 / 0.08)",
              }}
            >
              {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
        <span className="text-xs" style={{ color: "oklch(0.55 0.05 255)" }}>שבת</span>
      </div>
    </div>
  );
}

// ---- Suggestion Card ----
function SuggestionCard({
  s,
  onBlock,
  onDismiss,
}: {
  s: Suggestion;
  onBlock: (id: number) => void;
  onDismiss: (id: number) => void;
}) {
  const Icon = s.IconComp;
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        background: "white",
        borderColor: "oklch(0.93 0.02 85)",
        boxShadow: "0 2px 12px oklch(0 0 0 / 0.05)",
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${s.accentColor}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bgColor }}
          >
            <Icon className="w-5 h-5" style={{ color: s.accentColor }} />
          </div>

          {/* Title + dismiss */}
          <div className="flex-1 text-right">
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onDismiss(s.id)}
                className="p-0.5 rounded-lg transition-colors hover:bg-[oklch(0.95_0.01_85)] flex-shrink-0"
                style={{ color: "oklch(0.7 0.03 255)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="font-black text-sm leading-snug" style={{ color: "oklch(0.2 0.03 255)" }}>
                {s.title}
              </p>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>
              עבור {s.child}, {s.childAge}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="text-xs font-semibold rounded-xl px-2.5 py-1"
            style={{ background: `${s.accentColor}15`, color: s.accentColor }}
          >
            {s.prepLevel}
          </span>
          <div className="flex items-center gap-3 text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {s.duration}
            </span>
            <span>{s.timeSlot}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBlock(s.id)}
          className="w-full rounded-xl py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))`,
            boxShadow: "0 4px 12px oklch(0.65 0.14 140 / 0.3)",
          }}
        >
          חסום את הזמן הזה
        </button>
      </div>
    </div>
  );
}

// ---- Upcoming moment row ----
function UpcomingMoment({
  title,
  child,
  time,
  Icon,
  accentColor,
  bgColor,
}: {
  title: string;
  child: string;
  time: string;
  Icon: React.ElementType;
  accentColor: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: "oklch(0.93 0.02 85)" }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 text-right min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: "oklch(0.2 0.03 255)" }}>{title}</p>
        <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{child}</p>
      </div>
      <div className="text-left flex-shrink-0">
        <p className="text-xs font-semibold" style={{ color: "oklch(0.65 0.14 140)" }}>{time}</p>
        <div
          className="flex items-center gap-1 justify-end mt-0.5"
          style={{ color: "oklch(0.65 0.14 140)" }}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span className="text-xs">חסום</span>
        </div>
      </div>
    </div>
  );
}

// ---- Bottom Nav ----
function BottomNav({ active, setActive }: { active: Tab; setActive: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "profile", label: "פרופיל", Icon: User },
    { id: "suggestions", label: "הצעות", Icon: Lightbulb },
    { id: "calendar", label: "יומן", Icon: Calendar },
    { id: "home", label: "בית", Icon: Home },
  ];

  return (
    <div
      className="fixed bottom-0 right-0 left-0 flex justify-center pointer-events-none"
    >
      <div
        className="w-full max-w-[390px] pointer-events-auto"
        style={{
          background: "white",
          borderTop: "1px solid oklch(0.93 0.02 85)",
          boxShadow: "0 -4px 24px oklch(0 0 0 / 0.07)",
        }}
      >
        <div className="flex items-center justify-around px-2 pb-safe">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex flex-col items-center gap-1 py-3 px-4 min-w-[60px] transition-all active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: isActive ? "oklch(0.88 0.08 140 / 0.2)" : "transparent",
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-all"
                    style={{ color: isActive ? "oklch(0.55 0.14 140)" : "oklch(0.65 0.03 255)" }}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                </div>
                <span
                  className="text-xs font-semibold transition-all"
                  style={{ color: isActive ? "oklch(0.55 0.14 140)" : "oklch(0.65 0.03 255)" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Main Dashboard ----
const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    title: "בניית לגו - רכבת הרים",
    child: "יואב",
    childAge: 6,
    timeSlot: "שלישי - 17:30",
    duration: "25 דק'",
    prepLevel: "אפס הכנה",
    IconComp: Blocks,
    accentColor: "oklch(0.55 0.14 140)",
    bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    id: 2,
    title: "קריאה ביחד - ספר חדש",
    child: "נועה",
    childAge: 9,
    timeSlot: "חמישי - 20:00",
    duration: "20 דק'",
    prepLevel: "אפס הכנה",
    IconComp: BookOpen,
    accentColor: "oklch(0.55 0.18 255)",
    bgColor: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    id: 3,
    title: "ציור חופשי - ביחד",
    child: "יואב",
    childAge: 6,
    timeSlot: "שישי בוקר - 9:00",
    duration: "30 דק'",
    prepLevel: "הכנה קלה",
    IconComp: Pencil,
    accentColor: "oklch(0.55 0.15 42)",
    bgColor: "oklch(0.92 0.06 60 / 0.15)",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
  const [blockedIds, setBlockedIds] = useState<number[]>([]);

  const handleBlock = (id: number) => {
    setBlockedIds((prev) => [...prev, id]);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, blocked: true } : s))
    );
  };

  const handleDismiss = (id: number) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const activeSuggestions = suggestions.filter((s) => !s.blocked);
  const blocked = suggestions.filter((s) => s.blocked);

  return (
    <div
      className="flex justify-center min-h-screen"
      style={{ background: "oklch(0.95 0.02 85)" }}
    >
      {/* Phone shell */}
      <div
        className="relative w-full max-w-[390px] min-h-screen flex flex-col"
        style={{ background: "oklch(0.97 0.01 85)" }}
      >
        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* ---- Top bar ---- */}
          <div
            className="sticky top-0 z-10 px-4 pt-12 pb-3 flex items-center justify-between"
            style={{
              background: "oklch(0.97 0.01 85 / 0.92)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid oklch(0.92 0.02 85)",
            }}
          >
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ background: "white", border: "1px solid oklch(0.92 0.02 85)" }}
            >
              <Bell className="w-4.5 h-4.5" style={{ color: "oklch(0.45 0.03 255)" }} />
              {/* Notification dot */}
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: "oklch(0.72 0.18 42)" }}
              />
            </button>

            <div className="text-right">
              <p className="text-xs font-medium" style={{ color: "oklch(0.6 0.03 255)" }}>
                שלום,
              </p>
              <p className="text-base font-black leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
                מיכל
              </p>
            </div>

            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style={{ background: "oklch(0.65 0.14 140)" }}
            >
              מ
            </div>
          </div>

          <div className="px-4 pt-4 flex flex-col gap-4">
            {/* ---- Score Ring ---- */}
            <ScoreRing score={72} delta={8} />

            {/* ---- Quick stats ---- */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "רגעים השבוע", value: "3", sub: "מתוך 5 יעד", color: "oklch(0.65 0.14 140)" },
                { label: "שעות חיבור", value: "1.5", sub: "השבוע", color: "oklch(0.72 0.18 42)" },
                { label: "רצף שבועות", value: "4", sub: "שבועות ברצף", color: "oklch(0.55 0.18 255)" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: "white", border: "1px solid oklch(0.93 0.02 85)" }}
                >
                  <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs font-bold leading-tight mt-0.5" style={{ color: "oklch(0.35 0.03 255)" }}>{stat.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* ---- Suggestions section ---- */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  className="flex items-center gap-1 text-xs font-bold"
                  style={{ color: "oklch(0.65 0.14 140)" }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  כל ההצעות
                </button>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                  <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
                    הרגעים השבוע
                  </p>
                </div>
              </div>

              {activeSuggestions.length === 0 ? (
                <div
                  className="rounded-2xl p-6 text-center border"
                  style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.65 0.14 140)" }} />
                  <p className="text-sm font-black mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>כל ההצעות נחסמו!</p>
                  <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>עשית עבודה מצוינת השבוע.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeSuggestions.map((s) => (
                    <SuggestionCard
                      key={s.id}
                      s={s}
                      onBlock={handleBlock}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ---- Upcoming blocked moments ---- */}
            {(blocked.length > 0 || true) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: "oklch(0.65 0.14 140)" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    כל היומן
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.18 42)" }} />
                    <p className="text-sm font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
                      הרגעים הקרובים
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl px-4 border"
                  style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
                >
                  <UpcomingMoment
                    title="בניית לגו - רכבת הרים"
                    child="עם יואב, גיל 6"
                    time="שלישי 17:30"
                    Icon={Blocks}
                    accentColor="oklch(0.55 0.14 140)"
                    bgColor="oklch(0.88 0.08 140 / 0.15)"
                  />
                  <UpcomingMoment
                    title="קריאת סיפור לפני שינה"
                    child="עם נועה, גיל 9"
                    time="חמישי 20:00"
                    Icon={BookOpen}
                    accentColor="oklch(0.55 0.18 255)"
                    bgColor="oklch(0.90 0.06 255 / 0.12)"
                  />
                  {blocked.map((s) => (
                    <UpcomingMoment
                      key={s.id}
                      title={s.title}
                      child={`עם ${s.child}, גיל ${s.childAge}`}
                      time={s.timeSlot}
                      Icon={s.IconComp}
                      accentColor={s.accentColor}
                      bgColor={s.bgColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- Bottom Nav ---- */}
        <BottomNav active={activeTab} setActive={setActiveTab} />
      </div>
    </div>
  );
}
