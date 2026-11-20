"use client";

import { useEffect, useRef, useState } from "react";
import { trackAttrs } from "@/lib/analytics";

// Renders a demo's static HTML preview. Demo markup is authored in data/animations.ts (trusted, no user input).
export function Demo({ html, big = false, label }: { html: string; big?: boolean; label: string }) {
  return (
    <div
      className={big ? "stage big" : "stage"}
      role="img"
      aria-label={`Preview of the ${label} animation`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ReplayDemo({ id, html, label }: { id: string; html: string; label: string }) {
  const [run, setRun] = useState(0);
  return (
    <div className="col" style={{ gap: 10 }}>
      <Demo key={run} html={html} big label={label} />
      <div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setRun((r) => r + 1)}
          {...trackAttrs("demo_replay", { anim: id })}
        >
          ↺ Replay preview
        </button>
      </div>
    </div>
  );
}

// Card preview that mounts its markup only when it nears the viewport, fades in, and pauses its
// looping animations while scrolled out of view. Cards keep their full size, so nothing shifts.
export function LazyDemo({ html, label, eager = false }: { html: string; label: string; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(eager);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMounted(true);
        setVisible(e.isIntersecting);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={mounted ? "stage" : "stage wait"}
      data-paused={visible ? undefined : ""}
      role="img"
      aria-label={`Preview of the ${label} animation`}
    >
      {mounted && <div className={eager ? "stage-in" : "stage-in fade-in"} dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
}
