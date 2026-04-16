"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Sparkles, Plus, Trash2, ChevronLeft,
  Check, Clock, CalendarDays, Users, Heart, Lock,
  BookOpen, Pencil, Music, TreePine, CheckCircle2,
  RotateCcw, PartyPopper,
} from "lucide-react";

// ---- Types ----
type StepNum = 1 | 2 | 3 | 4;

interface Child {
  id: number;
  name: string;
  ageGroup: string;
  interests: string[];
}

interface FormData {
  children: Child[];
  calendarConnected: "google" | "apple" | null;
}

// ---- Constants ----
const AGE_GROUPS = ["0-2", "3-5", "6-8", "9-12", "13+"];

const INTEREST_OPTIONS = [
  "לגו", "ציור", "ספרים", "מוזיקה", "כדורגל", "טבע",
  "דינוזאורים", "בישול", "מיינקראפט", "ריקוד",
  "משחקי קופסא", "טיולים", "שחייה", "מדע", "אנימציה", "אומנות",
];

const CHILD_COLORS = [
  { accent: "oklch(0.72 0.18 42)",  bg: "oklch(0.94 0.06 60 / 0.3)"  },
  { accent: "oklch(0.58 0.18 280)", bg: "oklch(0.93 0.05 280 / 0.2)" },
  { accent: "oklch(0.55 0.14 140)", bg: "oklch(0.92 0.06 140 / 0.2)" },
];

// ---- Shared components ----

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-black text-lg" style={{ color: "oklch(0.18 0.05 255)" }}>BondFlow</span>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: "oklch(0.65 0.14 140)" }}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

function StepBar({ current }: { current: StepNum }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        {([1, 2, 3, 4] as StepNum[]).map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{ background: s <= current ? "oklch(0.65 0.14 140)" : "oklch(0.90 0.02 85)" }}
          />
        ))}
      </div>
      <p className="text-xs text-center" style={{ color: "oklch(0.68 0.03 255)" }}>
        שלב {current} מתוך 4
      </p>
    </div>
  );
}

function NavBar({ onBack, showBack }: { onBack?: () => void; showBack?: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 pt-8 pb-4">
      {showBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.58 0.03 255)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          חזור
        </button>
      ) : (
        <Link
          href="/auth"
          className="text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.52 0.14 140)" }}
        >
          כניסה
        </Link>
      )}
      <Logo />
    </div>
  );
}

function PrimaryButton({
  label, onClick, disabled = false,
}: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl py-4 text-base font-black text-white transition-all active:scale-[0.97]"
      style={{
        background: disabled
          ? "oklch(0.85 0.02 85)"
          : "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
        color: disabled ? "oklch(0.65 0.03 255)" : "white",
        boxShadow: disabled ? "none" : "0 8px 28px oklch(0.65 0.14 140 / 0.38)",
      }}
    >
      {label}
    </button>
  );
}

