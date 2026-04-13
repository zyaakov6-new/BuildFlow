import { Sparkles, Heart } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

      <div className="relative z-10 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl gradient-cta flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ boxShadow: "0 12px 32px oklch(0.65 0.14 140 / 0.4)" }}>
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black mb-3" style={{ color: "oklch(0.2 0.03 255)" }}>
          הדשבורד בפיתוח 🚧
        </h1>
        <p className="text-base leading-relaxed mb-8" style={{ color: "oklch(0.55 0.03 255)" }}>
          אנחנו עובדים עליו. בינתיים - חזור לדף הבית.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 gradient-cta text-white rounded-2xl px-6 py-3 font-bold text-sm"
          style={{ boxShadow: "0 6px 20px oklch(0.65 0.14 140 / 0.35)" }}
        >
          <Heart className="w-4 h-4 fill-white" />
          חזור לדף הבית
        </a>
      </div>
    </div>
  );
}
