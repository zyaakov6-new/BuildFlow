import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BondFlow - מצא רגעים אמיתיים עם הילדים שלך",
  description:
    "אפליקציית לוח הזמנים המשפחתי עם AI לעזרת הורים עסוקים. BondFlow מוצאת פרצות זמן אמיתיות ביומן שלך ומציעה פעילויות אפס-הכנה שהילדים שלך יאהבו.",
  keywords: ["זמן משפחתי", "אפליקציה להורים", "ישראל", "זמן איכות", "הורות"],
  openGraph: {
    title: "BondFlow - הילדים שלך לא צריכים עוד כסף. הם צריכים יותר אותך.",
    description:
      "הפוך 20 דקות כאוטיות לזיכרונות שנשארים. BondFlow היא מתזמנת המשפחה עם AI שנבנתה להורים ישראלים עסוקים.",
    type: "website",
  },
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
        {children}
      </body>
    </html>
  );
}
