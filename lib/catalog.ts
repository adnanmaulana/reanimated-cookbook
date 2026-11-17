import { animations } from "@/data/animations";
import { compose } from "@/data/compose";
import { flutter } from "@/data/flutter";
import { swiftui } from "@/data/swiftui";
import { isVersion, LEVELS, levelLabel, VERSIONS } from "@/lib/meta";
import type { Animation, CardData, Platform, PlatformSnippet, Version, VersionEntry } from "@/lib/types";

export { isVersion, LEVELS, levelLabel, VERSIONS };

const PORTS: Record<Platform, Record<string, PlatformSnippet>> = { flutter, swiftui, compose };
const isPlatform = (v: Version): v is Platform => v in PORTS;
const port = (a: Animation, p: Platform) => PORTS[p][a.id];

export const REPO = "https://github.com/wcandillon/can-it-be-done-in-react-native";
export const sourceUrl = (a: Animation) => (a.source ? `${REPO}/tree/master/${a.source.path}` : null);
export const youtubeUrl = (a: Animation) =>
  a.source
    ? "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("can it be done in react native " + a.source.query)
    : null;

export const getAnimation = (id: string) => animations.find((a) => a.id === id);

export const neighbors = (id: string) => {
  const i = animations.findIndex((a) => a.id === id);
  return {
    prev: i > 0 ? animations[i - 1] : null,
    next: i < animations.length - 1 ? animations[i + 1] : null,
  };
};

const usesGestures = (a: Animation) => a.code.includes("Gesture.");

export const commandFor = (a: Animation, v: Version = "v4") => `/anim ${a.id}${v === "v4" ? "" : `@${v}`}`;
export const codeFor = (a: Animation, v: Version = "v4") =>
  isPlatform(v) ? port(a, v).code : v === "v4" ? a.codeV4 : a.code;
export const apisFor = (a: Animation, v: Version = "v4") =>
  isPlatform(v) ? port(a, v).apis : v === "v4" ? a.apisV4 : a.apis;

const PLATFORM_STACK: Record<Platform, string> = {
  flutter:
    "Implement it in Flutter (Dart) with the built-in animation framework: implicit animations (AnimatedContainer, TweenAnimationBuilder...) for state changes, and AnimationController with Tweens, Curves or physics simulations for gestures and sequences. No third-party animation packages.",
  swiftui:
    "Implement it in SwiftUI for iOS 17+, with withAnimation, springs, transitions, gestures, and keyframe or phase animators where they fit. Avoid UIKit unless SwiftUI can't do it.",
  compose:
    "Implement it in Jetpack Compose (Kotlin) with androidx.compose.animation: animate*AsState, Animatable, rememberInfiniteTransition, AnimatedVisibility/AnimatedContent and pointerInput gestures. Apply per-frame transforms in graphicsLayer so they skip recomposition.",
};

export function promptFor(a: Animation, v: Version = "v4") {
  const inspired = a.source
    ? `Inspired by the ${a.source.app} episode of William Candillon's "Can it be done in React Native?" series.\n`
    : "";
  const gestures = usesGestures(a) ? " and react-native-gesture-handler v2" : "";
  const stack = isPlatform(v)
    ? PLATFORM_STACK[v]
    : v === "v4"
      ? `Implement it with react-native-reanimated v4${gestures} (New Architecture; worklet helpers such as scheduleOnRN come from react-native-worklets). Prefer the CSS animation and transition API when the animation only depends on state; otherwise use shared values on the UI thread. Don't use Animated from react-native.`
      : `Implement it with react-native-reanimated v3${gestures}, running on the UI thread with shared values and worklets (runOnJS for JS callbacks). Don't use Animated from react-native.`;
  return `${commandFor(a, v)} — ${a.name}: ${a.description}
${inspired}${stack} Key APIs: ${apisFor(a, v).join(", ")}. Adapt sizes, colors and timing to my component. Reference:

${codeFor(a, v)}`;
}

export function glossary() {
  const lines = animations.map(
    (a) => `/anim ${a.id} — ${a.description}${a.source ? ` (like ${a.source.app})` : ""} [v4: ${a.apisV4.join(", ")}]`,
  );
  return `Animation commands (React Native Reanimated). When I write "/anim <name>", implement that animation on the component I point to.
- Default: react-native-reanimated v4 (New Architecture). Use the CSS animation/transition API for state-driven animations, and shared values + worklets (scheduleOnRN from react-native-worklets) for gestures and scroll.
- "/anim <name>@v3": use react-native-reanimated v3 instead (shared values, worklets, runOnJS), for apps on the old architecture.
- Use react-native-gesture-handler v2 for gestures. Never use Animated from react-native.
- "/anim <name>@flutter": implement it in Flutter with the built-in animation framework (no packages).
- "/anim <name>@swiftui": implement it in SwiftUI (iOS 17+).
- "/anim <name>@compose": implement it in Jetpack Compose (Kotlin, Material 3).

${lines.join("\n")}
`;
}

/** Everything the version tabs need for one animation, computed on the server so the client never imports the catalog */
export const versionEntries = (a: Animation) =>
  Object.fromEntries(
    VERSIONS.map((v) => [v.id, { code: codeFor(a, v.id), apis: apisFor(a, v.id), command: commandFor(a, v.id), prompt: promptFor(a, v.id) }]),
  ) as Record<Version, VersionEntry>;

/** Slim card data for the home catalog. Code is reduced to its distinct identifiers so search still finds APIs used in it. */
export const cardData = (a: Animation): CardData => {
  const words = new Set((a.code + " " + a.codeV4).match(/[A-Za-z_][A-Za-z0-9_.]{2,}/g) ?? []);
  return {
    id: a.id,
    name: a.name,
    level: a.level,
    description: a.description,
    demo: a.demo,
    source: a.source?.app ?? null,
    tag: a.apisV4.includes("CSS animations") || a.apisV4.includes("CSS transitions") ? "v4 CSS API" : a.apisV4[0],
    hay: [a.name, a.id, a.description, a.apis.join(" "), a.apisV4.join(" "), a.source?.app ?? "", [...words].join(" ")].join(" ").toLowerCase(),
  };
};

export { animations };
