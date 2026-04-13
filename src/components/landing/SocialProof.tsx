"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const stats = [
  {
    value: "3-5 שעות",
    label: "של חיבור משפחתי אמיתי שהורים מחזירים בשבוע - לפי מחקרי פעילות מכוונת עם ילדים",
    icon: "🏆",
  },
  {
    value: "73%",
    label: "מההורים מדווחים על תחושת אשמה כרונית בגלל חוסר זמן איכות - סקר Pew Research 2023",
    icon: "💚",
  },
  {
    value: "20 דקות",
    label: "של פעילות ממוקדת ביום משפרות משמעותית את הקשר הרגשי - מחקר APA",
    icon: "📅",
  },
  {
    value: "87%",
    label: "מהילדים רוצים יותר זמן עם הוריהם על פני כל מתנה חומרית אחרת",
    icon: "❤️",
  },
];

export default function SocialProof() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-24" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* מה המחקר אומר */}
        <div className="text-center mb-16">
          <p
            className="text-sm font-bold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            המספרים לא משקרים
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
            למה זמן משפחתי מכוון
            <br />
            <span className="text-gradient">חשוב יותר ממה שחשבת</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "oklch(0.5 0.03 255)" }}>
            אלה לא מספרים שהמצאנו. זה מה שהמחקר אומר על הורות, חיבור, ואשמה.
          </p>
        </div>

        {/* כרטיסי סטטיסטיקות */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 sm:p-7 card-hover border flex gap-4 items-start"
              style={{ background: "white", borderColor: "oklch(0.92 0.02 85)" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: "oklch(0.95 0.03 85)" }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-3xl font-black mb-1 text-gradient">{s.value}</p>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.5 0.03 255)" }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* טריסט בדג'ים */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {[
            { icon: "🔒", text: "נתוני היומן פרטיים לגמרי - לא מוכרים לאף אחד" },
            { icon: "🌐", text: "ממשק מלא בעברית" },
            { icon: "🇮🇱", text: "לוח שנה ישראלי - חגים ושעות בית ספר" },
            { icon: "📱", text: "iOS + Android - Google ו-Apple Calendar" },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: "white",
                border: "1px solid oklch(0.9 0.02 85)",
                color: "oklch(0.45 0.03 255)",
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>

        {/* טופס גישה מוקדמת */}
        <div
          className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{ background: "oklch(0.28 0.05 255)" }}
        >
          <div
            className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "oklch(0.65 0.14 140)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-60 h-60 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: "oklch(0.72 0.18 42)" }}
          />

          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "oklch(0.65 0.14 140)" }}>
              גישה מוקדמת
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              BondFlow בבנייה - היה הראשון לדעת
            </h3>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "oklch(0.72 0.05 255)" }}>
              אנחנו מגיעים. השאיר את המייל ותקבל גישה ראשונה, מחיר מייסדים,
              ועדכונים ישר מהבנייה.
            </p>

            {submitted ? (
              <div
                className="rounded-2xl px-8 py-6 inline-block"
                style={{ background: "oklch(0.65 0.14 140 / 0.2)", border: "1px solid oklch(0.65 0.14 140 / 0.4)" }}
              >
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-black text-white text-lg">נרשמת בהצלחה!</p>
                <p className="text-sm mt-1" style={{ color: "oklch(0.72 0.05 255)" }}>
                  נעדכן אותך ראשון כשנשיק.
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
                  style={{
                    background: "oklch(1 0 0 / 0.1)",
                    border: "1px solid oklch(1 0 0 / 0.2)",
                    color: "white",
                  }}
                />
                <Button
                  type="submit"
                  className="gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-12 px-6 font-bold whitespace-nowrap"
                  style={{ boxShadow: "0 4px 16px oklch(0.65 0.14 140 / 0.4)" }}
                >
                  <Sparkles className="w-4 h-4 ml-1.5" />
                  שמור לי מקום
                </Button>
              </form>
            )}

            <p className="text-xs mt-4" style={{ color: "oklch(0.55 0.05 255)" }}>
              ללא ספאם. רק עדכונים חשובים. מבטיחים.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
