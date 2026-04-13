"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, EyeOff, ArrowLeft, Mail, Lock, User } from "lucide-react";

type Mode = "signin" | "signup" | "magic";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async auth - replace with real Supabase/NextAuth call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (mode === "magic") {
      setMagicSent(true);
      return;
    }
    // After successful auth, go to onboarding for new users or dashboard
    if (mode === "signup") {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const inputClass = `
    w-full rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all
    bg-white border-2 text-right
    placeholder:text-[oklch(0.7_0.02_255)]
    focus:border-[oklch(0.65_0.14_140)]
    hover:border-[oklch(0.8_0.05_140)]
  `;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "oklch(0.65 0.14 140)" }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "oklch(0.72 0.18 42)" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl gradient-cta flex items-center justify-center shadow-lg" style={{ boxShadow: "0 8px 20px oklch(0.65 0.14 140 / 0.35)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl" style={{ color: "oklch(0.2 0.05 255)" }}>BondFlow</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10" style={{ boxShadow: "0 24px 64px oklch(0.28 0.05 255 / 0.12)" }}>

          {/* Magic link sent state */}
          {magicSent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-2xl font-black mb-3" style={{ color: "oklch(0.2 0.03 255)" }}>בדוק את האימייל שלך</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "oklch(0.5 0.03 255)" }}>
                שלחנו לך קישור כניסה ל-<span className="font-bold" style={{ color: "oklch(0.45 0.14 140)" }}>{form.email}</span>.
                <br />הקישור תקף ל-10 דקות.
              </p>
              <Button
                variant="ghost"
                className="text-sm font-semibold"
                style={{ color: "oklch(0.65 0.14 140)" }}
                onClick={() => { setMagicSent(false); setMode("signin"); }}
              >
                חזור לכניסה
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex rounded-2xl p-1 mb-7" style={{ background: "oklch(0.95 0.02 85)" }}>
                {(["signin", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? "bg-white shadow-sm" : ""}`}
                    style={{
                      color: mode === m ? "oklch(0.2 0.03 255)" : "oklch(0.55 0.03 255)",
                    }}
                  >
                    {m === "signin" ? "כניסה" : "הרשמה"}
                  </button>
                ))}
              </div>

              {/* Headline */}
              <div className="text-right mb-7">
                <h1 className="text-2xl font-black mb-1.5" style={{ color: "oklch(0.2 0.03 255)" }}>
                  {mode === "signin" ? "ברוך הבא בחזרה 👋" : "מתחילים את המסע 🚀"}
                </h1>
                <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>
                  {mode === "signin"
                    ? "כנס לחשבון שלך וחזור לרגעים המשפחתיים."
                    : "צור חשבון בחינם - ללא כרטיס אשראי."}
                </p>
              </div>

              {/* Social buttons */}
              <div className="flex flex-col gap-3 mb-6">
                <button
                  className="flex items-center justify-center gap-3 w-full rounded-2xl py-3.5 text-sm font-semibold border-2 transition-all hover:border-[oklch(0.7_0.05_255)] active:scale-[0.98]"
                  style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.3 0.03 255)" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  המשך עם Google
                </button>
                <button
                  className="flex items-center justify-center gap-3 w-full rounded-2xl py-3.5 text-sm font-semibold border-2 transition-all hover:border-[oklch(0.7_0.05_255)] active:scale-[0.98]"
                  style={{ borderColor: "oklch(0.88 0.02 85)", color: "oklch(0.3 0.03 255)" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  המשך עם Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: "oklch(0.9 0.02 85)" }} />
                <span className="text-xs font-medium" style={{ color: "oklch(0.65 0.03 255)" }}>או עם אימייל</span>
                <div className="flex-1 h-px" style={{ background: "oklch(0.9 0.02 85)" }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "signup" && (
                  <div className="relative">
                    <User className="absolute top-1/2 -translate-y-1/2 end-4 w-4 h-4 pointer-events-none" style={{ color: "oklch(0.7 0.03 255)" }} />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="שם מלא"
                      required
                      className={inputClass}
                      style={{ borderColor: "oklch(0.88 0.02 85)", paddingInlineEnd: "2.75rem" }}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 end-4 w-4 h-4 pointer-events-none" style={{ color: "oklch(0.7 0.03 255)" }} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="כתובת אימייל"
                    required
                    className={inputClass}
                    style={{ borderColor: "oklch(0.88 0.02 85)", paddingInlineEnd: "2.75rem" }}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 end-4 w-4 h-4 pointer-events-none" style={{ color: "oklch(0.7 0.03 255)" }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 start-4"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />
                      : <Eye className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />}
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="סיסמה"
                    required
                    minLength={6}
                    className={inputClass}
                    style={{ borderColor: "oklch(0.88 0.02 85)", paddingInlineEnd: "2.75rem", paddingInlineStart: "2.75rem" }}
                  />
                </div>

                {mode === "signin" && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.65 0.14 140)" }}
                      onClick={() => setMode("magic")}
                    >
                      שכחת סיסמה? כנס עם קישור מהיר
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-13 text-base font-black mt-1 disabled:opacity-60"
                  style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      רגע...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 ml-2" />
                      {mode === "signin" ? "כניסה לחשבון" : "יצירת חשבון חינמי"}
                    </>
                  )}
                </Button>
              </form>

              {/* Magic link option */}
              {mode !== "magic" && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setMode("magic")}
                    className="text-xs font-medium transition-colors"
                    style={{ color: "oklch(0.6 0.03 255)" }}
                  >
                    מעדיף קישור כניסה במייל ללא סיסמה?{" "}
                    <span style={{ color: "oklch(0.65 0.14 140)" }} className="font-bold">לחץ כאן</span>
                  </button>
                </div>
              )}

              {/* Switch mode */}
              <p className="text-center text-xs mt-4" style={{ color: "oklch(0.6 0.03 255)" }}>
                {mode === "signin" ? "עדיין אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
                <button
                  type="button"
                  className="font-bold"
                  style={{ color: "oklch(0.65 0.14 140)" }}
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "הרשמה בחינם" : "כניסה"}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Back to landing */}
        <div className="mt-6 flex justify-center">
          <a
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "oklch(0.55 0.05 255)" }}
          >
            חזרה לדף הבית
            <ArrowLeft className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Magic link mode full form */}
        {mode === "magic" && !magicSent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10" style={{ boxShadow: "0 24px 64px oklch(0.28 0.05 255 / 0.12)" }}>
              <button
                onClick={() => setMode("signin")}
                className="flex items-center gap-1.5 text-sm font-semibold mb-6"
                style={{ color: "oklch(0.65 0.14 140)" }}
              >
                חזור
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="text-right mb-7">
                <div className="text-3xl mb-3">✉️</div>
                <h2 className="text-2xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>כניסה עם קישור מהיר</h2>
                <p className="text-sm" style={{ color: "oklch(0.55 0.03 255)" }}>נשלח לך קישור כניסה ישירות לאימייל. ללא סיסמה.</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 end-4 w-4 h-4 pointer-events-none" style={{ color: "oklch(0.7 0.03 255)" }} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="כתובת אימייל"
                    required
                    className={inputClass}
                    style={{ borderColor: "oklch(0.88 0.02 85)", paddingInlineEnd: "2.75rem" }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="gradient-cta text-white border-0 hover:opacity-90 rounded-2xl h-13 text-base font-black disabled:opacity-60"
                  style={{ boxShadow: "0 8px 24px oklch(0.65 0.14 140 / 0.35)" }}
                >
                  {loading ? "שולח..." : "שלח לי קישור כניסה"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
