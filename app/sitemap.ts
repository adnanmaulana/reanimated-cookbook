import type { MetadataRoute } from "next";
import { animations } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...animations.map((a) => ({ url: `${SITE_URL}/anim/${a.id}`, priority: 0.7 })),
  ];
}
