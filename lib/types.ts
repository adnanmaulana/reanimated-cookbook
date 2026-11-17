export type Level = "basic" | "mid" | "adv";
/** Native ports shown next to the Reanimated versions */
export type Platform = "flutter" | "swiftui" | "compose";
/** Every code tab: the two Reanimated versions plus the native ports */
export type Version = "v4" | "v3" | Platform;

export type PlatformSnippet = {
  code: string;
  /** Key APIs the snippet relies on */
  apis: string[];
};

export type Animation = {
  /** Used in the prompt command: /anim <id> */
  id: string;
  name: string;
  level: Level;
  description: string;
  /** Key Reanimated / gesture APIs the snippet relies on */
  apis: string[];
  /** Static HTML preview, styled by tokens and keyframes in globals.css */
  demo: string;
  /** Reanimated 3 reference snippet */
  code: string;
  /** Reanimated 4 reference snippet (main version) */
  codeV4: string;
  /** Key APIs used by the Reanimated 4 snippet */
  apisV4: string[];
  /** Set when the animation recreates an episode of "Can it be done in React Native?" */
  source?: { app: string; path: string; query: string };
};

/** One version tab's content on a detail page */
export type VersionEntry = { code: string; apis: string[]; command: string; prompt: string };

/** What a catalog card needs on the client */
export type CardData = {
  id: string;
  name: string;
  level: Level;
  description: string;
  demo: string;
  source: string | null;
  /** Shown when there is no source app: the main v4 API */
  tag: string;
  /** Lowercased search text */
  hay: string;
};
