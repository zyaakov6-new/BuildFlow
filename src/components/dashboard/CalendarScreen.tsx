"use client";

import { Blocks, BookOpen, Pencil, Car, CheckCircle2, Clock, Plus, Calendar } from "lucide-react";

const WEEK_DAYS = ["ר", "ב", "ג", "ד", "ה", "ו", "ש"];
const ACTIVE_DAYS = [0, 2, 4, 5]; // ראשון, שלישי, חמישי, שישי

const SCHEDULED = [
  {
    day: "ראשון", date: "13/4",
    moments: [{
      title: "שיחה ברכב",
      child: "נועה", childInitial: "נ", childColor: "oklch(0.60 0.18 280)",
      time: "08:10", duration: "10 דק'",
      Icon: Car, accentColor: "oklch(0.55 0.12 200)", bgColor: "oklch(0.90 0.05 200 / 0.12)",
    }],
  },
  {
    day: "שלישי", date: "15/4",
    moments: [{
      title: "בניית לגו - רכבת הרים",
      child: "יואב", childInitial: "י", childColor: "oklch(0.72 0.18 42)",
      time: "17:30", duration: "25 דק'",
      Icon: Blocks, accentColor: "oklch(0.55 0.14 140)", bgColor: "oklch(0.88 0.08 140 / 0.15)",
    }],
  },
  {
    day: "חמישי", date: "17/4",
    moments: [{
      title: "קריאה ביחד",
      child: "נועה", childInitial: "נ", childColor: "oklch(0.60 0.18 280)",
      time: "20:00", duration: "20 דק'",
      Icon: BookOpen, accentColor: "oklch(0.55 0.18 255)", bgColor: "oklch(0.90 0.06 255 / 0.12)",
    }],
  },
  {
    day: "שישי", date: "18/4",
    moments: [{
      title: "ציור חופשי",
      child: "יואב", childInitial: "י", childColor: "oklch(0.72 0.18 42)",
      time: "09:00", duration: "30 דק'",
      Icon: Pencil, accentColor: "oklch(0.55 0.15 42)", bgColor: "oklch(0.92 0.06 60 / 0.15)",
    }],
  },
];

export default function CalendarScreen() {
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
          3 מתוך 5 יעד
        </div>
        <div className="flex gap-1.5">
          {WEEK_DAYS.map((d, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: ACTIVE_DAYS.includes(i) ? "oklch(0.65 0.14 140)" : "oklch(0.93 0.02 85)",
                color: ACTIVE_DAYS.includes(i) ? "white" : "oklch(0.62 0.03 255)",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <p className="text-xs font-bold" style={{ color: "oklch(0.55 0.03 255)" }}>שבוע 15</p>
      </div>

      {/* Day sections */}
      <div className="flex flex-col gap-5">
        {SCHEDULED.map(({ day, date, moments }) => (
          <div key={day}>
            {/* Day header */}
            <div className="flex items-center gap-3 flex-row-reverse mb-2.5">
              <div
                className="rounded-xl px-3 py-1 text-xs font-black text-white flex-shrink-0"
                style={{ background: "oklch(0.65 0.14 140)" }}
              >
                {day}
              </div>
              <p className="text-xs font-medium" style={{ color: "oklch(0.65 0.03 255)" }}>{date}</p>
              <div className="flex-1 h-px" style={{ background: "oklch(0.91 0.02 85)" }} />
            </div>

            <div className="flex flex-col gap-2.5">
              {moments.map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl border flex items-center gap-3 p-3.5"
                  style={{ background: "white", borderColor: "oklch(0.93 0.02 85)", boxShadow: "0 1px 6px oklch(0 0 0 / 0.04)" }}
                >
                  {/* Blocked badge */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.65 0.14 140)" }} />
                    <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>חסום</span>
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
                        <span className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>{m.child}</span>
                      </div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: m.bgColor }}
                  >
                    <m.Icon className="w-5 h-5" style={{ color: m.accentColor }} />
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
            שני ורביעי פנויים
          </p>
          <p className="text-xs mb-3 leading-relaxed" style={{ color: "oklch(0.52 0.06 140)" }}>
            BondFlow זיהה חלונות זמן - רוצה לראות הצעות?
          </p>
          <button
            className="text-sm font-black px-5 py-2 rounded-xl text-white transition-opacity hover:opacity-85"
            style={{ background: "oklch(0.65 0.14 140)" }}
          >
            הראה לי הצעות
          </button>
        </div>
      </div>
    </div>
  );
}
