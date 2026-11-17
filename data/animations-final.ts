// Fourth batch: gesture, sensor and layout-driven animations, after data/animations-plus.ts.
// Same shape as data/animations.ts; their Flutter, SwiftUI and Compose ports live in data/flutter.ts,
// data/swiftui.ts and data/compose.ts. Demos use the z* keyframes in app/globals.css.
// String.raw keeps code verbatim; snippets avoid JS interpolation syntax.
import type { Animation } from "@/lib/types";

const c = String.raw;

/** Reanimated 4 version of a gesture snippet: the same code, one leading comment swapped */
const same = (code: string, note: string) => "// " + note + "\n" + code.split("\n").slice(1).join("\n");

const joystick = c`// The knob follows the finger but is clamped to the base's radius, then springs home
const R = 50; // base radius minus knob radius
const x = useSharedValue(0), y = useSharedValue(0);

const pan = Gesture.Pan()
  .onUpdate((e) => {
    const d = Math.hypot(e.translationX, e.translationY);
    const k = d > R ? R / d : 1; // scale back onto the circle edge
    x.value = e.translationX * k;
    y.value = e.translationY * k;
  })
  .onEnd(() => {
    x.value = withSpring(0, { damping: 12, stiffness: 220 });
    y.value = withSpring(0, { damping: 12, stiffness: 220 });
  });

// Normalized -1..1 direction for your game or camera, read on the UI thread
const direction = useDerivedValue(() => ({ x: x.value / R, y: y.value / R }));

const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));

<View style={styles.base}> {/* 140 x 140 circle, centered content */}
  <GestureDetector gesture={pan}>
    <Animated.View style={[styles.knob, knob]} /> {/* 40 x 40 circle */}
  </GestureDetector>
</View>`;

const imageCompare = c`// The "after" image sits on top in a container whose width follows the divider
const { width: W } = useWindowDimensions();
const x = useSharedValue(W / 2);

const pan = Gesture.Pan()
  .onBegin((e) => { x.value = Math.min(Math.max(e.x, 0), W); }) // tap to jump
  .onChange((e) => { x.value = Math.min(Math.max(x.value + e.changeX, 0), W); });

const clip = useAnimatedStyle(() => ({ width: x.value }));
const handle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value - 20 }] }));

<GestureDetector gesture={pan}>
  <View style={{ width: W, height: H }}>
    <Image source={before} style={StyleSheet.absoluteFill} />
    <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' }, clip]}>
      {/* Fixed full width so the image doesn't squash as its container narrows */}
      <Image source={after} style={{ width: W, height: H }} />
    </Animated.View>
    <Animated.View style={[styles.handle, handle]}> {/* 40 wide, full height; 2px line + round grip */}
      <View style={styles.line} />
      <View style={styles.grip}><Text>‹ ›</Text></View>
    </Animated.View>
  </View>
</GestureDetector>`;

const sideDrawer = c`// One open value (0..1): the drawer slides in, the screen dims and nudges over
const DRAWER = 280;
const open = useSharedValue(0);
const spring = { damping: 20, stiffness: 200 };

const pan = Gesture.Pan()
  .activeOffsetX([-10, 10])
  .onChange((e) => {
    open.value = Math.min(Math.max(open.value + e.changeX / DRAWER, 0), 1);
  })
  .onEnd((e) => {
    const toOpen = e.velocityX > 500 || (e.velocityX > -500 && open.value > 0.5);
    open.value = withSpring(toOpen ? 1 : 0, spring);
  });

const drawer = useAnimatedStyle(() => ({ transform: [{ translateX: (open.value - 1) * DRAWER }] }));
const screen = useAnimatedStyle(() => ({ transform: [{ translateX: open.value * 40 }] }));
const scrim = useAnimatedStyle(() => ({ opacity: open.value * 0.45 }));

// Mirror "is it open at all" into state so the scrim only catches taps while visible
const [isOpen, setIsOpen] = useState(false);
useAnimatedReaction(() => open.value > 0.01, (v, prev) => {
  if (v !== prev) runOnJS(setIsOpen)(v);
});

<GestureDetector gesture={pan}>
  <View style={{ flex: 1 }}>
    <Animated.View style={[{ flex: 1 }, screen]}>
      <Screen onMenu={() => { open.value = withSpring(1, spring); }} />
    </Animated.View>
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, scrim]}>
      <Pressable style={{ flex: 1 }} onPress={() => { open.value = withSpring(0, spring); }} />
    </Animated.View>
    <Animated.View style={[styles.drawer, { width: DRAWER }, drawer]}> {/* absolute, left/top/bottom 0 */}
      <Menu />
    </Animated.View>
  </View>
</GestureDetector>`;

const scrollTop = c`// The button appears past 400px of scroll; tapping it scrolls back to the top
const ref = useAnimatedRef();
const scrollY = useSharedValue(0);
const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

const shown = useDerivedValue(() => withSpring(scrollY.value > 400 ? 1 : 0, { damping: 15, stiffness: 200 }));
const fab = useAnimatedStyle(() => ({
  opacity: shown.value,
  transform: [
    { translateY: (1 - shown.value) * 24 },
    { scale: 0.6 + 0.4 * shown.value },
  ],
}));

const toTop = () => ref.current?.scrollTo({ y: 0, animated: true });

<View style={{ flex: 1 }}>
  <Animated.ScrollView ref={ref} onScroll={onScroll} scrollEventThrottle={16}>
    {content}
  </Animated.ScrollView>
  <Animated.View style={[styles.fab, fab]}> {/* absolute, right 20, bottom 32, 48 x 48 circle */}
    <Pressable onPress={toTop} hitSlop={8}><ArrowUpIcon /></Pressable>
  </Animated.View>
</View>`;

const layoutToggle = c`// The same items render as a list or a grid; LinearTransition animates every move and resize
import Animated, { LinearTransition } from 'react-native-reanimated';

const [grid, setGrid] = useState(false);
const { width } = useWindowDimensions();
const GAP = 10, PAD = 16;
const cell = (width - PAD * 2 - GAP) / 2;
const layout = LinearTransition.springify().damping(18).stiffness(160);

<Pressable onPress={() => setGrid((g) => !g)}>
  <Text>{grid ? 'List view' : 'Grid view'}</Text>
</Pressable>

{/* A plain View, not a FlatList: layout animations need every item to stay mounted */}
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, padding: PAD }}>
  {items.map((item) => (
    <Animated.View
      key={item.id}
      layout={layout}
      style={[styles.card, grid
        ? { width: cell, height: cell }
        : { width: '100%', height: 72, flexDirection: 'row' }]}>
      <Animated.Image layout={layout} source={item.image}
        style={grid ? { width: '100%', height: cell * 0.65 } : { width: 72, height: 72 }} />
      <Text>{item.title}</Text>
    </Animated.View>
  ))}
</View>`;

const tiltCard = c`// Finger position on the card maps to rotateX/rotateY; perspective makes it look 3D
const W = 260, H = 160, MAX = 12; // degrees
const rx = useSharedValue(0), ry = useSharedValue(0);
const glareX = useSharedValue(W / 2);

const pan = Gesture.Pan()
  .minDistance(0)
  .onUpdate((e) => {
    ry.value = interpolate(e.x, [0, W], [-MAX, MAX], Extrapolation.CLAMP);
    rx.value = interpolate(e.y, [0, H], [MAX, -MAX], Extrapolation.CLAMP);
    glareX.value = e.x;
  })
  .onFinalize(() => {
    rx.value = withSpring(0, { damping: 10 });
    ry.value = withSpring(0, { damping: 10 });
  });

const card = useAnimatedStyle(() => ({
  transform: [
    { perspective: 600 },
    { rotateX: rx.value + 'deg' },
    { rotateY: ry.value + 'deg' },
    { scale: withSpring(rx.value || ry.value ? 1.04 : 1) },
  ],
}));
const glare = useAnimatedStyle(() => ({
  opacity: interpolate(Math.abs(rx.value) + Math.abs(ry.value), [0, MAX * 2], [0, 0.35]),
  transform: [{ translateX: glareX.value - W }],
}));

<GestureDetector gesture={pan}>
  <Animated.View style={[styles.card, { width: W, height: H, overflow: 'hidden' }, card]}>
    <CardContent />
    {/* A white diagonal band that slides with the finger */}
    <Animated.View pointerEvents="none" style={[styles.glare, glare]} />
  </Animated.View>
</GestureDetector>`;

