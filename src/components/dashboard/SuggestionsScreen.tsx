"use client";

import { useState } from "react";
import {
  Blocks, BookOpen, Pencil, Car, TreePine, Music,
  Clock, Sparkles, X, Info, ChevronLeft,
} from "lucide-react";

type TimeFilter = "all" | "today" | "week";
type PlaceFilter = "all" | "indoor" | "outdoor" | "car";
type KidFilter = "all" | "yoav" | "noa";

interface Suggestion {
  id: number;
  title: string;
  insight: string;
  child: string;
  childInitial: string;
  childColor: string;
  childAge: number;
  timeSlot: string;
  duration: string;
  prepLevel: "אפס הכנה" | "הכנה קלה" | "קצת הכנה";
  place: "indoor" | "outdoor" | "car";
  timing: "today" | "week";
  IconComp: React.ElementType;
  accentColor: string;
  bgColor: string;
}

const ALL_SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    title: "בניית לגו - רכבת הרים",
    insight: "יואב אוהב לגו. יש לך 45 דק' ביום שלישי.",
    child: "יואב", childInitial: "י", childColor: "oklch(0.72 0.18 42)", childAge: 6,
    timeSlot: "שלישי 17:30", duration: "25 דק'", prepLevel: "אפס הכנה",
    place: "indoor", timing: "week",
    IconComp: Blocks, accentColor: "oklch(0.55 0.14 140)", bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    id: 2,
    title: "קריאה ביחד - ספר חדש",
    insight: "נועה מחכה לרגע שקט לפני שינה.",
    child: "נועה", childInitial: "נ", childColor: "oklch(0.60 0.18 280)", childAge: 9,
    timeSlot: "חמישי 20:00", duration: "20 דק'", prepLevel: "אפס הכנה",
    place: "indoor", timing: "week",
    IconComp: BookOpen, accentColor: "oklch(0.55 0.18 255)", bgColor: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    id: 3,
    title: "ציור חופשי ביחד",
    insight: "יואב מבקש לצייר כבר שלושה שבועות.",
    child: "יואב", childInitial: "י", childColor: "oklch(0.72 0.18 42)", childAge: 6,
    timeSlot: "שישי 9:00", duration: "30 דק'", prepLevel: "הכנה קלה",
    place: "indoor", timing: "week",
    IconComp: Pencil, accentColor: "oklch(0.55 0.15 42)", bgColor: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    id: 4,
    title: "שיחה ברכב בדרך לבית ספר",
    insight: "10 דקות שיכולות לשנות את כל היום.",
    child: "נועה", childInitial: "נ", childColor: "oklch(0.60 0.18 280)", childAge: 9,
    timeSlot: "ראשון 8:10", duration: "10 דק'", prepLevel: "אפס הכנה",
    place: "car", timing: "today",
    IconComp: Car, accentColor: "oklch(0.55 0.12 200)", bgColor: "oklch(0.90 0.05 200 / 0.12)",
  },
  {
    id: 5,
    title: "טיול קצר בפארק",
    insight: "שבת בוקר - כולם פנויים, האוויר נפלא.",
    child: "שניהם", childInitial: "כ", childColor: "oklch(0.65 0.14 140)", childAge: 0,
    timeSlot: "שבת 9:00", duration: "60 דק'", prepLevel: "הכנה קלה",
    place: "outdoor", timing: "week",
    IconComp: TreePine, accentColor: "oklch(0.50 0.16 148)", bgColor: "oklch(0.88 0.08 140 / 0.12)",
  },
  {
    id: 6,
    title: "שירים ומוזיקה ביחד",
    insight: "נועה מתחילה גיטרה. אולי תצטרף?",
    child: "נועה", childInitial: "נ", childColor: "oklch(0.60 0.18 280)", childAge: 9,
    timeSlot: "רביעי 17:00", duration: "20 דק'", prepLevel: "אפס הכנה",
    place: "indoor", timing: "week",
    IconComp: Music, accentColor: "oklch(0.55 0.18 320)", bgColor: "oklch(0.90 0.06 320 / 0.10)",
  },
];

