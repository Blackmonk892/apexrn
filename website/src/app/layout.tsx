import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { NO_FLASH_SCRIPT } from "@/lib/site-theme";

// Canonical URLs must be absolute, so they exist only when the deploy supplies the origin.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { default: "ApexRN: brutalist UI parts for React Native", template: "%s | ApexRN" },
  description:
    "A catalogue of React Native components you copy into your app with one command. Thick borders, zero radius, hard shadows. You own the code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-preset="neo" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body>
        <TopBar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
