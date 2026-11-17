import Link from "next/link";
import { animations } from "@/lib/catalog";
import { Logo } from "./Logo";

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Link href="/" className="brand" aria-label="Reanimated Cookbook home">
            <Logo />
            <span className="brand-name">&lt;cookbook /&gt;</span>
            <span className="badge-ver">RN·V4</span>
          </Link>
          <nav className="nav-links" aria-label="Sections">
            <Link href="/#readme">readme</Link>
            <Link href="/#animations">animations</Link>
            <a href="/glossary.txt">glossary</a>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="pill">
            <span className="dot" />
            {animations.length} animations
          </span>
          <Link href="/#animations" className="btn">
            git checkout anim
          </Link>
        </div>
      </div>
    </header>
  );
}
