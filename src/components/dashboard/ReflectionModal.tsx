"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (rating: 1 | 2 | 3) => void | Promise<void>;
}

const OPTIONS: { emoji: string; rating: 1 | 2 | 3; label: string }[] = [
  { emoji: "😞", rating: 1, label: "לא הצליח" },
  { emoji: "😐", rating: 2, label: "בסדר" },
  { emoji: "😊", rating: 3, label: "היה מעולה" },
];

export default function ReflectionModal({ open, title, onClose, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handlePick = async (rating: 1 | 2 | 3) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(rating);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        className="w-full max-w-sm rounded-3xl p-6 text-right"
        style={{ background: "white", boxShadow: "0 20px 60px oklch(0 0 0 / 0.2)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-[oklch(0.95_0.01_85)]"
            style={{ color: "oklch(0.55 0.03 255)" }}
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <p className="text-lg font-black leading-tight" style={{ color: "oklch(0.18 0.03 255)" }}>
              איך היה?
            </p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.03 255)" }}>
              {title}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-between mt-6">
          {OPTIONS.map((opt) => (
            <button
              key={opt.rating}
              onClick={() => handlePick(opt.rating)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-4 border transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
              style={{
                background: "oklch(0.97 0.01 85)",
                borderColor: "oklch(0.9 0.02 85)",
              }}
            >
              <span className="text-3xl" role="img" aria-label={opt.label}>{opt.emoji}</span>
              <span className="text-xs font-bold" style={{ color: "oklch(0.35 0.03 255)" }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: "oklch(0.62 0.03 255)" }}>
          הדירוג שלך עוזר לנו להמליץ פעילויות טובות יותר
        </p>
      </div>
    </div>
  );
}
