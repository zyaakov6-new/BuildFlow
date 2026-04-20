import { Calendar, Lightbulb, CalendarCheck, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    number: "01",
    title: "AI סורק את השבוע האמיתי שלך",
    description: "מחברים יומן. BondFlow מוצאת חלונות אמיתיים בין עבודה, איסופים וערב בבית.",
    color: "oklch(0.65 0.14 140)",
    bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    icon: Lightbulb,
    number: "02",
    title: "נכנסות רק הצעות שמתאימות לכם",
    description: "לפי גיל, תחביבים והזמן שיש עכשיו. לא רעיונות גנריים ולא הכנות מסובכות.",
    color: "oklch(0.72 0.18 42)",
    bgColor: "oklch(0.92 0.06 60 / 0.2)",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "לחיצה אחת והזמן נשמר",
    description: "אהבת רעיון? שומרים אותו מיד ביומן ומפסיקים להסתמך על ״אחר כך״.",
    color: "oklch(0.55 0.18 255)",
    bgColor: "oklch(0.90 0.06 255 / 0.15)",
  },
  {
    icon: MessageCircle,
    number: "04",
    title: "צ׳ק-אין קצר שמשפר את ההמשך",
    description: "אימוג׳י ושורה אחת. BondFlow לומדת מה עבד ומחדדת את ההצעות הבאות.",
    color: "oklch(0.65 0.14 140)",
    bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "oklch(0.65 0.14 140)" }}>
            איך זה עובד
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
            BondFlow מטפלת בתכנון.
            <br />
            <span className="text-gradient">אתה מקבל את הרגעים.</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "oklch(0.5 0.03 255)" }}>
            פחות לחשוב, יותר לעשות.
          </p>
        </div>

        <div className="relative">
          <div
            className="hidden lg:block absolute end-[2.25rem] top-8 bottom-8 w-0.5"
            style={{ background: "oklch(0.88 0.02 85)" }}
          />

          <div className="flex flex-col gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-5 items-start card-hover">
                  <div
                    className="flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center relative z-10 shadow-sm"
                    style={{
                      background: step.bgColor,
                      border: `1.5px solid ${step.color}30`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>

                  <div className="flex-1 rounded-2xl p-5 sm:p-6 bg-white">
                    <span className="text-xs font-black mb-2 block" style={{ color: step.color }}>
                      שלב {step.number}
                    </span>
                    <h3 className="text-lg font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "oklch(0.5 0.03 255)" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
