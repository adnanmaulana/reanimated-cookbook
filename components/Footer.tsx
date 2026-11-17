import { AUTHOR, AUTHOR_LINKEDIN } from "@/lib/site";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <span>
          © 2026 <a href={AUTHOR_LINKEDIN}>{AUTHOR}</a>
        </span>
        <span>built on main · Next.js on Vercel</span>
      </div>
    </footer>
  );
}