// ---- Hero Illustration (Screen 1) ----
function HeroIllustration() {
  return (
    <div
      className="relative w-full overflow-hidden flex-shrink-0"
      style={{
        height: "260px",
        background: "linear-gradient(145deg, oklch(0.93 0.05 140), oklch(0.95 0.04 55))",
      }}
    >
      {/* Background glow blobs */}
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-35 blur-3xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-28 blur-2xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />
      <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full opacity-18 blur-xl pointer-events-none" style={{ background: "oklch(0.60 0.18 280)" }} />

      {/* Family composition */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Dashed connection lines */}
          <div
            className="absolute inset-y-0 -left-14 -right-14 flex items-center opacity-25"
            style={{ top: "50%" }}
          >
            <div
              className="h-0.5 w-full"
              style={{
                background: "none",
                borderTop: "2px dashed oklch(0.52 0.14 140)",
              }}
            />
          </div>

          {/* Parent center */}
          <div
            className="relative z-10 w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center font-black text-2xl"
            style={{
              color: "oklch(0.50 0.14 140)",
              boxShadow: "0 12px 32px oklch(0.55 0.14 140 / 0.22)",
            }}
          >
            מ
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <Heart className="w-3 h-3" style={{ color: "oklch(0.62 0.20 15)" }} />
            </div>
          </div>

          {/* Kid 1 - right */}
          <div
            className="absolute -right-[68px] top-3 w-14 h-14 rounded-full bg-white flex items-center justify-center font-black text-xl"
            style={{ color: "oklch(0.60 0.18 42)", boxShadow: "0 8px 20px oklch(0.72 0.18 42 / 0.18)" }}
          >
            י
          </div>

          {/* Kid 2 - left */}
          <div
            className="absolute -left-[68px] top-3 w-14 h-14 rounded-full bg-white flex items-center justify-center font-black text-xl"
            style={{ color: "oklch(0.50 0.18 280)", boxShadow: "0 8px 20px oklch(0.60 0.18 280 / 0.18)" }}
          >
            נ
          </div>
        </div>
      </div>

      {/* Floating card - top right: time slot */}
      <div
        className="absolute top-5 right-5 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5"
        style={{ boxShadow: "0 4px 18px oklch(0 0 0 / 0.09)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: "oklch(0.52 0.14 140)" }} />
        </div>
        <div>
          <p className="text-xs font-black" style={{ color: "oklch(0.2 0.03 255)" }}>25 דקות פנויות</p>
          <p className="text-xs" style={{ color: "oklch(0.62 0.03 255)" }}>שלישי 17:30</p>
        </div>
      </div>

      {/* Floating card - bottom left: activity */}
      <div
        className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5"
        style={{ boxShadow: "0 4px 18px oklch(0 0 0 / 0.09)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.92 0.06 60 / 0.25)" }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.18 42)" }} />
        </div>
        <div>
          <p className="text-xs font-black" style={{ color: "oklch(0.2 0.03 255)" }}>אפס הכנה</p>
          <p className="text-xs" style={{ color: "oklch(0.62 0.03 255)" }}>בניית לגו</p>
        </div>
      </div>

      {/* Floating pill - score */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-4 py-2"
        style={{ boxShadow: "0 4px 18px oklch(0 0 0 / 0.09)" }}
      >
        <p className="text-sm font-black text-center" style={{ color: "oklch(0.50 0.14 140)" }}>72/100</p>
        <p className="text-xs text-center" style={{ color: "oklch(0.62 0.03 255)" }}>ציון חיבור</p>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 1 - Welcome / Hero
// ============================================================
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.97 0.01 85)" }}>
      <NavBar />
      <HeroIllustration />

      <div className="flex-1 flex flex-col px-6 pt-6 pb-10">
        {/* Step dots */}
        <div className="mb-6 max-w-sm mx-auto w-full">
          <StepBar current={1} />
        </div>

        {/* Emotional headline */}
        <div className="text-right mb-7 flex-1">
          <h1
            className="text-[28px] font-black leading-tight mb-3"
            style={{ color: "oklch(0.18 0.03 255)" }}
          >
            אתה הורה טוב.
            <br />
            <span className="text-gradient">אתה פשוט צריך מישהו שיאצור את הזמן.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.52 0.03 255)" }}>
            BondFlow סורק את הלו"ז שלך ומוצא רגעים קטנים שאפשר למלא באהבה - בלי מאמץ ובלי תכנון.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-auto">
          <PrimaryButton label="בואו נתחיל" onClick={onStart} />
          <p className="text-center text-sm" style={{ color: "oklch(0.62 0.03 255)" }}>
            יש לך כבר חשבון?{" "}
            <Link
              href="/auth"
              className="font-bold"
              style={{ color: "oklch(0.50 0.14 140)" }}
            >
              כניסה לחשבון
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 2 - Family Setup
// ============================================================
function FamilySetup({
  data, setData, onNext, onBack, onSkip,
}: {
  data: FormData;
  setData: (d: FormData) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const canNext =
    data.children.length > 0 && data.children.some((c) => c.name.trim().length > 0);

  const addChild = () => {
    if (data.children.length >= 3) return;
    setData({
      ...data,
      children: [
        ...data.children,
        { id: Date.now(), name: "", ageGroup: "", interests: [] },
      ],
    });
  };

  const removeChild = (id: number) =>
    setData({ ...data, children: data.children.filter((c) => c.id !== id) });

  const updateChild = (id: number, field: keyof Child, val: string | string[]) =>
    setData({
      ...data,
      children: data.children.map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    });

  const toggleInterest = (childId: number, interest: string) => {
    const child = data.children.find((c) => c.id === childId)!;
    const next = child.interests.includes(interest)
      ? child.interests.filter((i) => i !== interest)
      : child.interests.length < 5
        ? [...child.interests, interest]
        : child.interests;
    updateChild(childId, "interests", next);
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      <NavBar showBack onBack={onBack} />

      <div className="px-6 pb-10">
        {/* Progress */}
        <div className="mb-6">
          <StepBar current={2} />
        </div>

        {/* Title */}
        <div className="text-right mb-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "oklch(0.93 0.06 60 / 0.28)" }}
          >
            <Users className="w-5.5 h-5.5" style={{ color: "oklch(0.65 0.18 42)" }} />
          </div>
          <h2 className="text-2xl font-black mb-1.5" style={{ color: "oklch(0.18 0.03 255)" }}>
            ספרו לנו על הילדים שלכם
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
            כך נדאג שההצעות יהיו רלוונטיות לגיל ולתחביבים שלהם — לא הצעות גנריות.
          </p>
        </div>

        {/* Child cards */}
        <div className="flex flex-col gap-4 mb-4">
          {data.children.map((child, idx) => {
            const colors = CHILD_COLORS[idx % CHILD_COLORS.length];
            const initial = child.name.trim() ? child.name.trim()[0] : "?";

            return (
              <div
                key={child.id}
                className="rounded-3xl p-5 border-2"
                style={{ background: "white", borderColor: "oklch(0.91 0.02 85)" }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  {data.children.length > 1 && (
                    <button
                      onClick={() => removeChild(child.id)}
                      className="p-1.5 rounded-xl transition-colors"
                      style={{ color: "oklch(0.60 0.12 25)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className={`flex items-center gap-2 ${data.children.length <= 1 ? "mr-auto" : ""}`}>
                    <span className="text-sm font-bold" style={{ color: "oklch(0.48 0.03 255)" }}>
                      ילד {idx + 1}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm"
                      style={{ background: colors.accent }}
                    >
                      {initial}
                    </div>
                  </div>
                </div>

                {/* Name input */}
                <input
                  type="text"
                  placeholder="שם הילד"
                  value={child.name}
                  onChange={(e) => updateChild(child.id, "name", e.target.value)}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all mb-4 text-right"
                  style={{
                    background: "oklch(0.97 0.01 85)",
                    border: "2px solid oklch(0.90 0.02 85)",
                    color: "oklch(0.2 0.03 255)",
                  }}
                />

                {/* Age group picker */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-right mb-2.5" style={{ color: "oklch(0.52 0.03 255)" }}>
                    גיל:
                  </p>
                  <div className="flex gap-2 flex-row-reverse flex-wrap">
                    {AGE_GROUPS.map((ag) => {
                      const sel = child.ageGroup === ag;
                      return (
                        <button
                          key={ag}
                          onClick={() => updateChild(child.id, "ageGroup", ag)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                          style={{
                            background: sel ? colors.accent : "oklch(0.95 0.01 85)",
                            color: sel ? "white" : "oklch(0.48 0.03 255)",
                            border: `1.5px solid ${sel ? colors.accent : "oklch(0.88 0.02 85)"}`,
                          }}
                        >
                          {ag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <p className="text-xs font-bold text-right mb-2.5" style={{ color: "oklch(0.52 0.03 255)" }}>
                    תחביבים (עד 5):
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {INTEREST_OPTIONS.map((interest) => {
                      const sel = child.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(child.id, interest)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                          style={{
                            background: sel ? colors.accent : "white",
                            color: sel ? "white" : "oklch(0.52 0.03 255)",
                            border: `1.5px solid ${sel ? colors.accent : "oklch(0.88 0.02 85)"}`,
                          }}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add child button */}
        {data.children.length < 3 && (
          <button
            onClick={addChild}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-bold border-2 border-dashed transition-all mb-5 hover:opacity-75"
            style={{
              borderColor: "oklch(0.80 0.06 140 / 0.5)",
              color: "oklch(0.55 0.14 140)",
            }}
          >
            <Plus className="w-4 h-4" />
            הוסף ילד נוסף
          </button>
        )}

        {/* Next + skip */}
        <PrimaryButton label="המשך" onClick={onNext} disabled={!canNext} />
        <div className="mt-4 text-center">
          <button
            onClick={onSkip}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.68 0.03 255)" }}
          >
            דלג לעכשיו
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 3 - Connect Calendar (optional, explicit opt-in only)
// ============================================================
function CalendarConnect({
  onFinish, onBack, onConnectCalendar,
}: {
  onFinish: () => void;
  onBack: () => void;
  onConnectCalendar: () => void;
}) {
  const GoogleLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      <NavBar showBack onBack={onBack} />

      <div className="px-6 pb-10">
        {/* Progress */}
        <div className="mb-6">
          <StepBar current={3} />
        </div>

        {/* Trust box — shown FIRST so users feel safe before deciding */}
        <div
          className="rounded-2xl p-4 mb-5 flex items-start gap-3 flex-row-reverse"
          style={{
            background: "oklch(0.94 0.04 140 / 0.35)",
            border: "1px solid oklch(0.80 0.07 140 / 0.35)",
          }}
        >
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.50 0.12 140)" }} />
          <div className="flex flex-col gap-1.5">
            {[
              "רואה רק מתי אתם פנויים — לא מה הפגישה",
              "הנתונים מאובטחים בהצפנה מלאה",
              "אפשר לנתק בכל שלב מההגדרות",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 flex-row-reverse">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.65 0.14 140)" }}
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <p className="text-xs text-right" style={{ color: "oklch(0.40 0.08 140)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="text-right mb-6">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "oklch(0.90 0.06 255 / 0.18)" }}
          >
            <CalendarDays className="w-5.5 h-5.5" style={{ color: "oklch(0.52 0.18 255)" }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "oklch(0.18 0.03 255)" }}>
            רוצה לחבר את היומן שלך?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.52 0.03 255)" }}>
            BondFlow יסרוק את הלו&quot;ז וימצא חלונות קטנים שאפשר למלא ברגעים משפחתיים. לגמרי אופציונלי.
          </p>
        </div>

        {/* Connect button — explicit opt-in only */}
        <button
          onClick={onConnectCalendar}
          className="w-full rounded-2xl py-4 text-base font-black flex items-center justify-center gap-3 transition-all active:scale-[0.97] mb-2"
          style={{
            background: "white",
            border: "2px solid oklch(0.88 0.03 85)",
            color: "oklch(0.22 0.03 255)",
            boxShadow: "0 4px 16px oklch(0 0 0 / 0.07)",
          }}
        >
          <GoogleLogo />
          חבר Google Calendar
        </button>

        {/* Google unverified-app warning — shown proactively */}
        <div
          className="rounded-xl px-3 py-2 mb-4 flex items-start gap-2 flex-row-reverse"
          style={{ background: "oklch(0.96 0.03 60 / 0.6)", border: "1px solid oklch(0.88 0.08 60 / 0.5)" }}
        >
          <span className="text-base leading-none flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-right leading-relaxed" style={{ color: "oklch(0.45 0.08 50)" }}>
            Google עשוי להציג מסך אזהרה — זה זמני בזמן שהאפליקציה עוברת אישור.
            לחץ <strong>&quot;Advanced&quot;</strong> ואז <strong>&quot;Go to BondFlow&quot;</strong> כדי להמשיך.
          </p>
        </div>

        {/* Skip — visually equal weight to make it truly optional */}
        <button
          onClick={onFinish}
          className="w-full rounded-2xl py-4 text-base font-black text-white transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
            boxShadow: "0 8px 28px oklch(0.65 0.14 140 / 0.38)",
          }}
        >
          המשך בלי יומן
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 4 — First Win / Personalised Preview
// ============================================================

interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  duration: string;
  timeSlot: string;
  prepLevel: "אפס הכנה" | "הכנה קלה";
  context: string;
  interests: string[];
  ageGroups: string[];
  Icon: React.ElementType;
  accentColor: string;
  bgColor: string;
}

const ACTIVITY_POOL: ActivitySuggestion[] = [
  {
    id: "lego",
    title: "בניית לגו ביחד",
    description: "שב על הרצפה ותן לילד להוביל את הבנייה. שום מסך, שום הכנה - רק שניכם.",
    duration: "20 דק'", timeSlot: "17:30 - 17:50", prepLevel: "אפס הכנה",
    context: "מתאים אחרי בית ספר",
    interests: ["לגו", "מיינקראפט"],
    ageGroups: ["3-5", "6-8", "9-12"],
    Icon: Sparkles, accentColor: "oklch(0.55 0.14 140)", bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    id: "drawing",
    title: "ציור חופשי ביחד",
    description: "נייר לבן, צבעים, וחצי שעה בלי מסכות. הכי קל ומחבר שיש.",
    duration: "25 דק'", timeSlot: "18:00 - 18:25", prepLevel: "הכנה קלה",
    context: "מתאים אחרי ארוחת ערב",
    interests: ["ציור", "אומנות"],
    ageGroups: ["3-5", "6-8", "9-12"],
    Icon: Pencil, accentColor: "oklch(0.55 0.15 42)", bgColor: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    id: "reading",
    title: "קריאה ביחד לפני שינה",
    description: "שכבו יחד על הספה ותנו לילד לבחור דף. רגע שקט שיוצר קרבה אמיתית.",
    duration: "20 דק'", timeSlot: "20:00 - 20:20", prepLevel: "אפס הכנה",
    context: "מושלם לפני שינה",
    interests: ["ספרים", "קריאה", "אנימציה"],
    ageGroups: ["0-2", "3-5", "6-8", "9-12"],
    Icon: BookOpen, accentColor: "oklch(0.52 0.18 255)", bgColor: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    id: "dinos",
    title: "משחק דינוזאורים קצר",
    description: "הניחו פסים על השטיח ותנו לדינוזאורים לספר סיפור. אפס הכנה, מקסימום כיף.",
    duration: "15 דק'", timeSlot: "17:45 - 18:00", prepLevel: "אפס הכנה",
    context: "מתאים אחרי הגן",
    interests: ["דינוזאורים", "טבע", "מדע"],
    ageGroups: ["3-5", "6-8"],
    Icon: Sparkles, accentColor: "oklch(0.58 0.16 42)", bgColor: "oklch(0.93 0.07 60 / 0.18)",
  },
  {
    id: "music",
    title: "שירים ביחד - פלייליסט של הילד",
    description: "תנו לילד לבחור 3 שירים ותרקדו ביחד בסלון. 15 דקות של אנרגיה וחיוכים.",
    duration: "15 דק'", timeSlot: "18:30 - 18:45", prepLevel: "אפס הכנה",
    context: "מתאים לפני אמבטיה",
    interests: ["מוזיקה", "ריקוד"],
    ageGroups: ["0-2", "3-5", "6-8", "9-12"],
    Icon: Music, accentColor: "oklch(0.52 0.18 320)", bgColor: "oklch(0.90 0.06 320 / 0.10)",
  },
  {
    id: "nature",
    title: "סיבוב קצר בחוץ ביחד",
    description: "אפילו 15 דקות בחוץ עם ילדים קטנים יוצרת זיכרונות. תחפשו שלושה עלים שונים.",
    duration: "20 דק'", timeSlot: "17:00 - 17:20", prepLevel: "אפס הכנה",
    context: "מתאים אחרי הגן",
    interests: ["טבע", "טיולים", "מדע"],
    ageGroups: ["0-2", "3-5", "6-8"],
    Icon: TreePine, accentColor: "oklch(0.48 0.16 148)", bgColor: "oklch(0.88 0.08 140 / 0.12)",
  },
  {
    id: "cooking",
    title: "בישול קל ביחד",
    description: "תנו לילד לערבב, לשפוך ולבחור. לא חשוב מה יוצא - חשוב שעשיתם ביחד.",
    duration: "20 דק'", timeSlot: "16:30 - 16:50", prepLevel: "הכנה קלה",
    context: "מתאים אחרי בית ספר",
    interests: ["בישול"],
    ageGroups: ["3-5", "6-8", "9-12"],
    Icon: Sparkles, accentColor: "oklch(0.60 0.16 42)", bgColor: "oklch(0.93 0.07 60 / 0.15)",
  },
  {
    id: "sports",
    title: "20 דקות כדורגל בחצר",
    description: "אפילו בלי שער אמיתי - כדור ושתי כתרות ויש לכם משחק. פשוט ואמיתי.",
    duration: "20 דק'", timeSlot: "17:00 - 17:20", prepLevel: "אפס הכנה",
    context: "מתאים אחרי בית ספר",
    interests: ["כדורגל", "ספורט", "שחייה"],
    ageGroups: ["3-5", "6-8", "9-12", "13+"],
    Icon: Sparkles, accentColor: "oklch(0.55 0.14 140)", bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  // universal fallback
  {
    id: "default",
    title: "קריאה לפני שינה",
    description: "ספר אחד ביחד לפני שינה. כל גיל, כל ערב - הפשטות היא הכוח.",
    duration: "15 דק'", timeSlot: "20:00 - 20:15", prepLevel: "אפס הכנה",
    context: "מושלם לפני שינה",
    interests: [],
    ageGroups: ["0-2", "3-5", "6-8", "9-12", "13+"],
    Icon: BookOpen, accentColor: "oklch(0.52 0.18 255)", bgColor: "oklch(0.90 0.06 255 / 0.12)",
  },
];

/** Returns activities ranked by relevance to the first child's interests + age. */
function rankActivities(children: Child[]): ActivitySuggestion[] {
  if (children.length === 0) return ACTIVITY_POOL;
  const { interests, ageGroup } = children[0];

  const scored = ACTIVITY_POOL.map((a) => {
    let score = 0;
    interests.forEach((i) => { if (a.interests.includes(i)) score += 3; });
    if (ageGroup && a.ageGroups.includes(ageGroup)) score += 2;
    if (a.id === "default") score -= 1; // keep fallback last
    return { a, score };
  });

  return scored
    .sort((x, y) => y.score - x.score)
    .map((s) => s.a);
}

function FirstWinScreen({
  data, onBack, onFinish, isFinishing = false, onSaveActivity,
}: {
  data: FormData;
  onBack: () => void;
  onFinish: () => void;
  isFinishing?: boolean;
  onSaveActivity?: (activity: ActivitySuggestion) => Promise<void>;
}) {
  const pool = rankActivities(data.children);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [saved, setSaved] = useState(false);

  const activity = pool[index % pool.length];
  const firstChild = data.children[0] ?? null;
  const childColor = CHILD_COLORS[0].accent;
  const Icon = activity.Icon;

  const handleNext = () => {
    setVisible(false);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSaved(false);
      setVisible(true);
    }, 220);
  };

  const handleSave = async () => {
    if (onSaveActivity) await onSaveActivity(activity);
    setSaved(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      <NavBar showBack onBack={onBack} />

      <div className="px-6 pb-10">
        {/* Progress 4/4 */}
        <div className="mb-6">
          <StepBar current={4} />
        </div>

        {/* Celebration header */}
        <div className="text-right mb-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "oklch(0.92 0.06 60 / 0.28)" }}
          >
            <PartyPopper className="w-5.5 h-5.5" style={{ color: "oklch(0.65 0.18 42)" }} />
          </div>
          <h2 className="text-2xl font-black mb-1.5 leading-snug" style={{ color: "oklch(0.18 0.03 255)" }}>
            כמעט סיימנו!
            <br />
            <span className="text-gradient">הנה הצעה ראשונה בשבילכם</span>
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
            {firstChild?.name
              ? `התאמנו אותה במיוחד ל${firstChild.name}.`
              : "התאמנו אותה במיוחד למשפחה שלכם."}
          </p>
        </div>

        {/* Activity card — fades on swap */}
        <div
          className="rounded-3xl border overflow-hidden mb-4 transition-all duration-200"
          style={{
            background: "white",
            borderColor: "oklch(0.91 0.02 85)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.09)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(6px)",
          }}
        >
          {/* Accent strip */}
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${activity.accentColor}, oklch(0.72 0.18 42))` }}
          />

          <div className="p-5">
            {/* Context badge */}
            <div className="flex items-center justify-end mb-3">
              <span
                className="text-xs font-bold rounded-full px-3 py-1"
                style={{ background: `${activity.accentColor}18`, color: activity.accentColor }}
              >
                {activity.context}
              </span>
            </div>

            {/* Icon + title + child */}
            <div className="flex items-start gap-4 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: activity.bgColor }}
              >
                <Icon className="w-7 h-7" style={{ color: activity.accentColor }} />
              </div>
              <div className="flex-1 text-right">
                <p className="font-black text-lg leading-snug mb-1.5" style={{ color: "oklch(0.18 0.03 255)" }}>
                  {activity.title}
                </p>
                {firstChild && (
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
                      {firstChild.name || "הילד שלך"}
                      {firstChild.ageGroup ? `, גיל ${firstChild.ageGroup}` : ""}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
                      style={{ background: childColor, fontSize: "11px" }}
                    >
                      {(firstChild.name || "?")[0]}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p
              className="text-sm text-right leading-relaxed mb-4 pb-4"
              style={{
                color: "oklch(0.48 0.03 255)",
                borderBottom: "1px solid oklch(0.93 0.02 85)",
              }}
            >
              {activity.description}
            </p>

            {/* Meta row */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold rounded-full px-2.5 py-1"
                style={{ background: `${activity.accentColor}14`, color: activity.accentColor }}
              >
                {activity.prepLevel}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.58 0.03 255)" }}>
                <Clock className="w-3 h-3" />
                {activity.duration}
              </span>
            </div>
          </div>

          {/* Saved state overlay */}
          {saved && (
            <div
              className="flex items-center gap-3 px-5 py-3 flex-row-reverse"
              style={{ background: "oklch(0.92 0.06 140 / 0.25)", borderTop: "1px solid oklch(0.82 0.08 140 / 0.3)" }}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.52 0.14 140)" }} />
              <p className="text-sm font-bold" style={{ color: "oklch(0.38 0.12 140)" }}>
                נשמר - נראה אותו בדשבורד שלך
              </p>
            </div>
          )}
        </div>

        {/* Two action buttons */}
        {!saved ? (
          <div className="flex flex-col gap-3 mb-5">
            <PrimaryButton label="שמור ליומן עכשיו" onClick={handleSave} />
            <p className="text-xs text-center" style={{ color: "oklch(0.65 0.03 255)" }}>
              נשמר בדשבורד שלך ונוסף ליומן — תזכורת תגיע לפני הזמן
            </p>
            <button
              onClick={handleNext}
              className="w-full rounded-2xl py-3.5 text-sm font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{
                borderColor: "oklch(0.88 0.04 140 / 0.6)",
                color: "oklch(0.52 0.14 140)",
                background: "white",
              }}
            >
              <RotateCcw className="w-4 h-4" />
              תן לי הצעה אחרת
            </button>
          </div>
        ) : (
          <div className="mb-5" />
        )}

        {/* Motivational line */}
        <div
          className="rounded-2xl p-4 mb-6 text-right"
          style={{
            background: "oklch(0.94 0.04 140 / 0.3)",
            border: "1px solid oklch(0.82 0.06 140 / 0.3)",
          }}
        >
          <div className="flex items-start gap-2 flex-row-reverse">
            <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.14 140)" }} />
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.38 0.10 140)" }}>
              זה רק ההתחלה. BondFlow ימצא לכם 3-5 רגעים כאלה בכל שבוע - בלי מאמץ נוסף.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <PrimaryButton
          label={isFinishing ? "שומר..." : "סיום והתחל להשתמש ב-BondFlow"}
          onClick={onFinish}
          disabled={isFinishing}
        />
      </div>
    </div>
  );
}

// ============================================================
// ROOT - orchestrates the 4 screens
// ============================================================
export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<StepNum>(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FormData>({
    children: [{ id: 1, name: "", ageGroup: "", interests: [] }],
    calendarConnected: null,
  });

  const advance = () => {
    if (step < 4) setStep((s) => (s + 1) as StepNum);
    else router.push("/dashboard");
  };

  const retreat = () => {
    if (step > 1) setStep((s) => (s - 1) as StepNum);
  };

  /** Save form data + mark complete + trigger Google OAuth */
  const handleConnectCalendar = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      await supabase.from("onboarding").upsert({
        user_id: user.id,
        completed: true,
        calendar_connected: "google",
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      const validChildren = data.children.filter((c) => c.name.trim().length > 0);
      if (validChildren.length > 0) {
        const CHILD_COLOR_ACCENTS = ["oklch(0.72 0.18 42)", "oklch(0.58 0.18 280)", "oklch(0.55 0.14 140)"];
        await supabase.from("children").upsert(
          validChildren.map((c, idx) => ({
            user_id: user.id,
            name: c.name.trim(),
            age_group: c.ageGroup,
            interests: c.interests,
            avatar_color: CHILD_COLOR_ACCENTS[idx % CHILD_COLOR_ACCENTS.length],
          }))
        );
      }

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar.events",
          queryParams: { access_type: "offline", prompt: "consent" },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (e) {
      console.error("handleConnectCalendar error:", e);
      setSaving(false);
    }
  };

  /** Insert the onboarding preview activity as a real saved_moment */
  const handleSaveActivity = async (activity: ActivitySuggestion) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [hStr] = (activity.timeSlot.split("-")[0] ?? "17:30").trim().split(":");
      const hours = parseInt(hStr) || 17;
      const scheduledAt = new Date();
      scheduledAt.setHours(hours, 0, 0, 0);
      if (scheduledAt <= new Date()) scheduledAt.setDate(scheduledAt.getDate() + 1);
      await supabase.from("saved_moments").insert({
        user_id: user.id,
        title: activity.title,
        scheduled_at: scheduledAt.toISOString(),
        duration_min: parseInt(activity.duration) || 20,
      });
    } catch (e) {
      console.error("handleSaveActivity error:", e);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Upsert onboarding record
        await supabase.from("onboarding").upsert({
          user_id: user.id,
          completed: true,
          calendar_connected: data.calendarConnected,
          completed_at: new Date().toISOString(),
        });

        // Insert children (skip empty names)
        const validChildren = data.children.filter((c) => c.name.trim().length > 0);
        if (validChildren.length > 0) {
          const CHILD_COLOR_ACCENTS = [
            "oklch(0.72 0.18 42)",
            "oklch(0.58 0.18 280)",
            "oklch(0.55 0.14 140)",
          ];
          await supabase.from("children").insert(
            validChildren.map((c, idx) => ({
              user_id: user.id,
              name: c.name.trim(),
              age_group: c.ageGroup,
              interests: c.interests,
              avatar_color: CHILD_COLOR_ACCENTS[idx % CHILD_COLOR_ACCENTS.length],
            }))
          );
        }
      }
    } catch (e) {
      console.error("Failed to save onboarding data:", e);
    } finally {
      setSaving(false);
      router.push("/dashboard");
    }
  };

  if (step === 1)
    return <WelcomeScreen onStart={advance} />;

  if (step === 2)
    return (
      <FamilySetup
        data={data}
        setData={setData}
        onNext={advance}
        onBack={retreat}
        onSkip={advance}
      />
    );

  if (step === 3)
    return (
      <CalendarConnect
        onFinish={advance}
        onBack={retreat}
        onConnectCalendar={handleConnectCalendar}
      />
    );

  return (
    <FirstWinScreen
      data={data}
      onBack={retreat}
      onFinish={handleFinish}
      isFinishing={saving}
      onSaveActivity={handleSaveActivity}
    />
  );
}
