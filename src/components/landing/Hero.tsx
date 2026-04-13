"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Sparkles, Calendar, Heart, Star, CheckCircle2, Quote } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero flex items-center overflow-hidden pt-16">
      {/* עיגולי רקע דקורטיביים */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.65 0.14 140)" }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.72 0.18 42)" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* טקסט ראשי */}
        <div className="flex flex-col gap-6">
          <Badge
            variant="secondary"
            className="w-fit px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: "oklch(0.88 0.08 140 / 0.3)",
              color: "oklch(0.45 0.14 140)",
              border: "1px solid oklch(0.65 0.14 140 / 0.3)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 ml-1.5" />
            AI לזמן משפחתי - נבנה במיוחד להורים ישראלים
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
            הילדים שלך לא צריכים{" "}
            <span className="text-gradient">עוד כסף.</span>
            <br />
            הם צריכים יותר{" "}
            <span className="italic text-gradient">אותך.</span>
          </h1>

          <p className="text-lg leading-relaxed max-w-lg" style={{ color: "oklch(0.45 0.03 255)" }}>
            BondFlow מוצאת את הרגעים האמיתיים שמתחבאים ביומן הבלתי אפשרי שלך -
            והופכת אותם לזיכרונות שהילדים שלך ידברו עליהם שנים.{" "}
            <span className="font-bold" style={{ color: "oklch(0.35 0.03 255)" }}>
              גם אם יש לך רק 20 דקות ביום שלישי.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth"
              className={buttonVariants({ size: "lg" }) + " gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-14 px-8 text-base font-bold shadow-lg"}
              style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
            >
              <Sparkles className="w-4 h-4 ml-2" />
              מצא את הרגע המשפחתי הראשון שלי - בחינם
            </Link>
          </div>

          <p className="text-sm" style={{ color: "oklch(0.6 0.03 255)" }}>
            ללא כרטיס אשראי - עובד עם Google ו-Apple Calendar - בעברית
          </p>

          {/* שורת אמון */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2 space-x-reverse">
              {["#F4845F", "#7DB87A", "#F5C842", "#A78BFA", "#60A5FA"].map((color, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: color }}
                >
                  {["מ", "א", "ש", "ד", "נ"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-current"
                    style={{ color: "oklch(0.72 0.18 42)" }}
                  />
                ))}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 255)" }}>
                <span className="font-bold" style={{ color: "oklch(0.35 0.03 255)" }}>
                  הצטרפו לרשימת הגישה המוקדמת
                </span>{" "}
                - היה הראשון לדעת
              </p>
            </div>
          </div>
        </div>

        {/* מוקאפ אפליקציה */}
        <div className="relative flex justify-center lg:justify-start">
          <div className="relative">
            {/* מסגרת טלפון */}
            <div
              className="w-72 sm:w-80 rounded-[2.5rem] p-2 shadow-2xl"
              style={{
                background: "oklch(0.25 0.04 255)",
                boxShadow: "0 40px 80px oklch(0.25 0.04 255 / 0.3), 0 0 0 1px oklch(0.4 0.04 255 / 0.5)",
              }}
            >
              <div className="rounded-[2rem] overflow-hidden" style={{ background: "oklch(0.97 0.01 85)" }}>
                {/* שורת סטטוס */}
                <div
                  className="px-6 py-3 flex justify-between items-center text-xs font-medium"
                  style={{ color: "oklch(0.45 0.03 255)" }}
                >
                  <span>9:41</span>
                  <div className="w-4 h-2 rounded-sm border border-current opacity-70" />
                </div>

                {/* כותרת אפליקציה */}
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-xl gradient-cta flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm" style={{ color: "oklch(0.28 0.05 255)" }}>
                      BondFlow
                    </span>
                  </div>

                  {/* ברכה */}
                  <p className="text-xs font-medium mb-1" style={{ color: "oklch(0.55 0.03 255)" }}>
                    ערב טוב, מיכל 👋
                  </p>
                  <p className="text-lg font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
                    יש לך 2 חלונות השבוע
                  </p>

                  {/* כרטיס פעילות */}
                  <div
                    className="rounded-2xl p-3 mb-3"
                    style={{ background: "oklch(0.88 0.08 140 / 0.25)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.14 140)" }} />
                      <span className="text-xs font-bold" style={{ color: "oklch(0.45 0.14 140)" }}>
                        שלישי - 17:30-18:00
                      </span>
                    </div>
                    <p className="text-sm font-black mb-1" style={{ color: "oklch(0.25 0.03 255)" }}>
                      🚂 בניית לגו רכבת
                    </p>
                    <p className="text-xs" style={{ color: "oklch(0.5 0.03 255)" }}>
                      מתאים ליואב, 5 - אפס הכנה - רק אתה
                    </p>
                    <button className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-white gradient-cta">
                      חסום את הזמן הזה
                    </button>
                  </div>

                  {/* ציון חיבור */}
                  <div
                    className="rounded-2xl p-3"
                    style={{ background: "oklch(0.92 0.06 60 / 0.3)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Heart
                          className="w-3.5 h-3.5 fill-current"
                          style={{ color: "oklch(0.72 0.18 42)" }}
                        />
                        <span className="text-xs font-bold" style={{ color: "oklch(0.45 0.12 42)" }}>
                          ציון חיבור משפחתי
                        </span>
                      </div>
                      <span className="text-sm font-black" style={{ color: "oklch(0.55 0.18 42)" }}>
                        78
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.85 0.06 60 / 0.5)" }}
                    >
                      <div
                        className="h-full rounded-full gradient-orange"
                        style={{ width: "78%" }}
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "oklch(0.55 0.08 42)" }}>
                      עלה ב-12 מהשבוע שעבר
                    </p>
                  </div>
                </div>

                {/* ניווט תחתון */}
                <div
                  className="border-t px-6 py-3 flex justify-around"
                  style={{ borderColor: "oklch(0.88 0.02 85)", background: "white" }}
                >
                  {["🏠", "📅", "💡", "📊"].map((icon, i) => (
                    <div key={i} className="text-lg" style={{ opacity: i === 0 ? 1 : 0.4 }}>
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* תגיות צפות */}
            <div
              className="absolute -top-4 -left-4 rounded-2xl px-3 py-2 shadow-lg text-xs font-bold flex items-center gap-1.5"
              style={{
                background: "white",
                color: "oklch(0.45 0.14 140)",
                boxShadow: "0 8px 24px oklch(0 0 0 / 0.12)",
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
              4 רגעים השבוע!
            </div>
            <div
              className="absolute -bottom-4 -right-6 rounded-2xl px-3 py-2 shadow-lg text-xs font-bold flex items-center gap-1.5"
              style={{
                background: "white",
                color: "oklch(0.45 0.12 42)",
                boxShadow: "0 8px 24px oklch(0 0 0 / 0.12)",
              }}
            >
              <Quote className="w-3 h-3 opacity-60" />
              אמא, נעשה שוב BondFlow?
            </div>
          </div>
        </div>
      </div>

      {/* גל תחתית */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12"
        >
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
