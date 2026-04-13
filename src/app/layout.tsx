import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BondFlow — Find Real Family Moments in Your Impossible Schedule",
  description:
    "AI-powered family time scheduler for busy Israeli parents. BondFlow finds hidden pockets in your calendar and suggests zero-prep activities your kids actually love.",
  keywords: ["family time", "parenting app", "Israel", "family scheduler", "quality time", "busy parents"],
  openGraph: {
    title: "BondFlow — Your Kids Don't Need More Money. They Need More You.",
    description:
      "Turn 20 chaotic minutes into memories that last. BondFlow is the AI family planner built for Israeli working parents.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
