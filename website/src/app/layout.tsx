import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { NO_FLASH_SCRIPT } from "@/lib/site-theme";

export const metadata: Metadata = {
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
