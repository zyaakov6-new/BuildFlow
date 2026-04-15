import Link from "next/link";

export const metadata = { title: "תנאי שימוש – BondFlow" };

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm mb-8 block" style={{ color: "oklch(0.55 0.14 140)" }}>
          ← חזרה לדף הבית
        </Link>
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          תנאי שימוש
        </h1>
        <p className="text-sm mb-10" style={{ color: "oklch(0.6 0.03 255)" }}>
          עדכון אחרון: אפריל 2025
        </p>

        <div className="flex flex-col gap-8 text-right" style={{ color: "oklch(0.35 0.03 255)" }}>
          <section>
            <h2 className="text-lg font-black mb-2">קבלת התנאים</h2>
            <p className="text-sm leading-relaxed">
              השימוש ב-BondFlow מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכים/ה, אנא הפסק/י להשתמש בשירות.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">השירות</h2>
            <p className="text-sm leading-relaxed">
              BondFlow מספקת כלי לתכנון זמן משפחתי בעזרת AI. ההצעות שמייצרת האפליקציה הן המלצות בלבד ואינן מהוות ייעוץ מקצועי. אנחנו שומרים לעצמנו את הזכות לשנות, להשעות או להפסיק חלקים מהשירות בכל עת.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">חשבונות</h2>
            <ul className="text-sm leading-relaxed list-disc list-inside flex flex-col gap-1.5">
              <li>עליך להיות בן/בת 18 לפחות ליצירת חשבון</li>
              <li>אחראי/ת לשמור על סיסמתך בסוד</li>
              <li>אסור ליצור חשבונות מרובים לאותו אדם</li>
              <li>אנחנו רשאים להשעות חשבון שמפר תנאים אלה</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">תשלומים וביטולים</h2>
            <p className="text-sm leading-relaxed">
              תשלומים מעובדים על-ידי Paddle. ניתן לבטל מנוי בכל עת דרך Paddle Customer Portal. לאחר ביטול, הגישה לתכונות פרימיום נמשכת עד סוף תקופת החיוב הנוכחית. אין החזרים על תקופות שכבר שולמו, אלא אם נקבע אחרת בחוק.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">קניין רוחני</h2>
            <p className="text-sm leading-relaxed">
              כל התוכן, העיצוב והקוד של BondFlow הם רכושנו הבלעדי. אסור להעתיק, לשכפל או להפיץ ללא אישור בכתב.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">הגבלת אחריות</h2>
            <p className="text-sm leading-relaxed">
              השירות ניתן "כפי שהוא" ללא אחריות מפורשת או משתמעת. BondFlow לא תהיה אחראית לנזקים עקיפים, תקריים או תוצאתיים הנובעים מהשימוש בשירות. האחריות המרבית שלנו כלפיך לא תעלה על הסכום ששילמת ב-12 החודשים האחרונים.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">דין חל</h2>
            <p className="text-sm leading-relaxed">
              תנאי שימוש אלה כפופים לדין הישראלי. סמכות השיפוט הבלעדית תהיה לבתי המשפט בתל אביב.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">צור קשר</h2>
            <p className="text-sm leading-relaxed">
              לכל שאלה: support@bondflow.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
