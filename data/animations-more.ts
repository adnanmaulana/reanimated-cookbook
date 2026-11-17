// Everyday UI animations added after the original 48. Same shape as data/animations.ts;
// their Flutter, SwiftUI and Compose ports live in data/flutter.ts, data/swiftui.ts and data/compose.ts.
// Demos use the keyframes in app/globals.css. String.raw keeps code verbatim; snippets avoid JS interpolation syntax.
import type { Animation } from "@/lib/types";

const c = String.raw;

export const more: Animation[] = [
  {
    id: "count-up",
    name: "Number count-up",
    level: "basic",
    description: "Count a number up from 0 to its value, for stats, balances and scores.",
    apis: ["useAnimatedProps", "withTiming", "TextInput text prop"],
    apisV4: ["useAnimatedProps", "withTiming", "TextInput text prop"],
    demo: c`<div class="count"></div>`,
    code: c`// Text can't be animated on the UI thread, so animate a read-only TextInput's text prop
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const value = useSharedValue(0);
useEffect(() => {
  value.value = withTiming(1280, { duration: 1200, easing: Easing.out(Easing.cubic) });
}, []);

const animatedProps = useAnimatedProps(() => {
  const text = Math.round(value.value).toString();
  return { text, defaultValue: text } as any;
});

<AnimatedTextInput
  editable={false}
  underlineColorAndroid="transparent"
  animatedProps={animatedProps}
  style={styles.number} // add fontVariant: ['tabular-nums'] so digits don't jiggle
/>`,
    codeV4: c`// Text can't be animated on the UI thread, so animate a read-only TextInput's text prop
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const value = useSharedValue(0);
useEffect(() => {
  value.value = withTiming(1280, { duration: 1200, easing: Easing.out(Easing.cubic) });
}, []);

const animatedProps = useAnimatedProps(() => {
  const text = Math.round(value.value).toString();
  return { text, defaultValue: text } as any;
});

<AnimatedTextInput
  editable={false}
  underlineColorAndroid="transparent"
  animatedProps={animatedProps}
  style={styles.number} // add fontVariant: ['tabular-nums'] so digits don't jiggle
/>`,
  },

  {
    id: "toast",
    name: "Toast",
    level: "basic",
    description: "Slide a message in from the top, hold it, then slide it away on its own.",
    apis: ["SlideInUp", "SlideOutUp", "entering / exiting"],
    apisV4: ["SlideInUp", "SlideOutUp", "entering / exiting"],
    demo: c`<div style="position:relative;width:180px;height:90px;overflow:hidden;border-radius:10px;background:var(--surface);border:1px solid var(--line)"><div style="position:absolute;left:10px;right:10px;top:10px;height:28px;border-radius:8px;background:var(--accent);color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;padding:0 10px;animation:toast 3s cubic-bezier(.2,.9,.3,1.2) infinite">✓ Saved</div></div>`,
    code: c`// Layout animation presets handle the enter and exit
const [toast, setToast] = useState<string | null>(null);
const timer = useRef<ReturnType<typeof setTimeout>>();

const show = (message: string) => {
  clearTimeout(timer.current);
  setToast(message);
  timer.current = setTimeout(() => setToast(null), 2500); // auto dismiss
};

{toast && (
  <Animated.View
    key={toast}
    entering={SlideInUp.springify().damping(16)}
    exiting={SlideOutUp.duration(200)}
    style={[styles.toast, { top: insets.top + 8 }]}>
    <Text style={styles.toastText}>{toast}</Text>
  </Animated.View>
)}`,
    codeV4: c`// Layout animation presets handle the enter and exit
const [toast, setToast] = useState<string | null>(null);
const timer = useRef<ReturnType<typeof setTimeout>>();

const show = (message: string) => {
  clearTimeout(timer.current);
  setToast(message);
  timer.current = setTimeout(() => setToast(null), 2500); // auto dismiss
};

{toast && (
  <Animated.View
    key={toast}
    entering={SlideInUp.springify().damping(16)}
    exiting={SlideOutUp.duration(200)}
    style={[styles.toast, { top: insets.top + 8 }]}>
    <Text style={styles.toastText}>{toast}</Text>
  </Animated.View>
)}`,
  },

  {
    id: "menu-morph",
    name: "Menu icon morph",
    level: "basic",
    description: "Three hamburger lines morph into a close X: the middle fades, the outer two rotate.",
    apis: ["withTiming", "useAnimatedStyle", "rotate"],
    apisV4: ["transitionProperty", "transform", "CSS transitions"],
    demo: c`<div style="display:grid;gap:6px;width:34px"><i style="display:block;height:3px;border-radius:2px;background:var(--accent);animation:hbT 2.4s ease-in-out infinite"></i><i style="display:block;height:3px;border-radius:2px;background:var(--accent);animation:hbM 2.4s ease-in-out infinite"></i><i style="display:block;height:3px;border-radius:2px;background:var(--accent);animation:hbB 2.4s ease-in-out infinite"></i></div>`,
    code: c`const progress = useSharedValue(0); // 0 = ≡, 1 = ✕
const toggle = () => {
  progress.value = withTiming(progress.value > 0.5 ? 0 : 1, { duration: 250 });
};

// Lines are 3 px tall with a 6 px gap, so the outer ones travel 9 px to the middle
const top = useAnimatedStyle(() => ({
  transform: [{ translateY: progress.value * 9 }, { rotate: progress.value * 45 + 'deg' }],
}));
const middle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
const bottom = useAnimatedStyle(() => ({
  transform: [{ translateY: progress.value * -9 }, { rotate: progress.value * -45 + 'deg' }],
}));

<Pressable onPress={toggle} hitSlop={12} style={{ gap: 6 }}>
  <Animated.View style={[styles.line, top]} />
  <Animated.View style={[styles.line, middle]} />
  <Animated.View style={[styles.line, bottom]} />
</Pressable>`,
    codeV4: c`// Reanimated 4: CSS transitions react to the open state
const [open, setOpen] = useState(false);
const line = {
  width: 28, height: 3, borderRadius: 2, backgroundColor: '#111',
  transitionProperty: ['transform', 'opacity'],
  transitionDuration: '250ms',
  transitionTimingFunction: 'ease-in-out',
} as const;

// Lines are 3 px tall with a 6 px gap, so the outer ones travel 9 px to the middle
<Pressable onPress={() => setOpen(o => !o)} hitSlop={12} style={{ gap: 6 }}>
  <Animated.View style={[line, { transform: [{ translateY: open ? 9 : 0 }, { rotate: open ? '45deg' : '0deg' }] }]} />
  <Animated.View style={[line, { opacity: open ? 0 : 1 }]} />
  <Animated.View style={[line, { transform: [{ translateY: open ? -9 : 0 }, { rotate: open ? '-45deg' : '0deg' }] }]} />
</Pressable>`,
  },

  {
    id: "floating-label",
    name: "Floating label",
    level: "basic",
    description: "The placeholder shrinks and floats above the input when it's focused or filled.",
    apis: ["withTiming", "interpolateColor", "onFocus / onBlur"],
    apisV4: ["transitionProperty", "transform", "CSS transitions"],
    demo: c`<div style="position:relative;width:170px;height:40px;border:2px solid var(--line);border-radius:8px;background:var(--surface);animation:flB 3s infinite"><span style="position:absolute;left:8px;top:9px;padding:0 3px;font-size:13px;background:var(--surface);transform-origin:left center;animation:flL 3s cubic-bezier(.2,.8,.2,1) infinite">Email</span></div>`,
    code: c`const up = useSharedValue(0); // 1 = floated
const [value, setValue] = useState('');

const label = useAnimatedStyle(() => ({
  transform: [{ translateY: up.value * -22 }, { scale: 1 - up.value * 0.2 }],
  color: interpolateColor(up.value, [0, 1], ['#888888', '#2F5BFF']),
}));

<View style={styles.field}>
  {/* styles.label: position 'absolute', left 12, top 14, transformOrigin 'left' */}
  <Animated.Text style={[styles.label, label]} pointerEvents="none">Email</Animated.Text>
  <TextInput
    value={value}
    onChangeText={setValue}
    onFocus={() => (up.value = withTiming(1, { duration: 180 }))}
    onBlur={() => { if (!value) up.value = withTiming(0, { duration: 180 }); }}
    style={styles.input}
  />
</View>`,
    codeV4: c`// Reanimated 4: a CSS transition follows the focused / filled state
const [focused, setFocused] = useState(false);
const [value, setValue] = useState('');
const up = focused || value.length > 0;

<View style={styles.field}>
  {/* styles.label: position 'absolute', left 12, top 14, transformOrigin 'left' */}
  <Animated.Text
    pointerEvents="none"
    style={[styles.label, {
      transform: [{ translateY: up ? -22 : 0 }, { scale: up ? 0.8 : 1 }],
      color: up ? '#2F5BFF' : '#888888',
      transitionProperty: ['transform', 'color'],
      transitionDuration: '180ms',
      transitionTimingFunction: 'ease-out',
    }]}>
    Email
  </Animated.Text>
  <TextInput
    value={value}
    onChangeText={setValue}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    style={styles.input}
  />
</View>`,
  },

  {
    id: "marquee",
    name: "Infinite marquee",
    level: "basic",
    description: "A row of items scrolls sideways forever and loops without a seam. Good for logos and tickers.",
    apis: ["withRepeat", "withTiming", "Easing.linear"],
    apisV4: ["animationName", "animationIterationCount", "CSS animations"],
    demo: c`<div style="width:180px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)"><div style="display:flex;width:max-content;animation:mq 4s linear infinite"><span class="mqi"></span><span class="mqi" style="width:56px"></span><span class="mqi"></span><span class="mqi" style="width:30px"></span><span class="mqi"></span><span class="mqi" style="width:56px"></span><span class="mqi"></span><span class="mqi" style="width:30px"></span></div></div>`,
    code: c`// Two copies side by side; slide left by exactly one copy's width, forever
const [w, setW] = useState(0);
const x = useSharedValue(0);

useEffect(() => {
  if (!w) return;
  x.value = 0;
  x.value = withRepeat(withTiming(-w, { duration: w * 25, easing: Easing.linear }), -1); // ~40 px/s
}, [w]);

const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

<View style={{ overflow: 'hidden' }}>
  <Animated.View style={[{ flexDirection: 'row' }, style]}>
    <View style={{ flexDirection: 'row' }} onLayout={e => setW(e.nativeEvent.layout.width)}>{items}</View>
    <View style={{ flexDirection: 'row' }}>{items}</View>
  </Animated.View>
</View>
// Give every item the same trailing margin (no gap on the row) so the two copies tile exactly.`,
    codeV4: c`// Two copies side by side; a CSS animation slides left by one copy's width, forever
const [w, setW] = useState(0);
const marquee = {
  from: { transform: [{ translateX: 0 }] },
  to: { transform: [{ translateX: -w }] },
};

<View style={{ overflow: 'hidden' }}>
  <Animated.View
    style={[{ flexDirection: 'row' }, w > 0 && {
      animationName: marquee,
      animationDuration: w * 25 + 'ms', // ~40 px/s whatever the content width
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
    }]}>
    <View style={{ flexDirection: 'row' }} onLayout={e => setW(e.nativeEvent.layout.width)}>{items}</View>
    <View style={{ flexDirection: 'row' }}>{items}</View>
  </Animated.View>
</View>
// Give every item the same trailing margin (no gap on the row) so the two copies tile exactly.`,
  },

  {
    id: "success-check",
    name: "Success checkmark",
    level: "mid",
    description: "A circle springs in, then a checkmark draws itself. For payment or form success.",
    apis: ["withSpring", "withDelay", "useAnimatedProps", "react-native-svg"],
    apisV4: ["withSpring", "withDelay", "useAnimatedProps", "react-native-svg"],
    demo: c`<svg viewBox="0 0 52 52" width="58" height="58"><circle cx="26" cy="26" r="24" style="fill:var(--accent);transform-origin:26px 26px;animation:okC 2.8s infinite"/><path d="M15 27l7 7 15-15" pathLength="100" style="fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;animation:okP 2.8s ease-out infinite"/></svg>`,
    code: c`// react-native-svg draws the check; animating strokeDashoffset reveals it
const AnimatedPath = Animated.createAnimatedComponent(Path);
const LEN = 32; // length of the check path below

const scale = useSharedValue(0);
const draw = useSharedValue(LEN);

useEffect(() => {
  scale.value = withSpring(1, { damping: 10 });
  draw.value = withDelay(250, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
}, []);

const circle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
const pathProps = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));

<Animated.View style={[styles.circle, circle]}>
  <Svg width={52} height={52} viewBox="0 0 52 52">
    <AnimatedPath
      d="M15 27l7 7 15-15"
      stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none"
      strokeDasharray={LEN}
      animatedProps={pathProps}
    />
  </Svg>
</Animated.View>`,
    codeV4: c`// react-native-svg draws the check; animating strokeDashoffset reveals it
const AnimatedPath = Animated.createAnimatedComponent(Path);
const LEN = 32; // length of the check path below

const scale = useSharedValue(0);
const draw = useSharedValue(LEN);

useEffect(() => {
  scale.value = withSpring(1, { damping: 10 });
  draw.value = withDelay(250, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
}, []);

const circle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
const pathProps = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));

<Animated.View style={[styles.circle, circle]}>
  <Svg width={52} height={52} viewBox="0 0 52 52">
    <AnimatedPath
      d="M15 27l7 7 15-15"
      stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none"
      strokeDasharray={LEN}
      animatedProps={pathProps}
    />
  </Svg>
</Animated.View>`,
  },

  {
    id: "fab-menu",
    name: "Speed dial FAB",
    level: "mid",
    description: "The plus button turns into an X while action buttons fan out above it, one after another.",
    apis: ["withSpring", "interpolate", "Extrapolation.CLAMP"],
    apisV4: ["transitionDelay", "cubicBezier", "CSS transitions"],
    demo: c`<div style="position:relative;width:46px;height:132px"><div style="position:absolute;left:7px;bottom:7px;width:32px;height:32px;border-radius:50%;background:var(--accent-soft);border:2px solid var(--accent);--y:-46px;animation:fabI 3s cubic-bezier(.3,1.4,.5,1) infinite both"></div><div style="position:absolute;left:7px;bottom:7px;width:32px;height:32px;border-radius:50%;background:var(--accent-soft);border:2px solid var(--accent);--y:-86px;animation:fabI 3s .08s cubic-bezier(.3,1.4,.5,1) infinite both"></div><div style="position:absolute;left:0;bottom:0;width:46px;height:46px;border-radius:50%;background:var(--accent);color:#fff;font-size:28px;line-height:1;display:flex;align-items:center;justify-content:center;animation:fabR 3s ease-in-out infinite">+</div></div>`,
    code: c`const open = useSharedValue(0); // 0 closed, 1 open
const toggle = () => {
  open.value = withSpring(open.value > 0.5 ? 0 : 1, { damping: 14 });
};

function Action({ index, icon }: { index: number; icon: string }) {
  const style = useAnimatedStyle(() => {
    // Stagger: each action starts a little later along the same progress
    const p = interpolate(open.value, [index * 0.15, index * 0.15 + 0.7], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: -(index + 1) * 60 * p }, { scale: 0.3 + 0.7 * p }],
    };
  });
  return (
    <Animated.View style={[styles.action, style]}>
      <ActionButton icon={icon} />
    </Animated.View>
  );
}

const fab = useAnimatedStyle(() => ({ transform: [{ rotate: open.value * 45 + 'deg' }] }));

<View style={styles.fabArea}>
  {['camera', 'image', 'file'].map((icon, i) => <Action key={icon} index={i} icon={icon} />)}
  <Pressable onPress={toggle}>
    <Animated.View style={[styles.fab, fab]}><PlusIcon /></Animated.View>
  </Pressable>
</View>`,
    codeV4: c`// Reanimated 4: CSS transitions on the open state, with a per-item delay
import Animated, { cubicBezier } from 'react-native-reanimated';

const [open, setOpen] = useState(false);
const actions = ['camera', 'image', 'file'];

<View style={styles.fabArea}>
  {actions.map((icon, i) => (
    <Animated.View
      key={icon}
      pointerEvents={open ? 'auto' : 'none'}
      style={[styles.action, {
        opacity: open ? 1 : 0,
        transform: [{ translateY: open ? -(i + 1) * 60 : 0 }, { scale: open ? 1 : 0.3 }],
        transitionProperty: ['transform', 'opacity'],
        transitionDuration: '250ms',
        transitionTimingFunction: cubicBezier(0.3, 1.4, 0.5, 1), // slight overshoot
        transitionDelay: (open ? i : actions.length - 1 - i) * 40 + 'ms', // stagger, reversed on close
      }]}>
      <ActionButton icon={icon} />
    </Animated.View>
  ))}
  <Pressable onPress={() => setOpen(o => !o)}>
    <Animated.View style={[styles.fab, {
      transform: [{ rotate: open ? '45deg' : '0deg' }],
      transitionProperty: 'transform',
      transitionDuration: '200ms',
    }]}>
      <PlusIcon />
    </Animated.View>
  </Pressable>
</View>`,
  },

  {
    id: "page-dots",
    name: "Pager dots",
    level: "mid",
    description: "Carousel indicator where the active dot stretches into a pill and follows your swipe.",
    apis: ["useAnimatedScrollHandler", "interpolate", "useAnimatedStyle"],
    apisV4: ["useAnimatedScrollHandler", "interpolate", "useAnimatedStyle"],
    demo: c`<div style="display:flex;gap:6px;align-items:center"><i style="display:block;height:8px;border-radius:99px;background:var(--accent);animation:pdA 3.6s ease-in-out infinite"></i><i style="display:block;height:8px;border-radius:99px;background:var(--accent);animation:pdB 3.6s ease-in-out infinite"></i><i style="display:block;height:8px;border-radius:99px;background:var(--accent);animation:pdC 3.6s ease-in-out infinite"></i></div>`,
    code: c`const scrollX = useSharedValue(0); // fractional page index
const onScroll = useAnimatedScrollHandler(e => {
  scrollX.value = e.contentOffset.x / PAGE_WIDTH;
});

function Dot({ index }: { index: number }) {
  const style = useAnimatedStyle(() => {
    // 0 when this page is centered, 1 a page or more away: follows the finger
    const d = Math.min(Math.abs(scrollX.value - index), 1);
    return {
      width: interpolate(d, [0, 1], [22, 8]),
      opacity: interpolate(d, [0, 1], [1, 0.35]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />; // height 8, borderRadius 4
}

<Animated.ScrollView horizontal pagingEnabled onScroll={onScroll} scrollEventThrottle={16}>
  {pages}
</Animated.ScrollView>
<View style={styles.dots}>{pages.map((_, i) => <Dot key={i} index={i} />)}</View>`,
    codeV4: c`const scrollX = useSharedValue(0); // fractional page index
const onScroll = useAnimatedScrollHandler(e => {
  scrollX.value = e.contentOffset.x / PAGE_WIDTH;
});

function Dot({ index }: { index: number }) {
  const style = useAnimatedStyle(() => {
    // 0 when this page is centered, 1 a page or more away: follows the finger
    const d = Math.min(Math.abs(scrollX.value - index), 1);
    return {
      width: interpolate(d, [0, 1], [22, 8]),
      opacity: interpolate(d, [0, 1], [1, 0.35]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />; // height 8, borderRadius 4
}

<Animated.ScrollView horizontal pagingEnabled onScroll={onScroll} scrollEventThrottle={16}>
  {pages}
</Animated.ScrollView>
<View style={styles.dots}>{pages.map((_, i) => <Dot key={i} index={i} />)}</View>`,
  },

  {
    id: "hide-header",
    name: "Hide header on scroll",
    level: "mid",
    description: "The top bar slides away as you scroll down and comes back as soon as you scroll up.",
    apis: ["useAnimatedScrollHandler", "useSharedValue", "translateY"],
    apisV4: ["useAnimatedScrollHandler", "useSharedValue", "translateY"],
    demo: c`<div style="position:relative;width:150px;height:110px;overflow:hidden;border-radius:10px;background:var(--surface);border:1px solid var(--line)"><div style="padding:32px 10px 0;display:grid;gap:7px;animation:hhl 3.6s ease-in-out infinite"><div style="height:12px;border-radius:4px;background:var(--line)"></div><div style="height:12px;width:80%;border-radius:4px;background:var(--line)"></div><div style="height:12px;border-radius:4px;background:var(--line)"></div><div style="height:12px;width:70%;border-radius:4px;background:var(--line)"></div><div style="height:12px;border-radius:4px;background:var(--line)"></div><div style="height:12px;width:85%;border-radius:4px;background:var(--line)"></div></div><div style="position:absolute;top:0;left:0;right:0;height:24px;background:var(--accent);animation:hh 3.6s ease-in-out infinite"></div></div>`,
    code: c`const HEADER = 56;
const offset = useSharedValue(0); // 0 = shown, -HEADER = hidden
const lastY = useSharedValue(0);

const onScroll = useAnimatedScrollHandler({
  onScroll: e => {
    const y = Math.max(0, e.contentOffset.y); // ignore the iOS bounce at the top
    const dy = y - lastY.value;
    lastY.value = y;
    // Move the header by the scroll delta, clamped between hidden and shown
    offset.value = Math.min(0, Math.max(-HEADER, offset.value - dy));
  },
  onMomentumEnd: () => {
    // Don't leave it half-way: snap to whichever is closer
    offset.value = withTiming(offset.value < -HEADER / 2 ? -HEADER : 0, { duration: 150 });
  },
});

const header = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

<Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: HEADER }}>
  {rows}
</Animated.ScrollView>
<Animated.View style={[styles.header, { height: HEADER }, header]} /> {/* position absolute, top 0 */}`,
    codeV4: c`const HEADER = 56;
const offset = useSharedValue(0); // 0 = shown, -HEADER = hidden
const lastY = useSharedValue(0);

const onScroll = useAnimatedScrollHandler({
  onScroll: e => {
    const y = Math.max(0, e.contentOffset.y); // ignore the iOS bounce at the top
    const dy = y - lastY.value;
    lastY.value = y;
    // Move the header by the scroll delta, clamped between hidden and shown
    offset.value = Math.min(0, Math.max(-HEADER, offset.value - dy));
  },
  onMomentumEnd: () => {
    // Don't leave it half-way: snap to whichever is closer
    offset.value = withTiming(offset.value < -HEADER / 2 ? -HEADER : 0, { duration: 150 });
  },
});

const header = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

<Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: HEADER }}>
  {rows}
</Animated.ScrollView>
<Animated.View style={[styles.header, { height: HEADER }, header]} /> {/* position absolute, top 0 */}`,
  },

  {
    id: "button-loading",
    name: "Loading button",
    level: "mid",
    description: "On tap the button shrinks into a circle with a spinner, then grows back when the work is done.",
    apis: ["withTiming", "interpolate", "ActivityIndicator"],
    apisV4: ["transitionProperty", "FadeIn / FadeOut", "CSS transitions"],
    demo: c`<div style="position:relative;height:40px;border-radius:99px;background:var(--accent);display:flex;align-items:center;justify-content:center;overflow:hidden;animation:blW 3.4s cubic-bezier(.6,0,.3,1) infinite"><span style="color:#fff;font-size:12px;font-weight:600;white-space:nowrap;animation:blT 3.4s infinite">Pay now</span><i style="position:absolute;width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .8s linear infinite,blS 3.4s infinite"></i></div>`,
    code: c`const progress = useSharedValue(0); // 0 = button, 1 = spinner circle
const [loading, setLoading] = useState(false);

const submit = async () => {
  setLoading(true);
  progress.value = withTiming(1, { duration: 300 });
  await pay();
  progress.value = withTiming(0, { duration: 300 });
  setLoading(false);
};

const button = useAnimatedStyle(() => ({ width: interpolate(progress.value, [0, 1], [220, 52]) }));
const label = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP) }));
const spinner = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP) }));

<Pressable onPress={submit} disabled={loading}>
  {/* styles.button: height 52, borderRadius 26, overflow 'hidden', centered content */}
  <Animated.View style={[styles.button, button]}>
    <Animated.Text style={[styles.label, label]} numberOfLines={1}>Pay now</Animated.Text>
    <Animated.View style={[StyleSheet.absoluteFill, styles.center, spinner]}>
      <ActivityIndicator color="white" />
    </Animated.View>
  </Animated.View>
</Pressable>`,
    codeV4: c`// Reanimated 4: CSS transitions on the loading state, layout animations for the spinner
const [loading, setLoading] = useState(false);

const submit = async () => {
  setLoading(true);
  await pay();
  setLoading(false);
};

<Pressable onPress={submit} disabled={loading}>
  {/* styles.button: height 52, borderRadius 26, overflow 'hidden', centered content */}
  <Animated.View style={[styles.button, {
    width: loading ? 52 : 220,
    transitionProperty: 'width',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-in-out',
  }]}>
    <Animated.Text
      numberOfLines={1}
      style={[styles.label, { opacity: loading ? 0 : 1, transitionProperty: 'opacity', transitionDuration: '150ms' }]}>
      Pay now
    </Animated.Text>
    {loading && (
      <Animated.View entering={FadeIn.delay(200)} exiting={FadeOut.duration(100)} style={[StyleSheet.absoluteFill, styles.center]}>
        <ActivityIndicator color="white" />
      </Animated.View>
    )}
  </Animated.View>
</Pressable>`,
  },
];
