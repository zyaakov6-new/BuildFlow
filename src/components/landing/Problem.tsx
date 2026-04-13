import { AlertCircle, Smartphone, Car, CalendarX, Moon, PartyPopper } from "lucide-react";

const painPoints = [
  {
    Icon: AlertCircle,
    text: "אמרת לו \"רגע\" - והרגע לא הגיע.",
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    Icon: Smartphone,
    text: "גלשת ברשתות חברתיות בשעה 23:00 וראית משפחות אחרות עושות פעילויות יצירה. הרגשת עוד יותר גרוע.",
    color: "oklch(0.55 0.18 255)",
    bg: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    Icon: Car,
    text: "שעה בפקקים. שתי שעות ישיבות. ארוחת ערב מהמקפיא. עוד יום שעבר.",
    color: "oklch(0.65 0.14 140)",
    bg: "oklch(0.88 0.08 140 / 0.12)",
  },
  {
    Icon: CalendarX,
    text: "התכוונת לתכנן משהו לסוף השבוע. יום ראשון הגיע ולא קרה כלום.",
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    Icon: Moon,
    text: "עייף מדי בשמונה בערב. הילדים כבר במיטה. האשמה ערה לגמרי.",
    color: "oklch(0.55 0.18 255)",
    bg: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    Icon: PartyPopper,
    text: "חנוכה, פסח, חגים - הימים שאמורים להיות מחוברים הכי כאוטיים מתמיד.",
    color: "oklch(0.65 0.14 140)",
    bg: "oklch(0.88 0.08 140 / 0.12)",
  },
];

export default function Problem() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <AlertCircle className="w-4 h-4" style={{ color: "oklch(0.72 0.18 42)" }} />
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "oklch(0.72 0.18 42)" }}>
            אתה לא לבד
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-center mb-4 leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
          אתה מכיר את התחושה הזאת.
          <br />
          <span className="text-gradient">זאת שבאה בשעה עשר בלילה.</span>
        </h2>

        <p className="text-center text-lg mb-4 max-w-2xl mx-auto leading-relaxed" style={{ color: "oklch(0.5 0.03 255)" }}>
          סוף סוף הרדמת את הילדים. הבית שקט. ובמקום להרגיש הקלה - אתה מרגיש אותה.
          את הכבדות הזו, השקטה.
        </p>

        <p className="text-center text-xl font-bold italic mb-16 max-w-2xl mx-auto" style={{ color: "oklch(0.45 0.10 140)" }}>
          &quot;האם בכלל דיברתי איתם היום? או שסתם עשיתי להם לוגיסטיקה דרך עוד יום?&quot;
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {painPoints.map((point, i) => {
            const Icon = point.Icon;
            return (
              <div
                key={i}
                className="rounded-2xl p-5 flex gap-3 items-start card-hover"
                style={{ background: point.bg }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${point.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: point.color }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.03 255)" }}>
                  {point.text}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
          style={{ background: "oklch(0.95 0.03 85)" }}
        >
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
          <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "oklch(0.65 0.14 140)" }}>
            האמת
          </p>
          <h3 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
            אתה לא צריך <em>יותר</em> זמן.
            <br />
            אתה צריך להשתמש בזמן שיש לך -{" "}
            <span className="text-gradient">בצורה טובה יותר.</span>
          </h3>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "oklch(0.5 0.03 255)" }}>
            אבל למי יש כוח לתכנן את זה? אחרי עבודה, פקקים, ארוחת ערב, שיעורי בית
            ו-47 הודעות ווטסאפ? בדיוק בשביל זה בנינו את BondFlow.
          </p>
        </div>
      </div>
    </section>
  );
}
