// Third batch of everyday UI animations (text, loaders, form controls), after data/animations-extra.ts.
// Same shape as data/animations.ts; their Flutter, SwiftUI and Compose ports live in data/flutter.ts,
// data/swiftui.ts and data/compose.ts. Demos use the z* keyframes in app/globals.css.
// String.raw keeps code verbatim; snippets avoid JS interpolation syntax.
import type { Animation } from "@/lib/types";

const c = String.raw;

const wordRotate = c`// Keying the word on its index remounts it; the layout animations slide old out, new in
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

const WORDS = ['faster', 'smoother', 'together'];
const [i, setI] = useState(0);

useEffect(() => {
  const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2000);
  return () => clearInterval(id);
}, []);

<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={styles.title}>Build </Text>
  {/* Fixed height + overflow hidden clips the word as it slides */}
  <View style={{ height: 34, overflow: 'hidden' }}>
    <Animated.Text
      key={i}
      entering={FadeInUp.springify().damping(16)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.title, { color: '#2F54EB' }]}>
      {WORDS[i]}
    </Animated.Text>
  </View>
</View>`;

const stepper = c`// The number slides in from the direction you pressed: up for +, down for -
import Animated, { Keyframe } from 'react-native-reanimated';

const enterFrom = (dy) => new Keyframe({
  0: { opacity: 0, transform: [{ translateY: dy }] },
  100: { opacity: 1, transform: [{ translateY: 0 }] },
}).duration(220);
const exitTo = (dy) => new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: dy }] },
}).duration(220);

const [value, setValue] = useState(3);
const [dir, setDir] = useState(1);
const change = (d) => { setDir(d); setValue((v) => Math.max(0, v + d)); };

<View style={styles.stepper}>
  <Pressable onPress={() => change(-1)}><Text style={styles.btn}>−</Text></Pressable>
  <View style={{ width: 32, height: 28, overflow: 'hidden', alignItems: 'center' }}>
    <Animated.Text
      key={value}
      entering={enterFrom(dir * 16)}
      exiting={exitTo(dir * -16)}
      style={[styles.value, { position: 'absolute' }]}>
      {value}
    </Animated.Text>
  </View>
  <Pressable onPress={() => change(1)}><Text style={styles.btn}>+</Text></Pressable>
</View>`;

const copyFeedback = c`// Swap the icon on press; ZoomIn/ZoomOut cross the two over, a timer swaps back
import Animated, { ZoomIn, ZoomOut, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';

const [copied, setCopied] = useState(false);
const timer = useRef();

const copy = async () => {
  await Clipboard.setStringAsync(text);
  setCopied(true);
  clearTimeout(timer.current);
  timer.current = setTimeout(() => setCopied(false), 1500);
};

<Pressable onPress={copy} style={styles.copyButton}>
  <View style={{ width: 18, height: 18 }}>
    {copied ? (
      <Animated.View key="check" entering={ZoomIn.springify()} exiting={ZoomOut.duration(120)}>
        <CheckIcon color="#2BA84A" />
      </Animated.View>
    ) : (
      <Animated.View key="copy" entering={ZoomIn.duration(160)} exiting={ZoomOut.duration(120)}>
        <CopyIcon />
      </Animated.View>
    )}
  </View>
  <Animated.Text key={String(copied)} entering={FadeIn} exiting={FadeOut} style={styles.label}>
    {copied ? 'Copied' : 'Copy'}
  </Animated.Text>
</Pressable>`;

const chipSelect = c`// Layout transitions reflow the row as a chip grows its check mark
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

const [selected, setSelected] = useState(new Set(['Vegan']));
const toggle = (tag) => setSelected((s) => {
  const next = new Set(s);
  next.has(tag) ? next.delete(tag) : next.add(tag);
  return next;
});

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {TAGS.map((tag) => {
    const on = selected.has(tag);
    return (
      <Animated.View key={tag} layout={LinearTransition.springify().damping(18)}>
        <Pressable onPress={() => toggle(tag)} style={[styles.chip, on && styles.chipOn]}>
          {on && (
            <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut.duration(120)}>
              <CheckIcon size={14} color="white" />
            </Animated.View>
          )}
          <Text style={[styles.chipText, on && { color: 'white' }]}>{tag}</Text>
        </Pressable>
      </Animated.View>
    );
  })}
</View>`;

const tabBubble = c`// Only the active tab shows its label; LinearTransition springs the pill between tabs
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';

const TABS = [{ key: 'home', icon: HomeIcon, label: 'Home' }, { key: 'search', icon: SearchIcon, label: 'Search' }, { key: 'me', icon: UserIcon, label: 'Profile' }];
const [active, setActive] = useState('home');
const layout = LinearTransition.springify().damping(18).stiffness(180);

<View style={styles.bar}> {/* flexDirection 'row', justifyContent 'space-around' */}
  {TABS.map(({ key, icon: Icon, label }) => {
    const on = key === active;
    return (
      <Pressable key={key} onPress={() => setActive(key)}>
        <Animated.View layout={layout} style={[styles.tab, on && styles.tabOn]}> {/* tabOn: accent-soft pill */}
          <Icon color={on ? '#2F54EB' : '#8A8F98'} />
          {on && (
            <Animated.Text entering={FadeIn.delay(80)} exiting={FadeOut.duration(80)} style={styles.tabLabel}>
              {label}
            </Animated.Text>
          )}
        </Animated.View>
      </Pressable>
    );
  })}
</View>`;

