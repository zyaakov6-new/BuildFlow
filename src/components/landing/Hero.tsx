"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Heart, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero flex items-center overflow-hidden pt-16">
      {/* Decorative blobs */}
      <div
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.65 0.14 140)" }}
      />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.72 0.18 42)" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div className="flex flex-col gap-6">
          <Badge
            variant="secondary"
            className="w-fit px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: "oklch(0.88 0.08 140 / 0.3)",
              color: "oklch(0.45 0.14 140)",
              border: "1px solid oklch(0.65 0.14 140 / 0.3)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-powered family connection — built for Israeli parents
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[oklch(0.2_0.03_255)]">
            Your Kids Don&apos;t Need{" "}
            <span className="text-gradient">More Money.</span>
            <br />
            They Need More{" "}
            <span className="italic text-gradient">You.</span>
          </h1>

          {/* Hebrew headline */}
          <p
            className="text-base font-medium"
            style={{ color: "oklch(0.55 0.10 140)", direction: "rtl" }}
          >
            הילדים שלך לא צריכים עוד כסף. הם צריכים יותר אותך.
          </p>

          <p className="text-lg text-[oklch(0.45_0.03_255)] leading-relaxed max-w-lg">
            BondFlow finds the real moments hiding in your impossible schedule —
            and turns them into memories your kids will talk about for years.{" "}
            <span className="font-medium text-[oklch(0.35_0.03_255)]">
              Even if you have 20 minutes on a Tuesday.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-14 px-8 text-base font-semibold shadow-lg"
              style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Find My First Family Moment — Free
            </Button>
          </div>

          {/* Hebrew CTA */}
          <p
            className="text-sm text-[oklch(0.55_0.03_255)]"
            style={{ direction: "rtl" }}
          >
            ← מצא את הרגע המשפחתי הראשון שלי — בחינם
          </p>

          <p className="text-sm text-[oklch(0.6_0.03_255)]">
            No credit card needed · Works with Google & Apple Calendar · Hebrew
            + English
          </p>

          {/* Social trust row */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {["#F4845F", "#7DB87A", "#F5C842", "#A78BFA", "#60A5FA"].map(
                (color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: color }}
                  >
                    {["מ", "א", "ש", "ד", "נ"][i]}
                  </div>
                )
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-current"
                    style={{ color: "oklch(0.72 0.18 42)" }}
                  />
                ))}
              </div>
              <p className="text-xs text-[oklch(0.55_0.03_255)] mt-0.5">
                <span className="font-semibold text-[oklch(0.35_0.03_255)]">
                  2,400+ parents
                </span>{" "}
                already reconnecting
              </p>
            </div>
          </div>
        </div>

        {/* Right: App mockup */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative">
            {/* Phone frame */}
            <div
              className="w-72 sm:w-80 rounded-[2.5rem] p-2 shadow-2xl"
              style={{
                background: "oklch(0.25 0.04 255)",
                boxShadow:
                  "0 40px 80px oklch(0.25 0.04 255 / 0.3), 0 0 0 1px oklch(0.4 0.04 255 / 0.5)",
              }}
            >
              <div
                className="rounded-[2rem] overflow-hidden"
                style={{ background: "oklch(0.97 0.01 85)" }}
              >
                {/* Status bar */}
                <div
                  className="px-6 py-3 flex justify-between items-center text-xs font-medium"
                  style={{ color: "oklch(0.45 0.03 255)" }}
                >
                  <span>9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-2 rounded-sm border border-current opacity-70" />
                  </div>
                </div>

                {/* App header */}
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-7 h-7 rounded-xl gradient-cta flex items-center justify-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span
                      className="font-bold text-sm"
                      style={{ color: "oklch(0.28 0.05 255)" }}
                    >
                      BondFlow
                    </span>
                  </div>

                  {/* Greeting */}
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "oklch(0.55 0.03 255)" }}
                  >
                    Good evening, Michal 👋
                  </p>
                  <p
                    className="text-lg font-bold mb-4"
                    style={{ color: "oklch(0.2 0.03 255)" }}
                  >
                    You have 2 windows this week
                  </p>

                  {/* Calendar block */}
                  <div
                    className="rounded-2xl p-3 mb-3"
                    style={{ background: "oklch(0.88 0.08 140 / 0.25)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.55 0.14 140)" }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.45 0.14 140)" }}
                      >
                        Tuesday · 5:30–6:00 PM
                      </span>
                    </div>
                    <p
                      className="text-sm font-bold mb-1"
                      style={{ color: "oklch(0.25 0.03 255)" }}
                    >
                      🚂 LEGO Train Build
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.03 255)" }}
                    >
                      Perfect for Yoav, 5 · zero prep · just you
                    </p>
                    <button
                      className="mt-3 w-full rounded-xl py-2 text-xs font-semibold text-white gradient-cta"
                    >
                      Block This Time →
                    </button>
                  </div>

                  {/* Connection score */}
                  <div
                    className="rounded-2xl p-3"
                    style={{ background: "oklch(0.92 0.06 60 / 0.3)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Heart
                          className="w-3.5 h-3.5 fill-current"
                          style={{ color: "oklch(0.72 0.18 42)" }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "oklch(0.45 0.12 42)" }}
                        >
                          Connection Score
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.55 0.18 42)" }}
                      >
                        78
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.85 0.06 60 / 0.5)" }}
                    >
                      <div
                        className="h-full rounded-full gradient-orange"
                        style={{ width: "78%" }}
                      />
                    </div>
                    <p
                      className="text-xs mt-1.5"
                      style={{ color: "oklch(0.55 0.08 42)" }}
                    >
                      ↑ +12 from last week
                    </p>
                  </div>
                </div>

                {/* Bottom nav */}
                <div
                  className="border-t px-6 py-3 flex justify-around"
                  style={{
                    borderColor: "oklch(0.88 0.02 85)",
                    background: "white",
                  }}
                >
                  {["🏠", "📅", "💡", "📊"].map((icon, i) => (
                    <div
                      key={i}
                      className="text-lg"
                      style={{ opacity: i === 0 ? 1 : 0.4 }}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div
              className="absolute -top-4 -right-4 rounded-2xl px-3 py-2 shadow-lg text-xs font-semibold flex items-center gap-1.5"
              style={{
                background: "white",
                color: "oklch(0.45 0.14 140)",
                boxShadow: "0 8px 24px oklch(0 0 0 / 0.12)",
              }}
            >
              <span className="text-base">✅</span> 4 moments this week!
            </div>
            <div
              className="absolute -bottom-4 -left-6 rounded-2xl px-3 py-2 shadow-lg text-xs font-semibold"
              style={{
                background: "white",
                color: "oklch(0.45 0.12 42)",
                boxShadow: "0 8px 24px oklch(0 0 0 / 0.12)",
              }}
            >
              😊 &quot;Ima, let&apos;s do BondFlow time again!&quot;
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12"
        >
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
