import { Lock, Globe, Smartphone, MapPin } from "lucide-react";

const trustBadges = [
  { Icon: Lock, text: "נתוני היומן פרטיים לגמרי" },
  { Icon: Globe, text: "ממשק מלא בעברית" },
  { Icon: MapPin, text: "נבנה ללוח הישראלי" },
  { Icon: Smartphone, text: "iOS + Android + Google Calendar" },
];

export default function SocialProof() {
  return (
    <section className="py-8" style={{ background: "oklch(0.98 0.01 85)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-3">
          {trustBadges.map((badge, i) => {
            const Icon = badge.Icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: "white", border: "1px solid oklch(0.9 0.02 85)", color: "oklch(0.45 0.03 255)" }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.65 0.14 140)" }} />
                <span>{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
