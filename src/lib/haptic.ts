/**
 * Tiny haptic helper. No-op on unsupported browsers/desktop.
 * Use for affirming actions: streak increments, mark-as-done, successful save.
 */

export function haptic(kind: "tap" | "success" | "error" = "tap"): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    if (kind === "tap") navigator.vibrate(10);
    else if (kind === "success") navigator.vibrate([15, 30, 15]);
    else if (kind === "error") navigator.vibrate([40, 60, 40]);
  } catch {
    // Silent — some browsers throw when called without user gesture.
  }
}
