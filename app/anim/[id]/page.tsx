import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayDemo } from "@/components/Demo";
import { VersionPanel } from "@/components/VersionPanel";
import { animations, getAnimation, levelLabel, neighbors, sourceUrl, versionEntries, youtubeUrl } from "@/lib/catalog";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return animations.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = getAnimation(id);
  if (!a) return {};
  return {
    title: a.name,
    description: `${a.description} React Native Reanimated 4 code (with a Reanimated 3 version), Flutter, SwiftUI and Jetpack Compose ports, and the /anim ${a.id} prompt command.`,
    alternates: { canonical: `/anim/${a.id}` },
  };
}

export default async function AnimationPage({ params }: Props) {
  const { id } = await params;
  const a = getAnimation(id);
  if (!a) notFound();
  const { prev, next } = neighbors(a.id);
  const yt = youtubeUrl(a);
  const src = sourceUrl(a);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/#animations">← cd ../animations</Link>
        <span aria-hidden="true">/</span>
        <span>{a.id}</span>
      </nav>

      <div className="detail">
        <div className="col">
          <div className="eyebrow">$ git show {a.id}</div>
          <h1>{a.name}</h1>
          <div className="meta">
            <span className={`lv ${a.level}`}>{levelLabel(a.level)}</span>
            <span className="cmd">/anim {a.id}</span>
          </div>
          <p className="desc">{a.description}</p>
          <ReplayDemo id={a.id} html={a.demo} label={a.name} />
          {a.source && (
            <div className="inspired">
              <span className="src">Inspired by {a.source.app}</span>
              <span style={{ fontSize: 14.5, color: "var(--ink-2)" }}>
                From William Candillon’s “Can it be done in React Native?” series. The code here is a simplified rewrite for Reanimated 4 and 3.
              </span>
              <div className="links">
                {yt && <a href={yt} target="_blank" rel="noopener noreferrer">Find the episode on YouTube ↗</a>}
                {src && <a href={src} target="_blank" rel="noopener noreferrer">Original source code ↗</a>}
              </div>
            </div>
          )}
        </div>

        <div className="col">
          <VersionPanel id={a.id} entries={versionEntries(a)} />
        </div>
      </div>

      <nav className="pager" aria-label="More animations">
        {prev && (
          <Link href={`/anim/${prev.id}`}>
            <span className="k">← git checkout HEAD~1</span>
            <span className="n">{prev.name}</span>
          </Link>
        )}
        {next && (
          <Link href={`/anim/${next.id}`} className="next">
            <span className="k">git checkout HEAD+1 →</span>
            <span className="n">{next.name}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
