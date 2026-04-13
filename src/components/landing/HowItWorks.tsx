import { Calendar, Lightbulb, CalendarCheck, MessageCircle, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    number: "01",
    title: "AI Scans Your Real Week",
    description:
      "Connect your Google or Apple Calendar. BondFlow finds the actual windows in your week — between pickup, work, dinner, and bedtime. Even 15 minutes counts.",
    color: "oklch(0.65 0.14 140)",
    bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    icon: Lightbulb,
    number: "02",
    title: "Hyper-Personalized Ideas Drop In",
    description:
      "Tell us once: your kids' ages, interests, energy. BondFlow suggests activities that match right now — your kid's current obsession, the weather, Israeli school holidays. No generic \"go to the park.\"",
    color: "oklch(0.72 0.18 42)",
    bgColor: "oklch(0.92 0.06 60 / 0.2)",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "One Tap to Block It",
    description:
      "See a suggestion you love? Tap once. It's on the calendar. You get a gentle reminder. No more \"I meant to but forgot.\"",
    color: "oklch(0.55 0.18 255)",
    bgColor: "oklch(0.90 0.06 255 / 0.15)",
  },
  {
    icon: MessageCircle,
    number: "04",
    title: "30-Second Check-In",
    description:
      "How did it go? Emoji + one line. That's it. BondFlow learns what works for your family — and gets smarter every week.",
    color: "oklch(0.65 0.14 140)",
    bgColor: "oklch(0.88 0.08 140 / 0.15)",
  },
  {
    icon: TrendingUp,
    number: "05",
    title: "Weekly Family Connection Report",
    description:
      "Every Sunday, see your wins. The moments you made happen. Watch your score grow. Watch the guilt shrink. \"This week: 4 family moments. You showed up.\"",
    color: "oklch(0.72 0.18 42)",
    bgColor: "oklch(0.92 0.06 60 / 0.2)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.2_0.03_255)] mb-4">
            BondFlow Does the Planning.
            <br />
            <span className="text-gradient">You Get the Memories.</span>
          </h2>
          <p className="text-lg text-[oklch(0.5_0.03_255)] max-w-xl mx-auto">
            Zero extra mental load. Just open the app and go.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line for desktop */}
          <div
            className="hidden lg:block absolute left-[2.25rem] top-8 bottom-8 w-0.5"
            style={{ background: "oklch(0.88 0.02 85)" }}
          />

          <div className="flex flex-col gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="flex gap-5 items-start group card-hover"
                >
                  {/* Icon circle */}
                  <div
                    className="flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center relative z-10 shadow-sm"
                    style={{ background: step.bgColor, border: `1.5px solid ${step.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 rounded-2xl p-5 sm:p-6"
                    style={{ background: "white" }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-xs font-bold"
                        style={{ color: step.color }}
                      >
                        STEP {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[oklch(0.2_0.03_255)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[oklch(0.5_0.03_255)] leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
