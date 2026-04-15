"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "יתרונות", href: "#benefits" },
  { label: "שאלות נפוצות", href: "#faq" },
  { label: "מחירים", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* לוגו */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="BondFlow"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                objectFit: "cover",
                objectPosition: "50% 28%",
                flexShrink: 0,
              }}
            />
            <span className="font-bold text-xl" style={{ color: "oklch(0.28 0.05 255)" }}>
              BondFlow
            </span>
          </div>

          {/* ניווט דסקטופ */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: "oklch(0.5 0.03 255)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* כפתורי פעולה */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth"
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-sm"}
              style={{ color: "oklch(0.5 0.03 255)" }}
            >
              כניסה
            </Link>
            <Link href="/auth" className={buttonVariants({ size: "sm" }) + " gradient-cta text-white border-0 hover:opacity-90 rounded-xl px-5 text-sm font-semibold"}>
              התחל בחינם
            </Link>
          </div>

          {/* כפתור תפריט מובייל */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "oklch(0.5 0.03 255)" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* תפריט מובייל */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t pt-3" style={{ borderColor: "oklch(0.9 0.02 85)" }}>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm py-1"
                  style={{ color: "oklch(0.45 0.03 255)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link href="/auth" className="text-sm py-1 font-medium" style={{ color: "oklch(0.55 0.03 255)" }} onClick={() => setMenuOpen(false)}>
                כניסה לחשבון קיים
              </Link>
              <Link href="/auth" className={buttonVariants() + " gradient-cta text-white border-0 mt-1 rounded-xl font-semibold w-full justify-center"}>
                התחל בחינם - ללא כרטיס אשראי
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
