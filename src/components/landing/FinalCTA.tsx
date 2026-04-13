import { Button } from "@/components/ui/button";
import { Sparkles, Heart } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className="rounded-[2rem] p-10 sm:p-16 text-center relative overflow-hidden"
          style={{ background: "oklch(0.95 0.03 85)" }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{ background: "oklch(0.65 0.14 140)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "oklch(0.72 0.18 42)" }}
          />

          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.4)" }}
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[oklch(0.2_0.03_255)] mb-5 leading-tight">
              Your Kids Are Growing Up{" "}
              <span className="text-gradient">Right Now.</span>
              <br />
              This Week Counts.
            </h2>

            <p className="text-lg text-[oklch(0.45_0.03_255)] max-w-2xl mx-auto mb-4 leading-relaxed">
              You didn&apos;t read this far because you needed convincing that you
              love your kids. You read this far because you believe it&apos;s
              possible to feel less guilt and more joy — without quitting your
              job or pretending life is simpler than it is.
            </p>

            <p className="text-base font-semibold text-[oklch(0.35_0.03_255)] mb-10">
              It is possible. BondFlow was built for the exact version of you
              that exists right now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-14 px-10 text-base font-semibold shadow-lg w-full sm:w-auto"
                style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Find My First Family Moment — Start Free
              </Button>
            </div>

            {/* Hebrew CTA */}
            <p
              className="text-sm mt-4 font-medium"
              style={{
                color: "oklch(0.55 0.10 140)",
                direction: "rtl",
              }}
            >
              ← מצא את הרגע הראשון שלי — התחל בחינם היום
            </p>

            <p className="text-xs text-[oklch(0.6_0.03_255)] mt-4">
              No credit card · 3-minute setup · Works with your existing calendar
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