export default function SuggestionsScreen() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("all");
  const [kidFilter, setKidFilter] = useState<KidFilter>("all");
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [showWhy, setShowWhy] = useState(false);

  const filtered = ALL_SUGGESTIONS.filter((s) => {
    if (dismissed.includes(s.id) || saved.includes(s.id)) return false;
    if (timeFilter !== "all" && s.timing !== timeFilter) return false;
    if (placeFilter !== "all" && s.place !== placeFilter) return false;
    if (kidFilter === "yoav" && s.child !== "יואב") return false;
    if (kidFilter === "noa" && s.child !== "נועה") return false;
    return true;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="text-right mb-4">
        <div className="flex items-center justify-end gap-2 mb-1">
          <h2 className="text-xl font-black" style={{ color: "oklch(0.2 0.03 255)" }}>
            הרגעים שלך השבוע
          </h2>
          <Sparkles className="w-5 h-5" style={{ color: "oklch(0.65 0.14 140)" }} />
        </div>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
          BondFlow מצא {ALL_SUGGESTIONS.length} חלונות זמן שמתאימים לך
        </p>
      </div>

      {/* Time + place filters - scrollable row */}
      <div className="overflow-x-auto pb-2 mb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 flex-row-reverse min-w-max">
          {(["all", "today", "week"] as TimeFilter[]).map((f) => (
            <button key={f} onClick={() => setTimeFilter(f)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: timeFilter === f ? "oklch(0.65 0.14 140)" : "white",
                color: timeFilter === f ? "white" : "oklch(0.55 0.03 255)",
                border: `1px solid ${timeFilter === f ? "oklch(0.65 0.14 140)" : "oklch(0.88 0.02 85)"}`,
              }}
            >
              {f === "all" ? "הכל" : f === "today" ? "היום" : "השבוע"}
            </button>
          ))}
          <div className="w-px self-stretch mx-1" style={{ background: "oklch(0.88 0.02 85)" }} />
          {(["all", "indoor", "outdoor", "car"] as PlaceFilter[]).map((f) => (
            <button key={f} onClick={() => setPlaceFilter(f)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: placeFilter === f ? "oklch(0.72 0.18 42)" : "white",
                color: placeFilter === f ? "white" : "oklch(0.55 0.03 255)",
                border: `1px solid ${placeFilter === f ? "oklch(0.72 0.18 42)" : "oklch(0.88 0.02 85)"}`,
              }}
            >
              {f === "all" ? "כל הסוגים" : f === "indoor" ? "בבית" : f === "outdoor" ? "בחוץ" : "ברכב"}
            </button>
          ))}
        </div>
      </div>

      {/* Kid filter */}
      <div className="flex gap-2 flex-row-reverse mb-5">
        {([
          { id: "all" as KidFilter, label: "כל הילדים", color: "oklch(0.65 0.14 140)", initial: null },
          { id: "yoav" as KidFilter, label: "יואב", color: "oklch(0.72 0.18 42)", initial: "י" },
          { id: "noa" as KidFilter, label: "נועה", color: "oklch(0.60 0.18 280)", initial: "נ" },
        ]).map(({ id, label, color, initial }) => (
          <button key={id} onClick={() => setKidFilter(id)}
            className="rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
            style={{
              background: kidFilter === id ? color : "white",
              color: kidFilter === id ? "white" : "oklch(0.45 0.03 255)",
              border: `1.5px solid ${kidFilter === id ? color : "oklch(0.88 0.02 85)"}`,
            }}
          >
            {initial && (
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center font-black"
                style={{
                  background: kidFilter === id ? "oklch(1 0 0 / 0.25)" : color,
                  color: "white", fontSize: "9px",
                }}
              >
                {initial}
              </span>
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl p-8 text-center border" style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}>
          <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "oklch(0.65 0.14 140)" }} />
          <p className="font-black text-sm mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>אין הצעות עם הסינון הזה</p>
          <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>נסה לשנות את הסינון</p>
        </div>
      )}

      {/* Featured card */}
      {featured && (
        <div
          className="rounded-2xl overflow-hidden border mb-5"
          style={{
            background: "white",
            borderColor: "oklch(0.93 0.02 85)",
            boxShadow: "0 6px 30px oklch(0 0 0 / 0.09)",
          }}
        >
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${featured.accentColor}, oklch(0.72 0.18 42))` }} />
          <div className="p-5">
            {/* Live badge */}
            <div className="flex items-center justify-end mb-3">
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "oklch(0.65 0.14 140 / 0.12)", color: "oklch(0.42 0.14 140)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.55 0.14 140)" }} />
                {featured.timeSlot}
              </div>
            </div>

            {/* Icon + title + insight */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: featured.bgColor }}
              >
                <featured.IconComp className="w-7 h-7" style={{ color: featured.accentColor }} />
              </div>
              <div className="flex-1 text-right">
                <p className="font-black text-lg leading-snug mb-1" style={{ color: "oklch(0.15 0.03 255)" }}>
                  {featured.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
                  "{featured.insight}"
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-end gap-3 mb-4 text-xs flex-wrap" style={{ color: "oklch(0.55 0.03 255)" }}>
              <div className="flex items-center gap-1">
                <span
                  className="w-5 h-5 rounded-full text-white font-black flex items-center justify-center"
                  style={{ background: featured.childColor, fontSize: "10px" }}
                >
                  {featured.childInitial}
                </span>
                <span>{featured.child}{featured.childAge > 0 ? `, ${featured.childAge}` : ""}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {featured.duration}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{ background: `${featured.accentColor}18`, color: featured.accentColor }}
              >
                {featured.prepLevel}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex gap-2">
              <button
                onClick={() => setDismissed((p) => [...p, featured.id])}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold border transition-colors"
                style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.55 0.03 255)", background: "transparent" }}
              >
                הצג אחרת
              </button>
              <button
                onClick={() => setSaved((p) => [...p, featured.id])}
                className="flex-[2] rounded-xl py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))",
                  boxShadow: "0 4px 16px oklch(0.65 0.14 140 / 0.35)",
                }}
              >
                שמור את הרגע הזה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of remaining suggestions */}
      {rest.length > 0 && (
        <>
          <p className="text-sm font-black text-right mb-3" style={{ color: "oklch(0.2 0.03 255)" }}>
            עוד רגעים מומלצים
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {rest.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl overflow-hidden border"
                style={{ background: "white", borderColor: "oklch(0.93 0.02 85)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.04)" }}
              >
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${s.accentColor}, transparent)` }} />
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <button
                      onClick={() => setDismissed((p) => [...p, s.id])}
                      className="p-0.5 rounded-lg flex-shrink-0 mt-0.5 transition-colors hover:bg-[oklch(0.95_0.01_85)]"
                      style={{ color: "oklch(0.75 0.02 255)" }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 text-right">
                      <p className="font-black text-sm leading-snug mb-0.5" style={{ color: "oklch(0.2 0.03 255)" }}>
                        {s.title}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>
                        <span
                          className="w-4 h-4 rounded-full text-white font-black flex items-center justify-center"
                          style={{ background: s.childColor, fontSize: "9px" }}
                        >
                          {s.childInitial}
                        </span>
                        <span>{s.child}{s.childAge > 0 ? `, ${s.childAge}` : ""}</span>
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: s.bgColor }}
                    >
                      <s.IconComp className="w-5 h-5" style={{ color: s.accentColor }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>
                    <span
                      className="rounded-full px-2 py-0.5 font-semibold"
                      style={{ background: `${s.accentColor}12`, color: s.accentColor }}
                    >
                      {s.prepLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.duration} · {s.timeSlot}
                    </span>
                  </div>

                  <button
                    onClick={() => setSaved((p) => [...p, s.id])}
                    className="w-full rounded-xl py-2 text-sm font-black text-white transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))" }}
                  >
                    שמור את הרגע הזה
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Saved confirmation strip */}
      {saved.length > 0 && (
        <div
          className="rounded-2xl p-4 text-right mb-5"
          style={{ background: "oklch(0.88 0.08 140 / 0.15)", border: "1px solid oklch(0.75 0.10 140 / 0.3)" }}
        >
          <p className="text-sm font-black" style={{ color: "oklch(0.35 0.12 140)" }}>
            {saved.length} רגע נשמר ביומן שלך
          </p>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.08 140)" }}>
            תקבל תזכורת יום לפני כל רגע
          </p>
        </div>
      )}

      {/* Why BondFlow section */}
      <div
        className="rounded-2xl border p-4"
        style={{ background: "oklch(0.97 0.02 140 / 0.5)", borderColor: "oklch(0.85 0.06 140 / 0.4)" }}
      >
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="flex items-center gap-2 flex-row-reverse w-full"
        >
          <Info className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.48 0.12 140)" }} />
          <span className="text-sm font-bold flex-1 text-right" style={{ color: "oklch(0.32 0.10 140)" }}>
            למה BondFlow בחר את אלה?
          </span>
          <ChevronLeft
            className="w-4 h-4 flex-shrink-0 transition-transform"
            style={{
              color: "oklch(0.48 0.12 140)",
              transform: showWhy ? "rotate(-90deg)" : "rotate(0deg)",
            }}
          />
        </button>
        {showWhy && (
          <p className="text-sm text-right mt-3 leading-relaxed" style={{ color: "oklch(0.42 0.08 140)" }}>
            בססנו את ההמלצות על הלו"ז שלך, גיל הילדים, ותחומי העניין שהגדרת. BondFlow מעדיף פעילויות שדורשות אפס הכנה ומתאימות לחלונות הזמן שזוהו ביומן שלך.
          </p>
        )}
      </div>
    </div>
  );
}
