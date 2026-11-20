// Event tracking via the self-hosted tracker (monitoring-tools/tracker).
// Clicks are tracked declaratively: spread trackAttrs() onto an element and t.js picks it up.

type TrackProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    track?: (name: string, props?: TrackProps) => void;
  }
}

/** data-track attributes read by t.js on click, e.g. trackAttrs("resume_download", { from: "hero" }). Use one-word prop keys. */
export function trackAttrs(name: string, props: Record<string, string> = {}): Record<string, string> {
  const attrs: Record<string, string> = { "data-track": name };
  for (const [k, v] of Object.entries(props)) attrs[`data-track-${k.toLowerCase()}`] = v;
  return attrs;
}

/** Track an event from code. A no-op until t.js has loaded, or when analytics is off. */
export function track(name: string, props?: TrackProps) {
  window.track?.(name, props);
}
