import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Sparkles, Heart } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className="rounded-[2rem] p-10 sm:p-16 text-center relative overflow-hidden"
          style={{ background: "oklch(0.95 0.03 85)" }}
        >
          {/* כדורים דקורטיביים */}
          <div
            className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{ background: "oklch(0.65 0.14 140)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "oklch(0.72 0.18 42)" }}
          />

          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.4)" }}
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
              הילדים שלך גדלים{" "}
              <span className="text-gradient">עכשיו.</span>
              <br />
              השבוע הזה חשוב.
            </h2>

            <p className="text-lg max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: "oklch(0.45 0.03 255)" }}>
              לא קראת עד לפה כי הצטרכת שכנוע שאתה אוהב את הילדים שלך.
              קראת עד לפה כי אתה מאמין שאפשר להרגיש פחות אשמה ויותר שמחה -
              בלי לעזוב את העבודה ובלי להעמיד פנים שהחיים פשוטים יותר ממה שהם.
            </p>

            <p className="text-base font-bold mb-10" style={{ color: "oklch(0.35 0.03 255)" }}>
              זה אפשרי. BondFlow נבנתה בדיוק לגרסה שלך - שקיימת עכשיו.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth"
                className={buttonVariants({ size: "lg" }) + " gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-14 px-10 text-base font-black shadow-lg w-full sm:w-auto"}
                style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
              >
                <Sparkles className="w-4 h-4 ml-2" />
                מצא את הרגע המשפחתי הראשון שלי - בחינם
              </Link>
            </div>

            <p className="text-xs mt-4" style={{ color: "oklch(0.6 0.03 255)" }}>
              ללא כרטיס אשראי - הגדרה של 3 דקות - עובד עם היומן הקיים שלך
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
