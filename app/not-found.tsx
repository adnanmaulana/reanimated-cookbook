import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section" style={{ textAlign: "center" }}>
      <div className="eyebrow">fatal: pathspec did not match any files</div>
      <h1 className="title" style={{ fontSize: 44 }}>404 · animation not found</h1>
      <p style={{ color: "var(--ink-2)" }}>That command doesn’t exist in the cookbook.</p>
      <Link className="btn" href="/#animations">git checkout main</Link>
    </div>
  );
}
