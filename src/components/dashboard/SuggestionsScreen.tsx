"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Blocks, BookOpen, Pencil, Car, TreePine, Music, Sparkles,
  Clock, X, Info, ChevronLeft, Utensils, Puzzle, Dumbbell,
  FlaskConical, Palette, Heart, Crown, Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const HEBREW_TO_DAY: Record<string, number> = {
  "ראשון": 0, "שני": 1, "שלישי": 2, "רביעי": 3, "חמישי": 4, "שישי": 5, "שבת": 6,
};

function getScheduledDate(dayLabel: string | null, timeSlot: string | null): Date {
  const [hStr, mStr] = (timeSlot ?? "17:00").split(":");
  const hours = parseInt(hStr) || 17;
  const mins  = parseInt(mStr) || 0;
  const now = new Date();
  const result = new Date(now);
  if (dayLabel && HEBREW_TO_DAY[dayLabel] !== undefined) {
    const target = HEBREW_TO_DAY[dayLabel];
    const current = now.getDay();
    let diff = target - current;
    if (diff < 0) diff += 7;
    if (diff === 0) {
      const candidate = new Date(now);
      candidate.setHours(hours, mins, 0, 0);
      if (candidate <= now) diff = 7;
    }
    result.setDate(now.getDate() + diff);
  } else {
    result.setDate(now.getDate() + 1);
  }
  result.setHours(hours, mins, 0, 0);
  return result;
}

// ---- Types ----
type PlaceFilter = "all" | "indoor" | "outdoor" | "car";

interface ChildInfo {
  id: string;
  name: string;
  initial: string;
  color: string;
}

interface SuggestionItem {
  id: string;
  title: string;
  insight: string;
  childId: string | null;
  childName: string;
  childInitial: string;
  childColor: string;
  timeSlot: string;      // display string e.g. "שלישי 17:30"
  dayLabel: string | null;  // raw Hebrew day for scheduling
  rawTime: string | null;   // raw time "17:30" for scheduling
  duration: string;
  prepLevel: "אפס הכנה" | "הכנה קלה" | "קצת הכנה";
  place: "indoor" | "outdoor" | "car";
  isToday: boolean;
  IconComp: React.ElementType;
  accentColor: string;
  bgColor: string;
  durationMin: number;
}

// ---- Helpers ----
const CHILD_COLORS = [
  "oklch(0.72 0.18 42)", "oklch(0.60 0.18 280)", "oklch(0.55 0.14 140)",
  "oklch(0.58 0.18 20)", "oklch(0.55 0.16 320)",
];

const TODAY_HEBREW: Record<number, string> = {
  0: "ראשון", 1: "שני", 2: "שלישי", 3: "רביעי", 4: "חמישי", 5: "שישי", 6: "שבת",
};

function iconForCategory(cat: string | null): React.ElementType {
  switch (cat) {
    case "lego": return Blocks;
    case "drawing": return Pencil;
    case "reading": return BookOpen;
    case "music": return Music;
    case "outdoor": return TreePine;
    case "sports": return Dumbbell;
    case "cooking": return Utensils;
    case "puzzles": return Puzzle;
    case "science": return FlaskConical;
    case "art": return Palette;
    case "car": return Car;
    case "bonding": return Heart;
    default: return Sparkles;
  }
}

function prepLabel(mins: number | null): "אפס הכנה" | "הכנה קלה" | "קצת הכנה" {
  if (!mins || mins === 0) return "אפס הכנה";
  if (mins <= 10) return "הכנה קלה";
  return "קצת הכנה";
}

