"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X, LogOut, Crown, Sparkles, User, Mail,
  ChevronLeft, Calendar, CheckCircle2, Clock, ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  avatarInitial: string;
  avatarColor: string;
  memberSince: string;
  plan: "free" | "premium";
  planLabel: string;
  stats: {
    totalMoments: number;
    weeksActive: number;
    childrenCount: number;
  };
}

const PLAN_FEATURES = {
  free: [
    "3 הצעות פעילות בשבוע",
    "ציון חיבור בסיסי",
    "חסימת יומן בלחיצה אחת",
  ],
  premium: [
    "הצעות יומיות ללא הגבלה",
    "דוח חיבור שבועי מלא",
    "עד 4 פרופילי ילדים",
    "לוח שנה ישראלי - חגים",
    "מעקב רצף + אבני דרך",
  ],
};

const HEBREW_MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

function formatMemberSince(isoDate: string): string {
  const d = new Date(isoDate);
  return `${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const DEFAULT_DATA: UserData = {
  name: "...",
  email: "...",
  avatarInitial: "?",
  avatarColor: "oklch(0.65 0.14 140)",
  memberSince: "...",
  plan: "free",
  planLabel: "חינמי",
  stats: { totalMoments: 0, weeksActive: 0, childrenCount: 0 },
};

export default function ProfileSidebar({ open, onClose }: ProfileSidebarProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>(DEFAULT_DATA);

  useEffect(() => {
    if (!open) return; // only load when sidebar opens
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      // Children count
      const { count: childrenCount } = await supabase
        .from("children")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Saved moments count
      const { count: momentsCount } = await supabase
        .from("saved_moments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Weeks active (count distinct weeks with saved suggestions)
      const { data: scores } = await supabase
        .from("weekly_scores")
        .select("week_number")
        .eq("user_id", user.id);

      const name = profile?.full_name ?? user.email?.split("@")[0] ?? "משתמש";
      const initial = name[0] ?? "?";

      setUserData({
        name,
        email: user.email ?? "",
        avatarInitial: initial,
        avatarColor: "oklch(0.65 0.14 140)",
        memberSince: formatMemberSince(user.created_at),
        plan: "free",
        planLabel: "חינמי",
        stats: {
          totalMoments: momentsCount ?? 0,
          weeksActive: scores?.length ?? 0,
          childrenCount: childrenCount ?? 0,
        },
      });
    }
    load();
  }, [open]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/auth");
  };

  const user = userData;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "oklch(0 0 0 / 0.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer - slides in from the LEFT */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[300px] max-w-[85vw] transition-transform duration-300 ease-out"
        style={{
          background: "white",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: "8px 0 40px oklch(0 0 0 / 0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-12 pb-4 border-b"
          style={{ borderColor: "oklch(0.93 0.02 85)" }}
        >
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[oklch(0.95_0.01_85)]"
            style={{ color: "oklch(0.5 0.03 255)" }}
          >
            <X className="w-4 h-4" />
          </button>
          <span className="font-black text-sm" style={{ color: "oklch(0.35 0.03 255)" }}>
            פרופיל
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Avatar + name block */}
          <div
            className="mx-4 mt-4 rounded-2xl p-5 text-right"
            style={{ background: "oklch(0.97 0.01 85)" }}
          >
            <div className="flex items-center gap-3 mb-1 flex-row-reverse">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                style={{ background: user.avatarColor }}
              >
                {user.avatarInitial}
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="font-black text-base leading-tight truncate" style={{ color: "oklch(0.2 0.03 255)" }}>
                  {user.name}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>
                  חבר מ-{user.memberSince}
                </p>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="mx-4 mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: "oklch(0.93 0.02 85)" }}>
            <div
              className="flex items-center gap-3 px-4 py-3 text-right"
              style={{ background: "white" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "oklch(0.55 0.03 255)" }}>
                  {user.email}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.7 0.03 255)" }}>אימייל</p>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.95 0.01 85)" }}
              >
                <Mail className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
              </div>
            </div>
          </div>

          {/* Subscription card */}
          <div className="mx-4 mt-3">
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: user.plan === "premium"
                  ? "oklch(0.28 0.05 255)"
                  : "oklch(0.95 0.03 85)",
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-2.5 py-1"
                    style={{
                      background: user.plan === "premium"
                        ? "oklch(0.72 0.18 42)"
                        : "oklch(0.88 0.02 85)",
                    }}
                  >
                    {user.plan === "premium"
                      ? <Crown className="w-3 h-3 text-white" />
                      : <Sparkles className="w-3 h-3" style={{ color: "oklch(0.55 0.03 255)" }} />}
                    <span
                      className="text-xs font-black"
                      style={{ color: user.plan === "premium" ? "white" : "oklch(0.45 0.03 255)" }}
                    >
                      {user.planLabel}
                    </span>
                  </div>
                  <p
                    className="text-xs font-bold"
                    style={{ color: user.plan === "premium" ? "white" : "oklch(0.35 0.03 255)" }}
                  >
                    מנוי פעיל
                  </p>
                </div>

                <ul className="flex flex-col gap-1.5 text-right">
                  {PLAN_FEATURES[user.plan].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 flex-row-reverse">
                      <CheckCircle2
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: "oklch(0.65 0.14 140)" }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: user.plan === "premium" ? "oklch(0.75 0.05 255)" : "oklch(0.5 0.03 255)" }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {user.plan === "free" && (
                  <button
                    className="mt-4 w-full rounded-xl py-2 text-xs font-black text-white gradient-cta"
                    style={{ boxShadow: "0 4px 12px oklch(0.65 0.14 140 / 0.3)" }}
                  >
                    שדרג לפרימיום - ₪49/חודש
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity stats */}
          <div className="mx-4 mt-3 rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 85)", background: "white" }}>
            <p className="text-xs font-black px-4 pt-3 pb-2 text-right" style={{ color: "oklch(0.5 0.03 255)" }}>
              הסטטיסטיקות שלך
            </p>
            {[
              { Icon: Calendar, label: "רגעים משפחתיים סה\"כ", value: user.stats.totalMoments },
              { Icon: Clock, label: "שבועות פעילים", value: user.stats.weeksActive },
              { Icon: ShieldCheck, label: "ילדים בפרופיל", value: `${user.stats.childrenCount} ילדים` },
            ].map(({ Icon, label, value }, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border-t text-right"
                style={{ borderColor: "oklch(0.95 0.01 85)" }}
              >
                <span className="text-sm font-black" style={{ color: "oklch(0.65 0.14 140)" }}>
                  {value}
                </span>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.95 0.01 85)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                  </div>
                  <span className="text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Edit profile link */}
          <div className="mx-4 mt-3">
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-right transition-colors hover:bg-[oklch(0.97_0.01_85)]"
              style={{ borderColor: "oklch(0.93 0.02 85)", background: "white" }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />
              <div className="flex items-center gap-2 flex-row-reverse">
                <User className="w-4 h-4" style={{ color: "oklch(0.65 0.14 140)" }} />
                <span className="text-sm font-semibold" style={{ color: "oklch(0.35 0.03 255)" }}>עריכת פרופיל</span>
              </div>
            </button>
          </div>

          <div className="h-6" />
        </div>

        {/* Logout button */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "oklch(0.93 0.02 85)", background: "white" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] hover:opacity-90"
            style={{
              background: "oklch(0.97 0.02 25)",
              border: "1.5px solid oklch(0.85 0.06 25)",
              color: "oklch(0.55 0.18 25)",
            }}
          >
            <LogOut className="w-4 h-4" />
            יציאה מהחשבון
          </button>
        </div>
      </div>
    </>
  );
}
