"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BondFlow] Unhandled error:", error);
    // Forward to Sentry if loaded
    if (typeof window !== "undefined") {
      const w = window as unknown as { Sentry?: { captureException: (e: Error) => void } };
      w.Sentry?.captureException(error);
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "oklch(0.97 0.01 85)" }}
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: "oklch(0.92 0.05 25 / 0.3)" }}
      >
        ⚠️
      </div>
      <div>
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          משהו השתבש
        </h1>
        <p className="text-base" style={{ color: "oklch(0.5 0.03 255)" }}>
          אירעה שגיאה בלתי צפויה. נסה שוב או חזור לדף הבית.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: "oklch(0.65 0.14 140)" }}
        >
          נסה שוב
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-2xl font-bold text-sm border"
          style={{ color: "oklch(0.45 0.03 255)", borderColor: "oklch(0.88 0.02 85)" }}
        >
          דף הבית
        </a>
      </div>
    </div>
  );
}
