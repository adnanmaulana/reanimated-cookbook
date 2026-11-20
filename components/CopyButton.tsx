"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  label: string;
  className?: string;
  copiedLabel?: string;
  /** data-track attributes for analytics, from trackAttrs(). */
  tracking?: Record<string, string>;
};

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers or webviews that block the async clipboard
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function CopyButton({ text, label, className = "btn ghost", copiedLabel = "Copied", tracking }: Props) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onClick = async () => {
    const ok = await writeClipboard(text);
    setState(ok ? "ok" : "fail");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  };

  return (
    <button type="button" className={className} onClick={onClick} aria-live="polite" {...tracking}>
      {state === "ok" ? `${copiedLabel} ✓` : state === "fail" ? "Couldn't copy" : label}
    </button>
  );
}
