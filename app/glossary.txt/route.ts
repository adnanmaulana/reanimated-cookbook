import { glossary } from "@/lib/catalog";

export const dynamic = "force-static";

export function GET() {
  return new Response(glossary(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
