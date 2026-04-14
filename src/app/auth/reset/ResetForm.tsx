"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "w-full rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all bg-white border-2 text-right placeholder:text-[oklch(0.7_0.02_255)] focus:border-[oklch(0.65_0.14_140)] hover:border-[oklch(0.8_0.05_140)]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("הסיסמאות אינן תואמות"); return; }
    if (password.length < 6) { setError("הסיסמה חייבת להיות לפחות 6 תווים"); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl gradient-cta flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl" style={{ color: "oklch(0.2 0.05 255)" }}>BondFlow</span>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10" style={{ boxShadow: "0 24px 64px oklch(0.28 0.05 255 / 0.12)" }}>
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.65 0.14 140)" }} />
              <h2 className="text-xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>הסיסמה עודכנה!</h2>
              <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>מעביר אותך לדשבורד...</p>
            </div>
          ) : (
            <>
              <div className="text-right mb-7">
                <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "oklch(0.88 0.08 140 / 0.15)" }}>
                  <Lock className="w-5 h-5" style={{ color: "oklch(0.65 0.14 140)" }} />
                </div>
                <h1 className="text-2xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>סיסמה חדשה</h1>
                <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>הזן סיסמה חדשה לחשבונך</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute top-1/2 -translate-y-1/2 start-4">
                    {showPw ? <EyeOff className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} /> : <Eye className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />}
                  </button>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="סיסמה חדשה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required minLength={6}
                    className={inputClass}
                    style={{ borderColor: "oklch(0.88 0.02 85)", paddingInlineStart: "2.75rem" }}
                  />
                </div>
                <input
                  type="password"
                  placeholder="אשר סיסמה"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={inputClass}
                  style={{ borderColor: "oklch(0.88 0.02 85)" }}
                />
                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm text-right" style={{ background: "oklch(0.95 0.04 25 / 0.3)", color: "oklch(0.45 0.15 25)" }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-cta text-white rounded-2xl h-13 py-3.5 text-base font-black disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
                >
                  {loading ? "מעדכן..." : "עדכן סיסמה"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
