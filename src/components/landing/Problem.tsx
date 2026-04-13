import { Frown } from "lucide-react";

const painPoints = [
  {
    emoji: "😓",
    text: "You said \"in a minute\" — and the minute never came.",
  },
  {
    emoji: "📱",
    text: "You scrolled Instagram watching other families do craft projects and felt worse.",
  },
  {
    emoji: "🚗",
    text: "An hour in traffic. Two hours of meetings. Dinner from the freezer. Another day gone.",
  },
  {
    emoji: "📆",
    text: "You meant to plan something for the weekend. Sunday arrived and nothing happened.",
  },
  {
    emoji: "😴",
    text: "You're exhausted by 8pm. The kids are already in bed. The guilt is fully awake.",
  },
  {
    emoji: "🎉",
    text: "Chol HaMoed, school holidays, Shabbat — the days when you should connect feel the most chaotic.",
  },
];

export default function Problem() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Frown className="w-5 h-5" style={{ color: "oklch(0.72 0.18 42)" }} />
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "oklch(0.72 0.18 42)" }}
          >
            You&apos;re not alone
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[oklch(0.2_0.03_255)] mb-4 leading-tight">
          You Know That Feeling.
          <br />
          <span className="text-gradient">The One at 10pm.</span>
        </h2>

        <p className="text-center text-lg text-[oklch(0.5_0.03_255)] mb-4 max-w-2xl mx-auto leading-relaxed">
          You finally put the kids to bed. The house is quiet. And instead of
          feeling relieved — you feel it. That low, dull ache.
        </p>

        <p
          className="text-center text-xl font-medium italic mb-16 max-w-2xl mx-auto"
          style={{ color: "oklch(0.45 0.10 140)" }}
        >
          &quot;Did I even really talk to them today? Or did I just... logistics them
          through another day?&quot;
        </p>

        {/* Pain points grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 flex gap-3 items-start card-hover"
              style={{ background: "oklch(0.97 0.01 85)" }}
            >
              <span className="text-2xl flex-shrink-0">{point.emoji}</span>
              <p className="text-sm text-[oklch(0.45_0.03_255)] leading-relaxed">
                {point.text}
              </p>
            </div>
          ))}
        </div>

        {/* Reframe */}
        <div
          className="rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
          style={{ background: "oklch(0.95 0.03 85)" }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none"
            style={{ background: "oklch(0.65 0.14 140)" }}
          />
          <p className="text-sm font-semibold uppercase tracking-wider text-[oklch(0.65_0.14_140)] mb-3">
            Here&apos;s the truth
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[oklch(0.2_0.03_255)] mb-4">
            You don&apos;t need <em>more</em> time.
            <br />
            You need to use the time you have —{" "}
            <span className="text-gradient">better.</span>
          </h3>
          <p className="text-[oklch(0.5_0.03_255)] max-w-xl mx-auto leading-relaxed">
            But who has the mental bandwidth to plan that? After work, traffic,
            dinner, homework, and 47 WhatsApp messages? That&apos;s exactly why we
            built BondFlow.
          </p>
        </div>
      </div>
    </section>
  );
}
