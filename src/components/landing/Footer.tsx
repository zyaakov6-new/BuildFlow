"use client";

import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="py-12 border-t"
      style={{
        background: "oklch(0.28 0.05 255)",
        borderColor: "oklch(0.35 0.05 255)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-cta flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">BondFlow</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {["How It Works", "Benefits", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm transition-colors"
                style={{ color: "oklch(0.65 0.05 255)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "oklch(0.85 0.05 255)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "oklch(0.65 0.05 255)")
                }
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div
          className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: "oklch(0.38 0.05 255)" }}
        >
          <p className="text-xs" style={{ color: "oklch(0.55 0.05 255)" }}>
            © 2025 BondFlow. All rights reserved. · Made in 🇮🇱 for Israeli
            families.
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "oklch(0.55 0.05 255)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "oklch(0.75 0.05 255)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "oklch(0.55 0.05 255)")
                }
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
