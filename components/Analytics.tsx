import Script from "next/script";

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL?.replace(/\/+$/, "");

/** Loads the cookie-free tracker. Renders nothing unless NEXT_PUBLIC_ANALYTICS_URL is set at build time. */
export function Analytics({ site }: { site: string }) {
  if (!ANALYTICS_URL) return null;
  return <Script src={`${ANALYTICS_URL}/t.js`} data-site={site} strategy="afterInteractive" />;
}
