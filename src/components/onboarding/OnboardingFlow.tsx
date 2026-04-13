"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2, ChevronLeft, Check, Calendar, Clock } from "lucide-react";

// ---- Types ----
interface Child {
  id: number;
  name: string;
  age: string;
  interests: string[];
}

interface FormData {
  parentName: string;
  children: Child[];
  calendarConnected: "google" | "apple" | "manual" | null;
  availableSlots: string[];
}

const INTEREST_OPTIONS = [
  "לגו", "ציור", "ספרים", "מוזיקה", "ספורט", "מיינקראפט",
  "דינוזאורים", "בישול", "טבע", "מחשבים", "כדורגל", "ריקוד",
  "אומנות", "מדע", "קריאה", "משחקי קופסא",
];

const TIME_SLOTS = [
  { id: "morning", label: "בוקר (7:00-9:00)", icon: "🌅" },
  { id: "afternoon", label: "צהריים (12:00-14:00)", icon: "☀️" },
  { id: "after_school", label: "אחה\"צ (15:30-18:00)", icon: "🎒" },
  { id: "evening", label: "ערב (18:00-20:00)", icon: "🌙" },
  { id: "weekend_morning", label: "סוף שבוע בוקר", icon: "🏡" },
  { id: "weekend_afternoon", label: "סוף שבוע צהריים", icon: "🌳" },
];

const TOTAL_STEPS = 5;

// ---- Step indicator ----
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < current ? "gradient-cta" : i === current - 1 ? "gradient-cta" : ""}`}
            style={{
              background: i < current
                ? "oklch(0.65 0.14 140)"
                : "oklch(0.9 0.02 85)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ---- Shared input style ----
const inputClass = `
  w-full rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all
  bg-white border-2 text-right
  placeholder:text-[oklch(0.7_0.02_255)]
  focus:border-[oklch(0.65_0.14_140)]
  hover:border-[oklch(0.8_0.05_140)]
