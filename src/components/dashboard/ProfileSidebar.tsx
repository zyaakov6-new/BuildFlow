"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X, LogOut, Crown, Sparkles, User, Mail,
  ChevronLeft, Calendar, CheckCircle2, Clock, ShieldCheck,
  Plus, Trash2, Baby, Pencil,
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

const AGE_GROUPS = ["0-2", "3-5", "6-8", "9-12", "13+"];
const INTEREST_OPTIONS = [
  "לגו", "ציור", "ספרים", "מוזיקה", "כדורגל", "טבע",
  "דינוזאורים", "בישול", "מיינקראפט", "ריקוד",
  "משחקי קופסא", "טיולים", "שחייה", "מדע", "אנימציה", "אומנות",
];
const CHILD_COLORS = [
  "oklch(0.72 0.18 42)", "oklch(0.60 0.18 280)", "oklch(0.55 0.14 140)",
  "oklch(0.58 0.18 20)", "oklch(0.55 0.16 320)",
];

interface ChildRecord {
  id: string;
  name: string;
  age_group: string;
  interests: string[];
  avatar_color: string | null;
}

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
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Children state
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [childForm, setChildForm] = useState({ name: "", age_group: "6-8", interests: [] as string[] });
  const [savingChild, setSavingChild] = useState(false);

  useEffect(() => {
    if (!open) return;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, childrenRes, momentsRes, scoresRes] = await Promise.allSettled([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("children").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("saved_moments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("weekly_scores").select("week_number").eq("user_id", user.id),
      ]);

      const profileData = profileRes.status === "fulfilled" ? profileRes.value.data : null;
      const kidsData    = childrenRes.status === "fulfilled" ? (childrenRes.value.data ?? []) as ChildRecord[] : [];
      const momentsCount = momentsRes.status === "fulfilled" ? (momentsRes.value.count ?? 0) : 0;
      const scoresData   = scoresRes.status === "fulfilled"  ? (scoresRes.value.data ?? []) : [];

      const name = profileData?.full_name ?? user.email?.split("@")[0] ?? "משתמש";
      setChildren(kidsData);

      setUserData({
        name,
        email: user.email ?? "",
        avatarInitial: name[0] ?? "?",
        avatarColor: "oklch(0.65 0.14 140)",
        memberSince: formatMemberSince(user.created_at),
        plan: "free",
        planLabel: "חינמי",
        stats: {
          totalMoments: momentsCount,
          weeksActive: scoresData.length,
          childrenCount: kidsData.length,
        },
      });
    }
    load();
  }, [open]);

  const handleAddChild = async () => {
    if (!childForm.name.trim()) return;
    setSavingChild(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const color = CHILD_COLORS[children.length % CHILD_COLORS.length];
      const { data: newChild } = await supabase.from("children").insert({
        user_id: user.id,
        name: childForm.name.trim(),
        age_group: childForm.age_group,
        interests: childForm.interests,
        avatar_color: color,
      }).select().single();

      if (newChild) {
        setChildren((prev) => [...prev, newChild as ChildRecord]);
        setUserData((prev) => ({ ...prev, stats: { ...prev.stats, childrenCount: prev.stats.childrenCount + 1 } }));
      }
      setChildForm({ name: "", age_group: "6-8", interests: [] });
      setAddingChild(false);
    } catch (e) {
      console.error("Failed to add child:", e);
    } finally {
      setSavingChild(false);
    }
  };

  const handleUpdateChild = async (id: string) => {
    if (!childForm.name.trim()) return;
    setSavingChild(true);
    try {
      const supabase = createClient();
      await supabase.from("children").update({
        name: childForm.name.trim(),
        age_group: childForm.age_group,
        interests: childForm.interests,
      }).eq("id", id);

      setChildren((prev) => prev.map((c) =>
        c.id === id ? { ...c, name: childForm.name.trim(), age_group: childForm.age_group, interests: childForm.interests } : c
      ));
      setEditingChildId(null);
    } catch (e) {
      console.error("Failed to update child:", e);
    } finally {
      setSavingChild(false);
    }
  };

  const handleDeleteChild = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from("children").delete().eq("id", id);
      setChildren((prev) => prev.filter((c) => c.id !== id));
      setUserData((prev) => ({ ...prev, stats: { ...prev.stats, childrenCount: prev.stats.childrenCount - 1 } }));
    } catch (e) {
      console.error("Failed to delete child:", e);
    }
  };

  const openEditChild = (child: ChildRecord) => {
    setEditingChildId(child.id);
    setAddingChild(false);
    setChildForm({ name: child.name, age_group: child.age_group, interests: child.interests });
  };

  const toggleInterest = (interest: string) => {
    setChildForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: nameInput.trim() }).eq("id", user.id);
      setUserData((prev) => ({ ...prev, name: nameInput.trim(), avatarInitial: nameInput.trim()[0] ?? "?" }));
    }
    setSavingName(false);
    setEditingName(false);
  };

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

          {/* Children management */}
          <div className="mx-4 mt-3">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 85)", background: "white" }}>
              {/* Section header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <button
                  onClick={() => { setAddingChild(true); setEditingChildId(null); setChildForm({ name: "", age_group: "6-8", interests: [] }); }}
                  className="flex items-center gap-1 text-xs font-bold rounded-lg px-2 py-1 transition-colors hover:bg-[oklch(0.93_0.04_140_/_0.2)]"
                  style={{ color: "oklch(0.52 0.14 140)" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  הוסף
                </button>
                <div className="flex items-center gap-1.5 flex-row-reverse">
                  <Baby className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                  <p className="text-xs font-black" style={{ color: "oklch(0.35 0.03 255)" }}>הילדים שלי</p>
                </div>
              </div>

              {/* Existing children */}
              {children.length === 0 && !addingChild && (
                <p className="text-xs text-right px-4 pb-3" style={{ color: "oklch(0.65 0.03 255)" }}>
                  עדיין לא הוספת ילדים
                </p>
              )}

              {children.map((child) => (
                <div key={child.id}>
                  {editingChildId === child.id ? (
                    /* Edit form */
                    <div className="border-t px-4 py-3" style={{ borderColor: "oklch(0.95 0.01 85)", background: "oklch(0.98 0.01 85)" }}>
                      <input
                        type="text"
                        value={childForm.name}
                        onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="שם הילד"
                        dir="rtl"
                        className="w-full rounded-xl px-3 py-2 text-sm text-right outline-none mb-2 border-2 focus:border-[oklch(0.65_0.14_140)]"
                        style={{ borderColor: "oklch(0.90 0.02 85)", background: "white" }}
                      />
                      <select
                        value={childForm.age_group}
                        onChange={(e) => setChildForm((p) => ({ ...p, age_group: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2 text-sm text-right outline-none mb-2 border-2"
                        style={{ borderColor: "oklch(0.90 0.02 85)", background: "white", direction: "rtl" }}
                      >
                        {AGE_GROUPS.map((g) => <option key={g} value={g}>גיל {g}</option>)}
                      </select>
                      <p className="text-xs font-bold text-right mb-1.5" style={{ color: "oklch(0.55 0.03 255)" }}>תחומי עניין</p>
                      <div className="flex flex-wrap gap-1.5 flex-row-reverse mb-3">
                        {INTEREST_OPTIONS.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className="rounded-full px-2.5 py-1 text-xs font-semibold transition-all"
                            style={{
                              background: childForm.interests.includes(interest) ? "oklch(0.65 0.14 140)" : "white",
                              color: childForm.interests.includes(interest) ? "white" : "oklch(0.5 0.03 255)",
                              border: `1px solid ${childForm.interests.includes(interest) ? "oklch(0.65 0.14 140)" : "oklch(0.88 0.02 85)"}`,
                            }}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingChildId(null)} className="flex-1 rounded-xl py-1.5 text-xs font-bold border" style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.55 0.03 255)" }}>ביטול</button>
                        <button onClick={() => handleUpdateChild(child.id)} disabled={savingChild} className="flex-[2] rounded-xl py-1.5 text-xs font-black text-white disabled:opacity-60" style={{ background: "oklch(0.65 0.14 140)" }}>{savingChild ? "שומר..." : "שמור"}</button>
                      </div>
                    </div>
                  ) : (
                    /* Child row */
                    <div className="flex items-center gap-3 px-4 py-2.5 border-t" style={{ borderColor: "oklch(0.95 0.01 85)" }}>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => openEditChild(child)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[oklch(0.93_0.02_85)]" style={{ color: "oklch(0.65 0.03 255)" }}>
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteChild(child.id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[oklch(0.95_0.04_25)]" style={{ color: "oklch(0.65 0.10 25)" }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "oklch(0.25 0.03 255)" }}>{child.name}</p>
                        <p className="text-xs" style={{ color: "oklch(0.65 0.03 255)" }}>
                          גיל {child.age_group}
                          {child.interests.length > 0 && ` · ${child.interests.slice(0, 2).join(", ")}${child.interests.length > 2 ? "..." : ""}`}
                        </p>
                      </div>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ background: child.avatar_color ?? "oklch(0.65 0.14 140)" }}
                      >
                        {child.name[0]}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add child form */}
              {addingChild && (
                <div className="border-t px-4 py-3" style={{ borderColor: "oklch(0.95 0.01 85)", background: "oklch(0.98 0.01 85)" }}>
                  <input
                    type="text"
                    value={childForm.name}
                    onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="שם הילד"
                    dir="rtl"
                    className="w-full rounded-xl px-3 py-2 text-sm text-right outline-none mb-2 border-2 focus:border-[oklch(0.65_0.14_140)]"
                    style={{ borderColor: "oklch(0.90 0.02 85)", background: "white" }}
                    autoFocus
                  />
                  <select
                    value={childForm.age_group}
                    onChange={(e) => setChildForm((p) => ({ ...p, age_group: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2 text-sm text-right outline-none mb-2 border-2"
                    style={{ borderColor: "oklch(0.90 0.02 85)", background: "white", direction: "rtl" }}
                  >
                    {AGE_GROUPS.map((g) => <option key={g} value={g}>גיל {g}</option>)}
                  </select>
                  <p className="text-xs font-bold text-right mb-1.5" style={{ color: "oklch(0.55 0.03 255)" }}>תחומי עניין</p>
                  <div className="flex flex-wrap gap-1.5 flex-row-reverse mb-3">
                    {INTEREST_OPTIONS.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className="rounded-full px-2.5 py-1 text-xs font-semibold transition-all"
                        style={{
                          background: childForm.interests.includes(interest) ? "oklch(0.65 0.14 140)" : "white",
                          color: childForm.interests.includes(interest) ? "white" : "oklch(0.5 0.03 255)",
                          border: `1px solid ${childForm.interests.includes(interest) ? "oklch(0.65 0.14 140)" : "oklch(0.88 0.02 85)"}`,
                        }}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAddingChild(false)} className="flex-1 rounded-xl py-1.5 text-xs font-bold border" style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.55 0.03 255)" }}>ביטול</button>
                    <button onClick={handleAddChild} disabled={savingChild || !childForm.name.trim()} className="flex-[2] rounded-xl py-1.5 text-xs font-black text-white disabled:opacity-60" style={{ background: "oklch(0.65 0.14 140)" }}>{savingChild ? "שומר..." : "הוסף ילד"}</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit profile */}
          <div className="mx-4 mt-3">
            {!editingName ? (
              <button
                onClick={() => { setEditingName(true); setNameInput(userData.name); }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-right transition-colors hover:bg-[oklch(0.97_0.01_85)]"
                style={{ borderColor: "oklch(0.93 0.02 85)", background: "white" }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />
                <div className="flex items-center gap-2 flex-row-reverse">
                  <User className="w-4 h-4" style={{ color: "oklch(0.65 0.14 140)" }} />
                  <span className="text-sm font-semibold" style={{ color: "oklch(0.35 0.03 255)" }}>עריכת שם</span>
                </div>
              </button>
            ) : (
              <div className="rounded-2xl border p-4" style={{ borderColor: "oklch(0.88 0.04 140 / 0.5)", background: "white" }}>
                <p className="text-xs font-bold text-right mb-2" style={{ color: "oklch(0.52 0.03 255)" }}>שם מלא</p>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-right outline-none mb-3 border-2 focus:border-[oklch(0.65_0.14_140)]"
                  style={{ borderColor: "oklch(0.90 0.02 85)", background: "oklch(0.97 0.01 85)" }}
                  dir="rtl"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingName(false)}
                    className="flex-1 rounded-xl py-2 text-xs font-bold border transition-colors"
                    style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.55 0.03 255)" }}
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="flex-[2] rounded-xl py-2 text-xs font-black text-white disabled:opacity-60"
                    style={{ background: "oklch(0.65 0.14 140)" }}
                  >
                    {savingName ? "שומר..." : "שמור"}
                  </button>
                </div>
              </div>
            )}
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
