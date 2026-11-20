import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted variable fonts (latin subset), so builds don't depend on Google Fonts.
const sans = localFont({
  src: "./fonts/SpaceGrotesk-latin.woff2",
  weight: "300 700",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
const mono = localFont({
  src: "./fonts/JetBrainsMono-latin.woff2",
  weight: "100 800",
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description:
    "101 React Native Reanimated animations from basic to advanced, each with a live preview, Reanimated 4 code (plus a Reanimated 3 version), Flutter, SwiftUI and Jetpack Compose ports, and a /anim command to paste into AI prompts.",
  openGraph: { type: "website", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#F3F5EE",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Nav />
        <main id="top">{children}</main>
        <Footer />
        <Analytics site="reanimated-cookbook" />
      </body>
    </html>
  );
}
