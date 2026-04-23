/**
 * Celebration effect — confetti burst for milestone moments (first moment saved,
 * streak reached, etc.). Dynamically imported so it doesn't bloat the initial bundle.
 */

export async function celebrate(intensity: "small" | "big" = "small"): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const confetti = (await import("canvas-confetti")).default;
    const count = intensity === "big" ? 160 : 90;
    const base = {
      spread: 70,
      ticks: 90,
      gravity: 0.9,
      origin: { y: 0.7 },
      colors: ["#22c55e", "#f97316", "#fbbf24", "#a855f7", "#ec4899"],
    };
    confetti({ ...base, particleCount: Math.floor(count * 0.4), startVelocity: 35, decay: 0.92 });
    confetti({ ...base, particleCount: Math.floor(count * 0.25), startVelocity: 25, decay: 0.94, spread: 100, scalar: 0.8 });
    confetti({ ...base, particleCount: Math.floor(count * 0.35), startVelocity: 45, decay: 0.9, spread: 55, scalar: 1.1 });
  } catch {
    // confetti not available — no-op
  }
}

/** One-time celebration keyed by localStorage to avoid firing repeatedly. */
export async function celebrateOnce(key: string, intensity: "small" | "big" = "big"): Promise<void> {
  if (typeof window === "undefined") return;
  const storageKey = `bf_celebrated_${key}`;
  if (localStorage.getItem(storageKey)) return;
  localStorage.setItem(storageKey, "1");
  await celebrate(intensity);
}