const gyro = c`// The rotation sensor feeds pitch and roll on the UI thread; deeper layers move further
import { useAnimatedSensor, SensorType } from 'react-native-reanimated';

const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 16 });

function Layer({ depth, children }) {
  const style = useAnimatedStyle(() => {
    const { pitch, roll } = sensor.sensor.value; // radians
    return {
      transform: [
        { translateX: withSpring(clamp(roll, -0.6, 0.6) * depth * 40, { damping: 20 }) },
        { translateY: withSpring(clamp(pitch - 0.6, -0.6, 0.6) * depth * 40, { damping: 20 }) }, // 0.6 = phone held tilted
      ],
    };
  });
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

<View style={{ width: W, height: H, overflow: 'hidden', borderRadius: 20 }}>
  <Layer depth={-0.3}><Image source={sky} style={styles.oversized} /></Layer>
  <Layer depth={0.4}><Image source={mountains} style={styles.oversized} /></Layer>
  <Layer depth={1}><Image source={foreground} style={styles.oversized} /></Layer>
</View>
// oversized: inset -40 so moving layers never show their edges`;

const waveFill = c`// A sine wave path, its phase looping forever, its level animating to the progress
import Svg, { Path, ClipPath, Circle, Defs, G } from 'react-native-svg';
const AnimatedPath = Animated.createAnimatedComponent(Path);

const S = 120;        // size
const AMP = 6;        // wave height
const phase = useSharedValue(0);
const level = useSharedValue(0);

useEffect(() => {
  phase.value = withRepeat(withTiming(2 * Math.PI, { duration: 1800, easing: Easing.linear }), -1);
}, []);
useEffect(() => {
  level.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
}, [progress]);

const wave = useAnimatedProps(() => {
  const top = S * (1 - level.value);
  let d = 'M 0 ' + top;
  for (let x = 0; x <= S; x += 4) {
    d += ' L ' + x + ' ' + (top + AMP * Math.sin((x / S) * 2 * Math.PI + phase.value));
  }
  return { d: d + ' L ' + S + ' ' + S + ' L 0 ' + S + ' Z' };
});

<Svg width={S} height={S}>
  <Defs>
    <ClipPath id="bubble"><Circle cx={S / 2} cy={S / 2} r={S / 2 - 3} /></ClipPath>
  </Defs>
  <Circle cx={S / 2} cy={S / 2} r={S / 2 - 1.5} stroke="#2F54EB" strokeWidth={3} fill="#EEF2FF" />
  <G clipPath="url(#bubble)">
    <AnimatedPath animatedProps={wave} fill="#2F54EB" />
  </G>
</Svg>`;

const springChain = c`// The leader tracks the finger; each follower springs toward the one before it
const COUNT = 6;
const leaderX = useSharedValue(START.x), leaderY = useSharedValue(START.y);

const pan = Gesture.Pan()
  .onChange((e) => { leaderX.value += e.changeX; leaderY.value += e.changeY; });

// A custom hook can't run in a loop, so the chain is built from fixed calls
function useFollow(x, y) {
  const fx = useDerivedValue(() => withSpring(x.value, { damping: 14, stiffness: 120 }));
  const fy = useDerivedValue(() => withSpring(y.value, { damping: 14, stiffness: 120 }));
  return [fx, fy];
}
const d1 = useFollow(leaderX, leaderY);
const d2 = useFollow(...d1);
const d3 = useFollow(...d2);
const d4 = useFollow(...d3);
const d5 = useFollow(...d4);
const chain = [[leaderX, leaderY], d1, d2, d3, d4, d5];

function Dot({ x, y, index }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: 1 - index * 0.12 }],
    opacity: 1 - index * 0.12,
  }));
  return <Animated.View style={[styles.dot, { zIndex: COUNT - index }, style]} />; // absolute 36 x 36 circle
}

<GestureDetector gesture={pan}>
  <View style={StyleSheet.absoluteFill}>
    {chain.map(([x, y], i) => <Dot key={i} x={x} y={y} index={i} />)}
  </View>
</GestureDetector>`;

const shapeMorph = c`// Skia interpolates between paths that share the same verbs, so build each with 4 cubics
import { Canvas, Path, Skia, usePathInterpolation } from '@shopify/react-native-skia';

const S = 120, k = 0.5523 * (S / 2), m = S / 2;
// Every shape: moveTo + 4 cubicTo + close, so the verbs line up
const circle = Skia.Path.MakeFromSVGString(
  'M ' + m + ' 0 C ' + (m + k) + ' 0 ' + S + ' ' + (m - k) + ' ' + S + ' ' + m +
  ' C ' + S + ' ' + (m + k) + ' ' + (m + k) + ' ' + S + ' ' + m + ' ' + S +
  ' C ' + (m - k) + ' ' + S + ' 0 ' + (m + k) + ' 0 ' + m +
  ' C 0 ' + (m - k) + ' ' + (m - k) + ' 0 ' + m + ' 0 Z');
const square = Skia.Path.MakeFromSVGString(
  'M ' + m + ' 0 C ' + S + ' 0 ' + S + ' 0 ' + S + ' ' + m +
  ' C ' + S + ' ' + S + ' ' + S + ' ' + S + ' ' + m + ' ' + S +
  ' C 0 ' + S + ' 0 ' + S + ' 0 ' + m + ' C 0 0 0 0 ' + m + ' 0 Z');
const blob = Skia.Path.MakeFromSVGString(
  'M 60 6 C 100 0 118 30 112 62 C 106 98 80 118 52 112 C 20 106 0 80 8 50 C 14 24 30 10 60 6 Z');

const t = useSharedValue(0);
useEffect(() => {
  t.value = withRepeat(withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.cubic) }), -1, true);
}, []);

const path = usePathInterpolation(t, [0, 1, 2], [circle, square, blob]);

<Canvas style={{ width: S, height: S }}>
  <Path path={path} color="#2F54EB" />
</Canvas>`;

