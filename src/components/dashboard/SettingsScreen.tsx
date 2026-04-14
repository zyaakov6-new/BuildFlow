"use client";

import { useState } from "react";
import {
  Bell,
  Globe,
  Calendar,
  Shield,
  HelpCircle,
  ChevronLeft,
  Check,
  Moon,
  Smartphone,
  Trash2,
  FileText,
  Mail,
} from "lucide-react";

// ---- Toggle switch ----
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: checked ? "oklch(0.65 0.14 140)" : "oklch(0.85 0.02 255)" }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ right: checked ? "0.125rem" : "auto", left: checked ? "auto" : "0.125rem" }}
      />
    </button>
  );
}

// ---- Setting row ----
function SettingRow({
  Icon,
  label,
  sublabel,
  right,
}: {
  Icon: React.ElementType;
  label: string;
  sublabel?: string;
  right: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3.5 border-b last:border-0 text-right"
      style={{ borderColor: "oklch(0.95 0.01 85)" }}
    >
      <div className="flex-shrink-0">{right}</div>
      <div className="flex items-center gap-3 flex-row-reverse flex-1 min-w-0 mr-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.94 0.02 85)" }}
        >
          <Icon className="w-4 h-4" style={{ color: "oklch(0.65 0.14 140)" }} />
        </div>
        <div className="text-right min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "oklch(0.25 0.03 255)" }}>{label}</p>
          {sublabel && <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.03 255)" }}>{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

// ---- Section card ----
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p
        className="text-xs font-black uppercase tracking-wider mb-2 text-right px-1"
        style={{ color: "oklch(0.6 0.03 255)" }}
      >
        {title}
      </p>
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ background: "white", borderColor: "oklch(0.93 0.02 85)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ---- Language picker ----
const LANGUAGES = [
  { id: "he", label: "עברית" },
  { id: "en", label: "English" },
];

// ---- Calendar options ----
const CALENDAR_OPTIONS = [
  { id: "google", label: "Google Calendar", connected: true },
  { id: "apple", label: "Apple Calendar", connected: false },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailDigest: false,
    weeklyReport: true,
    quietHours: false,
    darkMode: false,
    language: "he",
    calendarSync: "google",
  });

  const set = (key: keyof typeof settings, val: boolean | string) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6">
        {/* Notifications */}
        <Section title="התראות">
          <SettingRow
            Icon={Bell}
            label="התראות פוש"
            sublabel="תזכורות לרגעים משפחתיים"
            right={
              <Toggle
                checked={settings.pushNotifications}
                onChange={(v) => set("pushNotifications", v)}
              />
            }
          />
          <SettingRow
            Icon={Mail}
            label="סיכום שבועי במייל"
            sublabel="מגיע כל יום ראשון"
            right={
              <Toggle
                checked={settings.emailDigest}
                onChange={(v) => set("emailDigest", v)}
              />
            }
          />
          <SettingRow
            Icon={FileText}
            label="דוח חיבור שבועי"
            sublabel="סיכום ניצחונות השבוע"
            right={
              <Toggle
                checked={settings.weeklyReport}
                onChange={(v) => set("weeklyReport", v)}
              />
            }
          />
          <SettingRow
            Icon={Moon}
            label="שעות שקט"
            sublabel="אין התראות 22:00 - 7:00"
            right={
              <Toggle
                checked={settings.quietHours}
                onChange={(v) => set("quietHours", v)}
              />
            }
          />
        </Section>

        {/* Calendar */}
        <Section title="יומן">
          {CALENDAR_OPTIONS.map((cal) => (
            <SettingRow
              key={cal.id}
              Icon={Calendar}
              label={cal.label}
              sublabel={cal.connected ? "מחובר ופעיל" : "לא מחובר"}
              right={
                cal.connected ? (
                  <div
                    className="flex items-center gap-1 rounded-xl px-2.5 py-1"
                    style={{ background: "oklch(0.88 0.08 140 / 0.2)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: "oklch(0.55 0.14 140)" }} />
                    <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.14 140)" }}>
                      מחובר
                    </span>
                  </div>
                ) : (
                  <button
                    className="rounded-xl px-3 py-1 text-xs font-bold border"
                    style={{
                      borderColor: "oklch(0.65 0.14 140)",
                      color: "oklch(0.55 0.14 140)",
                    }}
                  >
                    חבר
                  </button>
                )
              }
            />
          ))}
          <SettingRow
            Icon={Smartphone}
            label="סנכרון אוטומטי"
            sublabel="עדכון היומן כל שעה"
            right={<ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />}
          />
        </Section>

        {/* App */}
        <Section title="אפליקציה">
          <SettingRow
            Icon={Globe}
            label="שפה"
            sublabel={settings.language === "he" ? "עברית" : "English"}
            right={
              <div className="flex gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => set("language", lang.id)}
                    className="rounded-xl px-2.5 py-1 text-xs font-bold transition-all"
                    style={{
                      background: settings.language === lang.id
                        ? "oklch(0.65 0.14 140)"
                        : "oklch(0.93 0.02 85)",
                      color: settings.language === lang.id ? "white" : "oklch(0.55 0.03 255)",
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            }
          />
          <SettingRow
            Icon={Moon}
            label="מצב לילה"
            sublabel="כהה יותר לעיניים"
            right={
              <Toggle
                checked={settings.darkMode}
                onChange={(v) => set("darkMode", v)}
              />
            }
          />
        </Section>

        {/* Privacy & Support */}
        <Section title="פרטיות ותמיכה">
          <SettingRow
            Icon={Shield}
            label="מדיניות פרטיות"
            sublabel="איך אנחנו שומרים על הנתונים שלך"
            right={<ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />}
          />
          <SettingRow
            Icon={HelpCircle}
            label="עזרה ותמיכה"
            sublabel="שאלות? אנחנו כאן"
            right={<ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />}
          />
          <SettingRow
            Icon={FileText}
            label="תנאי שימוש"
            sublabel=""
            right={<ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.7 0.03 255)" }} />}
          />
        </Section>

        {/* Danger zone */}
        <div className="mb-6">
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: "oklch(0.88 0.06 25)" }}
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-right"
              style={{ background: "oklch(0.97 0.02 25)" }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.65 0.15 25)" }} />
              <div className="flex items-center gap-3 flex-row-reverse">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.92 0.05 25)" }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: "oklch(0.55 0.18 25)" }} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.18 25)" }}>
                    מחיקת חשבון
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.10 25)" }}>
                    פעולה זו לא ניתנת לביטול
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs pb-2" style={{ color: "oklch(0.75 0.02 255)" }}>
          BondFlow v0.1.0 - נבנה בישראל
        </p>
      </div>
    </div>
  );
}