export const plus: Animation[] = [
  {
    id: "typewriter",
    name: "Typewriter text",
    level: "basic",
    description: "Text types itself out one character at a time while a caret blinks at the end.",
    apis: ["withRepeat", "withTiming", "useAnimatedStyle"],
    apisV4: ["animationName", "steps()", "CSS animations"],
    demo: c`<div style="display:flex;align-items:center;font:600 14px var(--f-mono)"><span style="display:inline-block;overflow:hidden;white-space:nowrap;width:0;animation:zTw 4s steps(17) infinite">Hello, Reanimated</span><span style="width:2px;height:18px;margin-left:2px;background:var(--accent);animation:zCr .8s step-end infinite"></span></div>`,
    code: c`// A timer reveals one more character; the caret is a blinking shared value
const [shown, setShown] = useState(0);
const caret = useSharedValue(1);

useEffect(() => {
  setShown(0);
  const id = setInterval(() => {
    setShown((n) => {
      if (n >= text.length) { clearInterval(id); return n; }
      return n + 1;
    });
  }, 45);
  return () => clearInterval(id);
}, [text]);

useEffect(() => {
  caret.value = withRepeat(withTiming(0, { duration: 450 }), -1, true);
}, []);

const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value > 0.5 ? 1 : 0 }));

<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={styles.mono}>{text.slice(0, shown)}</Text>
  <Animated.View style={[{ width: 2, height: 20, marginLeft: 2, backgroundColor: '#2F54EB' }, caretStyle]} />
</View>`,
    codeV4: c`// Reanimated 4: the caret is a CSS keyframe animation, the text still reveals on a timer
const blink = { '0%': { opacity: 1 }, '50%': { opacity: 0 }, '100%': { opacity: 1 } };
const [shown, setShown] = useState(0);

useEffect(() => {
  setShown(0);
  const id = setInterval(() => {
    setShown((n) => {
      if (n >= text.length) { clearInterval(id); return n; }
      return n + 1;
    });
  }, 45);
  return () => clearInterval(id);
}, [text]);

<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={styles.mono}>{text.slice(0, shown)}</Text>
  <Animated.View
    style={{
      width: 2, height: 20, marginLeft: 2, backgroundColor: '#2F54EB',
      animationName: blink,
      animationDuration: '900ms',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'steps(2)', // hard on/off instead of a fade
    }}
  />
</View>`,
  },

  {
    id: "word-rotate",
    name: "Rotating word",
    level: "basic",
    description: "One word in a headline cycles through options, each sliding up and out as the next slides in.",
    apis: ["FadeInUp", "FadeOutUp", "key remount"],
    apisV4: ["FadeInUp", "FadeOutUp", "key remount"],
    demo: c`<div style="display:flex;align-items:center;gap:6px;font-size:18px;font-weight:700"><span>Build</span><span style="display:block;height:26px;overflow:hidden"><span style="display:flex;flex-direction:column;color:var(--accent);line-height:26px;animation:zWr 6s cubic-bezier(.5,1.4,.5,1) infinite"><span>faster</span><span>smoother</span><span>together</span><span>faster</span></span></span></div>`,
    code: wordRotate,
    codeV4: c`// Unchanged in Reanimated 4: entering/exiting layout animations still drive mount and unmount
` + wordRotate.split("\n").slice(1).join("\n"),
  },

  {
    id: "text-reveal",
    name: "Staggered text reveal",
    level: "basic",
    description: "A headline fades in word by word, each word rising into place a beat after the one before.",
    apis: ["FadeInUp", "delay", "springify"],
    apisV4: ["animationName", "animationDelay", "CSS animations"],
    demo: c`<div style="display:flex;gap:6px;font-size:18px;font-weight:700"><span style="opacity:0;animation:zTr 3.6s ease-out infinite">Motion</span><span style="opacity:0;animation:zTr 3.6s ease-out .12s infinite">that</span><span style="opacity:0;animation:zTr 3.6s ease-out .24s infinite;color:var(--accent)">feels</span><span style="opacity:0;animation:zTr 3.6s ease-out .36s infinite">alive</span></div>`,
    code: c`// Split into words; each one enters a little later than the last
import Animated, { FadeInUp } from 'react-native-reanimated';

const words = title.split(' ');

<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {words.map((word, i) => (
    <Animated.Text
      key={word + i}
      entering={FadeInUp.delay(i * 80).springify().damping(14)}
      style={styles.title}>
      {word + ' '}
    </Animated.Text>
  ))}
</View>
// To replay, change a key on the parent View`,
    codeV4: c`// Reanimated 4: one keyframe object, a growing animationDelay per word
const rise = {
  from: { opacity: 0, transform: [{ translateY: 14 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
};
const words = title.split(' ');

<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {words.map((word, i) => (
    <Animated.Text
      key={word + i}
      style={[styles.title, {
        animationName: rise,
        animationDuration: '450ms',
        animationDelay: i * 80 + 'ms',
        animationFillMode: 'both', // stay hidden during the delay
        animationTimingFunction: 'ease-out',
      }]}>
      {word + ' '}
    </Animated.Text>
  ))}
</View>`,
  },

  {
    id: "wave-bars",
    name: "Equalizer bars",
    level: "basic",
    description: "A few bars bounce up and down out of step, the classic now-playing or voice-input indicator.",
    apis: ["withRepeat", "withSequence", "withDelay"],
    apisV4: ["animationName", "animationDelay", "animationDirection"],
    demo: c`<div style="display:flex;align-items:flex-end;gap:5px;height:44px"><span style="width:6px;height:44px;border-radius:3px;background:var(--accent);transform-origin:bottom;animation:zEq .9s ease-in-out infinite alternate"></span><span style="width:6px;height:44px;border-radius:3px;background:var(--accent);transform-origin:bottom;animation:zEq .9s ease-in-out -.3s infinite alternate"></span><span style="width:6px;height:44px;border-radius:3px;background:var(--accent);transform-origin:bottom;animation:zEq .9s ease-in-out -.6s infinite alternate"></span><span style="width:6px;height:44px;border-radius:3px;background:var(--accent);transform-origin:bottom;animation:zEq .9s ease-in-out -.15s infinite alternate"></span><span style="width:6px;height:44px;border-radius:3px;background:var(--accent);transform-origin:bottom;animation:zEq .9s ease-in-out -.45s infinite alternate"></span></div>`,
    code: c`// Each bar scales on Y from its base; offset start times keep them out of step
function Bar({ delay }) {
  const s = useSharedValue(0.3);
  useEffect(() => {
    s.value = withDelay(delay, withRepeat(withTiming(1, { duration: 450, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: s.value }] }));
  return <Animated.View style={[styles.bar, { transformOrigin: 'bottom' }, style]} />; // 6 x 44, radius 3
}

<View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 44 }}>
  {[0, 300, 600, 150, 450].map((d, i) => <Bar key={i} delay={d} />)}
</View>`,
    codeV4: c`// Reanimated 4: one CSS animation, alternating, with a negative delay per bar
const bounce = {
  from: { transform: [{ scaleY: 0.3 }] },
  to: { transform: [{ scaleY: 1 }] },
};

<View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 44 }}>
  {[0, -300, -600, -150, -450].map((d, i) => (
    <Animated.View
      key={i}
      style={[styles.bar, {
        transformOrigin: 'bottom',
        animationName: bounce,
        animationDuration: '450ms',
        animationDelay: d + 'ms', // negative: start mid-cycle, no waiting
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        animationTimingFunction: 'ease-in-out',
      }]}
    />
  ))}
</View>`,
  },

  {
    id: "spinner-arc",
    name: "Arc spinner",
    level: "basic",
    description: "The Material-style loader: an arc that spins while it stretches and shrinks.",
    apis: ["useAnimatedProps", "strokeDashoffset", "withRepeat"],
    apisV4: ["animationName", "useAnimatedProps", "Easing.bezier"],
    demo: c`<svg width="48" height="48" viewBox="0 0 48 48" style="animation:zSr 1.6s linear infinite"><circle cx="24" cy="24" r="18" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-dasharray="113" style="animation:zSa 1.4s ease-in-out infinite"/></svg>`,
    code: c`// The arc length (dash offset) grows and shrinks while the whole svg rotates
import Svg, { Circle } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const R = 18, C = 2 * Math.PI * R;
const spin = useSharedValue(0);
const arc = useSharedValue(0);

useEffect(() => {
  spin.value = withRepeat(withTiming(360, { duration: 1600, easing: Easing.linear }), -1);
  arc.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, true);
}, []);

const rotate = useAnimatedStyle(() => ({ transform: [{ rotate: spin.value + 'deg' }] }));
const props = useAnimatedProps(() => ({
  strokeDashoffset: C * (0.95 - 0.7 * arc.value), // 5% to 75% of the ring visible
}));

<Animated.View style={rotate}>
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <AnimatedCircle cx={24} cy={24} r={R} fill="none" stroke="#2F54EB" strokeWidth={5}
      strokeLinecap="round" strokeDasharray={C} animatedProps={props} />
  </Svg>
</Animated.View>`,
    codeV4: c`// Reanimated 4: the rotation is a CSS animation; the arc stays on useAnimatedProps
import Svg, { Circle } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const R = 18, C = 2 * Math.PI * R;
const spinKeyframes = { from: { transform: [{ rotate: '0deg' }] }, to: { transform: [{ rotate: '360deg' }] } };
const arc = useSharedValue(0);

useEffect(() => {
  arc.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, true);
}, []);

const props = useAnimatedProps(() => ({ strokeDashoffset: C * (0.95 - 0.7 * arc.value) }));

<Animated.View style={{
  animationName: spinKeyframes,
  animationDuration: '1600ms',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
}}>
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <AnimatedCircle cx={24} cy={24} r={R} fill="none" stroke="#2F54EB" strokeWidth={5}
      strokeLinecap="round" strokeDasharray={C} animatedProps={props} />
  </Svg>
</Animated.View>`,
  },

  {
    id: "checkbox",
    name: "Animated checkbox",
    level: "basic",
    description: "The box fills with color, gives a small bounce, and the check mark draws itself in.",
    apis: ["interpolateColor", "useAnimatedProps", "withSequence"],
    apisV4: ["transitionProperty", "useAnimatedProps", "withTiming"],
    demo: c`<div style="display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600"><span style="width:26px;height:26px;border-radius:7px;border:2px solid var(--line);display:grid;place-items:center;animation:zCb 3s ease-out infinite"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-dasharray="22" style="animation:zCk 3s ease-out infinite"/></svg></span>Remember me</div>`,
    code: c`// One progress value drives the fill color and the check's dash offset; a sequence adds the bounce
import Svg, { Path } from 'react-native-svg';
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK = 22; // path length

const p = useSharedValue(checked ? 1 : 0);
const scale = useSharedValue(1);

useEffect(() => {
  p.value = withTiming(checked ? 1 : 0, { duration: 220 });
  if (checked) scale.value = withSequence(withTiming(0.85, { duration: 80 }), withSpring(1, { damping: 6 }));
}, [checked]);

const box = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(p.value, [0, 1], ['transparent', '#2F54EB']),
  borderColor: interpolateColor(p.value, [0, 1], ['#C9CED6', '#2F54EB']),
  transform: [{ scale: scale.value }],
}));
const mark = useAnimatedProps(() => ({ strokeDashoffset: CHECK * (1 - p.value) }));

<Pressable onPress={() => setChecked((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked }}>
  <Animated.View style={[styles.box, box]}> {/* 26 x 26, radius 7, borderWidth 2, centered */}
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <AnimatedPath d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth={3.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHECK} animatedProps={mark} />
    </Svg>
  </Animated.View>
</Pressable>`,
    codeV4: c`// Reanimated 4: a CSS transition handles the box colors; the check still draws via animated props
import Svg, { Path } from 'react-native-svg';
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK = 22;

const p = useSharedValue(checked ? 1 : 0);
useEffect(() => {
  p.value = withTiming(checked ? 1 : 0, { duration: 220 });
}, [checked]);
const mark = useAnimatedProps(() => ({ strokeDashoffset: CHECK * (1 - p.value) }));

<Pressable onPress={() => setChecked((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked }}>
  <Animated.View style={[styles.box, {
    backgroundColor: checked ? '#2F54EB' : 'transparent',
    borderColor: checked ? '#2F54EB' : '#C9CED6',
    transform: [{ scale: checked ? 1 : 0.96 }],
    transitionProperty: ['backgroundColor', 'borderColor', 'transform'],
    transitionDuration: '220ms',
    transitionTimingFunction: cubicBezier(0.3, 1.6, 0.5, 1), // overshoot = the bounce
  }]}>
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <AnimatedPath d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth={3.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHECK} animatedProps={mark} />
    </Svg>
  </Animated.View>
</Pressable>`,
  },

  {
    id: "stepper",
    name: "Quantity stepper",
    level: "basic",
    description: "Plus and minus buttons where the number rolls in from the direction you pressed.",
    apis: ["Keyframe", "entering / exiting", "key remount"],
    apisV4: ["Keyframe", "entering / exiting", "key remount"],
    demo: c`<div style="display:flex;align-items:center;gap:4px;padding:4px;border-radius:99px;background:var(--surface);border:1px solid var(--line)"><span style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--line);font-weight:700">−</span><span style="display:block;width:30px;height:24px;overflow:hidden;text-align:center"><span style="display:flex;flex-direction:column;font:700 16px/24px var(--f-mono);animation:zSt 4.8s cubic-bezier(.4,1.5,.5,1) infinite"><span>3</span><span>4</span><span>5</span></span></span><span style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;font-weight:700">+</span></div>`,
    code: stepper,
    codeV4: c`// Unchanged in Reanimated 4: Keyframe entering/exiting animations work the same
` + stepper.split("\n").slice(1).join("\n"),
  },

  {
    id: "step-progress",
    name: "Step progress",
    level: "basic",
    description: "A checkout-style progress line fills between steps and each dot lights up as it is reached.",
    apis: ["withTiming", "interpolateColor", "useDerivedValue"],
    apisV4: ["transitionProperty", "percentage width", "transitionDelay"],
    demo: c`<div style="position:relative;width:190px;height:14px"><div style="position:absolute;left:7px;right:7px;top:5px;height:4px;border-radius:2px;background:var(--line)"></div><div style="position:absolute;left:7px;top:5px;height:4px;width:0;border-radius:2px;background:var(--accent);animation:zSpL 4.8s ease-in-out infinite"></div><span style="position:absolute;left:0;width:14px;height:14px;border-radius:50%;background:var(--accent)"></span><span style="position:absolute;left:58px;width:14px;height:14px;border-radius:50%;background:var(--line);animation:zSpD 4.8s infinite;--t:20%"></span><span style="position:absolute;left:117px;width:14px;height:14px;border-radius:50%;background:var(--line);animation:zSpE 4.8s infinite"></span><span style="position:absolute;right:0;width:14px;height:14px;border-radius:50%;background:var(--line);animation:zSpF 4.8s infinite"></span></div>`,
    code: c`// One shared value animates to the step index; the fill and each dot read from it
const STEPS = ['Cart', 'Address', 'Payment', 'Done'];
const progress = useSharedValue(step);
const [trackW, setTrackW] = useState(0);

useEffect(() => {
  progress.value = withTiming(step, { duration: 400, easing: Easing.inOut(Easing.ease) });
}, [step]);

const fill = useAnimatedStyle(() => ({ width: (progress.value / (STEPS.length - 1)) * trackW }));

function Dot({ index }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [index - 0.2, index], ['#DADFE6', '#2F54EB']),
    transform: [{ scale: interpolate(progress.value, [index - 0.2, index, index + 0.3], [1, 1.25, 1], Extrapolation.CLAMP) }],
  }));
  return <Animated.View style={[styles.dot, style]} />; // 14 x 14 circle
}

<View style={styles.row} onLayout={(e) => setTrackW(e.nativeEvent.layout.width - 14)}>
  <View style={styles.track} />                      {/* absolute line, inset 7 */}
  <Animated.View style={[styles.trackFill, fill]} /> {/* same, accent color */}
  {STEPS.map((s, i) => <Dot key={s} index={i} />)}   {/* row with space-between */}
</View>`,
    codeV4: c`// Reanimated 4: a percentage width and per-dot transitions, delayed until the fill arrives
const STEPS = ['Cart', 'Address', 'Payment', 'Done'];
const pct = (step / (STEPS.length - 1)) * 100;

<View style={styles.row}>
  <View style={styles.track} />
  <Animated.View style={[styles.trackFill, {
    width: pct + '%',
    transitionProperty: 'width',
    transitionDuration: '400ms',
    transitionTimingFunction: 'ease-in-out',
  }]} />
  {STEPS.map((s, i) => (
    <Animated.View key={s} style={[styles.dot, {
      backgroundColor: i <= step ? '#2F54EB' : '#DADFE6',
      transitionProperty: 'backgroundColor',
      transitionDuration: '150ms',
      transitionDelay: i <= step ? '300ms' : '0ms', // light up when the line gets there
    }]} />
  ))}
</View>`,
  },

  {
    id: "gradient-border",
    name: "Rotating gradient border",
    level: "basic",
    description: "A glowing gradient spins around the edge of a card, a popular highlight for a featured plan or button.",
    apis: ["withRepeat", "Easing.linear", "overflow hidden"],
    apisV4: ["animationName", "animationIterationCount", "CSS animations"],
    demo: c`<div style="position:relative;width:170px;height:72px;border-radius:16px;overflow:hidden;display:grid;place-items:center"><div style="position:absolute;width:240px;height:240px;background:conic-gradient(var(--accent),var(--coral),#f5b301,var(--accent));animation:spin 3s linear infinite"></div><div style="position:absolute;inset:3px;border-radius:13px;background:var(--surface);display:grid;place-items:center;font-size:13px;font-weight:700">Pro plan</div></div>`,
    code: c`// A big gradient square spins behind the card; overflow hidden and a 2px inset leave only the rim
import { LinearGradient } from 'expo-linear-gradient';

const angle = useSharedValue(0);
useEffect(() => {
  angle.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1);
}, []);
const spin = useAnimatedStyle(() => ({ transform: [{ rotate: angle.value + 'deg' }] }));

<View style={{ width: W, height: H, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
  {/* Square larger than the card's diagonal so its corners never show */}
  <Animated.View style={[{ position: 'absolute', width: DIAG, height: DIAG }, spin]}>
    <LinearGradient colors={['#2F54EB', '#F25F8B', '#F5B301']} style={{ flex: 1 }} />
  </Animated.View>
  <View style={{ position: 'absolute', inset: 2, borderRadius: 14, backgroundColor: 'white' }}>
    {children}
  </View>
</View>
// DIAG = Math.ceil(Math.hypot(W, H))`,
    codeV4: c`// Reanimated 4: the spin is a CSS animation, nothing else changes
import { LinearGradient } from 'expo-linear-gradient';
const spin = { from: { transform: [{ rotate: '0deg' }] }, to: { transform: [{ rotate: '360deg' }] } };

<View style={{ width: W, height: H, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
  <Animated.View style={{
    position: 'absolute', width: DIAG, height: DIAG,
    animationName: spin,
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  }}>
    <LinearGradient colors={['#2F54EB', '#F25F8B', '#F5B301']} style={{ flex: 1 }} />
  </Animated.View>
  <View style={{ position: 'absolute', inset: 2, borderRadius: 14, backgroundColor: 'white' }}>
    {children}
  </View>
</View>
// DIAG = Math.ceil(Math.hypot(W, H))`,
  },

  {
    id: "copy-feedback",
    name: "Copy feedback",
    level: "basic",
    description: "Tap copy and the icon pops into a green check with a Copied label, then swaps back on its own.",
    apis: ["ZoomIn / ZoomOut", "FadeIn / FadeOut", "key remount"],
    apisV4: ["ZoomIn / ZoomOut", "FadeIn / FadeOut", "key remount"],
    demo: c`<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--line);font-size:12px;font-weight:600"><span style="position:relative;width:16px;height:16px"><svg style="position:absolute;inset:0;animation:zCpA 3.2s infinite" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg><svg style="position:absolute;inset:0;opacity:0;animation:zCpB 3.2s infinite" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2BA84A" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span style="position:relative;width:46px;height:16px"><span style="position:absolute;animation:zCpA 3.2s infinite">Copy</span><span style="position:absolute;opacity:0;color:#2BA84A;animation:zCpB 3.2s infinite">Copied</span></span></div>`,
    code: copyFeedback,
    codeV4: c`// Unchanged in Reanimated 4: entering/exiting layout animations still swap the icons
` + copyFeedback.split("\n").slice(1).join("\n"),
  },

  {
    id: "password-strength",
    name: "Password strength meter",
    level: "basic",
    description: "As you type, a bar grows and shifts from red to green, with the label updating to match.",
    apis: ["withTiming", "interpolateColor", "useAnimatedStyle"],
    apisV4: ["transitionProperty", "percentage width", "backgroundColor transition"],
    demo: c`<div style="width:180px;display:flex;flex-direction:column;gap:6px"><div style="height:30px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface);display:flex;align-items:center;padding:0 10px;font:700 14px var(--f-mono);letter-spacing:2px;overflow:hidden"><span style="display:inline-block;overflow:hidden;white-space:nowrap;animation:zPwT 4.8s steps(10) infinite">••••••••••</span></div><div style="height:6px;border-radius:3px;background:var(--line);overflow:hidden"><div style="height:100%;border-radius:3px;animation:zPwB 4.8s ease-out infinite"></div></div></div>`,
    code: c`// Score 0-4 from your checker of choice; width and color animate to match
const COLORS = ['#E5484D', '#F76B15', '#F5B301', '#7CC23A', '#2BA84A'];
const LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
const score = useSharedValue(0);

useEffect(() => {
  score.value = withTiming(scorePassword(password), { duration: 300 }); // returns 0..4
}, [password]);

const bar = useAnimatedStyle(() => ({
  width: ((score.value + 1) / 5) * 100 + '%',
  backgroundColor: interpolateColor(score.value, [0, 1, 2, 3, 4], COLORS),
}));

<TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
<View style={styles.track}> {/* height 6, radius 3, light gray, overflow hidden */}
  <Animated.View style={[{ height: '100%', borderRadius: 3 }, bar]} />
</View>
<Text style={styles.hint}>{password ? LABELS[scorePassword(password)] : ' '}</Text>`,
    codeV4: c`// Reanimated 4: a plain style with a CSS transition, no shared value
const COLORS = ['#E5484D', '#F76B15', '#F5B301', '#7CC23A', '#2BA84A'];
const LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
const score = scorePassword(password); // 0..4

<TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
<View style={styles.track}>
  <Animated.View style={{
    height: '100%', borderRadius: 3,
    width: password ? ((score + 1) / 5) * 100 + '%' : '0%',
    backgroundColor: COLORS[score],
    transitionProperty: ['width', 'backgroundColor'],
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-out',
  }} />
</View>
<Text style={styles.hint}>{password ? LABELS[score] : ' '}</Text>`,
  },

  {
    id: "odometer",
    name: "Rolling digits",
    level: "mid",
    description: "An odometer-style number: each digit is a column of 0 to 9 that springs to its new value.",
    apis: ["withSpring", "useSharedValue", "overflow hidden"],
    apisV4: ["transitionProperty", "transform transition", "cubicBezier"],
    demo: c`<div style="display:flex;gap:2px;font:700 26px/34px var(--f-mono)"><span style="display:block;height:34px;overflow:hidden;padding:0 3px;border-radius:6px;background:var(--surface)"><span style="display:flex;flex-direction:column;animation:zOdA 4.8s cubic-bezier(.4,1.4,.5,1) infinite"><span>1</span><span>2</span></span></span><span style="display:block;height:34px;overflow:hidden;padding:0 3px;border-radius:6px;background:var(--surface)"><span style="display:flex;flex-direction:column;animation:zOdB 4.8s cubic-bezier(.4,1.4,.5,1) infinite"><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>0</span></span></span><span style="display:block;height:34px;overflow:hidden;padding:0 3px;border-radius:6px;background:var(--surface)"><span style="display:flex;flex-direction:column;animation:zOdC 4.8s cubic-bezier(.4,1.4,.5,1) infinite"><span>8</span><span>9</span><span>0</span><span>1</span><span>2</span><span>3</span></span></span></div>`,
    code: c`// One column per digit; translateY = -digit * line height, springing on change
const H = 34;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ value }) {
  const y = useSharedValue(-value * H);
  useEffect(() => {
    y.value = withSpring(-value * H, { damping: 14, stiffness: 140 });
  }, [value]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height: H, overflow: 'hidden' }}>
      <Animated.View style={style}>
        {DIGITS.map((d) => <Text key={d} style={[styles.digit, { height: H, lineHeight: H }]}>{d}</Text>)}
      </Animated.View>
    </View>
  );
}

// Key from the right so columns keep their identity when the number gains a digit
const chars = String(value).split('').reverse();
<View style={{ flexDirection: 'row-reverse' }}>
  {chars.map((ch, i) => <Digit key={i} value={Number(ch)} />)}
</View>`,
    codeV4: c`// Reanimated 4: each column is a plain style with a transform transition
const H = 34;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ value }) {
  return (
    <View style={{ height: H, overflow: 'hidden' }}>
      <Animated.View style={{
        transform: [{ translateY: -value * H }],
        transitionProperty: 'transform',
        transitionDuration: '500ms',
        transitionTimingFunction: cubicBezier(0.4, 1.4, 0.5, 1), // small overshoot past the digit
      }}>
        {DIGITS.map((d) => <Text key={d} style={[styles.digit, { height: H, lineHeight: H }]}>{d}</Text>)}
      </Animated.View>
    </View>
  );
}

const chars = String(value).split('').reverse();
<View style={{ flexDirection: 'row-reverse' }}>
  {chars.map((ch, i) => <Digit key={i} value={Number(ch)} />)}
</View>`,
  },

  {
    id: "tooltip",
    name: "Tooltip",
    level: "mid",
    description: "A small bubble with an arrow springs out of the element it points at, then shrinks back into it.",
    apis: ["withSpring", "transformOrigin", "useAnimatedStyle"],
    apisV4: ["transitionProperty", "transformOrigin", "cubicBezier"],
    demo: c`<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:10px"><div style="position:relative;padding:6px 10px;border-radius:8px;background:var(--ink, #1b1f24);color:#fff;font-size:11px;font-weight:600;transform-origin:50% 130%;animation:zTt 3.2s infinite">Saved to library<span style="position:absolute;left:50%;bottom:-5px;width:10px;height:10px;margin-left:-5px;background:inherit;transform:rotate(45deg);border-radius:2px"></span></div><span style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);font-size:16px">🔖</span></div>`,
    code: c`// Scale from the arrow tip (bottom center), so the bubble grows out of the anchor
const p = useSharedValue(0);

useEffect(() => {
  p.value = visible
    ? withSpring(1, { damping: 14, stiffness: 260 })
    : withTiming(0, { duration: 120 });
}, [visible]);

const bubble = useAnimatedStyle(() => ({
  opacity: p.value,
  transform: [
    { translateY: (1 - p.value) * 6 },
    { scale: 0.6 + 0.4 * p.value },
  ],
}));

<View style={{ alignItems: 'center' }}>
  <Animated.View
    pointerEvents="none"
    style={[styles.tooltip, { transformOrigin: 'bottom' }, bubble]}> {/* dark, radius 8, absolute above */}
    <Text style={styles.tooltipText}>Saved to library</Text>
    <View style={styles.arrow} /> {/* 10 x 10 square rotated 45deg, bottom -5 */}
  </Animated.View>
  <Pressable onLongPress={() => setVisible(true)} onPressOut={() => setVisible(false)}>
    <BookmarkIcon />
  </Pressable>
</View>`,
    codeV4: c`// Reanimated 4: opacity and transform transitions, an overshoot curve on the way in
<View style={{ alignItems: 'center' }}>
  <Animated.View
    pointerEvents="none"
    style={[styles.tooltip, {
      transformOrigin: 'bottom',
      opacity: visible ? 1 : 0,
      transform: [{ translateY: visible ? 0 : 6 }, { scale: visible ? 1 : 0.6 }],
      transitionProperty: ['opacity', 'transform'],
      transitionDuration: visible ? '260ms' : '120ms',
      transitionTimingFunction: visible ? cubicBezier(0.3, 1.5, 0.5, 1) : 'ease-in',
    }]}>
    <Text style={styles.tooltipText}>Saved to library</Text>
    <View style={styles.arrow} />
  </Animated.View>
  <Pressable onLongPress={() => setVisible(true)} onPressOut={() => setVisible(false)}>
    <BookmarkIcon />
  </Pressable>
</View>`,
  },

  {
    id: "expand-search",
    name: "Expanding search",
    level: "mid",
    description: "A round search button stretches into a full search field and focuses it; cancel shrinks it back.",
    apis: ["withTiming", "interpolate", "useAnimatedStyle"],
    apisV4: ["transitionProperty", "width transition", "transitionDelay"],
    demo: c`<div style="width:200px;display:flex;justify-content:flex-end"><div style="height:38px;width:38px;border-radius:19px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;gap:8px;padding:0 11px;overflow:hidden;animation:zEs 4s cubic-bezier(.3,1.2,.5,1) infinite"><svg style="flex:none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span style="font-size:12px;color:var(--muted);white-space:nowrap;animation:zEsT 4s infinite">Search recipes…</span></div></div>`,
    code: c`// One open value drives the field width and the input/cancel fade
const COLLAPSED = 40;
const open = useSharedValue(0);
const input = useRef(null);
const { width } = useWindowDimensions();
const FULL = width - 32;

const expand = () => {
  open.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.back(1.2)) });
  input.current?.focus();
};
const collapse = () => {
  input.current?.blur();
  open.value = withTiming(0, { duration: 220 });
};

const field = useAnimatedStyle(() => ({ width: interpolate(open.value, [0, 1], [COLLAPSED, FULL]) }));
const inner = useAnimatedStyle(() => ({ opacity: interpolate(open.value, [0.5, 1], [0, 1], Extrapolation.CLAMP) }));

<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
  <Animated.View style={[styles.field, field]}> {/* height 40, radius 20, row, overflow hidden */}
    <Pressable onPress={expand}><SearchIcon /></Pressable>
    <Animated.View style={[{ flex: 1, flexDirection: 'row' }, inner]}>
      <TextInput ref={input} placeholder="Search recipes…" style={{ flex: 1 }} />
      <Pressable onPress={collapse}><Text>Cancel</Text></Pressable>
    </Animated.View>
  </Animated.View>
</View>`,
    codeV4: c`// Reanimated 4: width and opacity transitions on state, the input fades in after the stretch
const [open, setOpen] = useState(false);
const input = useRef(null);
const { width } = useWindowDimensions();

useEffect(() => { open ? input.current?.focus() : input.current?.blur(); }, [open]);

<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
  <Animated.View style={[styles.field, {
    width: open ? width - 32 : 40,
    transitionProperty: 'width',
    transitionDuration: open ? '280ms' : '220ms',
    transitionTimingFunction: open ? cubicBezier(0.3, 1.2, 0.5, 1) : 'ease-in',
  }]}>
    <Pressable onPress={() => setOpen(true)}><SearchIcon /></Pressable>
    <Animated.View style={{
      flex: 1, flexDirection: 'row',
      opacity: open ? 1 : 0,
      transitionProperty: 'opacity',
      transitionDuration: '150ms',
      transitionDelay: open ? '140ms' : '0ms',
    }}>
      <TextInput ref={input} placeholder="Search recipes…" style={{ flex: 1 }} />
      <Pressable onPress={() => setOpen(false)}><Text>Cancel</Text></Pressable>
    </Animated.View>
  </Animated.View>
</View>`,
  },

  {
    id: "chip-select",
    name: "Filter chips",
    level: "mid",
    description: "Tapping a chip fills it and grows a check mark, and the chips around it slide over to make room.",
    apis: ["LinearTransition", "ZoomIn / ZoomOut", "layout"],
    apisV4: ["LinearTransition", "ZoomIn / ZoomOut", "transitionProperty"],
    demo: c`<div style="display:flex;gap:6px;font-size:11px;font-weight:600"><span style="padding:6px 10px;border-radius:99px;border:1.5px solid var(--accent);background:var(--accent);color:#fff">✓ Vegan</span><span style="display:flex;align-items:center;padding:6px 10px;border-radius:99px;border:1.5px solid var(--line);background:var(--surface);animation:zChB 3.6s infinite"><span style="display:inline-block;overflow:hidden;width:0;animation:zChC 3.6s cubic-bezier(.3,1.4,.5,1) infinite">✓&nbsp;</span>Quick</span><span style="padding:6px 10px;border-radius:99px;border:1.5px solid var(--line);background:var(--surface)">Spicy</span></div>`,
    code: chipSelect,
    codeV4: c`// Reanimated 4: layout animations still reflow the row; the chip colors use a CSS transition
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

const [selected, setSelected] = useState(new Set(['Vegan']));
const toggle = (tag) => setSelected((s) => {
  const next = new Set(s);
  next.has(tag) ? next.delete(tag) : next.add(tag);
  return next;
});

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {TAGS.map((tag) => {
    const on = selected.has(tag);
    return (
      <Animated.View key={tag} layout={LinearTransition.springify().damping(18)}>
        <Pressable onPress={() => toggle(tag)}>
          <Animated.View style={[styles.chip, {
            backgroundColor: on ? '#2F54EB' : 'white',
            borderColor: on ? '#2F54EB' : '#DADFE6',
            transitionProperty: ['backgroundColor', 'borderColor'],
            transitionDuration: '180ms',
          }]}>
            {on && (
              <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut.duration(120)}>
                <CheckIcon size={14} color="white" />
              </Animated.View>
            )}
            <Text style={[styles.chipText, on && { color: 'white' }]}>{tag}</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  })}
</View>`,
  },

  {
    id: "tab-bubble",
    name: "Bubble tab bar",
    level: "mid",
    description: "The active tab swells into a pill that shows its label, and the pill springs over to whichever tab you tap.",
    apis: ["LinearTransition", "FadeIn / FadeOut", "layout"],
    apisV4: ["LinearTransition", "FadeIn / FadeOut", "layout"],
    demo: c`<div style="display:flex;align-items:center;justify-content:space-around;width:210px;height:48px;padding:0 6px;border-radius:16px;background:var(--surface);border:1px solid var(--line);font-size:11px;font-weight:700;color:var(--accent)"><span style="display:flex;align-items:center;gap:5px;height:32px;padding:0 10px;border-radius:99px;overflow:hidden;animation:zTbA 4.8s cubic-bezier(.3,1.3,.5,1) infinite">🏠<span style="overflow:hidden;white-space:nowrap;animation:zTbL 4.8s cubic-bezier(.3,1.3,.5,1) infinite">Home</span></span><span style="display:flex;align-items:center;gap:5px;height:32px;padding:0 10px;border-radius:99px;overflow:hidden;animation:zTbA 4.8s cubic-bezier(.3,1.3,.5,1) -3.2s infinite">🔍<span style="overflow:hidden;white-space:nowrap;animation:zTbL 4.8s cubic-bezier(.3,1.3,.5,1) -3.2s infinite">Search</span></span><span style="display:flex;align-items:center;gap:5px;height:32px;padding:0 10px;border-radius:99px;overflow:hidden;animation:zTbA 4.8s cubic-bezier(.3,1.3,.5,1) -1.6s infinite">👤<span style="overflow:hidden;white-space:nowrap;animation:zTbL 4.8s cubic-bezier(.3,1.3,.5,1) -1.6s infinite">Profile</span></span></div>`,
    code: tabBubble,
    codeV4: c`// Unchanged in Reanimated 4: layout transitions animate the pill's size and position
` + tabBubble.split("\n").slice(1).join("\n"),
  },
];
