"use client";

import { useEffect, useState } from "react";
import { isVersion, VERSIONS } from "@/lib/meta";
import type { Version, VersionEntry } from "@/lib/types";
import { trackAttrs } from "@/lib/analytics";
import { CopyButton } from "./CopyButton";

const KEY = "rc-version";

// v4 is the main version; the viewer's choice (including a native platform) is remembered across pages in this browser.
export function useVersion(): [Version, (v: Version) => void] {
  const [version, setVersion] = useState<Version>("v4");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (isVersion(saved)) setVersion(saved);
    } catch {
      /* storage blocked: keep v4 */
    }
  }, []);
  const choose = (v: Version) => {
    setVersion(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  };
  return [version, choose];
}

export function VersionPanel({ id, entries }: { id: string; entries: Record<Version, VersionEntry> }) {
  const [version, choose] = useVersion();
  const meta = VERSIONS.find((v) => v.id === version)!;
  const { code, apis, command, prompt } = entries[version];

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="vbar">
        <div className="seg" role="tablist" aria-label="Platform and version">
          {VERSIONS.map((v, i) => (
            <button
              key={v.id}
              className={i === 2 ? "seg-split" : undefined}
              type="button"
              role="tab"
              id={`tab-${v.id}`}
              aria-selected={version === v.id}
              aria-controls="code-panel"
              onClick={() => choose(v.id)}
              {...trackAttrs("version_switch", { anim: id, version: v.id })}
            >
              {v.label}
              {v.id === "v4" && <span className="seg-tag">main</span>}
            </button>
          ))}
        </div>
        <span className="vnote">{meta.note}</span>
      </div>
      {(version === "v4" || version === "v3") && entries.v3.code === entries.v4.code && (
        <p className="vnote" style={{ margin: 0 }}>
          This snippet uses APIs that didn’t change between versions, so the same code runs on Reanimated 4 and 3.
        </p>
      )}

      <div className="meta" aria-label="Key APIs">
        {apis.map((h) => (
          <span key={h} className="api">{h}</span>
        ))}
      </div>

      <div className="actions">
        <CopyButton
          key={`cmd-${version}`}
          text={command}
          label={`Copy ${command}`}
          className="btn"
          tracking={trackAttrs("copy_command", { anim: id, version })}
        />
        <CopyButton
          key={`prompt-${version}`}
          text={prompt}
          label="Copy full prompt"
          tracking={trackAttrs("copy_prompt", { anim: id, version })}
        />
        <CopyButton
          key={`code-${version}`}
          text={code}
          label="Copy code"
          tracking={trackAttrs("copy_code", { anim: id, version })}
        />
      </div>

      <div className="term" id="code-panel" role="tabpanel" aria-labelledby={`tab-${version}`}>
        <div className="term-bar">
          <i style={{ background: "#2F5BFF" }} />
          <i style={{ background: "#C6F25B" }} />
          <i style={{ background: "#F2558A" }} />
          <span>
            {id}.{meta.file} · {meta.stack}
          </span>
        </div>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
