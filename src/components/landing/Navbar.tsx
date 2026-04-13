"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-cta flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-[oklch(0.28_0.05_255)]">
              BondFlow
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-[oklch(0.5_0.03_255)] hover:text-[oklch(0.65_0.14_140)] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              className="text-sm text-[oklch(0.5_0.03_255)] hover:text-[oklch(0.65_0.14_140)] transition-colors"
            >
              Benefits
            </a>
            <a
              href="#pricing"
              className="text-sm text-[oklch(0.5_0.03_255)] hover:text-[oklch(0.65_0.14_140)] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm text-[oklch(0.5_0.03_255)] hover:text-[oklch(0.65_0.14_140)] transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[oklch(0.5_0.03_255)] hover:text-[oklch(0.65_0.14_140)]"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="gradient-cta text-white border-0 hover:opacity-90 rounded-xl px-5"
            >
              Start Free
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[oklch(0.5_0.03_255)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-border/50 pt-3">
            <div className="flex flex-col gap-3">
              {["How It Works", "Benefits", "Pricing", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-[oklch(0.5_0.03_255)] hover:text-[oklch(0.65_0.14_140)] py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Button className="gradient-cta text-white border-0 mt-2 rounded-xl">
                Start Free — No Card Needed
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
