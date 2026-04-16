"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Restores the original user session after a Google Calendar OAuth redirect
 * that may have switched the active Supabase session.
 *
 * The client stores `__bf_cal_restore` in localStorage before the OAuth redirect.
 * This page reads it and calls setSession() to put the original user back.
 */
export default function RestoreSession() {
  useEffect(() => {
    const restore = async () => {
      try {
        const raw = localStorage.getItem("__bf_cal_restore");
        if (raw) {
          const { access_token, refresh_token } = JSON.parse(raw);
          const supabase = createClient();
          await supabase.auth.setSession({ access_token, refresh_token });
          localStorage.removeItem("__bf_cal_restore");
        }
      } catch {
        // If restore fails we'll land on dashboard as whatever user the OAuth set
      }
      window.location.href = "/dashboard?calendar_connected=1";
    };
    restore();
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "oklch(0.97 0.01 85)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          className="animate-spin w-8 h-8"
          style={{ color: "oklch(0.65 0.14 140)" }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-semibold" style={{ color: "oklch(0.5 0.03 255)" }}>
          מחבר יומן...
        </p>
      </div>
    </div>
  );
}
