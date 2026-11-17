"use client";

import { useState } from "react";

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

export function ReplayDemo({ html, label }: { html: string; label: string }) {
  const [run, setRun] = useState(0);
  return (
    <div className="col" style={{ gap: 10 }}>
      <Demo key={run} html={html} big label={label} />
      <div>
        <button type="button" className="btn ghost" onClick={() => setRun((r) => r + 1)}>
          ↺ Replay preview
        </button>
      </div>
    </div>
  );
}
