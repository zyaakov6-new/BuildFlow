"use client";

import { useState } from "react";
import { Sparkles, Trophy, Heart, Calendar, Lock, Globe, Smartphone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    Icon: Trophy,
    value: "3-5 שעות",
    label: "של זמן איכות שבועי חוזר כשיש כוונה ותכנון פשוט.",
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.2)",
  },
  {
    Icon: Heart,
    value: "73%",
    label: "מההורים מדווחים על אשמה סביב חוסר זמן איכות.",
    color: "oklch(0.65 0.14 140)",
    bg: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    Icon: Calendar,
    value: "20 דקות",
    label: "של נוכחות מכוונת כבר יכולות לשנות את התחושה בבית.",
    color: "oklch(0.55 0.18 255)",
    bg: "oklch(0.90 0.06 255 / 0.12)",
  },
];

const trustBadges = [
  { Icon: Lock, text: "נתוני היומן פרטיים לגמרי" },
  { Icon: Globe, text: "ממשק מלא בעברית" },
  { Icon: MapPin, text: "נבנה ללוח הישראלי" },
  { Icon: Smartphone, text: "iOS + Android + Google / Apple Calendar" },
];

export default function SocialProof() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-14" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {trustBadges.map((badge, i) => {
            const Icon = badge.Icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: "white", border: "1px solid oklch(0.9 0.02 85)", color: "oklch(0.45 0.03 255)" }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.65 0.14 140)" }} />
                <span>{badge.text}</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden" style={{ background: "oklch(0.28 0.05 255)" }}>
          <div className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
          <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "oklch(0.65 0.14 140)" }}>
              גישה מוקדמת
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              רוצים לנסות ראשונים?
            </h3>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "oklch(0.72 0.05 255)" }}>
              השאירו מייל ונעדכן כשנפתחת הגישה המוקדמת.
            </p>

            {submitted ? (
              <div
                className="rounded-2xl px-8 py-6 inline-block"
                style={{ background: "oklch(0.65 0.14 140 / 0.2)", border: "1px solid oklch(0.65 0.14 140 / 0.4)" }}
              >
                <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.75 0.14 140)" }} />
                <p className="font-black text-white text-lg">נרשמת בהצלחה</p>
                <p className="text-sm mt-1" style={{ color: "oklch(0.72 0.05 255)" }}>
                  נעדכן אותך כשנפתח.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="המייל שלך"
                  required
                  className="flex-1 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none text-right"
                  style={{ background: "oklch(1 0 0 / 0.1)", border: "1px solid oklch(1 0 0 / 0.2)", color: "white" }}
                />
                <Button
                  type="submit"
                  className="gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-12 px-6 font-bold whitespace-nowrap"
                  style={{ boxShadow: "0 4px 16px oklch(0.65 0.14 140 / 0.4)" }}
                >
                  <Sparkles className="w-4 h-4 ml-1.5" />
                  שמרו לי מקום
                </Button>
              </form>
            )}

            <p className="text-xs mt-4" style={{ color: "oklch(0.55 0.05 255)" }}>
              בלי ספאם. רק עדכונים חשובים.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
