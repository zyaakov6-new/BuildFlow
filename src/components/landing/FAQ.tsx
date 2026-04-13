"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Will this just add more things to my to-do list?",
    a: "Absolutely not. BondFlow removes thinking, it doesn't add it. You connect your calendar once, answer a few questions about your kids, and we handle the suggestions. You just tap 'yes' to the ones that feel right. That's it.",
  },
  {
    q: "What if my schedule is completely unpredictable?",
    a: "That's exactly who we built this for. BondFlow re-scans your calendar every week and finds pockets based on what's actually there — not some idealized version of your life. Even 15 minutes counts. We'll find them.",
  },
  {
    q: "My kids are different ages with totally different interests. Does it work?",
    a: "Yes. Each child gets their own profile. Suggestions are always age-appropriate and interest-matched. The app also suggests group activities when it makes sense for the whole family.",
  },
  {
    q: "Is my calendar data private?",
    a: "We take privacy seriously. Your calendar data is used only to find your time slots — never sold, never shared. We're fully GDPR-compliant and working toward Israeli Privacy Protection Law compliance. Full details in our privacy policy.",
  },
  {
    q: "Is it really in Hebrew?",
    a: "Full Hebrew interface, Hebrew notifications, Hebrew holiday calendar, and Hebrew support — yes. BondFlow is built for Israeli parents, not just translated for them. Right-to-left layout, Hebrew fonts, the whole experience.",
  },
  {
    q: "What if I try it and nothing changes?",
    a: "Cancel any time — no friction, no guilt. But here's what we've seen: the parents who feel most skeptical are usually the ones who feel the biggest shift after their first completed activity. Start free. Try one thing. See how it feels.",
  },
  {
    q: "My partner won't engage with another family app.",
    a: "The free plan works perfectly for one parent. And once your kids start asking for 'BondFlow time,' your partner will want in. We've seen it happen dozens of times.",
  },
  {
    q: "Does it work with Israeli school holidays and chagim?",
    a: "Yes — that was one of our first priorities. BondFlow knows the Israeli school calendar, all the Jewish holidays, school recesses, and even Chol HaMoed. It factors all of this in when suggesting activities and finding time windows.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.2_0.03_255)] mb-4">
            Questions?{" "}
            <span className="text-gradient">We&apos;ve Heard Them All.</span>
          </h2>
          <p className="text-[oklch(0.5_0.03_255)]">
            Real answers for real parents with real doubts.
          </p>
        </div>

        <Accordion className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border px-5 data-[state=open]:shadow-sm"
              style={{
                borderColor: "oklch(0.9 0.02 85)",
                background: "white",
              }}
            >
              <AccordionTrigger className="text-left font-semibold text-[oklch(0.25_0.03_255)] text-sm py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[oklch(0.5_0.03_255)] leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
