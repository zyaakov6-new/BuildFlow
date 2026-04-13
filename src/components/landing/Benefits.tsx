const benefits = [
  {
    icon: "🕐",
    title: "Turn 20 Minutes into Memories That Last",
    description:
      "Not every family moment needs to be a day trip. BondFlow turns small windows — before dinner, after school, Sunday morning — into real connection that sticks.",
  },
  {
    icon: "💚",
    title: "Watch the Guilt Fade — For Real",
    description:
      "Your Family Connection Score doesn't lie. When you see the moments stacking up, your brain finally believes: you are showing up. That guilt? It has data to fight now.",
  },
  {
    icon: "🎯",
    title: "Activities Your Kid Will Actually Want to Do",
    description:
      "Not Pinterest-worthy. Not prep-heavy. Real suggestions based on your kid's age, current obsessions, and attention span. Minecraft kid gets Minecraft. Not \"make a birdhouse.\"",
  },
  {
    icon: "🇮🇱",
    title: "Built for Israeli Family Life",
    description:
      "School hours. Chagim. Hamsin days. Yom HaZikaron. BondFlow understands the Israeli calendar, not just the American one. It speaks Hebrew, English, and your life.",
  },
  {
    icon: "🧠",
    title: "Zero Extra Mental Load",
    description:
      "You already carry everything. BondFlow carries the planning. You just show up and be present — no research, no prep, no decision fatigue.",
  },
  {
    icon: "📊",
    title: "Progress You Can Actually See",
    description:
      "Weekly reports. Monthly streaks. Milestone moments. When your kid says \"Ima, remember when we did that thing?\" — BondFlow helped make that happen.",
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.72 0.18 42)" }}
          >
            What changes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.2_0.03_255)] mb-4">
            What Changes When BondFlow
            <br />
            <span className="text-gradient">Is in Your Corner</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 sm:p-7 card-hover border"
              style={{
                borderColor: "oklch(0.92 0.02 85)",
                background: i % 3 === 1 ? "oklch(0.98 0.01 85)" : "white",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: "oklch(0.95 0.03 85)" }}
              >
                {b.icon}
              </div>
              <h3 className="text-base font-bold text-[oklch(0.2_0.03_255)] mb-2 leading-snug">
                {b.title}
              </h3>
              <p className="text-sm text-[oklch(0.5_0.03_255)] leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>

        {/* Before / After CTA strip */}
        <div
          className="mt-12 rounded-3xl p-8 sm:p-10 text-center gradient-cta"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Before BondFlow vs. After BondFlow
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 mt-6 text-left">
            <div
              className="rounded-2xl p-5"
              style={{ background: "oklch(1 0 0 / 0.1)" }}
            >
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                Before
              </p>
              {[
                "Another Sunday went by with nothing planned",
                "You feel guilty every night",
                "You say 'in a minute' a lot",
                "You wonder if you're failing them",
              ].map((item, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <span className="text-white/50 mt-0.5">✗</span>
                  <p className="text-white/80 text-sm">{item}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: "oklch(1 0 0 / 0.15)" }}
            >
              <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-3">
                After
              </p>
              {[
                "You have 3 family moments blocked this week",
                "Your Connection Score is climbing",
                "Your kid asks for \"BondFlow time\"",
                "You know: you are showing up",
              ].map((item, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <span className="text-white mt-0.5">✓</span>
                  <p className="text-white text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
