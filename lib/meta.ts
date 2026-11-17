// Small constants that client components need. Kept apart from lib/catalog.ts so importing them
// doesn't pull the full animation data and native ports into the browser bundle.
import type { Level, Version } from "@/lib/types";

export const LEVELS: { id: Level; label: string }[] = [
  { id: "basic", label: "Basic" },
  { id: "mid", label: "Intermediate" },
  { id: "adv", label: "Advanced" },
];

export const levelLabel = (l: Level) => LEVELS.find((x) => x.id === l)!.label;

export const VERSIONS: { id: Version; label: string; note: string; file: string; stack: string }[] = [
  { id: "v4", label: "Reanimated 4", note: "Main · New Architecture only · worklets live in react-native-worklets", file: "tsx", stack: "reanimated 4" },
  { id: "v3", label: "Reanimated 3", note: "For apps still on the old architecture", file: "tsx", stack: "reanimated 3" },
  { id: "flutter", label: "Flutter", note: "Dart · Flutter's built-in animation framework, no packages", file: "dart", stack: "flutter" },
  { id: "swiftui", label: "SwiftUI", note: "Swift · iOS 17+ (APIs marked iOS 18 need it)", file: "swift", stack: "swiftui" },
  { id: "compose", label: "Compose", note: "Kotlin · Jetpack Compose 1.7+ with Material 3", file: "kt", stack: "jetpack compose" },
];

export const isVersion = (v: unknown): v is Version => VERSIONS.some((x) => x.id === v);
