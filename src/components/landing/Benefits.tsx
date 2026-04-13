import { Clock, TrendingUp, Target, Flag, Brain, BarChart2, X, Check } from "lucide-react";

const benefits = [
  {
    Icon: Clock,
    title: "הפוך 20 דקות לזיכרונות שנשארים",
    description: "לא כל רגע משפחתי צריך להיות טיול של יום שלם. BondFlow הופכת חלונות קטנים - לפני ארוחת הערב, אחרי בית הספר, שבת בבוקר - לחיבור אמיתי שנשאר.",
    color: "oklch(0.65 0.14 140)",
    bg: "oklch(0.88 0.08 140 / 0.12)",
  },
  {
    Icon: TrendingUp,
    title: "ראה את האשמה נעלמת - באמת",
    description: "ציון החיבור המשפחתי שלך לא משקר. כשאתה רואה את הרגעים מצטברים, המוח שלך סוף סוף מאמין: אתה מופיע. לאשמה הזאת יש עכשיו נתונים שנלחמים נגדה.",
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    Icon: Target,
    title: "פעילויות שהילד שלך באמת ירצה לעשות",
    description: "לא מהפינטרסט. לא קשה להכנה. הצעות אמיתיות לפי גיל הילד, ההתמכרויות הנוכחיות שלו, וטווח הקשב שלו. ילד שמת על מיינקראפט מקבל מיינקראפט - לא \"בוא נבנה בית ציפורים.\"",
    color: "oklch(0.55 0.18 255)",
    bg: "oklch(0.90 0.06 255 / 0.12)",
  },
  {
    Icon: Flag,
    title: "נבנה לחיי משפחה ישראלית",
    description: "שעות בית הספר. חגים. בלגן החופש הגדול. BondFlow מבינה את הלוח הישראלי, לא האמריקאי. היא מדברת עברית, אנגלית - ואת החיים שלך.",
    color: "oklch(0.65 0.14 140)",
    bg: "oklch(0.88 0.08 140 / 0.12)",
  },
  {
    Icon: Brain,
    title: "אפס עומס מנטלי נוסף",
    description: "אתה כבר סוחב הכל. BondFlow סוחבת את התכנון. אתה רק מגיע ומופיע - בלי מחקר, בלי הכנה, בלי עייפות של יותר מדי החלטות.",
    color: "oklch(0.72 0.18 42)",
    bg: "oklch(0.92 0.06 60 / 0.15)",
  },
  {
    Icon: BarChart2,
    title: "התקדמות שאפשר לראות",
    description: "דוחות שבועיים. רצפים חודשיים. רגעי אבן דרך. כשהילד שלך אומר \"אבא, זוכר מה עשינו?\" - BondFlow עזרה לגרום לזה לקרות.",
    color: "oklch(0.55 0.18 255)",
    bg: "oklch(0.90 0.06 255 / 0.12)",
  },
];

const before = [
  "עוד שבת עברה בלי תכנון",
  "אשמה כל לילה",
  "אומר 'יותר מאוחר' הרבה מדי פעמים",
  "תוהה אם אתה כושל בהם",
];

const after = [
  "רגעים משפחתיים חסומים השבוע",
  "ציון החיבור שלך עולה",
  "הילד שלך מבקש 'זמן BondFlow'",
  "אתה יודע: אתה מופיע",
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "oklch(0.72 0.18 42)" }}>
            מה משתנה
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
            מה קורה כשBondFlow
            <br />
            <span className="text-gradient">לצדך</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.Icon;
            return (
              <div
                key={i}
                className="rounded-3xl p-6 sm:p-7 card-hover border"
                style={{ borderColor: "oklch(0.92 0.02 85)", background: "white" }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: b.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: b.color }} />
                </div>
                <h3 className="text-base font-black mb-2 leading-snug" style={{ color: "oklch(0.2 0.03 255)" }}>
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.5 0.03 255)" }}>
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl p-8 sm:p-10 text-center gradient-cta">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-6">
            לפני BondFlow לעומת אחרי BondFlow
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 text-right">
            <div className="rounded-2xl p-5" style={{ background: "oklch(1 0 0 / 0.08)" }}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-3">לפני</p>
              {before.map((item, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-50 text-white" />
                  <p className="text-white/75 text-sm">{item}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-5" style={{ background: "oklch(1 0 0 / 0.15)" }}>
              <p className="text-white/90 text-xs font-black uppercase tracking-wider mb-3">אחרי</p>
              {after.map((item, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white" strokeWidth={3} />
                  <p className="text-white text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
