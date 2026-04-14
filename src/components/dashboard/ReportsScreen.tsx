"use client";

import { useState } from "react";
import {
  Clock, Calendar, TrendingUp, Share2,
  Blocks, BookOpen, Car, Heart,
} from "lucide-react";

function WeekBar({ label, score, isCurrent }: { label: string; score: number; isCurrent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-xs font-bold" style={{ color: isCurrent ? "oklch(0.48 0.14 140)" : "oklch(0.65 0.03 255)" }}>
        {score}
      </span>
      <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
        <div
          className="w-full max-w-[32px] rounded-t-lg transition-all"
          style={{
            height: `${(score / 100) * 80}px`,
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

export default function ReportsScreen() {
  const [shared, setShared] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium" style={{ color: "oklch(0.6 0.03 255)" }}>
          שבוע 15 - אפריל 2026
        </span>
        <h2 className="text-xl font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
          הדוח השבועי
        </h2>
      </div>

      {/* Shareable summary card */}
      <div
        className="rounded-3xl overflow-hidden mb-6"
        style={{
          background: "linear-gradient(135deg, oklch(0.28 0.05 255), oklch(0.32 0.08 265))",
          boxShadow: "0 8px 40px oklch(0.28 0.05 255 / 0.35)",
        }}
      >
        <div className="relative p-6">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-15 blur-xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

          {/* Top row */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <p className="text-xs font-medium" style={{ color: "oklch(0.7 0.03 255)" }}>
              שבוע 15 - אפריל 2026
            </p>
            <p className="text-sm font-black text-white">BondFlow</p>
          </div>

          {/* Big score */}
          <div className="relative z-10 text-center mb-6">
            <div className="inline-flex items-end gap-1.5">
              <span className="text-7xl font-black text-white leading-none">72</span>
              <span className="text-2xl font-bold mb-2" style={{ color: "oklch(0.65 0.03 255)" }}>/100</span>
            </div>
            <p className="text-sm font-bold mt-1" style={{ color: "oklch(0.65 0.14 140)" }}>
              ציון חיבור משפחתי
            </p>
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mb-5">
            {[
              { Icon: Clock, value: "1.5 שעות", label: "זמן איכות" },
              { Icon: Calendar, value: "3 רגעים", label: "משפחתיים" },
              { Icon: TrendingUp, value: "שבוע 4", label: "ברצף" },
            ].map(({ Icon, value, label }, i) => (
              <div key={i} className="text-center">
                <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                <p className="text-sm font-black text-white">{value}</p>
                <p className="text-xs" style={{ color: "oklch(0.68 0.03 255)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div
            className="relative z-10 rounded-2xl p-3.5 text-center"
            style={{ background: "oklch(1 0 0 / 0.08)" }}
          >
            <p className="text-sm font-bold text-white">"מיכל, אתה שם. ממשיך כך."</p>
          </div>
        </div>

        {/* Share button */}
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

      {/* Top moments */}
      <div className="mb-6">
        <p className="text-base font-black text-right mb-3" style={{ color: "oklch(0.2 0.03 255)" }}>
          הרגעים הטובים ביותר השבוע
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              rank: "1", medal: "oklch(0.75 0.18 80)",
              title: "בניית לגו עם יואב", time: "שלישי 17:30",
              note: "25 דקות של ריכוז מלא ביחד",
              Icon: Blocks, accentColor: "oklch(0.55 0.14 140)", bgColor: "oklch(0.88 0.08 140 / 0.15)",
            },
            {
              rank: "2", medal: "oklch(0.72 0.04 255)",
              title: "קריאה עם נועה", time: "חמישי 20:00",
              note: "רגע שקט ומחבר לפני שינה",
              Icon: BookOpen, accentColor: "oklch(0.55 0.18 255)", bgColor: "oklch(0.90 0.06 255 / 0.12)",
            },
            {
              rank: "3", medal: "oklch(0.65 0.12 42)",
              title: "שיחה ברכב עם נועה", time: "ראשון 8:15",
              note: "10 דקות ששינו את כל היום שלה",
              Icon: Car, accentColor: "oklch(0.55 0.12 200)", bgColor: "oklch(0.90 0.05 200 / 0.12)",
            },
          ].map(({ rank, medal, title, time, note, Icon, accentColor, bgColor }) => (
            <div
              key={rank}
              className="rounded-2xl border overflow-hidden"
              style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
            >
              <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
              <div className="p-4 flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: medal }}
                >
                  {rank}
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="flex-1 text-right min-w-0">
                  <p className="font-black text-sm" style={{ color: "oklch(0.2 0.03 255)" }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.58 0.03 255)" }}>"{note}"</p>
                </div>
                <p className="text-xs font-semibold flex-shrink-0" style={{ color: "oklch(0.55 0.14 140)" }}>
                  {time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <div
        className="rounded-2xl border p-5 mb-6"
        style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
      >
        <p className="text-sm font-black text-right mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
          מגמה - 4 שבועות אחרונים
        </p>
        <div className="flex items-end gap-2 mb-3">
          <WeekBar label="שב' 12" score={55} />
          <WeekBar label="שב' 13" score={60} />
          <WeekBar label="שב' 14" score={64} />
          <WeekBar label="שב' 15" score={72} isCurrent />
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "oklch(0.88 0.08 140 / 0.15)" }}
        >
          <p className="text-xs font-bold" style={{ color: "oklch(0.42 0.12 140)" }}>
            +17 נקודות בחודש האחרון - כיוון נהדר
          </p>
        </div>
      </div>

      {/* Next week CTA */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "oklch(0.97 0.02 140 / 0.5)", borderColor: "oklch(0.82 0.07 140 / 0.4)" }}
      >
        <div className="flex items-start gap-3 flex-row-reverse mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.65 0.14 140 / 0.15)" }}
          >
            <Heart className="w-5 h-5" style={{ color: "oklch(0.52 0.14 140)" }} />
          </div>
          <div className="flex-1 text-right">
            <p className="font-black text-sm mb-1" style={{ color: "oklch(0.22 0.08 140)" }}>
              הצצה לשבוע הבא
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.42 0.06 140)" }}>
              זיהינו 4 חלונות זמן שבועיים. רוצה שנשמור אותם אוטומטית?
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 rounded-xl py-2.5 text-sm font-bold border transition-colors"
            style={{ borderColor: "oklch(0.68 0.10 140 / 0.4)", color: "oklch(0.42 0.12 140)", background: "transparent" }}
          >
            אראה אותם קודם
          </button>
          <button
            className="flex-[2] rounded-xl py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
              boxShadow: "0 4px 12px oklch(0.65 0.14 140 / 0.3)",
            }}
          >
            כן, שמור אוטומטית
          </button>
        </div>
      </div>
    </div>
  );
}
