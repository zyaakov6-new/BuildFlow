import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    subtitle: "Always free — because every parent deserves this",
    price: "₪0",
    period: "forever",
    cta: "Start Free Now",
    ctaVariant: "outline" as const,
    highlighted: false,
    features: [
      "AI scans your calendar weekly",
      "3 personalized activity suggestions/week",
      "One-tap calendar blocking",
      "Basic Family Connection Score",
      "Hebrew + English interface",
    ],
  },
  {
    name: "Premium",
    subtitle: "Most popular — the full experience",
    price: "₪49",
    period: "per month",
    badge: "Most Popular",
    cta: "Try Premium Free — 14 Days",
    ctaVariant: "default" as const,
    highlighted: true,
    features: [
      "Everything in Free, plus:",
      "Unlimited daily activity suggestions",
      "Advanced personalization (mood, weather, location)",
      "Full weekly Family Connection Report",
      "Multi-child profiles (up to 4 kids)",
      "Israeli holiday & school calendar",
      "Family Streak tracking + milestone celebrations",
      "Priority support in Hebrew + English",
    ],
  },
  {
    name: "Annual",
    subtitle: "Best value for committed families",
    price: "₪349",
    period: "per year",
    badge: "Save 40%",
    cta: "Get Annual — Save ₪240/year",
    ctaVariant: "outline" as const,
    highlighted: false,
    features: [
      "Everything in Premium, plus:",
      "2 parent profiles synced",
      "Monthly 'Connection Snapshot' PDF",
      "Early access to new features",
      "Dedicated family onboarding call",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.2_0.03_255)] mb-4">
            Start Free.{" "}
            <span className="text-gradient">Stay Because It Works.</span>
          </h2>
          <p className="text-lg text-[oklch(0.5_0.03_255)]">
            No credit card needed to start. Cancel any time. No guilt.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col gap-5 relative ${
                plan.highlighted
                  ? "shadow-2xl"
                  : "border"
              }`}
              style={{
                background: plan.highlighted
                  ? "oklch(0.28 0.05 255)"
                  : "white",
                borderColor: "oklch(0.92 0.02 85)",
                ...(plan.highlighted && {
                  boxShadow: "0 20px 60px oklch(0.28 0.05 255 / 0.3)",
                }),
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <Badge
                  className="w-fit rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: plan.highlighted
                      ? "oklch(0.72 0.18 42)"
                      : "oklch(0.88 0.08 140 / 0.3)",
                    color: plan.highlighted
                      ? "white"
                      : "oklch(0.45 0.14 140)",
                    border: "none",
                  }}
                >
                  {plan.badge}
                </Badge>
              )}

              {/* Plan name */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{
                    color: plan.highlighted
                      ? "oklch(0.75 0.10 140)"
                      : "oklch(0.65 0.14 140)",
                  }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-4xl font-bold"
                    style={{
                      color: plan.highlighted
                        ? "white"
                        : "oklch(0.2 0.03 255)",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: plan.highlighted
                        ? "oklch(0.75 0.05 255)"
                        : "oklch(0.55 0.03 255)",
                    }}
                  >
                    /{plan.period}
                  </span>
                </div>
                <p
                  className="text-xs mt-1.5 leading-relaxed"
                  style={{
                    color: plan.highlighted
                      ? "oklch(0.75 0.05 255)"
                      : "oklch(0.55 0.03 255)",
                  }}
                >
                  {plan.subtitle}
                </p>
              </div>

              {/* CTA */}
              <Button
                className={`w-full rounded-2xl h-12 font-semibold text-sm ${
                  plan.highlighted
                    ? "gradient-cta text-white border-0 hover:opacity-90"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                style={
                  plan.highlighted
                    ? { boxShadow: "0 4px 16px oklch(0.65 0.14 140 / 0.4)" }
                    : { borderColor: "oklch(0.88 0.02 85)" }
                }
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {plan.cta}
              </Button>

              {/* Divider */}
              <div
                className="border-t"
                style={{
                  borderColor: plan.highlighted
                    ? "oklch(1 0 0 / 0.1)"
                    : "oklch(0.93 0.02 85)",
                }}
              />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{
                        color: plan.highlighted
                          ? "oklch(0.75 0.14 140)"
                          : "oklch(0.65 0.14 140)",
                      }}
                    />
                    <span
                      className="text-sm leading-relaxed"
                      style={{
                        color: plan.highlighted
                          ? "oklch(0.85 0.03 255)"
                          : "oklch(0.45 0.03 255)",
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[oklch(0.55_0.03_255)] mt-8">
          All plans include Hebrew + English support · GDPR compliant · Cancel anytime
        </p>
      </div>
    </section>
  );
}
