import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ApexRN — brutalist UI components for React Native",
  description:
    "Copy-paste React Native components with hard borders, offset shadows and real press physics. Built for Expo, themeable with one file, owned by your codebase.",
  keywords: [
    "React Native",
    "Expo",
    "UI library",
    "brutalist UI",
    "component library",
    "TypeScript",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
