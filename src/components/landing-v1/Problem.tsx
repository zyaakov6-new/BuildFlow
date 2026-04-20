import { AlertCircle, Smartphone, Car, CalendarX } from "lucide-react";

const painPoints = [
  {
    Icon: AlertCircle,
    text: 'אמרת "רגע". הרגע הזה לא הגיע.',
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    Icon: Smartphone,
    text: "ב-23:00 ראית משפחות אחרות באינסטגרם.",
    color: "oklch(0.55 0.18 255)",
    bg: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    Icon: Car,
    text: "פקקים, ישיבות, ארוחת ערב. עוד יום על אוטומט.",
    color: "oklch(0.65 0.14 140)",
    bg: "oklch(0.88 0.08 140 / 0.12)",
  },
  {
    Icon: CalendarX,
    text: "תכננת לסופ״ש. יום ראשון הגיע בלי שזה קרה.",
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.15)",
  },
];

export default function Problem() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-5 justify-center">
          <AlertCircle className="w-4 h-4" style={{ color: "oklch(0.72 0.18 42)" }} />
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "oklch(0.72 0.18 42)" }}>
            אתה לא לבד
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-center mb-10 leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
          הבעיה היא לא שאכפת לך פחות.
          <br />
          <span className="text-gradient">פשוט אין לך מקום לנשום.</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {painPoints.map((point, i) => {
            const Icon = point.Icon;
            return (
              <div
                key={i}
                className="rounded-2xl p-4 flex gap-3 items-center card-hover"
                style={{ background: point.bg }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${point.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: point.color }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "oklch(0.35 0.03 255)" }}>
                  {point.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden" style={{ background: "oklch(0.95 0.03 85)" }}>
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
          <h3 className="relative z-10 text-xl sm:text-2xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
            אתה לא צריך יותר זמן.{" "}
            <span className="text-gradient">אתה צריך תוכנית שמתאימה לחיים שלך.</span>
          </h3>
          <p className="relative z-10 text-sm max-w-md mx-auto" style={{ color: "oklch(0.5 0.03 255)" }}>
            BondFlow מחפשת את החלונות הקטנים, וממלאת אותם ברגעים שאפשר באמת לעשות.
          </p>
        </div>
      </div>
    </section>
  );
}
