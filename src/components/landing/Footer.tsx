const navLinks = [
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "יתרונות", href: "#benefits" },
  { label: "מחירים", href: "#pricing" },
  { label: "שאלות נפוצות", href: "#faq" },
];

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
            <span className="font-black text-xl text-white">BondFlow</span>
          </div>

          {/* ניווט */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: "oklch(0.65 0.05 255)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div
          className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: "oklch(0.38 0.05 255)" }}
        >
          <p className="text-xs" style={{ color: "oklch(0.55 0.05 255)" }}>
            כל הזכויות שמורות 2025 BondFlow - נבנה בישראל 🇮🇱 למשפחות ישראליות.
          </p>
          <div className="flex gap-5">
            {[
              { label: "מדיניות פרטיות", href: "/privacy" },
              { label: "תנאי שימוש",      href: "/terms" },
              { label: "צור קשר",         href: "mailto:support@bondflow.app" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs transition-colors"
                style={{ color: "oklch(0.55 0.05 255)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