export const final: Animation[] = [
  {
    id: "range-slider",
    name: "Range slider",
    level: "mid",
    description: "Two thumbs pick a minimum and maximum; each one stops at the other and the fill stretches between them.",
    apis: ["Gesture.Pan", "useSharedValue", "runOnJS"],
    apisV4: ["Gesture.Pan", "useSharedValue", "scheduleOnRN"],
    demo: c`<div style="position:relative;width:190px;height:24px"><div style="position:absolute;left:0;right:0;top:10px;height:4px;border-radius:2px;background:var(--line)"></div><div style="position:absolute;top:10px;height:4px;border-radius:2px;background:var(--accent);animation:zRsF 4.8s linear infinite"></div><span style="position:absolute;top:0;margin-left:-12px;width:24px;height:24px;border-radius:50%;background:var(--surface);border:2px solid var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.2);animation:zRsA 4.8s linear infinite"></span><span style="position:absolute;top:0;margin-left:-12px;width:24px;height:24px;border-radius:50%;background:var(--surface);border:2px solid var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.2);animation:zRsB 4.8s linear infinite"></span></div>`,
    code: c`// Two shared positions in px; each thumb's pan is clamped by the other thumb
const W = 280, THUMB = 24, MIN_GAP = THUMB;
const lo = useSharedValue(0.2 * W), hi = useSharedValue(0.8 * W);
const report = (a, b) => onChange(Math.round((a / W) * max), Math.round((b / W) * max));

const thumbPan = (self, isLow) => Gesture.Pan()
  .hitSlop(12)
  .onChange((e) => {
    const next = self.value + e.changeX;
    self.value = isLow
      ? Math.min(Math.max(next, 0), hi.value - MIN_GAP)
      : Math.max(Math.min(next, W), lo.value + MIN_GAP);
  })
  .onEnd(() => runOnJS(report)(lo.value, hi.value));

const lowPan = thumbPan(lo, true);
const highPan = thumbPan(hi, false);

const fill = useAnimatedStyle(() => ({ left: lo.value, width: hi.value - lo.value }));
const lowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: lo.value - THUMB / 2 }] }));
const highStyle = useAnimatedStyle(() => ({ transform: [{ translateX: hi.value - THUMB / 2 }] }));

<View style={{ width: W, height: THUMB }}>
  <View style={styles.track} />                     {/* absolute, top 10, height 4, gray */}
  <Animated.View style={[styles.fill, fill]} />     {/* same, accent */}
  <GestureDetector gesture={lowPan}><Animated.View style={[styles.thumb, lowStyle]} /></GestureDetector>
  <GestureDetector gesture={highPan}><Animated.View style={[styles.thumb, highStyle]} /></GestureDetector>
</View>`,
    codeV4: c`import { scheduleOnRN } from 'react-native-worklets';

// Gesture-driven, so Reanimated 4 keeps shared values; scheduleOnRN replaces runOnJS
const W = 280, THUMB = 24, MIN_GAP = THUMB;
const lo = useSharedValue(0.2 * W), hi = useSharedValue(0.8 * W);
const report = (a, b) => onChange(Math.round((a / W) * max), Math.round((b / W) * max));

const thumbPan = (self, isLow) => Gesture.Pan()
  .hitSlop(12)
  .onChange((e) => {
    const next = self.value + e.changeX;
    self.value = isLow
      ? Math.min(Math.max(next, 0), hi.value - MIN_GAP)
      : Math.max(Math.min(next, W), lo.value + MIN_GAP);
  })
  .onEnd(() => scheduleOnRN(report, lo.value, hi.value));

const lowPan = thumbPan(lo, true);
const highPan = thumbPan(hi, false);

const fill = useAnimatedStyle(() => ({ left: lo.value, width: hi.value - lo.value }));
const lowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: lo.value - THUMB / 2 }] }));
const highStyle = useAnimatedStyle(() => ({ transform: [{ translateX: hi.value - THUMB / 2 }] }));

<View style={{ width: W, height: THUMB }}>
  <View style={styles.track} />
  <Animated.View style={[styles.fill, fill]} />
  <GestureDetector gesture={lowPan}><Animated.View style={[styles.thumb, lowStyle]} /></GestureDetector>
  <GestureDetector gesture={highPan}><Animated.View style={[styles.thumb, highStyle]} /></GestureDetector>
</View>`,
  },

  {
    id: "joystick",
    name: "Joystick",
    level: "mid",
    description: "A thumbstick you can drag anywhere inside its ring; let go and it springs back to the center.",
    apis: ["Gesture.Pan", "withSpring", "useDerivedValue"],
    apisV4: ["Gesture.Pan", "withSpring", "useDerivedValue"],
    demo: c`<div style="width:96px;height:96px;border-radius:50%;background:var(--surface);border:2px solid var(--line);display:grid;place-items:center"><span style="width:36px;height:36px;border-radius:50%;background:var(--accent);box-shadow:0 3px 8px rgba(0,0,0,.25);animation:zJs 4s ease-in-out infinite"></span></div>`,
    code: joystick,
    codeV4: same(joystick, "Unchanged in Reanimated 4: a pure gesture, all on the UI thread"),
  },

  {
    id: "image-compare",
    name: "Before / after slider",
    level: "mid",
    description: "Drag a divider across two stacked images to reveal more of the edited version.",
    apis: ["Gesture.Pan", "useAnimatedStyle", "overflow hidden"],
    apisV4: ["Gesture.Pan", "useAnimatedStyle", "overflow hidden"],
    demo: c`<div style="position:relative;width:190px;height:96px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#9aa3ad,#5d6670)"><span style="position:absolute;left:10px;bottom:8px;font-size:10px;font-weight:700;color:#fff">BEFORE</span><div style="position:absolute;left:0;top:0;bottom:0;overflow:hidden;animation:zIcW 4.8s ease-in-out infinite"><div style="width:190px;height:96px;background:linear-gradient(135deg,var(--accent),var(--coral))"></div><span style="position:absolute;left:10px;bottom:8px;font-size:10px;font-weight:700;color:#fff">AFTER</span></div><div style="position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;animation:zIcH 4.8s ease-in-out infinite"><span style="position:absolute;top:50%;left:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);font:700 10px/24px var(--f-mono);text-align:center;color:#333">‹›</span></div></div>`,
    code: imageCompare,
    codeV4: same(imageCompare, "Unchanged in Reanimated 4: the divider is driven by a gesture"),
  },

  {
    id: "side-drawer",
    name: "Side drawer",
    level: "mid",
    description: "A navigation drawer you can drag open from the edge or flick shut, while the screen behind dims and shifts.",
    apis: ["Gesture.Pan", "withSpring", "useAnimatedReaction"],
    apisV4: ["Gesture.Pan", "withSpring", "scheduleOnRN"],
    demo: c`<div style="position:relative;width:180px;height:112px;border-radius:12px;overflow:hidden;background:var(--surface);border:1px solid var(--line)"><div style="position:absolute;inset:0;padding:12px;animation:zSdS 4.4s cubic-bezier(.3,1.1,.5,1) infinite"><div style="width:16px;height:2px;background:currentColor;box-shadow:0 5px 0 currentColor,0 10px 0 currentColor"></div><div style="margin-top:20px;height:8px;width:70%;border-radius:4px;background:var(--line)"></div><div style="margin-top:8px;height:8px;width:90%;border-radius:4px;background:var(--line)"></div></div><div style="position:absolute;inset:0;background:#000;opacity:0;animation:zSdM 4.4s cubic-bezier(.3,1.1,.5,1) infinite"></div><div style="position:absolute;left:0;top:0;bottom:0;width:110px;padding:12px;background:var(--accent);transform:translateX(-100%);animation:zSdD 4.4s cubic-bezier(.3,1.1,.5,1) infinite"><div style="height:8px;width:60%;border-radius:4px;background:rgba(255,255,255,.7)"></div><div style="margin-top:10px;height:8px;width:80%;border-radius:4px;background:rgba(255,255,255,.45)"></div><div style="margin-top:10px;height:8px;width:70%;border-radius:4px;background:rgba(255,255,255,.45)"></div></div></div>`,
    code: sideDrawer,
    codeV4: "import { scheduleOnRN } from 'react-native-worklets';\n\n" +
      same(sideDrawer, "Drag-driven, so Reanimated 4 keeps one shared value; scheduleOnRN replaces runOnJS")
        .replace("runOnJS(setIsOpen)(v)", "scheduleOnRN(setIsOpen, v)"),
  },

  {
    id: "otp-input",
    name: "Code input",
    level: "mid",
    description: "One-time-code boxes where each digit pops in as you type, the next box glows, and a wrong code shakes the row.",
    apis: ["ZoomIn", "withSequence", "withRepeat"],
    apisV4: ["ZoomIn", "animationName", "transitionProperty"],
    demo: c`<div style="display:flex;gap:6px;animation:zOtS 4.8s infinite"><span style="width:28px;height:36px;border-radius:8px;border:2px solid var(--line);background:var(--surface);display:grid;place-items:center;font:700 16px var(--f-mono)"><b style="animation:zOt1 4.8s infinite;opacity:0">4</b></span><span style="width:28px;height:36px;border-radius:8px;border:2px solid var(--line);background:var(--surface);display:grid;place-items:center;font:700 16px var(--f-mono)"><b style="animation:zOt2 4.8s infinite;opacity:0">8</b></span><span style="width:28px;height:36px;border-radius:8px;border:2px solid var(--line);background:var(--surface);display:grid;place-items:center;font:700 16px var(--f-mono)"><b style="animation:zOt3 4.8s infinite;opacity:0">1</b></span><span style="width:28px;height:36px;border-radius:8px;border:2px solid var(--line);background:var(--surface);display:grid;place-items:center;font:700 16px var(--f-mono)"><b style="animation:zOt4 4.8s infinite;opacity:0">5</b></span></div>`,
    code: c`// A hidden TextInput owns the keyboard; the boxes just render its value
import Animated, { ZoomIn } from 'react-native-reanimated';
const LEN = 4;
const [code, setCode] = useState('');
const shake = useSharedValue(0);
const caret = useSharedValue(1);
const input = useRef(null);

useEffect(() => {
  caret.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
}, []);

const onChange = async (text) => {
  const digits = text.replace(/\D/g, '').slice(0, LEN);
  setCode(digits);
  if (digits.length === LEN && !(await verify(digits))) {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }), withTiming(0, { duration: 50 }),
    );
    setCode('');
  }
};

const row = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

<Pressable onPress={() => input.current?.focus()}>
  <Animated.View style={[{ flexDirection: 'row', gap: 8 }, row]}>
    {Array.from({ length: LEN }, (_, i) => (
      <View key={i} style={[styles.box, i === code.length && styles.boxActive]}>
        {code[i]
          ? <Animated.Text entering={ZoomIn.springify().damping(12)} style={styles.digit}>{code[i]}</Animated.Text>
          : i === code.length && <Animated.View style={[styles.caret, caretStyle]} />}
      </View>
    ))}
  </Animated.View>
  <TextInput ref={input} value={code} onChangeText={onChange} keyboardType="number-pad"
    textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={LEN} style={styles.hidden} />
</Pressable>`,
    codeV4: c`// Reanimated 4: CSS animations for the caret and the shake, transitions for the active border
import Animated, { ZoomIn } from 'react-native-reanimated';
const LEN = 4;
const blink = { '0%': { opacity: 1 }, '50%': { opacity: 0 }, '100%': { opacity: 1 } };
const shakeKeyframes = {
  '0%': { transform: [{ translateX: 0 }] }, '20%': { transform: [{ translateX: -10 }] },
  '40%': { transform: [{ translateX: 10 }] }, '60%': { transform: [{ translateX: -6 }] },
  '100%': { transform: [{ translateX: 0 }] },
};
const [code, setCode] = useState('');
const [fails, setFails] = useState(0); // bump to replay the shake
const input = useRef(null);

const onChange = async (text) => {
  const digits = text.replace(/\D/g, '').slice(0, LEN);
  setCode(digits);
  if (digits.length === LEN && !(await verify(digits))) { setFails((n) => n + 1); setCode(''); }
};

<Pressable onPress={() => input.current?.focus()}>
  <Animated.View
    key={fails}
    style={{ flexDirection: 'row', gap: 8, animationName: fails ? shakeKeyframes : undefined, animationDuration: '250ms' }}>
    {Array.from({ length: LEN }, (_, i) => (
      <Animated.View key={i} style={[styles.box, {
        borderColor: i === code.length ? '#2F54EB' : '#DADFE6',
        transitionProperty: 'borderColor',
        transitionDuration: '150ms',
      }]}>
        {code[i]
          ? <Animated.Text entering={ZoomIn.springify().damping(12)} style={styles.digit}>{code[i]}</Animated.Text>
          : i === code.length && (
            <Animated.View style={[styles.caret, {
              animationName: blink, animationDuration: '1s', animationIterationCount: 'infinite',
            }]} />
          )}
      </Animated.View>
    ))}
  </Animated.View>
  <TextInput ref={input} value={code} onChangeText={onChange} keyboardType="number-pad"
    textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={LEN} style={styles.hidden} />
</Pressable>`,
  },

  {
    id: "scroll-top-fab",
    name: "Scroll-to-top button",
    level: "mid",
    description: "A floating arrow springs up once you have scrolled down a way, and scrolls you back to the top when tapped.",
    apis: ["useAnimatedScrollHandler", "useDerivedValue", "withSpring"],
    apisV4: ["useAnimatedScrollHandler", "useDerivedValue", "withSpring"],
    demo: c`<div style="position:relative;width:150px;height:112px;border-radius:12px;overflow:hidden;background:var(--surface);border:1px solid var(--line)"><div style="padding:10px;display:flex;flex-direction:column;gap:8px;animation:zStL 4.8s ease-in-out infinite"><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i><i style="height:16px;border-radius:5px;background:var(--line)"></i></div><span style="position:absolute;right:10px;bottom:10px;width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;animation:zStB 4.8s cubic-bezier(.3,1.5,.5,1) infinite">↑</span></div>`,
    code: scrollTop,
    codeV4: same(scrollTop, "Unchanged in Reanimated 4: scroll-driven, so the button still reads a shared value"),
  },

  {
    id: "layout-toggle",
    name: "List / grid toggle",
    level: "mid",
    description: "Switch a list of cards into a two-column grid and every card glides and resizes into its new spot.",
    apis: ["LinearTransition", "layout", "springify"],
    apisV4: ["LinearTransition", "layout", "springify"],
    demo: c`<div style="position:relative;width:150px;height:104px"><span style="position:absolute;left:0;top:0;height:30px;border-radius:7px;background:var(--accent-soft);border:1.5px solid var(--accent);animation:zLtA 4.8s cubic-bezier(.4,1.2,.5,1) infinite"></span><span style="position:absolute;left:0;top:36px;height:30px;border-radius:7px;background:var(--accent-soft);border:1.5px solid var(--accent);animation:zLtB 4.8s cubic-bezier(.4,1.2,.5,1) infinite"></span><span style="position:absolute;left:0;top:72px;height:30px;border-radius:7px;background:var(--accent-soft);border:1.5px solid var(--accent);animation:zLtC 4.8s cubic-bezier(.4,1.2,.5,1) infinite"></span></div>`,
    code: layoutToggle,
    codeV4: same(layoutToggle, "Unchanged in Reanimated 4: layout transitions animate size and position"),
  },

  {
    id: "keyboard-avoid",
    name: "Keyboard-aware input bar",
    level: "mid",
    description: "A chat input bar that rides up with the keyboard frame by frame instead of jumping when it opens.",
    apis: ["useAnimatedKeyboard", "useAnimatedStyle", "translateY"],
    apisV4: ["useReanimatedKeyboardAnimation", "react-native-keyboard-controller", "translateY"],
    demo: c`<div style="position:relative;width:140px;height:112px;border-radius:14px;overflow:hidden;background:var(--surface);border:1px solid var(--line)"><div style="position:absolute;left:8px;top:10px;width:70px;height:16px;border-radius:8px;background:var(--line)"></div><div style="position:absolute;right:8px;top:32px;width:60px;height:16px;border-radius:8px;background:var(--accent-soft)"></div><div style="position:absolute;left:0;right:0;bottom:0;animation:zKbB 4s cubic-bezier(.2,.8,.3,1) infinite"><div style="margin:0 6px 6px;height:22px;border-radius:11px;border:1.5px solid var(--line);background:var(--surface)"></div><div style="height:56px;background:var(--line);display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:4px"><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i><i style="background:var(--surface);border-radius:2px"></i></div></div></div>`,
    code: c`// useAnimatedKeyboard reports the keyboard height every frame of its animation
import { useAnimatedKeyboard } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const keyboard = useAnimatedKeyboard();
const { bottom } = useSafeAreaInsets();

// Subtract the home-indicator inset: the bar already sits above it
const bar = useAnimatedStyle(() => ({
  transform: [{ translateY: -Math.max(keyboard.height.value - bottom, 0) }],
}));

<View style={{ flex: 1 }}>
  <FlatList inverted data={messages} renderItem={renderMessage} />
  <Animated.View style={[styles.inputBar, { paddingBottom: bottom }, bar]}>
    <TextInput placeholder="Message" style={styles.input} />
    <SendButton />
  </Animated.View>
</View>
// Android: set android:windowSoftInputMode="adjustResize" so the window doesn't pan as well`,
    codeV4: c`// Reanimated 4 deprecates useAnimatedKeyboard; react-native-keyboard-controller gives the same frame-by-frame values
import { KeyboardProvider, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Wrap the app once: <KeyboardProvider><App /></KeyboardProvider>
const { height, progress } = useReanimatedKeyboardAnimation(); // height is negative while open
const { bottom } = useSafeAreaInsets();

const bar = useAnimatedStyle(() => ({
  // Same inset trick: move by the keyboard height minus what the safe area already covers
  transform: [{ translateY: Math.min(height.value + bottom * progress.value, 0) }],
}));

<View style={{ flex: 1 }}>
  <FlatList inverted data={messages} renderItem={renderMessage} />
  <Animated.View style={[styles.inputBar, { paddingBottom: bottom }, bar]}>
    <TextInput placeholder="Message" style={styles.input} />
    <SendButton />
  </Animated.View>
</View>
// The library also ships KeyboardStickyView, which does this in one component`,
  },

  {
    id: "tilt-card",
    name: "3D tilt card",
    level: "mid",
    description: "Press and move your finger on a card and it tilts toward you in 3D with a sliding glare, then springs flat.",
    apis: ["Gesture.Pan", "perspective", "rotateX / rotateY"],
    apisV4: ["Gesture.Pan", "perspective", "rotateX / rotateY"],
    demo: c`<div style="perspective:500px"><div style="position:relative;width:150px;height:92px;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,var(--accent),#7a5af8);color:#fff;padding:12px;font:700 12px var(--f-mono);box-shadow:0 10px 24px rgba(0,0,0,.25);animation:zTlC 4.8s ease-in-out infinite">•••• 4242<div style="margin-top:34px;font-size:10px;opacity:.8">VALID 08/29</div><span style="position:absolute;top:-40px;bottom:-40px;width:50px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);transform:rotate(20deg);animation:zTlG 4.8s ease-in-out infinite"></span></div></div>`,
    code: tiltCard,
    codeV4: same(tiltCard, "Unchanged in Reanimated 4: the finger position drives the tilt directly"),
  },

  {
    id: "gyro-parallax",
    name: "Gyroscope parallax",
    level: "mid",
    description: "Layers of an illustration drift by different amounts as you tilt the phone, giving the picture depth.",
    apis: ["useAnimatedSensor", "SensorType.ROTATION", "withSpring"],
    apisV4: ["useAnimatedSensor", "SensorType.ROTATION", "withSpring"],
    demo: c`<div style="position:relative;width:170px;height:104px;border-radius:14px;overflow:hidden;background:linear-gradient(#bcd3ff,#eef2ff)"><span style="position:absolute;left:100px;top:14px;width:22px;height:22px;border-radius:50%;background:#f5b301;animation:zGyA 4s ease-in-out infinite"></span><span style="position:absolute;left:-30px;right:-30px;bottom:-10px;height:70px;background:#8ea7e6;clip-path:polygon(0 100%,20% 30%,40% 70%,62% 10%,85% 60%,100% 35%,100% 100%);animation:zGyB 4s ease-in-out infinite"></span><span style="position:absolute;left:-40px;right:-40px;bottom:-14px;height:44px;background:var(--accent);clip-path:polygon(0 100%,0 40%,25% 70%,50% 20%,75% 60%,100% 30%,100% 100%);animation:zGyC 4s ease-in-out infinite"></span></div>`,
    code: gyro,
    codeV4: same(gyro, "Unchanged in Reanimated 4: the sensor value still arrives on the UI thread"),
  },

  {
    id: "emoji-reactions",
    name: "Emoji reactions",
    level: "adv",
    description: "Long-press Like to open a bar of reactions, slide your finger along it to magnify each one, and let go to pick.",
    apis: ["activateAfterLongPress", "useDerivedValue", "runOnJS"],
    apisV4: ["activateAfterLongPress", "useDerivedValue", "scheduleOnRN"],
    demo: c`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px"><div style="display:flex;align-items:flex-end;gap:4px;padding:5px 8px;border-radius:99px;background:var(--surface);border:1px solid var(--line);box-shadow:0 4px 12px rgba(0,0,0,.12);transform-origin:20px 100%;animation:zEmB 4.8s cubic-bezier(.3,1.5,.5,1) infinite"><span style="font-size:20px;transform-origin:bottom;animation:zEm1 4.8s cubic-bezier(.3,1.5,.5,1) infinite">👍</span><span style="font-size:20px;transform-origin:bottom;animation:zEm2 4.8s cubic-bezier(.3,1.5,.5,1) infinite">❤️</span><span style="font-size:20px;transform-origin:bottom;animation:zEm3 4.8s cubic-bezier(.3,1.5,.5,1) infinite">😂</span><span style="font-size:20px;transform-origin:bottom;animation:zEm4 4.8s cubic-bezier(.3,1.5,.5,1) infinite">😮</span><span style="font-size:20px">😢</span></div><span style="padding:5px 12px;border-radius:8px;background:var(--line);font-size:11px;font-weight:700">👍 Like</span></div>`,
    code: c`// One pan that starts after a long press: it opens the bar, tracks which emoji is under the finger, and picks on release
const EMOJI = ['👍', '❤️', '😂', '😮', '😢', '😡'];
const SIZE = 44;
const open = useSharedValue(0);
const hovered = useSharedValue(-1);

const pan = Gesture.Pan()
  .activateAfterLongPress(300)
  .onStart(() => { open.value = withSpring(1, { damping: 14 }); })
  .onUpdate((e) => {
    // e.x is relative to the Like button; the bar starts at its left edge, BAR_Y above it
    const overBar = e.y < 0 && e.y > -BAR_Y - SIZE;
    const i = Math.floor((e.x - 8) / SIZE);
    hovered.value = overBar && i >= 0 && i < EMOJI.length ? i : -1;
  })
  .onFinalize(() => {
    if (hovered.value >= 0) runOnJS(onReact)(EMOJI[hovered.value]);
    hovered.value = -1;
    open.value = withTiming(0, { duration: 150 });
  });

function Emoji({ index, char }) {
  const style = useAnimatedStyle(() => {
    const on = hovered.value === index;
    return {
      transform: [
        // each emoji pops in a little after the previous
        { translateY: interpolate(open.value, [index * 0.08, index * 0.08 + 0.5], [20, 0], Extrapolation.CLAMP) },
        { translateY: withSpring(on ? -14 : 0) },
        { scale: withSpring(on ? 1.6 : hovered.value >= 0 ? 0.85 : 1) },
      ],
    };
  });
  return <Animated.Text style={[{ fontSize: 30, width: SIZE, textAlign: 'center', transformOrigin: 'bottom' }, style]}>{char}</Animated.Text>;
}

const bar = useAnimatedStyle(() => ({
  opacity: open.value,
  transform: [{ scale: interpolate(open.value, [0, 1], [0.6, 1]) }],
}));

<View>
  <Animated.View pointerEvents="none" style={[styles.bar, { transformOrigin: 'left bottom' }, bar]}>
    {EMOJI.map((ch, i) => <Emoji key={ch} index={i} char={ch} />)}
  </Animated.View>
  <GestureDetector gesture={Gesture.Exclusive(pan, Gesture.Tap().onEnd(() => runOnJS(onReact)('👍')))}>
    <View style={styles.likeButton}><Text>👍 Like</Text></View>
  </GestureDetector>
</View>`,
    codeV4: c`import { scheduleOnRN } from 'react-native-worklets';

// Gesture-driven, so Reanimated 4 keeps shared values; scheduleOnRN replaces runOnJS
const EMOJI = ['👍', '❤️', '😂', '😮', '😢', '😡'];
const SIZE = 44;
const open = useSharedValue(0);
const hovered = useSharedValue(-1);

const pan = Gesture.Pan()
  .activateAfterLongPress(300)
  .onStart(() => { open.value = withSpring(1, { damping: 14 }); })
  .onUpdate((e) => {
    const overBar = e.y < 0 && e.y > -BAR_Y - SIZE;
    const i = Math.floor((e.x - 8) / SIZE);
    hovered.value = overBar && i >= 0 && i < EMOJI.length ? i : -1;
  })
  .onFinalize(() => {
    if (hovered.value >= 0) scheduleOnRN(onReact, EMOJI[hovered.value]);
    hovered.value = -1;
    open.value = withTiming(0, { duration: 150 });
  });

function Emoji({ index, char }) {
  const style = useAnimatedStyle(() => {
    const on = hovered.value === index;
    return {
      transform: [
        { translateY: interpolate(open.value, [index * 0.08, index * 0.08 + 0.5], [20, 0], Extrapolation.CLAMP) },
        { translateY: withSpring(on ? -14 : 0) },
        { scale: withSpring(on ? 1.6 : hovered.value >= 0 ? 0.85 : 1) },
      ],
    };
  });
  return <Animated.Text style={[{ fontSize: 30, width: SIZE, textAlign: 'center', transformOrigin: 'bottom' }, style]}>{char}</Animated.Text>;
}

const bar = useAnimatedStyle(() => ({
  opacity: open.value,
  transform: [{ scale: interpolate(open.value, [0, 1], [0.6, 1]) }],
}));

<View>
  <Animated.View pointerEvents="none" style={[styles.bar, { transformOrigin: 'left bottom' }, bar]}>
    {EMOJI.map((ch, i) => <Emoji key={ch} index={i} char={ch} />)}
  </Animated.View>
  <GestureDetector gesture={Gesture.Exclusive(pan, Gesture.Tap().onEnd(() => scheduleOnRN(onReact, '👍')))}>
    <View style={styles.likeButton}><Text>👍 Like</Text></View>
  </GestureDetector>
</View>`,
  },

  {
    id: "context-menu",
    name: "Long-press context menu",
    level: "adv",
    description: "Hold a message and it shrinks under your finger, then lifts out above a dimmed screen with a menu springing from it.",
    apis: ["Gesture.LongPress", "measure", "useAnimatedRef"],
    apisV4: ["Gesture.LongPress", "measure", "scheduleOnRN"],
    demo: c`<div style="position:relative;width:180px;height:112px;border-radius:12px;overflow:hidden;background:var(--surface);border:1px solid var(--line)"><div style="position:absolute;inset:0;background:#000;opacity:0;animation:zCmS 4.4s infinite"></div><div style="position:absolute;left:12px;top:16px;padding:7px 11px;border-radius:12px;background:var(--accent-soft);font-size:11px;font-weight:600;animation:zCmM 4.4s cubic-bezier(.3,1.4,.5,1) infinite">See you at 7?</div><div style="position:absolute;left:12px;top:50px;width:110px;border-radius:10px;background:var(--surface);box-shadow:0 6px 18px rgba(0,0,0,.25);font-size:10px;font-weight:600;overflow:hidden;transform-origin:top left;opacity:0;animation:zCmP 4.4s cubic-bezier(.3,1.4,.5,1) infinite"><div style="padding:6px 10px;border-bottom:1px solid var(--line)">↩ Reply</div><div style="padding:6px 10px;border-bottom:1px solid var(--line)">⧉ Copy</div><div style="padding:6px 10px;color:var(--danger)">🗑 Delete</div></div></div>`,
    code: c`// Press: squeeze. Long press: measure where the bubble is, show an overlay copy there and lift it
const ref = useAnimatedRef();
const press = useSharedValue(1);
const lift = useSharedValue(0);
const frame = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
const [menuOpen, setMenuOpen] = useState(false);

const longPress = Gesture.LongPress()
  .minDuration(350)
  .onBegin(() => { press.value = withTiming(0.95, { duration: 350 }); })
  .onStart(() => {
    const m = measure(ref); // window coordinates, read on the UI thread
    if (!m) return;
    frame.value = { x: m.pageX, y: m.pageY, width: m.width, height: m.height };
    press.value = withSpring(1);
    lift.value = withSpring(1, { damping: 16, stiffness: 180 });
    runOnJS(setMenuOpen)(true);
  })
  .onFinalize((_, success) => { if (!success) press.value = withSpring(1); });

const close = () => {
  lift.value = withTiming(0, { duration: 180 }, () => runOnJS(setMenuOpen)(false));
};

const inline = useAnimatedStyle(() => ({ transform: [{ scale: press.value }], opacity: lift.value > 0 ? 0 : 1 }));
const scrim = useAnimatedStyle(() => ({ opacity: lift.value * 0.5 }));
const floating = useAnimatedStyle(() => ({
  position: 'absolute', left: frame.value.x, top: frame.value.y, width: frame.value.width,
  transform: [{ translateY: -12 * lift.value }, { scale: 1 + 0.04 * lift.value }],
}));
const menu = useAnimatedStyle(() => ({
  position: 'absolute', left: frame.value.x, top: frame.value.y + frame.value.height + 8,
  opacity: lift.value,
  transform: [{ scale: interpolate(lift.value, [0, 1], [0.5, 1]) }],
}));

<GestureDetector gesture={longPress}>
  <Animated.View ref={ref} style={inline}><Bubble message={message} /></Animated.View>
</GestureDetector>

<Modal transparent visible={menuOpen} onRequestClose={close}>
  <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, scrim]}>
    <Pressable style={StyleSheet.absoluteFill} onPress={close} />
  </Animated.View>
  <Animated.View style={floating}><Bubble message={message} /></Animated.View>
  <Animated.View style={[styles.menu, { transformOrigin: 'top left' }, menu]}>
    <MenuItem label="Reply" onPress={close} />
    <MenuItem label="Copy" onPress={close} />
    <MenuItem label="Delete" destructive onPress={close} />
  </Animated.View>
</Modal>`,
    codeV4: c`import { scheduleOnRN } from 'react-native-worklets';

// Same structure in Reanimated 4: measure() on the UI thread, scheduleOnRN to open the Modal
const ref = useAnimatedRef();
const press = useSharedValue(1);
const lift = useSharedValue(0);
const frame = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
const [menuOpen, setMenuOpen] = useState(false);

const longPress = Gesture.LongPress()
  .minDuration(350)
  .onBegin(() => { press.value = withTiming(0.95, { duration: 350 }); })
  .onStart(() => {
    const m = measure(ref);
    if (!m) return;
    frame.value = { x: m.pageX, y: m.pageY, width: m.width, height: m.height };
    press.value = withSpring(1);
    lift.value = withSpring(1, { damping: 16, stiffness: 180 });
    scheduleOnRN(setMenuOpen, true);
  })
  .onFinalize((_, success) => { if (!success) press.value = withSpring(1); });

const close = () => {
  lift.value = withTiming(0, { duration: 180 }, () => scheduleOnRN(setMenuOpen, false));
};

const inline = useAnimatedStyle(() => ({ transform: [{ scale: press.value }], opacity: lift.value > 0 ? 0 : 1 }));
const scrim = useAnimatedStyle(() => ({ opacity: lift.value * 0.5 }));
const floating = useAnimatedStyle(() => ({
  position: 'absolute', left: frame.value.x, top: frame.value.y, width: frame.value.width,
  transform: [{ translateY: -12 * lift.value }, { scale: 1 + 0.04 * lift.value }],
}));
const menu = useAnimatedStyle(() => ({
  position: 'absolute', left: frame.value.x, top: frame.value.y + frame.value.height + 8,
  opacity: lift.value,
  transform: [{ scale: interpolate(lift.value, [0, 1], [0.5, 1]) }],
}));

<GestureDetector gesture={longPress}>
  <Animated.View ref={ref} style={inline}><Bubble message={message} /></Animated.View>
</GestureDetector>

<Modal transparent visible={menuOpen} onRequestClose={close}>
  <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, scrim]}>
    <Pressable style={StyleSheet.absoluteFill} onPress={close} />
  </Animated.View>
  <Animated.View style={floating}><Bubble message={message} /></Animated.View>
  <Animated.View style={[styles.menu, { transformOrigin: 'top left' }, menu]}>
    <MenuItem label="Reply" onPress={close} />
    <MenuItem label="Copy" onPress={close} />
    <MenuItem label="Delete" destructive onPress={close} />
  </Animated.View>
</Modal>`,
  },

  {
    id: "fly-to-cart",
    name: "Fly to cart",
    level: "adv",
    description: "Add to cart and a copy of the product image arcs across the screen into the cart icon, which bumps when it lands.",
    apis: ["measure", "useAnimatedRef", "withSequence"],
    apisV4: ["measure", "useAnimatedRef", "scheduleOnRN"],
    demo: c`<div style="position:relative;width:190px;height:108px"><span style="position:absolute;right:4px;top:4px;width:32px;height:32px;border-radius:10px;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;font-size:16px;animation:zFcC 3.2s infinite">🛒</span><span style="position:absolute;left:8px;bottom:8px;width:48px;height:48px;border-radius:10px;background:var(--accent-soft);display:grid;place-items:center;font-size:24px">👟</span><span style="position:absolute;left:8px;bottom:8px;width:48px;height:48px;display:grid;place-items:center;font-size:24px;animation:zFcX 3.2s linear infinite"><span style="display:block;animation:zFcY 3.2s linear infinite">👟</span></span></div>`,
    code: c`// Measure the image and the cart on the UI thread, then fly a clone between them
const imageRef = useAnimatedRef();
const cartRef = useAnimatedRef();
const p = useSharedValue(0);
const from = useSharedValue({ x: 0, y: 0 }), to = useSharedValue({ x: 0, y: 0 });
const bump = useSharedValue(1);
const [flying, setFlying] = useState(false);

const landed = () => { setFlying(false); addToCart(product); };

const fly = () => {
  setFlying(true);
  runOnUI(() => {
    const a = measure(imageRef), b = measure(cartRef);
    if (!a || !b) return;
    from.value = { x: a.pageX, y: a.pageY };
    to.value = { x: b.pageX + b.width / 2 - a.width / 2, y: b.pageY + b.height / 2 - a.height / 2 };
    p.value = 0;
    p.value = withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }, (done) => {
      if (!done) return;
      bump.value = withSequence(withTiming(1.3, { duration: 100 }), withSpring(1, { damping: 6 }));
      runOnJS(landed)();
    });
  })();
};

const clone = useAnimatedStyle(() => {
  const t = p.value;
  return {
    position: 'absolute', left: 0, top: 0,
    transform: [
      { translateX: from.value.x + (to.value.x - from.value.x) * t },
      // straight line plus a sine bump = a throw arc
      { translateY: from.value.y + (to.value.y - from.value.y) * t - Math.sin(Math.PI * t) * 120 },
      { scale: 1 - 0.75 * t },
    ],
    opacity: t < 0.95 ? 1 : 0,
  };
});
const cart = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

<Animated.View ref={cartRef} style={cart}><CartIcon /></Animated.View>
<Animated.Image ref={imageRef} source={product.image} style={styles.image} />
<Button title="Add to cart" onPress={fly} />
{/* Rendered last, at the root of the screen, so it flies over everything */}
{flying && <Animated.Image pointerEvents="none" source={product.image} style={[styles.image, clone]} />}`,
    codeV4: c`import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

// Reanimated 4: scheduleOnUI and scheduleOnRN replace runOnUI and runOnJS
const imageRef = useAnimatedRef();
const cartRef = useAnimatedRef();
const p = useSharedValue(0);
const from = useSharedValue({ x: 0, y: 0 }), to = useSharedValue({ x: 0, y: 0 });
const bump = useSharedValue(1);
const [flying, setFlying] = useState(false);

const landed = () => { setFlying(false); addToCart(product); };

const fly = () => {
  setFlying(true);
  scheduleOnUI(() => {
    const a = measure(imageRef), b = measure(cartRef);
    if (!a || !b) return;
    from.value = { x: a.pageX, y: a.pageY };
    to.value = { x: b.pageX + b.width / 2 - a.width / 2, y: b.pageY + b.height / 2 - a.height / 2 };
    p.value = 0;
    p.value = withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }, (done) => {
      if (!done) return;
      bump.value = withSequence(withTiming(1.3, { duration: 100 }), withSpring(1, { damping: 6 }));
      scheduleOnRN(landed);
    });
  });
};

const clone = useAnimatedStyle(() => {
  const t = p.value;
  return {
    position: 'absolute', left: 0, top: 0,
    transform: [
      { translateX: from.value.x + (to.value.x - from.value.x) * t },
      { translateY: from.value.y + (to.value.y - from.value.y) * t - Math.sin(Math.PI * t) * 120 },
      { scale: 1 - 0.75 * t },
    ],
    opacity: t < 0.95 ? 1 : 0,
  };
});
const cart = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

<Animated.View ref={cartRef} style={cart}><CartIcon /></Animated.View>
<Animated.Image ref={imageRef} source={product.image} style={styles.image} />
<Button title="Add to cart" onPress={fly} />
{flying && <Animated.Image pointerEvents="none" source={product.image} style={[styles.image, clone]} />}`,
  },

  {
    id: "wave-fill",
    name: "Liquid fill progress",
    level: "adv",
    description: "A round progress gauge filled with liquid: the surface waves continuously while the level rises to the value.",
    apis: ["useAnimatedProps", "withRepeat", "ClipPath"],
    apisV4: ["useAnimatedProps", "withRepeat", "ClipPath"],
    demo: c`<div style="position:relative;width:90px;height:90px;border-radius:50%;border:3px solid var(--accent);background:var(--accent-soft);overflow:hidden"><div style="position:absolute;left:0;right:0;bottom:0;animation:zWfL 5s ease-in-out infinite"><svg style="position:absolute;left:0;top:-8px;width:180px;height:10px;animation:zWfX 1.6s linear infinite" viewBox="0 0 180 10" preserveAspectRatio="none"><path d="M0 5 Q 22.5 0 45 5 T 90 5 T 135 5 T 180 5 V 10 H 0 Z" fill="var(--accent)"/></svg><div style="position:absolute;inset:0;background:var(--accent)"></div></div><span style="position:absolute;inset:0;display:grid;place-items:center;font:700 15px var(--f-mono);color:#fff;mix-blend-mode:difference">72%</span></div>`,
    code: waveFill,
    codeV4: same(waveFill, "Unchanged in Reanimated 4: the wave is a computed path, so it stays on animated props"),
  },

  {
    id: "spring-chain",
    name: "Spring chain",
    level: "adv",
    description: "Drag the lead bubble and a trail of smaller ones follows, each springing after the one in front of it.",
    apis: ["useDerivedValue", "withSpring", "Gesture.Pan"],
    apisV4: ["useDerivedValue", "withSpring", "Gesture.Pan"],
    demo: c`<div style="position:relative;width:190px;height:100px"><span style="position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--accent);opacity:.35;scale:.6;animation:zScP 3.6s ease-in-out .32s infinite both"></span><span style="position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--accent);opacity:.5;scale:.7;animation:zScP 3.6s ease-in-out .24s infinite both"></span><span style="position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--accent);opacity:.65;scale:.8;animation:zScP 3.6s ease-in-out .16s infinite both"></span><span style="position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--accent);opacity:.8;scale:.9;animation:zScP 3.6s ease-in-out .08s infinite both"></span><span style="position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--accent);animation:zScP 3.6s ease-in-out infinite"></span></div>`,
    code: springChain,
    codeV4: same(springChain, "Unchanged in Reanimated 4: derived values with springs chain the same way"),
  },

  {
    id: "shape-morph",
    name: "Shape morph",
    level: "adv",
    description: "A shape melts smoothly from a circle to a rounded square to an organic blob and back.",
    apis: ["usePathInterpolation", "Skia.Path", "withRepeat"],
    apisV4: ["usePathInterpolation", "Skia.Path", "withRepeat"],
    demo: c`<div style="width:70px;height:70px;background:var(--accent);animation:zMo 4.5s ease-in-out infinite alternate"></div>`,
    code: shapeMorph,
    codeV4: same(shapeMorph, "Unchanged in Reanimated 4: Skia reads the shared value directly"),
  },

  {
    id: "spin-wheel",
    name: "Spinning prize wheel",
    level: "mid",
    description: "Tap spin and the wheel whips round and slowly winds down onto a prize, the pointer flicking as each segment passes.",
    apis: ["withTiming", "Easing.bezier", "useAnimatedReaction"],
    apisV4: ["withTiming", "useAnimatedReaction", "scheduleOnRN"],
    demo: c`<div style="position:relative;width:104px;height:116px"><span style="position:absolute;left:50%;top:0;margin-left:-7px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:14px solid var(--ink);z-index:2;transform-origin:50% 0;animation:zWhP 5s infinite"></span><div style="position:absolute;left:2px;top:10px;width:100px;height:100px;border-radius:50%;border:3px solid var(--surface);box-shadow:0 3px 10px rgba(0,0,0,.2);background:conic-gradient(var(--accent) 0deg 60deg,var(--coral) 60deg 120deg,#f5b301 120deg 180deg,#7a5af8 180deg 240deg,#2BA84A 240deg 300deg,#0ea5e9 300deg 360deg);animation:zWh 5s infinite"><span style="position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--surface);box-shadow:0 1px 3px rgba(0,0,0,.3)"></span></div></div>`,
    code: c`// Pick the prize first, then spin to it: whole turns plus the angle that puts its center under the pointer
const PRIZES = ['10%', 'Free ship', '5%', 'Try again', '20%', 'Gift'];
const SEG = 360 / PRIZES.length;
const rotation = useSharedValue(0);
const pointer = useSharedValue(0);
const [spinning, setSpinning] = useState(false);

const spin = () => {
  if (spinning) return;
  setSpinning(true);
  const prize = Math.floor(Math.random() * PRIZES.length); // or the result from your server
  const jitter = (Math.random() - 0.5) * SEG * 0.7;        // don't always stop dead center
  const current = rotation.value % 360;
  // segment i sits at i * SEG clockwise from the top, so rotate it back under the pointer
  const target = rotation.value - current + 360 * 6 + (360 - (prize * SEG + SEG / 2)) + jitter;
  rotation.value = withTiming(target, { duration: 4500, easing: Easing.bezier(0.15, 0.75, 0.2, 1) }, (done) => {
    if (done) runOnJS(finish)(prize);
  });
};
const finish = (prize) => { setSpinning(false); onWin(PRIZES[prize]); };

// Each time a segment edge passes the pointer: flick the pointer and tick a haptic
useAnimatedReaction(
  () => Math.floor(rotation.value / SEG),
  (edge, prev) => {
    if (prev === null || edge === prev) return;
    pointer.value = withSequence(withTiming(-18, { duration: 40 }), withSpring(0, { damping: 8, stiffness: 400 }));
    runOnJS(Haptics.selectionAsync)();
  },
);

const wheel = useAnimatedStyle(() => ({ transform: [{ rotate: rotation.value + 'deg' }] }));
const flap = useAnimatedStyle(() => ({ transform: [{ rotate: pointer.value + 'deg' }] }));

<View style={{ alignItems: 'center' }}>
  <Animated.View style={[styles.pointer, { transformOrigin: 'top' }, flap]} /> {/* small triangle, zIndex above the wheel */}
  <Animated.View style={[{ width: 260, height: 260 }, wheel]}>
    <WheelFace prizes={PRIZES} /> {/* react-native-svg: one Path wedge + Text label per prize */}
  </Animated.View>
  <Button title={spinning ? 'Spinning…' : 'Spin'} onPress={spin} disabled={spinning} />
</View>`,
    codeV4: c`import { scheduleOnRN } from 'react-native-worklets';

// Per-frame ticks need the live angle, so Reanimated 4 keeps a shared value; scheduleOnRN replaces runOnJS
const PRIZES = ['10%', 'Free ship', '5%', 'Try again', '20%', 'Gift'];
const SEG = 360 / PRIZES.length;
const rotation = useSharedValue(0);
const pointer = useSharedValue(0);
const [spinning, setSpinning] = useState(false);

const spin = () => {
  if (spinning) return;
  setSpinning(true);
  const prize = Math.floor(Math.random() * PRIZES.length); // or the result from your server
  const jitter = (Math.random() - 0.5) * SEG * 0.7;        // don't always stop dead center
  const current = rotation.value % 360;
  // segment i sits at i * SEG clockwise from the top, so rotate it back under the pointer
  const target = rotation.value - current + 360 * 6 + (360 - (prize * SEG + SEG / 2)) + jitter;
  rotation.value = withTiming(target, { duration: 4500, easing: Easing.bezier(0.15, 0.75, 0.2, 1) }, (done) => {
    if (done) scheduleOnRN(finish, prize);
  });
};
const finish = (prize) => { setSpinning(false); onWin(PRIZES[prize]); };

// Each time a segment edge passes the pointer: flick the pointer and tick a haptic
useAnimatedReaction(
  () => Math.floor(rotation.value / SEG),
  (edge, prev) => {
    if (prev === null || edge === prev) return;
    pointer.value = withSequence(withTiming(-18, { duration: 40 }), withSpring(0, { damping: 8, stiffness: 400 }));
    scheduleOnRN(Haptics.selectionAsync);
  },
);

const wheel = useAnimatedStyle(() => ({ transform: [{ rotate: rotation.value + 'deg' }] }));
const flap = useAnimatedStyle(() => ({ transform: [{ rotate: pointer.value + 'deg' }] }));

<View style={{ alignItems: 'center' }}>
  <Animated.View style={[styles.pointer, { transformOrigin: 'top' }, flap]} /> {/* small triangle, zIndex above the wheel */}
  <Animated.View style={[{ width: 260, height: 260 }, wheel]}>
    <WheelFace prizes={PRIZES} /> {/* react-native-svg: one Path wedge + Text label per prize */}
  </Animated.View>
  <Button title={spinning ? 'Spinning…' : 'Spin'} onPress={spin} disabled={spinning} />
</View>`,
  },
];
