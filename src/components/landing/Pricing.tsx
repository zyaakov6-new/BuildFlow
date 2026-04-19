"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { openPaddleCheckout, getPaddlePriceId } from "@/lib/paddle";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "חינמי",
    subtitle: "תמיד בחינם - כי לכל הורה מגיע",
    price: "₪0",
    period: "לתמיד",
    cta: "התחל עכשיו בחינם",
    highlighted: false,
    features: [
      "AI סורק את היומן השבועי שלך",
      "3 הצעות פעילות מותאמות אישית בשבוע",
      "חסימת יומן בלחיצה אחת",
      "ציון חיבור משפחתי",
      "פרופיל ילד אחד",
    ],
  },
  {
    id: "premium",
    name: "פרימיום",
    subtitle: "הכי פופולרי - החוויה המלאה",
    price: "₪39",
    period: "לחודש",
    badge: "הכי פופולרי",
    cta: "שדרג לפרימיום עכשיו",
    highlighted: true,
    features: [
      "הכל מהחינמי, בנוסף:",
      "הצעות פעילות יומיות ללא הגבלה",
      "התאמה מתקדמת - מצב רוח, מזג אוויר, מיקום",
      "עד 4 פרופילי ילדים",
    ],
  },
  {
    id: "annual",
    name: "שנתי",
    subtitle: "הכי משתלם למשפחות מחויבות",
    price: "₪299",
    period: "לשנה",
    badge: "חסוך 36%",
    cta: "קנה שנתי - חסוך ₪169",
    highlighted: false,
    features: [
      "הכל מהפרימיום, בנוסף:",
      "סיכום חיבור חודשי להדפסה",
      "ניתוח מגמות חיבור לאורך זמן",
      "גישה מוקדמת לתכונות חדשות",
    ],
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePaidPlan = async (planId: "premium" | "annual") => {
    setLoadingPlan(planId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth";
        return;
      }
      const priceId = await getPaddlePriceId(planId);
      if (!priceId) {
        toast.error("שגיאה בטעינת מערכת התשלום. נסה שוב בעוד רגע.");
        return;
      }
      await openPaddleCheckout({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email! },
        customData: { supabase_user_id: user.id, plan: planId },
        settings: { displayMode: "overlay", theme: "light" },
      });
    } catch (err) {
      console.error("Paddle checkout error:", err);
      toast.error("לא הצלחנו לפתוח את מסך התשלום. נסה שוב.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p
            className="text-sm font-bold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            מחירים
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "oklch(0.2 0.03 255)" }}>
            מתחיל בחינם.{" "}
            <span className="text-gradient">נשאר כי זה עובד.</span>
          </h2>
          <p className="text-lg" style={{ color: "oklch(0.5 0.03 255)" }}>
            ללא כרטיס אשראי. ביטול בכל זמן. ללא אשמה.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isBusy = loadingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col gap-5 relative ${plan.highlighted ? "shadow-2xl" : "border"}`}
                style={{
                  background: plan.highlighted ? "oklch(0.28 0.05 255)" : "white",
                  borderColor: "oklch(0.92 0.02 85)",
                  ...(plan.highlighted && { boxShadow: "0 20px 60px oklch(0.28 0.05 255 / 0.3)" }),
                }}
              >
                {plan.badge && (
                  <Badge
                    className="w-fit rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      background: plan.highlighted ? "oklch(0.72 0.18 42)" : "oklch(0.88 0.08 140 / 0.3)",
                      color: plan.highlighted ? "white" : "oklch(0.45 0.14 140)",
                      border: "none",
                    }}
                  >
                    {plan.badge}
                  </Badge>
                )}

                <div>
                  <p
                    className="text-xs font-black uppercase tracking-wider mb-1"
                    style={{ color: plan.highlighted ? "oklch(0.75 0.10 140)" : "oklch(0.65 0.14 140)" }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-4xl font-black"
                      style={{ color: plan.highlighted ? "white" : "oklch(0.2 0.03 255)" }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: plan.highlighted ? "oklch(0.75 0.05 255)" : "oklch(0.55 0.03 255)" }}
                    >
                      /{plan.period}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-1.5 leading-relaxed"
                    style={{ color: plan.highlighted ? "oklch(0.75 0.05 255)" : "oklch(0.55 0.03 255)" }}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                {plan.id === "free" ? (
                  <Link
                    href="/auth"
                    className="w-full rounded-2xl h-12 font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 border"
                    style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.35 0.03 255)" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 140)" }} />
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePaidPlan(plan.id as "premium" | "annual")}
                    disabled={isBusy}
                    className={`w-full rounded-2xl h-12 font-bold text-sm flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-70 ${plan.highlighted ? "gradient-cta" : ""}`}
                    style={
                      plan.highlighted
                        ? { boxShadow: "0 4px 16px oklch(0.65 0.14 140 / 0.4)" }
                        : { background: "oklch(0.35 0.05 255)" }
                    }
                  >
                    {isBusy
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> רגע...</>
                      : <><Sparkles className="w-3.5 h-3.5" />{plan.cta}</>
                    }
                  </button>
                )}

                <div
                  className="border-t"
                  style={{ borderColor: plan.highlighted ? "oklch(1 0 0 / 0.1)" : "oklch(0.93 0.02 85)" }}
                />

                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: plan.highlighted ? "oklch(0.75 0.14 140)" : "oklch(0.65 0.14 140)" }}
                      />
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: plan.highlighted ? "oklch(0.85 0.03 255)" : "oklch(0.45 0.03 255)" }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: "oklch(0.55 0.03 255)" }}>
          כל התוכניות כוללות תמיכה בעברית ואנגלית · ביטול בכל זמן · מנוהל על ידי Paddle
        </p>
      </div>
    </section>
  );
}
