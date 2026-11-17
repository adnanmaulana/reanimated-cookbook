import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { CopyButton } from "@/components/CopyButton";
import { Skyline } from "@/components/Skyline";
import { animations, cardData, glossary } from "@/lib/catalog";

export default function Home() {
  const total = animations.length;
  const fromYoutube = animations.filter((a) => a.source).length;
  const gestures = animations.filter((a) => a.code.includes("Gesture.")).length;
  const cssApi = animations.filter((a) => a.codeV4.includes("animationName") || a.codeV4.includes("transitionProperty")).length;

  return (
    <>
      <section className="hero">
        <div className="float term" style={{ left: "3%", top: 300, width: 290, transform: "rotate(-5deg)" }} aria-hidden="true">
          <div className="term-bar">
            <i style={{ background: "#2F5BFF" }} />
            <i style={{ background: "#C6F25B" }} />
            <i style={{ background: "#F2558A" }} />
            <span>~/my-app — zsh</span>
          </div>
          <pre>
            <span style={{ color: "var(--prompt)" }}>$</span> git log --oneline -4{"\n"}
            <span className="hash">7f3a2c1</span> feat: /anim spring-bounce{"\n"}
            <span className="hash">c41b9e0</span> feat: /anim bottom-sheet{"\n"}
            <span className="hash">a08d6f4</span> feat: /anim stagger-list{"\n"}
            <span className="hash">5e2c113</span> fix: 60fps on UI thread
          </pre>
        </div>
        <div className="float note" style={{ right: "3%", top: 110, width: 260, transform: "rotate(4deg)" }} aria-hidden="true">
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-3)" }}>
            PROMPT · ONE LINE
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginTop: 10 }}>/anim liquid-swipe on the onboarding</div>
          <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 8 }}>
            The glossary tells your AI exactly what each command means.
          </div>
        </div>
        <div
          className="float fps"
          style={{ right: "6%", top: 470, width: 210, transform: "rotate(-3deg)" }}
          aria-hidden="true"
        >
          <span className="mono" style={{ fontSize: 11, color: "var(--night)", background: "var(--lime)", padding: "3px 8px", borderRadius: 5 }}>
            UI thread
          </span>
          <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--term-fg)" }}>60 fps</span>
        </div>

        <div className="wrap hero-in">
          <Link href="/#animations" className="head-chip">
            <b>HEAD</b>
            {fromYoutube} real-app animations from “Can it be done in React Native?”
            <span style={{ color: "var(--ink-3)" }}>→</span>
          </Link>
          <h1>
            <span className="soft">Reanimated recipes</span> you can <span className="mark">ship with one prompt.</span>
          </h1>
          <div className="commit">
            <span className="ok" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="hash">/anim</span>
            <span style={{ fontWeight: 700 }}>
              spring-bounce<span className="cursor">_</span>
            </span>
          </div>
          <p className="lede">
            {total} React Native animations, from a simple fade to gesture-driven sheets. Every one has a live preview, Reanimated 4 code (with a Reanimated 3 version), ports for
            Flutter, SwiftUI and Jetpack Compose, and a short command you can drop into Claude, Cursor or any AI coding tool.
          </p>
          <div className="hero-ctas">
            <Link href="#animations" className="btn lg">
              Browse animations <span aria-hidden="true">→</span>
            </Link>
            <CopyButton text={glossary()} label="git clone glossary" copiedLabel="Glossary copied" className="btn ghost lg" />
          </div>
        </div>
        <Skyline />
      </section>

      <section className="stats" aria-label="Catalog stats">
        <div className="stats-in">
          {/* Six identical sets (two halves of three) so each half is wider than any screen;
              the track slides by exactly half its width, so the loop never shows a gap or a jump. */}
          <div className="stats-track">
            {[0, 1, 2, 3, 4, 5].map((copy) => (
              <div className="stats-set" key={copy} aria-hidden={copy > 0 ? true : undefined}>
                <span className="stat"><b>{total}</b>ANIMATIONS</span>
                <span className="stat"><b>{fromYoutube}</b>FROM REAL APPS</span>
                <span className="stat"><b>{gestures}</b>GESTURE-DRIVEN</span>
                <span className="stat"><b>v4</b>MAIN · <b>v3</b>INCLUDED</span>
                <span className="stat"><b>+3</b>FLUTTER · SWIFTUI · COMPOSE</span>
                <span className="stat"><b>{cssApi}</b>ON THE V4 CSS API</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="readme" className="wrap section">
        <div className="eyebrow">$ cat README.md</div>
        <h2 className="title">How the commands work</h2>
        <div className="steps">
          <div className="step">
            <span className="k">01 · git clone</span>
            <h3>Copy the glossary once</h3>
            <p>
              Paste it at the top of your AI chat, or into <code className="inline">CLAUDE.md</code> or{" "}
              <code className="inline">.cursorrules</code> in your project. It defines every <code className="inline">/anim</code> command.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
              <CopyButton text={glossary()} label="Copy glossary" />
              <a className="btn ghost" href="/glossary.txt">Open .txt</a>
            </div>
          </div>
          <div className="step">
            <span className="k">02 · git commit</span>
            <h3>Write one line</h3>
            <p>
              Point at a component and name the animation: <code className="inline">/anim press-scale on CheckoutButton</code>. Add{" "}
              <code className="inline">@v3</code> for the Reanimated 3 version: <code className="inline">/anim press-scale@v3</code>. Not on React
              Native? Use <code className="inline">@flutter</code>, <code className="inline">@swiftui</code> or{" "}
              <code className="inline">@compose</code>.
            </p>
          </div>
          <div className="step">
            <span className="k">03 · git show</span>
            <h3>Need it exact? Copy the full prompt</h3>
            <p>Open any animation to copy a full prompt with the description, the key APIs and a working Reanimated 4 reference. Switch tabs on the same page for Reanimated 3, Flutter, SwiftUI or Jetpack Compose.</p>
          </div>
        </div>
      </section>

      <section id="animations" className="wrap section">
        <div className="eyebrow">$ ls ./animations</div>
        <h2 className="title">Pick an animation</h2>
        <Catalog cards={animations.map(cardData)} />
      </section>
    </>
  );
}
