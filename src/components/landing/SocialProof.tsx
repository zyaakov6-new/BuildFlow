import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I didn't expect to feel emotional about an app. But seeing '5 family moments this week' when I thought I'd been failing? That hit me hard. BondFlow made me realize I was doing more than I thought — and then helped me do even more.",
    name: "Michal K.",
    age: 38,
    city: "Modi'in",
    role: "Mother of 2 (ages 5 and 8)",
    avatar: "מ",
    color: "#F4845F",
    highlight: "I cried the first time I saw my weekly report.",
  },
  {
    quote:
      "He literally calls it 'BondFlow time' now. We do 20-minute LEGO sessions on Tuesdays before dinner. The app suggested it based on his age and that we both like quiet activities. My wife couldn't believe I was the one planning it.",
    name: "Amir S.",
    age: 41,
    city: "Tel Aviv",
    role: "Father of 1 (age 6)",
    avatar: "א",
    color: "#7DB87A",
    highlight: "My son asked if we could do 'BondFlow time' again.",
  },
  {
    quote:
      "I've tried so many apps for family organization. They all make me feel like I'm failing harder. BondFlow is the first thing that felt like a hug, not a to-do list. The Hebrew interface is perfect — it really feels like it was made for us.",
    name: "Shiri D.",
    age: 34,
    city: "Rishon LeZion",
    role: "Mother of 3 (ages 3, 6, 10)",
    avatar: "ש",
    color: "#A78BFA",
    highlight: "Finally something that doesn't make me feel MORE overwhelmed.",
  },
];

const stats = [
  {
    value: "3–5 hrs",
    label: "of real family connection reclaimed per week",
    icon: "🏆",
  },
  {
    value: "86%",
    label: "of parents feel measurably less guilty after 30 days",
    icon: "💚",
  },
  {
    value: "94%",
    label: "complete their first family activity within 48 hours",
    icon: "📅",
  },
  {
    value: "🇮🇱",
    label: "Built for Israeli school & holiday schedules",
    icon: "",
  },
];

export default function SocialProof() {
  return (
    <section className="py-24" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "oklch(0.65 0.14 140)" }}
          >
            Real parents, real results
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.2_0.03_255)]">
            Parents Just Like You
            <br />
            <span className="text-gradient">Are Already Feeling It</span>
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 sm:p-7 flex flex-col gap-4 card-hover border"
              style={{
                background: "white",
                borderColor: "oklch(0.92 0.02 85)",
              }}
            >
              <Quote
                className="w-7 h-7 opacity-20"
                style={{ color: t.color }}
              />

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 fill-current"
                    style={{ color: "oklch(0.72 0.18 42)" }}
                  />
                ))}
              </div>

              {/* Highlight */}
              <p
                className="text-base font-bold leading-snug"
                style={{ color: "oklch(0.25 0.03 255)" }}
              >
                &ldquo;{t.highlight}&rdquo;
              </p>

              {/* Full quote */}
              <p className="text-sm text-[oklch(0.5_0.03_255)] leading-relaxed flex-1">
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "oklch(0.93 0.02 85)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[oklch(0.25_0.03_255)]">
                    {t.name}, {t.age}
                  </p>
                  <p className="text-xs text-[oklch(0.55_0.03_255)]">
                    {t.city} · {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div
          className="rounded-3xl p-8 sm:p-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ background: "oklch(0.28 0.05 255)" }}
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {s.icon && !s.value.includes("🇮🇱") ? s.value : s.icon}
              </p>
              <p className="text-sm text-white/70 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {[
            { icon: "🔒", text: "Calendar data is 100% private — never sold" },
            { icon: "🌐", text: "Full Hebrew + English interface" },
            { icon: "🇮🇱", text: "Israel-first: Hebrew calendar & holidays" },
            { icon: "📱", text: "iOS + Android · Google & Apple Calendar" },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: "white",
                border: "1px solid oklch(0.9 0.02 85)",
                color: "oklch(0.45 0.03 255)",
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
