"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSDismissed, setIsIOSDismissed] = useState(false);

  useEffect(() => {
    // Already installed or dismissed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDismissed(true);
      return;
    }
    // Re-show after 30 days if previously dismissed
    const dismissedAt = localStorage.getItem("pwa-banner-dismissed");
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < 30 * 24 * 60 * 60 * 1000) { setDismissed(true); return; }
      localStorage.removeItem("pwa-banner-dismissed");
    }

    // iOS detection (no beforeinstallprompt, needs manual share instruction)
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    if (ios) {
      setIsIOS(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setDismissed(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
    setDismissed(true);
    setIsIOSDismissed(true);
  };

  // Android/Chrome install banner
  if (!dismissed && prompt) {
    return (
      <div
        className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl p-4 flex items-center gap-3 shadow-xl"
        style={{
          background: "oklch(0.20 0.04 255)",
          boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)",
        }}
      >
        <img src="/logo.jpg" alt="BondFlow" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{ objectPosition: "50% 28%" }} />
        <div className="flex-1 text-right min-w-0">
          <p className="text-sm font-black text-white leading-tight">הוסף לדף הבית</p>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.75 0.03 255)" }}>גישה מהירה בלחיצה אחת</p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-xl px-3 py-2 text-xs font-black flex-shrink-0 flex items-center gap-1.5"
          style={{ background: "oklch(0.65 0.14 140)", color: "white" }}
        >
          <Download className="w-3.5 h-3.5" />
          התקן
        </button>
        <button onClick={handleDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  // iOS manual instruction banner
  if (isIOS && !isIOSDismissed && !dismissed) {
    return (
      <div
        className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl p-4 flex items-start gap-3 shadow-xl"
        style={{
          background: "oklch(0.20 0.04 255)",
          boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)",
        }}
      >
        <img src="/logo.jpg" alt="BondFlow" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 mt-0.5" style={{ objectPosition: "50% 28%" }} />
        <div className="flex-1 text-right min-w-0">
          <p className="text-sm font-black text-white leading-tight mb-0.5">הוסף לדף הבית</p>
          <p className="text-xs leading-relaxed" style={{ color: "oklch(0.75 0.03 255)" }}>
            לחץ על <strong className="text-white">שתף ↑</strong> ואז <strong className="text-white">&quot;הוסף למסך הבית&quot;</strong>
          </p>
        </div>
        <button onClick={handleDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100 mt-0.5">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return null;
}
