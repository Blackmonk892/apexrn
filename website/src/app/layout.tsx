import type { Metadata, Viewport } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { BASE_PATH } from "@/lib/base-path";
import { PRESET_SCRIPT } from "@/lib/preset-script";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-apexrn-site.invalid";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL.endsWith("/") ? SITE_URL : `${SITE_URL}/`),
  title: { default: "ApexRN", template: "%s | ApexRN" },
  description: "Brutalist UI components for React Native and Expo. A CLI copies the source into your app.",
  other: { "color-scheme": "light dark" },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "light dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRESET_SCRIPT }} />
      </head>
      <body>
        <a href="#nd-page" className="ax-skip">
          Skip to content
        </a>
        <RootProvider
          theme={{ attribute: "class", defaultTheme: "system", enableSystem: true, disableTransitionOnChange: true }}
          search={{ options: { type: "static", api: `${BASE_PATH}/api/search` } }}
        >
          <ThemeColorSync />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
