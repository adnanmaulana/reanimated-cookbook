<div align="center">

# Reanimated Cookbook

**101 copy-ready React Native Reanimated animations, from a simple fade to full app interactions.**

Each recipe has a live preview, Reanimated 4 and Reanimated 3 code, native ports for Flutter, SwiftUI and Jetpack Compose, and a one-line `/anim` command to paste into an AI coding assistant.

![Animations](https://img.shields.io/badge/animations-101-0f5c5c)
![Reanimated](https://img.shields.io/badge/Reanimated-4%20%2B%203-3355cc)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/node-%E2%89%A518.18-5fa04e?logo=node.js&logoColor=white)

</div>

---

## Contents

- [Features](#features)
- [What's in the catalog](#whats-in-the-catalog)
- [Using the `/anim` commands](#using-the-anim-commands)
- [Getting started](#getting-started)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Adding an animation](#adding-an-animation)
- [Tech stack](#tech-stack)
- [Credits](#credits)

## Features

- **Live previews.** Every card shows the motion running in the browser, so you can see a recipe before reading its code.
- **Reanimated 4 first.** The main snippet targets Reanimated 4 and uses CSS animations and transitions where they fit. A Reanimated 3 version (shared values and worklets) sits in the next tab.
- **Native ports.** The same animation in Flutter (built-in animation framework), SwiftUI (iOS 17+) and Jetpack Compose (Material 3).
- **AI-ready commands.** Copy `/anim <name>` or the full prompt and paste it into Claude, Cursor or another assistant.
- **Plain-text glossary.** [`/glossary.txt`](app/glossary.txt/route.ts) lists every command so you can drop it into `CLAUDE.md` or `.cursorrules`.
- **Static and fast.** Every animation page is pre-rendered at build time, and the site has a generated sitemap.

## What's in the catalog

| Level | Count | Examples |
| --- | :-: | --- |
| Basic | 30 | Fade in, slide in, count-up, toast, typewriter, animated checkbox |
| Mid | 40 | Speed dial, segmented control, slide to confirm, spinning prize wheel, 3D tilt card |
| Advanced | 31 | Liquid swipe, reorder list, emoji reactions, fly to cart, shape morph |

**24 recipes recreate real app interactions** featured in William Candillon's series *Can it be done in React Native?*, including Apple Wallet, Apple Activity, Spotify, Instagram, Snapchat, Telegram, WhatsApp, Duolingo, Headspace, Uber Eats, Coinbase and the iPod click wheel.

## Using the `/anim` commands

Each animation has an id. Paste its command into an AI prompt to get that recipe in the version you want:

```text
/anim fade-in            # Reanimated 4 (default)
/anim fade-in@v3         # Reanimated 3
/anim fade-in@flutter    # Flutter
/anim fade-in@swiftui    # SwiftUI
/anim fade-in@compose    # Jetpack Compose
```

To make an assistant understand the commands everywhere in a project, add the contents of `/glossary.txt` to its instruction file (`CLAUDE.md`, `.cursorrules` or similar).

## Getting started

**Requirements:** Node.js 18.18 or newer.

```bash
git clone git@github.com:adnanmaulana/reanimated-cookbook.git
cd reanimated-cookbook
npm install
npm run dev
```

Then open <http://localhost:3000>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build (the same one Vercel runs) |
| `npm start` | Serve the production build |
| `npm run lint` | Run Next.js linting |

## Deployment

The project deploys to [Vercel](https://vercel.com) without any configuration:

1. In Vercel, choose **Add New → Project** and import this repository.
2. Click **Deploy**. Vercel detects Next.js on its own.
3. *(Optional)* With a custom domain, set `NEXT_PUBLIC_SITE_URL=https://your-domain.com` so the sitemap and page metadata use it. Without it, the site uses the Vercel production URL.

To deploy from the terminal, run `npx vercel` for a preview or `npx vercel --prod` for production.

## Project structure

```text
reanimated-cookbook/
├── app/
│   ├── page.tsx                # Home: hero, how-to and the filterable catalog
│   ├── anim/[id]/page.tsx      # One static page per animation
│   ├── glossary.txt/route.ts   # Plain-text command glossary
│   ├── sitemap.ts              # Generated sitemap
│   └── globals.css             # Theme tokens, layout and preview keyframes
├── components/                 # Nav, catalog, version tabs, demo stage, copy button…
├── data/
│   ├── animations.ts           # Core catalog (48), merges the files below
│   ├── animations-more.ts      # 10 everyday UI additions
│   ├── animations-extra.ts     # 10 more everyday UI additions
│   ├── animations-plus.ts      # 16 text, loader and form-control animations
│   ├── animations-final.ts     # 17 gesture, sensor and layout-driven animations
│   ├── flutter.ts              # Flutter ports, keyed by animation id
│   ├── swiftui.ts              # SwiftUI ports
│   └── compose.ts              # Jetpack Compose ports
└── lib/
    ├── catalog.ts              # Prompt and glossary builders, links
    ├── site.ts                 # Site URL, name and author
    └── types.ts                # Animation, Version and Platform types
```

## Adding an animation

1. Add an entry to `data/animations.ts` (or one of the files it merges) with an `id`, `name`, `level`, `description`, a `demo`, the Reanimated 4 code (`codeV4`, `apisV4`) and the Reanimated 3 code (`code`, `apis`). The `Animation` type in [`lib/types.ts`](lib/types.ts) lists every field.
2. Add a port with the same `id` to `data/flutter.ts`, `data/swiftui.ts` and `data/compose.ts`.
3. Write the `demo` as static HTML. It can use the theme variables (`--accent`, `--coral`, `--line`, `--surface`, `--stage`…) and any keyframes in `app/globals.css`.

The detail page, catalog card, glossary line and sitemap entry are generated from that entry.

## Tech stack

- [Next.js 15](https://nextjs.org) with the App Router
- [React 19](https://react.dev)
- [TypeScript 5.8](https://www.typescriptlang.org)
- No runtime dependencies beyond Next.js and React. Previews are pure CSS.

## Credits

The app-inspired recipes reference [can-it-be-done-in-react-native](https://github.com/wcandillon/can-it-be-done-in-react-native) by [William Candillon](https://github.com/wcandillon). The code here is a simplified rewrite for Reanimated 4 and 3, not a copy of the original sources.

Built by **Adnan Radja Maulana** · [LinkedIn](https://id.linkedin.com/in/adnanradjam)