// ---- Main Component ----
export default function SuggestionsScreen({
  isPremium = false,
  onUpgrade,
}: {
  isPremium?: boolean;
  onUpgrade?: () => void;
}) {
  const [allItems, setAllItems] = useState<SuggestionItem[]>([]);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showWhy, setShowWhy] = useState(false);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("all");
  const [kidFilter, setKidFilter] = useState<string>("all"); // "all" or child id

  // Ref so the auto-refresh effect always calls the latest handleRefresh
  const handleRefreshRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch children
        const { data: kids } = await supabase
          .from("children")
          .select("id, name, avatar_color")
          .eq("user_id", user.id);

        const childList: ChildInfo[] = (kids ?? []).map((c, i) => ({
          id: c.id,
          name: c.name,
          initial: c.name[0] ?? "?",
          color: c.avatar_color ?? CHILD_COLORS[i % CHILD_COLORS.length],
        }));
        setChildren(childList);
        const childMap = new Map(childList.map((c) => [c.id, c]));

        // Fetch suggestions
        const res = await fetch("/api/suggestions");
        if (!res.ok) return;
        const json = await res.json();
        // Debug info visible in browser DevTools console
        if (json._debug) console.log("[BondFlow AI]", json._debug);
        const raw: Array<{
          id: string; title: string; child_id?: string; duration_min?: number;
          time_slot?: string; day_label?: string; prep_min?: number;
          accent_color?: string; bg_color?: string; category?: string;
          activity_type?: string; status?: string;
        }> = json.suggestions ?? [];

        const todayName = TODAY_HEBREW[new Date().getDay()];

        const items: SuggestionItem[] = raw
          .filter((s) => s.status !== "saved" && s.status !== "dismissed")
          .map((s) => {
            const child = s.child_id ? childMap.get(s.child_id) : null;
            const childName = child?.name ?? "הילד שלך";
            const placeType: "indoor" | "outdoor" | "car" =
              s.activity_type === "outdoor" ? "outdoor"
              : s.activity_type === "car" ? "car"
              : "indoor";
            return {
              id: s.id,
              title: s.title,
              insight: `פעילות מותאמת ל${childName}`,
              childId: s.child_id ?? null,
              childName,
              childInitial: child?.initial ?? childName[0] ?? "?",
              childColor: child?.color ?? CHILD_COLORS[0],
              timeSlot: `${s.day_label ?? ""} ${s.time_slot ?? ""}`.trim(),
              dayLabel: s.day_label ?? null,
              rawTime: s.time_slot ?? null,
              duration: s.duration_min ? `${s.duration_min} דק'` : "20 דק'",
              durationMin: s.duration_min ?? 30,
              prepLevel: prepLabel(s.prep_min ?? null),
              place: placeType,
              isToday: s.day_label === todayName,
              IconComp: iconForCategory(s.category ?? null),
              accentColor: s.accent_color ?? "oklch(0.55 0.14 140)",
              bgColor: s.bg_color ?? "oklch(0.88 0.08 140 / 0.15)",
            };
          });

        setAllItems(items);
      } catch (e) {
        console.error("SuggestionsScreen load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrigger]);

  const handleRefresh = useCallback(async (silent = false) => {
    setRefreshing(true);
    setAllItems([]);
    setDismissed(new Set());
    setSaved(new Set());
    setKidFilter("all");
    setPlaceFilter("all");
    try {
      const res = await fetch("/api/suggestions?force=true");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Log AI debug so it shows in console during refresh too
      if (json._debug) console.log("[BondFlow AI refresh]", json._debug);
      const raw: Array<{
        id: string; title: string; child_id?: string; duration_min?: number;
        time_slot?: string; day_label?: string; prep_min?: number;
        accent_color?: string; bg_color?: string; category?: string;
        activity_type?: string; status?: string;
      }> = json.suggestions ?? [];

      const childMap = new Map(children.map((c) => [c.id, c]));
      const todayName = TODAY_HEBREW[new Date().getDay()];

      const items: SuggestionItem[] = raw
        .filter((s) => s.status !== "saved" && s.status !== "dismissed")
        .map((s) => {
          const child = s.child_id ? childMap.get(s.child_id) : null;
          const childName = child?.name ?? "הילד שלך";
          const placeType: "indoor" | "outdoor" | "car" =
            s.activity_type === "outdoor" ? "outdoor"
            : s.activity_type === "car" ? "car"
            : "indoor";
          return {
            id: s.id,
            title: s.title,
            insight: `פעילות מותאמת ל${childName}`,
            childId: s.child_id ?? null,
            childName,
            childInitial: child?.initial ?? childName[0] ?? "?",
            childColor: child?.color ?? CHILD_COLORS[0],
            timeSlot: `${s.day_label ?? ""} ${s.time_slot ?? ""}`.trim(),
            dayLabel: s.day_label ?? null,
            rawTime: s.time_slot ?? null,
            duration: s.duration_min ? `${s.duration_min} דק'` : "20 דק'",
            durationMin: s.duration_min ?? 30,
            prepLevel: prepLabel(s.prep_min ?? null),
            place: placeType,
            isToday: s.day_label === todayName,
            IconComp: iconForCategory(s.category ?? null),
            accentColor: s.accent_color ?? "oklch(0.55 0.14 140)",
            bgColor: s.bg_color ?? "oklch(0.88 0.08 140 / 0.15)",
          };
        });

      setAllItems(items);
      if (!silent) toast.success("הצעות חדשות נוצרו! ✨");
    } catch (e) {
      console.error("Refresh error:", e);
      if (!silent) toast.error("שגיאה בטעינה, נסה שוב");
    } finally {
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  // Keep ref in sync so the auto-trigger effect is never stale
  useEffect(() => { handleRefreshRef.current = () => handleRefresh(true); }, [handleRefresh]);

  // Never show a blank suggestions page
  useEffect(() => {
    if (loading || refreshing || allItems.length === 0) return;

    // Recompute visible count inside the effect so we don't need filteredLength as a dep
    const visibleCount = allItems.filter((s) => {
      if (dismissed.has(s.id) || saved.has(s.id)) return false;
      if (placeFilter !== "all" && s.place !== placeFilter) return false;
      if (kidFilter !== "all" && s.childId !== kidFilter) return false;
      return true;
    }).length;

    if (visibleCount > 0) return; // Something is still visible — do nothing

    const filtersActive = placeFilter !== "all" || kidFilter !== "all";

    if (filtersActive) {
      // Filters are hiding everything — clear filters AND generate fresh suggestions
      const t = setTimeout(() => {
        setPlaceFilter("all");
        setKidFilter("all");
        handleRefreshRef.current();
      }, 700);
      return () => clearTimeout(t);
    }

    // No active filters and all items dismissed/saved — generate new ones
    if (dismissed.size + saved.size >= allItems.length) {
      const t = setTimeout(() => handleRefreshRef.current(), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, refreshing, allItems, dismissed, saved, placeFilter, kidFilter]);

  const handleSave = async (item: SuggestionItem) => {
    setSaved((prev) => new Set(prev).add(item.id));
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark suggestion saved
      await supabase.from("suggestions").update({ status: "saved" }).eq("id", item.id);

      // Schedule at the suggestion's actual day+time
      const scheduledAt = getScheduledDate(item.dayLabel, item.rawTime);

      await supabase.from("saved_moments").insert({
        user_id: user.id,
        suggestion_id: item.id,
        child_id: item.childId,
        title: item.title,
        duration_min: item.durationMin,
        scheduled_at: scheduledAt.toISOString(),
        completed: false,
      });
      toast.success("הרגע נשמר ביומן! 🎉");

      // Push to Google Calendar via server-side route (handles token refresh)
      const endDate = new Date(scheduledAt.getTime() + item.durationMin * 60_000);
      await fetch("/api/calendar/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:    item.title,
          startISO: scheduledAt.toISOString(),
          endISO:   endDate.toISOString(),
        }),
      });
    } catch (e) {
      console.error("Failed to save suggestion:", e);
      toast.error("שגיאה בשמירת הרגע, נסה שוב");
    }
  };

  const handleDismiss = async (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    try {
      const supabase = createClient();
      await supabase.from("suggestions").update({ status: "dismissed" }).eq("id", id);
    } catch (e) {
      console.error("Failed to dismiss suggestion:", e);
    }
  };

  const filtered = allItems.filter((s) => {
    if (dismissed.has(s.id) || saved.has(s.id)) return false;
    if (placeFilter !== "all" && s.place !== placeFilter) return false;
    if (kidFilter !== "all" && s.childId !== kidFilter) return false;
    return true;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col gap-4 animate-pulse">
          {/* Header */}
          <div className="flex justify-end gap-2">
            <div className="h-6 w-44 rounded-xl" style={{ background: "oklch(0.86 0.02 85)" }} />
          </div>
          {/* Filter chips */}
          <div className="flex gap-2 flex-row-reverse">
            {[70, 55, 65, 50].map((w, i) => <div key={i} className="h-8 rounded-full" style={{ width: w, background: "oklch(0.86 0.02 85)" }} />)}
          </div>
          {/* Featured card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: "oklch(0.86 0.02 85)" }}>
            <div className="h-1 w-full" style={{ background: "oklch(0.78 0.06 140)" }} />
            <div className="p-5 flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl flex-shrink-0" style={{ background: "oklch(0.80 0.04 140)" }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-3/4 rounded-lg ms-auto" style={{ background: "oklch(0.80 0.02 85)" }} />
                  <div className="h-3 w-1/2 rounded-lg ms-auto" style={{ background: "oklch(0.83 0.02 85)" }} />
                </div>
              </div>
              <div className="h-10 rounded-xl" style={{ background: "oklch(0.78 0.04 140)" }} />
            </div>
          </div>
          {/* Grid cards */}
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "oklch(0.86 0.02 85)" }}>
                <div className="w-9 h-9 rounded-xl ms-auto" style={{ background: "oklch(0.80 0.02 85)" }} />
                <div className="h-3 w-full rounded-lg" style={{ background: "oklch(0.80 0.02 85)" }} />
                <div className="h-3 w-2/3 rounded-lg ms-auto" style={{ background: "oklch(0.83 0.02 85)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          BondFlow מצא {allItems.length} חלונות זמן שמתאימים לך
        </p>
      </div>

      {/* Place filter */}
      <div className="overflow-x-auto pb-2 mb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 flex-row-reverse min-w-max">
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

      {/* Kid filter — dynamic from DB */}
      {children.length > 0 && (
        <div className="flex gap-2 flex-row-reverse mb-5 flex-wrap">
          <button
            onClick={() => setKidFilter("all")}
            className="rounded-full px-3 py-1.5 text-xs font-bold transition-all"
            style={{
              background: kidFilter === "all" ? "oklch(0.65 0.14 140)" : "white",
              color: kidFilter === "all" ? "white" : "oklch(0.45 0.03 255)",
              border: `1.5px solid ${kidFilter === "all" ? "oklch(0.65 0.14 140)" : "oklch(0.88 0.02 85)"}`,
            }}
          >
            כל הילדים
          </button>
          {children.map((c) => (
            <button key={c.id} onClick={() => setKidFilter(kidFilter === c.id ? "all" : c.id)}
              className="rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
              style={{
                background: kidFilter === c.id ? c.color : "white",
                color: kidFilter === c.id ? "white" : "oklch(0.45 0.03 255)",
                border: `1.5px solid ${kidFilter === c.id ? c.color : "oklch(0.88 0.02 85)"}`,
              }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center font-black"
                style={{
                  background: kidFilter === c.id ? "oklch(1 0 0 / 0.25)" : c.color,
                  color: "white", fontSize: "9px",
                }}
              >
                {c.initial}
              </span>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !refreshing && (
        <div className="rounded-2xl p-8 text-center border" style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}>
          {allItems.length > 0 && dismissed.size + saved.size >= allItems.length ? (
            // All exhausted — auto-refresh will fire shortly
            <div className="flex flex-col items-center gap-3">
              <div className="animate-pulse">
                <Sparkles className="w-8 h-8" style={{ color: "oklch(0.65 0.14 140)" }} />
              </div>
              <p className="font-black text-sm" style={{ color: "oklch(0.2 0.03 255)" }}>מכין לך רעיונות חדשים...</p>
              <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>רגע אחד</p>
            </div>
          ) : (
            // Active filter is hiding results — offer to clear it
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-7 h-7" style={{ color: "oklch(0.65 0.14 140)" }} />
              <p className="font-black text-sm" style={{ color: "oklch(0.2 0.03 255)" }}>אין הצעות עם הסינון הזה</p>
              <p className="text-xs mb-1" style={{ color: "oklch(0.6 0.03 255)" }}>
                {placeFilter !== "all" || kidFilter !== "all"
                  ? "מייצר הצעות חדשות שמתאימות לסינון..."
                  : "נסה לרענן את ההצעות"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Refreshing skeleton — shows while auto-refresh or manual refresh loads */}
      {filtered.length === 0 && refreshing && (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-48 rounded-2xl" style={{ background: "oklch(0.91 0.02 85)" }} />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-2xl" style={{ background: "oklch(0.91 0.02 85)" }} />)}
          </div>
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
            {/* Time badge */}
            <div className="flex items-center justify-end mb-3">
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "oklch(0.65 0.14 140 / 0.12)", color: "oklch(0.42 0.14 140)" }}
              >
                {featured.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.55 0.14 140)" }} />
                )}
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
                <span>{featured.childName}</span>
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
                onClick={() => handleDismiss(featured.id)}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold border transition-colors"
                style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.55 0.03 255)", background: "transparent" }}
              >
                הצג אחרת
              </button>
              <button
                onClick={() => handleSave(featured)}
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
      {rest.length > 0 && (() => {
        // Free users see at most 2 grid cards (+ 1 featured = 3 total)
        const visibleRest = isPremium ? rest : rest.slice(0, 2);
        const hiddenCount = isPremium ? 0 : rest.length - 2;
        return (
          <>
            <p className="text-sm font-black text-right mb-3" style={{ color: "oklch(0.2 0.03 255)" }}>
              עוד רגעים מומלצים
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {visibleRest.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl overflow-hidden border"
                  style={{ background: "white", borderColor: "oklch(0.93 0.02 85)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.04)" }}
                >
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${s.accentColor}, transparent)` }} />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        onClick={() => handleDismiss(s.id)}
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
                          <span>{s.childName}</span>
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
                      onClick={() => handleSave(s)}
                      className="w-full rounded-xl py-2 text-sm font-black text-white transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, oklch(0.65 0.14 140), oklch(0.58 0.16 148))" }}
                    >
                      שמור את הרגע הזה
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium gate — shown for free users when there are more suggestions */}
            {!isPremium && hiddenCount > 0 && (
              <div
                className="rounded-2xl p-5 mb-6 text-right relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, oklch(0.28 0.05 255), oklch(0.32 0.07 265))",
                  boxShadow: "0 4px 24px oklch(0.28 0.05 255 / 0.25)",
                }}
              >
                {/* Decorative glow */}
                <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-sm font-black text-white">עוד {hiddenCount} הצעות מחכות לך</span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.72 0.18 42)" }}>
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: "oklch(0.72 0.05 255)" }}>
                    בפרימיום תקבל הצעות יומיות ללא הגבלה עם התאמה מתקדמת לפי מצב רוח ומיקום.
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {["הצעות יומיות ללא הגבלה", "התאמה מתקדמת לפי מצב רוח ומיקום", "עד 4 פרופילי ילדים"].map((f) => (
                      <div key={f} className="flex items-center gap-2 flex-row-reverse">
                        <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: "oklch(0.72 0.18 42)" }} />
                        <span className="text-xs" style={{ color: "oklch(0.82 0.03 255)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onUpgrade}
                    className="w-full rounded-xl py-2.5 text-sm font-black text-white gradient-cta transition-opacity hover:opacity-90 active:scale-[0.98]"
                    style={{ boxShadow: "0 4px 14px oklch(0.65 0.14 140 / 0.4)" }}
                  >
                    שדרג לפרימיום - ₪39/חודש
                  </button>
                </div>
              </div>
            )}

            {/* Free-tier counter badge — shown when user has no more hidden items */}
            {!isPremium && hiddenCount <= 0 && (
              <div
                className="rounded-2xl p-4 mb-6 text-right border"
                style={{ background: "oklch(0.97 0.02 85)", borderColor: "oklch(0.90 0.03 85)" }}
              >
                <div className="flex items-center justify-end gap-2 mb-1">
                  <p className="text-sm font-black" style={{ color: "oklch(0.35 0.03 255)" }}>3/3 הצעות שבועיות</p>
                  <Lock className="w-4 h-4" style={{ color: "oklch(0.55 0.03 255)" }} />
                </div>
                <p className="text-xs mb-3" style={{ color: "oklch(0.58 0.03 255)" }}>
                  הגעת למכסה השבועית. פרימיום נותן לך הצעות יומיות ללא הגבלה.
                </p>
                <button
                  onClick={onUpgrade}
                  className="rounded-xl px-4 py-2 text-xs font-black text-white gradient-cta transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ boxShadow: "0 3px 10px oklch(0.65 0.14 140 / 0.3)" }}
                >
                  שדרג לפרימיום
                </button>
              </div>
            )}
          </>
        );
      })()}

      {/* Saved confirmation strip */}
      {saved.size > 0 && (
        <div
          className="rounded-2xl p-4 text-right mb-5"
          style={{ background: "oklch(0.88 0.08 140 / 0.15)", border: "1px solid oklch(0.75 0.10 140 / 0.3)" }}
        >
          <p className="text-sm font-black" style={{ color: "oklch(0.35 0.12 140)" }}>
            {saved.size} {saved.size === 1 ? "רגע נשמר" : "רגעים נשמרו"} ביומן שלך
          </p>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.08 140)" }}>
            עבור לטאב יומן כדי לראות אותם
          </p>
        </div>
      )}

      {/* Why BondFlow */}
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
            בססנו את ההמלצות על גיל הילדים ותחומי העניין שהגדרת. BondFlow מעדיף פעילויות שדורשות אפס הכנה ומתאימות לחלונות הזמן שזוהו.
          </p>
        )}
      </div>
    </div>
  );
}
