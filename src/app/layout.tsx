import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bonflowapp.vercel.app"
  ),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon-192.png", type: "image/png", sizes: "180x180" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icon-192.png",
  },
  title: "BondFlow - מצא רגעים אמיתיים עם הילדים שלך",
  description:
    "אפליקציית לוח הזמנים המשפחתי עם AI לעזרת הורים עסוקים. BondFlow מוצאת פרצות זמן אמיתיות ביומן שלך ומציעה פעילויות אפס-הכנה שהילדים שלך יאהבו.",
  keywords: [
    "זמן משפחתי", "אפליקציה להורים", "ישראל", "זמן איכות", "הורות",
    "פעילויות לילדים", "פעילויות עם ילדים", "אפליקציה לזמן משפחתי",
    "רעיונות לפעילויות", "זמן איכות עם ילדים", "תזמון משפחתי",
    "bonding", "family time", "activities for kids",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BondFlow",
  },
  openGraph: {
    title: "BondFlow - הילדים שלך לא צריכים עוד כסף. הם צריכים יותר אותך.",
    description:
      "הפוך 20 דקות כאוטיות לזיכרונות שנשארים. BondFlow היא מתזמנת המשפחה עם AI שנבנתה להורים ישראלים עסוקים.",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "BondFlow — רגעים עם הילדים" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[var(--font-heebo)]">
        <ServiceWorkerRegistration />
        <Toaster position="top-center" dir="rtl" richColors />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
