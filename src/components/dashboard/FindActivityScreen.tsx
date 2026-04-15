"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles, ChevronLeft, RefreshCw, CheckCircle2, Clock,
  Blocks, BookOpen, Pencil, TreePine, Music, Utensils,
  Dumbbell, FlaskConical, Palette, Puzzle, Heart,
} from "lucide-react";
import { toast } from "sonner";

// ---- Types ----
interface Child {
  id: string;
  name: string;
  age_group: string;
  avatar_color: string | null;
}

interface Activity {
  title: string;
  description: string;
  duration_min: number;
  prep_min: number;
  category: string;
  accent_color: string;
  bg_color: string;
}

// ---- Helpers ----
function getInitials(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

function iconForCategory(category: string | null) {
  switch (category) {
    case "lego":        return Blocks;
    case "reading":     return BookOpen;
    case "drawing":     return Pencil;
    case "nature":      return TreePine;
    case "music":       return Music;
    case "dance":       return Music;
    case "cooking":     return Utensils;
    case "sports":      return Dumbbell;
    case "science":     return FlaskConical;
    case "art":         return Palette;
    case "games":       return Puzzle;
    case "storytelling": return BookOpen;
    default:            return Heart;
  }
}

function prepLabel(prepMin: number): string {
  if (prepMin === 0) return "אפס הכנה";
  if (prepMin <= 5)  return "הכנה קלה";
  return "קצת הכנה";
}

// ---- Loading dots animation ----
function LoadingDots() {
  return (
    <div className="flex gap-2 justify-center items-center mt-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full animate-bounce"
          style={{
            background: "oklch(0.65 0.14 140)",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

// ---- Main Component ----
export default function FindActivityScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Step: "pick" | "loading" | "result"
  const [step, setStep] = useState<"pick" | "loading" | "result">("pick");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [shownTitles, setShownTitles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load children on mount
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("children")
        .select("id, name, age_group, avatar_color")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      setChildren(data ?? []);
      setLoadingChildren(false);
    })();
  }, []);

  const fetchActivity = useCallback(async (child: Child, exclude: string[]) => {
    setStep("loading");
    setActivity(null);
    setSaved(false);

    try {
      const excludeParam = exclude.length > 0 ? `&exclude=${encodeURIComponent(exclude.join(","))}` : "";
      const res = await fetch(`/api/suggest-one?child_id=${child.id}${excludeParam}`);
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      setActivity(json.activity ?? null);
      setStep("result");
    } catch {
      toast.error("לא הצלחנו למצוא פעילות. נסה שוב.");
      setStep("pick");
    }
  }, []);

  const handlePickChild = (child: Child) => {
    setSelectedChild(child);
    setShownTitles([]);
    fetchActivity(child, []);
  };

  const handleNext = () => {
    if (!selectedChild || !activity) return;
    const newExcludes = [...shownTitles, activity.title];
    setShownTitles(newExcludes);
    fetchActivity(selectedChild, newExcludes);
  };

  const handleChangeChild = () => {
    setStep("pick");
    setSelectedChild(null);
    setActivity(null);
    setShownTitles([]);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!activity || !selectedChild || saving || saved) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("no user");

      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1);
      scheduledAt.setHours(17, 0, 0, 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("saved_moments").insert({
        user_id: user.id,
        child_id: selectedChild.id,
        title: activity.title,
        description: activity.description,
        duration_min: activity.duration_min,
        prep_min: activity.prep_min,
        category: activity.category,
        accent_color: activity.accent_color,
        bg_color: activity.bg_color,
        scheduled_at: scheduledAt.toISOString(),
        completed: false,
      });

      if (error) throw error;
      setSaved(true);
      toast.success("הפעילות נשמרה ליומן! 🎉");
    } catch {
      toast.error("שגיאה בשמירה. נסה שוב.");
    } finally {
      setSaving(false);
    }
  };

  // ---- STEP: Pick child ----
  if (step === "pick") {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-right">
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ms-auto"
            style={{ background: "oklch(0.88 0.08 140 / 0.25)" }}
          >
            <Sparkles className="w-7 h-7" style={{ color: "oklch(0.55 0.14 140)" }} />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: "oklch(0.18 0.03 255)" }}>
            מצא פעילות
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
            עם איזה ילד תרצה לבלות היום?
          </p>
        </div>

        {loadingChildren ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse"
                style={{ background: "oklch(0.92 0.02 85)" }}
              />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-12" style={{ color: "oklch(0.55 0.03 255)" }}>
            <p className="text-sm">לא נמצאו ילדים בחשבון שלך.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => handlePickChild(child)}
                className="w-full flex items-center gap-4 rounded-2xl p-5 border text-right transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "white",
                  borderColor: "oklch(0.91 0.03 85)",
                  boxShadow: "0 2px 12px oklch(0 0 0 / 0.05)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                  style={{ background: child.avatar_color ?? "oklch(0.65 0.14 140)" }}
                >
                  {getInitials(child.name)}
                </div>
                {/* Info */}
                <div className="flex-1">
                  <p className="text-base font-bold" style={{ color: "oklch(0.18 0.03 255)" }}>
                    {child.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 255)" }}>
                    גיל {child.age_group}
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.70 0.03 255)" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- STEP: Loading ----
  if (step === "loading") {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "oklch(0.88 0.08 140 / 0.25)" }}
        >
          <Sparkles className="w-8 h-8" style={{ color: "oklch(0.55 0.14 140)" }} />
        </div>
        <p className="text-lg font-bold mb-1 text-center" style={{ color: "oklch(0.18 0.03 255)" }}>
          מחפש פעילות מושלמת...
        </p>
        <p className="text-sm text-center mb-4" style={{ color: "oklch(0.55 0.03 255)" }}>
          {selectedChild ? `בשביל ${selectedChild.name}` : ""}
        </p>
        <LoadingDots />
      </div>
    );
  }

  // ---- STEP: Result ----
  if (step === "result" && activity) {
    const IconComp = iconForCategory(activity.category);

    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-right">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleChangeChild}
            className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.55 0.03 255)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>החלף ילד</span>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ background: selectedChild?.avatar_color ?? "oklch(0.65 0.14 140)" }}
            >
              {selectedChild ? getInitials(selectedChild.name) : "?"}
            </div>
            <span className="text-sm font-bold" style={{ color: "oklch(0.18 0.03 255)" }}>
              {selectedChild?.name}
            </span>
          </div>
        </div>

        {/* Activity card */}
        <div
          className="rounded-3xl p-6 border mb-5"
          style={{
            background: activity.bg_color,
            borderColor: activity.accent_color + "33",
            boxShadow: "0 4px 24px oklch(0 0 0 / 0.07)",
          }}
        >
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: activity.accent_color + "22" }}
            >
              <IconComp className="w-6 h-6" style={{ color: activity.accent_color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black leading-tight" style={{ color: "oklch(0.18 0.03 255)" }}>
                {activity.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-5" style={{ color: "oklch(0.35 0.03 255)" }}>
            {activity.description}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 justify-end">
            <span
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold"
              style={{ background: "white", color: "oklch(0.45 0.03 255)" }}
            >
              <Clock className="w-3 h-3" />
              {activity.duration_min} דק&apos;
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold"
              style={{
                background: activity.accent_color + "18",
                color: activity.accent_color,
              }}
            >
              {prepLabel(activity.prep_min)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: saved
                ? "oklch(0.55 0.14 140)"
                : "oklch(0.55 0.14 140)",
              color: "white",
              boxShadow: saved ? "none" : "0 4px 16px oklch(0.55 0.14 140 / 0.35)",
            }}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                נשמר ביומן!
              </span>
            ) : saving ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                שומר...
              </span>
            ) : (
              "שמור ביומן"
            )}
          </button>

          {/* Next suggestion */}
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl font-bold text-sm border transition-all active:scale-[0.98]"
            style={{
              background: "white",
              borderColor: "oklch(0.88 0.03 85)",
              color: "oklch(0.40 0.03 255)",
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              פעילות אחרת
            </span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