`;

// ---- Step 1: Parent name ----
function Step1({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-right">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          שלום! מי אתה?
        </h2>
        <p className="text-base" style={{ color: "oklch(0.55 0.03 255)" }}>
          נתחיל עם הכרות קצרה. זה לוקח 3 דקות.
        </p>
      </div>
      <input
        type="text"
        placeholder="השם שלך"
        value={data.parentName}
        onChange={(e) => setData({ ...data, parentName: e.target.value })}
        className={inputClass}
        style={{ borderColor: "oklch(0.88 0.02 85)", fontSize: "1.1rem" }}
        autoFocus
      />
      {data.parentName && (
        <p className="text-right text-sm font-semibold" style={{ color: "oklch(0.65 0.14 140)" }}>
          נעים להכיר, {data.parentName}! 🌱
        </p>
      )}
    </div>
  );
}

// ---- Step 2: Children ----
function Step2({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const addChild = () => {
    setData({
      ...data,
      children: [...data.children, { id: Date.now(), name: "", age: "", interests: [] }],
    });
  };

  const updateChild = (id: number, field: keyof Child, value: string | string[]) => {
    setData({
      ...data,
      children: data.children.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    });
  };

  const removeChild = (id: number) => {
    setData({ ...data, children: data.children.filter((c) => c.id !== id) });
  };

  const toggleInterest = (childId: number, interest: string) => {
    const child = data.children.find((c) => c.id === childId)!;
    const newInterests = child.interests.includes(interest)
      ? child.interests.filter((i) => i !== interest)
      : [...child.interests, interest];
    updateChild(childId, "interests", newInterests);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-right">
        <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          ספר לנו על הילדים שלך
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
          ככל שנדע יותר - ההצעות יהיו יותר מדויקות.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {data.children.map((child, idx) => (
          <div
            key={child.id}
            className="rounded-3xl p-5 border-2"
            style={{ borderColor: "oklch(0.9 0.02 85)", background: "oklch(0.98 0.01 85)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => removeChild(child.id)}
                className="p-1.5 rounded-xl transition-colors hover:bg-red-50"
                style={{ color: "oklch(0.6 0.15 25)" }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="font-black text-sm" style={{ color: "oklch(0.45 0.14 140)" }}>
                ילד {idx + 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="number"
                placeholder="גיל"
                value={child.age}
                onChange={(e) => updateChild(child.id, "age", e.target.value)}
                min="0" max="18"
                className={inputClass}
                style={{ borderColor: "oklch(0.88 0.02 85)" }}
              />
              <input
                type="text"
                placeholder="שם הילד"
                value={child.name}
                onChange={(e) => updateChild(child.id, "name", e.target.value)}
                className={inputClass}
                style={{ borderColor: "oklch(0.88 0.02 85)" }}
              />
            </div>

            <div className="text-right">
              <p className="text-xs font-bold mb-2.5" style={{ color: "oklch(0.5 0.03 255)" }}>
                תחביבים (בחר כמה שרוצה):
              </p>
              <div className="flex flex-wrap gap-2 justify-end">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = child.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(child.id, interest)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      style={{
                        background: selected ? "oklch(0.65 0.14 140)" : "white",
                        color: selected ? "white" : "oklch(0.5 0.03 255)",
                        border: `1.5px solid ${selected ? "oklch(0.65 0.14 140)" : "oklch(0.88 0.02 85)"}`,
                      }}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addChild}
        className="flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-bold border-2 border-dashed transition-all hover:border-[oklch(0.65_0.14_140)] hover:text-[oklch(0.65_0.14_140)]"
        style={{ borderColor: "oklch(0.85 0.03 140)", color: "oklch(0.65 0.14 140)" }}
      >
        <Plus className="w-4 h-4" />
        הוסף ילד
      </button>
    </div>
  );
}

// ---- Step 3: Connect calendar ----
function Step3({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const options = [
    {
      id: "google" as const,
      label: "Google Calendar",
      desc: "מתאים לאנדרואיד ו-Gmail",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
    },
    {
      id: "apple" as const,
      label: "Apple Calendar",
      desc: "מתאים לאייפון ו-Mac",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" style={{ color: "oklch(0.3 0 0)" }}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
    },
    {
      id: "manual" as const,
      label: "אזין ידנית",
      desc: "אגיד לBondFlow מתי אני פנוי",
      icon: <Clock className="w-7 h-7" style={{ color: "oklch(0.65 0.14 140)" }} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-right">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          חבר את היומן שלך
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
          BondFlow צריכה לראות את היומן שלך כדי למצוא חלונות זמן אמיתיים.
          אנחנו לא שומרים פרטי אירועים - רק בודקים מתי אתה פנוי.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const selected = data.calendarConnected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setData({ ...data, calendarConnected: opt.id })}
              className="flex items-center gap-4 rounded-2xl p-4 border-2 text-right transition-all active:scale-[0.98]"
              style={{
                borderColor: selected ? "oklch(0.65 0.14 140)" : "oklch(0.9 0.02 85)",
                background: selected ? "oklch(0.88 0.08 140 / 0.12)" : "white",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: selected ? "oklch(0.88 0.08 140 / 0.2)" : "oklch(0.96 0.01 85)" }}
              >
                {opt.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "oklch(0.25 0.03 255)" }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 255)" }}>{opt.desc}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selected ? "oklch(0.65 0.14 140)" : "oklch(0.8 0.02 85)",
                  background: selected ? "oklch(0.65 0.14 140)" : "transparent",
                }}
              >
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "oklch(0.88 0.08 140 / 0.12)", border: "1px solid oklch(0.65 0.14 140 / 0.2)" }}
      >
        <span className="text-lg flex-shrink-0">🔒</span>
        <p className="text-xs leading-relaxed text-right" style={{ color: "oklch(0.5 0.08 140)" }}>
          אנחנו לא קוראים את תוכן האירועים שלך - רק בודקים מתי יש לך זמן פנוי. הנתונים לא נמכרים לאף אחד.
        </p>
      </div>
    </div>
  );
}

// ---- Step 4: Availability ----
function Step4({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const toggle = (id: string) => {
    const newSlots = data.availableSlots.includes(id)
      ? data.availableSlots.filter((s) => s !== id)
      : [...data.availableSlots, id];
    setData({ ...data, availableSlots: newSlots });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-right">
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          מתי אתה בדרך כלל פנוי?
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
          זה עוזר לנו להציע פעילויות בזמנים שיש סיכוי שיתפנה לך.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TIME_SLOTS.map((slot) => {
          const selected = data.availableSlots.includes(slot.id);
          return (
            <button
              key={slot.id}
              onClick={() => toggle(slot.id)}
              className="rounded-2xl p-4 text-right transition-all active:scale-95 border-2"
              style={{
                borderColor: selected ? "oklch(0.65 0.14 140)" : "oklch(0.9 0.02 85)",
                background: selected ? "oklch(0.88 0.08 140 / 0.12)" : "white",
              }}
            >
              <div className="text-2xl mb-2">{slot.icon}</div>
              <p className="text-xs font-bold leading-snug" style={{ color: selected ? "oklch(0.45 0.14 140)" : "oklch(0.4 0.03 255)" }}>
                {slot.label}
              </p>
            </button>
          );
        })}
      </div>

      {data.availableSlots.length > 0 && (
        <p className="text-right text-sm font-semibold" style={{ color: "oklch(0.65 0.14 140)" }}>
          בחרת {data.availableSlots.length} זמנים - מצוין!
        </p>
      )}
    </div>
  );
}

// ---- Step 5: Done ----
function Step5({ data }: { data: FormData }) {
  const firstName = data.parentName.split(" ")[0];
  const childName = data.children[0]?.name || "הילד שלך";

  const suggestions = [
    {
      emoji: "🚂",
      title: `בניית לגו עם ${childName}`,
      time: "שלישי - 17:30 - 18:00",
      prep: "אפס הכנה",
      color: "oklch(0.88 0.08 140 / 0.2)",
      accent: "oklch(0.55 0.14 140)",
    },
    {
      emoji: "🎨",
      title: "ציור חופשי ביחד",
      time: "חמישי - 18:30 - 19:00",
      prep: "רק ניירות וצבעים",
      color: "oklch(0.92 0.06 60 / 0.25)",
      accent: "oklch(0.55 0.15 42)",
    },
    {
      emoji: "📖",
      title: "קריאת סיפור לפני שינה",
      time: "יום ראשון - 20:00",
      prep: "ספר אחד - 15 דקות",
      color: "oklch(0.90 0.06 255 / 0.15)",
      accent: "oklch(0.5 0.18 255)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          {firstName}, BondFlow מוכן!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
          מצאנו 3 רגעים אפשריים עבורך השבוע. לחץ על אחד כדי לחסום אותו.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 border cursor-pointer transition-all active:scale-[0.98] hover:shadow-md"
            style={{ background: s.color, borderColor: `${s.accent}30` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{s.emoji}</span>
              <div className="flex-1 text-right">
                <p className="font-black text-base mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>{s.title}</p>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-xs font-medium" style={{ color: s.accent }}>{s.prep}</span>
                  <span className="text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>{s.time}</span>
                </div>
              </div>
            </div>
            <button
              className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-white gradient-cta"
            >
              חסום את הזמן הזה
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main flow ----
const STEP_TITLES = [
  "שלום!",
  "הילדים שלך",
  "יומן",
  "זמינות",
  "מוכן!",
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>({
    parentName: "",
    children: [{ id: 1, name: "", age: "", interests: [] }],
    calendarConnected: null,
    availableSlots: [],
  });

  const canNext = () => {
    if (step === 1) return data.parentName.trim().length > 0;
    if (step === 2) return data.children.length > 0 && data.children.every((c) => c.name && c.age);
    if (step === 3) return data.calendarConnected !== null;
    if (step === 4) return data.availableSlots.length > 0;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else router.push("/dashboard");
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl gradient-cta flex items-center justify-center shadow-lg" style={{ boxShadow: "0 8px 20px oklch(0.65 0.14 140 / 0.35)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl" style={{ color: "oklch(0.2 0.05 255)" }}>BondFlow</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-7 sm:p-9" style={{ boxShadow: "0 24px 64px oklch(0.28 0.05 255 / 0.12)" }}>
          {/* Step info */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: "oklch(0.65 0.14 140)" }}>
              {STEP_TITLES[step - 1]}
            </span>
            <span className="text-xs font-medium" style={{ color: "oklch(0.65 0.03 255)" }}>
              {step} / {TOTAL_STEPS}
            </span>
          </div>

          <StepBar current={step} total={TOTAL_STEPS} />

          {/* Step content */}
          <div className="min-h-[360px]">
            {step === 1 && <Step1 data={data} setData={setData} />}
            {step === 2 && <Step2 data={data} setData={setData} />}
            {step === 3 && <Step3 data={data} setData={setData} />}
            {step === 4 && <Step4 data={data} setData={setData} />}
            {step === 5 && <Step5 data={data} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && step < TOTAL_STEPS && (
              <Button
                variant="outline"
                onClick={back}
                className="rounded-2xl h-12 px-5 font-semibold border-2 flex items-center gap-1.5"
                style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.5 0.03 255)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                חזור
              </Button>
            )}
            <Button
              onClick={next}
              disabled={!canNext()}
              className={`flex-1 gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-12 font-black text-sm disabled:opacity-40 ${step === TOTAL_STEPS ? "" : ""}`}
              style={{ boxShadow: canNext() ? "0 6px 20px oklch(0.65 0.14 140 / 0.35)" : "none" }}
            >
              {step === TOTAL_STEPS ? (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  כניסה לאפליקציה
                </>
              ) : (
                "המשך"
              )}
            </Button>
          </div>

          {/* Skip */}
          {step < TOTAL_STEPS && (
            <div className="mt-4 text-center">
              <button
                onClick={next}
                className="text-xs font-medium"
                style={{ color: "oklch(0.65 0.03 255)" }}
              >
                דלג לעכשיו
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
