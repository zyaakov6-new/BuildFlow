import Link from "next/link";

export const metadata = { title: "מדיניות פרטיות – BondFlow" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 85)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm mb-8 block" style={{ color: "oklch(0.55 0.14 140)" }}>
          ← חזרה לדף הבית
        </Link>
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          מדיניות פרטיות
        </h1>
        <p className="text-sm mb-10" style={{ color: "oklch(0.6 0.03 255)" }}>
          עדכון אחרון: אפריל 2025
        </p>

        <div className="flex flex-col gap-8 text-right" style={{ color: "oklch(0.35 0.03 255)" }}>
          <section>
            <h2 className="text-lg font-black mb-2">מי אנחנו</h2>
            <p className="text-sm leading-relaxed">
              BondFlow היא אפליקציה לניהול זמן משפחתי, המופעלת על-ידי BondFlow Ltd. (להלן: "BondFlow", "אנחנו"). כתובת דוא"ל לפניות: privacy@bondflow.app
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">אילו מידע אנחנו אוספים</h2>
            <ul className="text-sm leading-relaxed list-disc list-inside flex flex-col gap-1.5">
              <li>פרטי חשבון: שם, כתובת דוא"ל, תמונת פרופיל (דרך Google OAuth)</li>
              <li>פרופילי ילדים: שם, גיל, תחומי עניין שהזנת אתה/את</li>
              <li>נתוני לוח שנה: קריאת חלונות זמן פנויים מ-Google Calendar בלבד (לא תוכן פגישות)</li>
              <li>שימוש באפליקציה: פעילויות שנשמרו, הצעות שנדחו, ציוני חיבור</li>
              <li>נתוני תשלום: מנוהלים לחלוטין על-ידי Paddle — אנחנו לא שומרים פרטי כרטיס אשראי</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">כיצד אנו משתמשים במידע</h2>
            <ul className="text-sm leading-relaxed list-disc list-inside flex flex-col gap-1.5">
              <li>יצירת הצעות פעילות מותאמות אישית בעזרת AI</li>
              <li>חישוב ציון חיבור משפחתי שבועי</li>
              <li>שיפור השירות ומניעת שימוש לרעה</li>
              <li>שליחת עדכונים שביקשת (ניתן לביטול בכל עת)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">שיתוף מידע עם צדדים שלישיים</h2>
            <p className="text-sm leading-relaxed">
              אנחנו לא מוכרים את המידע שלך. אנחנו משתמשים בספקים הבאים לצורך הפעלת השירות: Supabase (אחסון נתונים, EU), Anthropic (עיבוד AI — נתונים אנונימיים בלבד), Paddle (עיבוד תשלומים), Vercel (אחסון אפליקציה).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">אבטחת מידע</h2>
            <p className="text-sm leading-relaxed">
              טוקני Google Calendar מוצפנים במנוחה ב-AES-256-GCM. כל התקשורת מוצפנת ב-HTTPS. הנתונים מאוחסנים בתשתית אירופאית (Frankfurt).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">הזכויות שלך</h2>
            <p className="text-sm leading-relaxed mb-2">
              בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR, יש לך זכות ל:
            </p>
            <ul className="text-sm leading-relaxed list-disc list-inside flex flex-col gap-1.5">
              <li>גישה לנתונים שלך</li>
              <li>תיקון נתונים שגויים</li>
              <li>מחיקת חשבונך וכל הנתונים (דרך הגדרות → מחיקת חשבון)</li>
              <li>ניוד נתונים</li>
              <li>התנגדות לעיבוד</li>
            </ul>
            <p className="text-sm leading-relaxed mt-2">
              לכל פנייה: privacy@bondflow.app
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2">שינויים במדיניות</h2>
            <p className="text-sm leading-relaxed">
              נודיע לך על שינויים מהותיים דרך האפליקציה או בדוא"ל. המשך השימוש לאחר הודעה מהווה הסכמה.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
