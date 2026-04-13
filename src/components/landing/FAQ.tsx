"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "האם זה לא יוסיף לי עוד דברים לרשימת המטלות?",
    a: "ממש לא. BondFlow מסירה מחשבות, לא מוסיפה אותן. אתה מחבר את היומן פעם אחת, עונה על כמה שאלות על הילדים - ואנחנו מטפלים בהצעות. אתה רק לוחץ 'כן' על מה שמרגיש נכון. זהו.",
  },
  {
    q: "מה אם הלוח שלי לגמרי בלתי צפוי?",
    a: "בדיוק בשביל זה בנינו את זה. BondFlow סורקת מחדש את היומן שלך כל שבוע ומוצאת חלונות לפי מה שיש שם בפועל - לא גרסה אידיאלית של החיים שלך. גם 15 דקות נחשבות. נמצא אותן.",
  },
  {
    q: "יש לי ילדים בגילאים שונים עם תחביבים שונים לגמרי - זה עובד?",
    a: "כן. לכל ילד יש פרופיל משלו. ההצעות תמיד מותאמות לגיל ולתחביבים. האפליקציה גם מציעה פעילויות קבוצתיות כשזה הגיוני לכל המשפחה.",
  },
  {
    q: "מה אם אנסה ולא ישתנה כלום?",
    a: "תוכלו לבטל בכל זמן - בלי חיכוך, בלי אשמה. אבל זה מה שראינו: ההורים שהכי סקפטיים הם בדרך כלל אלה שמרגישים את השינוי הגדול ביותר אחרי הפעילות הראשונה. מתחילים בחינם. מנסים כמה פעמים. רואים איך זה מרגיש.",
  },
  {
    q: "הפרטנר שלי לא ייכנס לעוד אפליקציה משפחתית.",
    a: "התוכנית החינמית עובדת מצוין להורה אחד. וברגע שהילדים שלך מתחילים לבקש 'זמן BondFlow' - הפרטנר ירצה להיכנס. ראינו את זה קורה שוב ושוב.",
  },
  {
    q: "עובד עם חגי ישראל וחופשות בית ספר?",
    a: "כן - זה היה אחד הדברים הראשונים שבנינו. BondFlow מכירה את לוח השנה הישראלי, את כל החגים, חופשות בית ספר, וחול המועד. הכל נלקח בחשבון בהצעות הפעילויות.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p
            className="text-sm font-bold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            שאלות נפוצות
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
            שאלות?{" "}
            <span className="text-gradient">שמענו הכל.</span>
          </h2>
          <p style={{ color: "oklch(0.5 0.03 255)" }}>
            תשובות אמיתיות להורים אמיתיים עם ספקות אמיתיות.
          </p>
        </div>

        <Accordion className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border px-5"
              style={{ borderColor: "oklch(0.9 0.02 85)", background: "white" }}
            >
              <AccordionTrigger className="text-right font-bold text-sm py-5 hover:no-underline" style={{ color: "oklch(0.25 0.03 255)" }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed pb-5" style={{ color: "oklch(0.5 0.03 255)" }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
