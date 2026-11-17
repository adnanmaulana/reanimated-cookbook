// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is set automatically (e.g. "reanimated-cookbook.vercel.app").
// Set NEXT_PUBLIC_SITE_URL to override it, for example with a custom domain.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Reanimated Cookbook";
export const AUTHOR = "Adnan Radja Maulana";
export const AUTHOR_LINKEDIN = "https://id.linkedin.com/in/adnanradjam";
