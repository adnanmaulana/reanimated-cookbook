// Second batch of everyday UI animations, after data/animations-more.ts. Same shape as data/animations.ts;
// their Flutter, SwiftUI and Compose ports live in data/flutter.ts, data/swiftui.ts and data/compose.ts.
// Demos use the keyframes in app/globals.css. String.raw keeps code verbatim; snippets avoid JS interpolation syntax.
import type { Animation } from "@/lib/types";

const c = String.raw;

// Confetti pieces for the preview: launch offset, spin and color
const confettiPieces: [number, number, number, string][] = [
  [-60, -50, 320, "var(--accent)"],
  [-40, -64, -260, "var(--coral)"],
  [-20, -72, 400, "#f5b301"],
  [0, -78, -340, "#a78bfa"],
  [20, -70, 280, "var(--accent)"],
  [42, -62, -420, "var(--coral)"],
  [62, -48, 360, "#f5b301"],
  [-72, -30, -300, "#a78bfa"],
  [72, -28, 240, "var(--accent)"],
  [-32, -46, 500, "#f5b301"],
  [32, -50, -380, "#a78bfa"],
  [8, -56, 300, "var(--coral)"],
];
const confettiDemo =
  '<div style="position:relative;width:180px;height:110px;overflow:hidden;border-radius:10px;background:var(--surface);border:1px solid var(--line)">' +
  '<div style="position:absolute;left:50%;top:64%;transform:translate(-50%,-50%);font-size:20px">🎉</div>' +
  confettiPieces
    .map(
      ([x, y, r, color]) =>
        '<i class="cfp" style="--x:' + x + "px;--y:" + y + "px;--r:" + r + "deg;background:" + color + '"></i>',
    )
    .join("") +
  "</div>";

const starDemo =
  '<div style="display:flex;gap:6px;font-size:28px;line-height:1">' +
  [0, 1, 2, 3, 4]
    .map(
      (i) =>
        '<span style="display:inline-block;color:var(--line);animation:star 3.2s ease-out infinite;animation-delay:' +
        i * 0.12 +
        's">★</span>',
    )
    .join("") +
  "</div>";

const scrollLines = [100, 86, 94, 60, 100, 78, 90, 52, 100, 84, 70, 96, 64, 88]
  .map((w) => '<i style="display:block;height:7px;width:' + w + '%;border-radius:3px;background:var(--line)"></i>')
  .join("");

const reorderRow = (label: string, extra: string) =>
  '<div style="height:22px;border-radius:6px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;gap:6px;padding:0 8px;font-size:10px;' +
  extra +
  '"><span style="color:var(--muted);letter-spacing:-2px">⋮⋮</span>' +
  label +
  "</div>";

export const extra: Animation[] = [
  {
    id: "confetti",
    name: "Confetti burst",
    level: "mid",
    description: "Pieces shoot up from a point, spin, fall under gravity and fade, for wins and completed goals.",
    apis: ["useSharedValue", "withSequence", "useAnimatedStyle"],
    apisV4: ["useSharedValue", "withSequence", "useAnimatedStyle"],
    demo: confettiDemo,
    code: c`// Each piece gets a random launch angle, speed and spin; one shared clock drives them all
const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];
const GRAVITY = 900; // px per second²

const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
  angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.6, // mostly upward
  speed: 450 + Math.random() * 350,                   // px per second
  spin: (Math.random() - 0.5) * 1440,                 // degrees per second
  color: COLORS[i % COLORS.length],
})), []);

const t = useSharedValue(0); // seconds since the burst
const fire = () => {
  t.value = withSequence(
    withTiming(0, { duration: 0 }),
    withTiming(1.6, { duration: 1600, easing: Easing.linear }),
  );
};

function Piece({ p, t }) {
  const style = useAnimatedStyle(() => {
    const x = Math.cos(p.angle) * p.speed * t.value;
    const y = Math.sin(p.angle) * p.speed * t.value + 0.5 * GRAVITY * t.value * t.value;
    return {
      opacity: t.value === 0 ? 0 : interpolate(t.value, [0, 1.2, 1.6], [1, 1, 0]),
      transform: [{ translateX: x }, { translateY: y }, { rotate: p.spin * t.value + 'deg' }],
    };
  });
  return <Animated.View style={[styles.piece, { backgroundColor: p.color }, style]} />; // 6 x 10
}

{/* Zero-size origin where the burst starts, e.g. the center of the button */}
<View pointerEvents="none" style={styles.origin}>
  {pieces.map((p, i) => <Piece key={i} p={p} t={t} />)}
</View>`,
    codeV4: c`// Physics per piece is easiest as a worklet, so this is the same shared-value code in Reanimated 4
const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];
const GRAVITY = 900; // px per second²

const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
  angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.6, // mostly upward
  speed: 450 + Math.random() * 350,                   // px per second
  spin: (Math.random() - 0.5) * 1440,                 // degrees per second
  color: COLORS[i % COLORS.length],
})), []);

const t = useSharedValue(0); // seconds since the burst
const fire = () => {
  t.value = withSequence(
    withTiming(0, { duration: 0 }),
    withTiming(1.6, { duration: 1600, easing: Easing.linear }),
  );
};

function Piece({ p, t }) {
  const style = useAnimatedStyle(() => {
    const x = Math.cos(p.angle) * p.speed * t.value;
    const y = Math.sin(p.angle) * p.speed * t.value + 0.5 * GRAVITY * t.value * t.value;
    return {
      opacity: t.value === 0 ? 0 : interpolate(t.value, [0, 1.2, 1.6], [1, 1, 0]),
      transform: [{ translateX: x }, { translateY: y }, { rotate: p.spin * t.value + 'deg' }],
    };
  });
  return <Animated.View style={[styles.piece, { backgroundColor: p.color }, style]} />; // 6 x 10
}

{/* Zero-size origin where the burst starts, e.g. the center of the button */}
<View pointerEvents="none" style={styles.origin}>
  {pieces.map((p, i) => <Piece key={i} p={p} t={t} />)}
</View>`,
  },

  {
    id: "star-rating",
    name: "Star rating",
    level: "basic",
    description: "Tap a star and every star up to it fills in, each one popping with a short stagger.",
    apis: ["withSequence", "withSpring", "interpolateColor"],
    apisV4: ["animationName", "keyframes", "transitionProperty"],
    demo: starDemo,
    code: c`// Each star animates when it turns on; the delay staggers a multi-star jump
function Star({ index, rating, onPress }) {
  const filled = index < rating;
  const scale = useSharedValue(1);
  const fill = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(filled ? 1 : 0, { duration: 150 });
    if (filled) {
      scale.value = withDelay(index * 40, withSequence(
        withTiming(1.35, { duration: 120 }),
        withSpring(1, { damping: 6, stiffness: 300 }),
      ));
    }
  }, [filled]);

  const style = useAnimatedStyle(() => ({
    color: interpolateColor(fill.value, [0, 1], ['#d4d4d8', '#f5b301']),
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={() => onPress(index + 1)} hitSlop={6}>
      <Animated.Text style={[styles.star, style]}>★</Animated.Text>
    </Pressable>
  );
}

const [rating, setRating] = useState(0);
<View style={{ flexDirection: 'row', gap: 8 }}>
  {[0, 1, 2, 3, 4].map((i) => <Star key={i} index={i} rating={rating} onPress={setRating} />)}
</View>`,
    codeV4: c`// Reanimated 4: the color is a CSS transition, and the pop keyframes run when a star turns on
const pop = {
  '0%': { transform: [{ scale: 1 }] },
  '35%': { transform: [{ scale: 1.35 }] },
  '70%': { transform: [{ scale: 0.92 }] },
  '100%': { transform: [{ scale: 1 }] },
};

function Star({ index, rating, onPress }) {
  const filled = index < rating;
  return (
    <Pressable onPress={() => onPress(index + 1)} hitSlop={6}>
      <Animated.Text style={[styles.star, {
        color: filled ? '#f5b301' : '#d4d4d8',
        transitionProperty: 'color',
        transitionDuration: '150ms',
        // Adding animationName starts the keyframes; removing it resets them
        ...(filled && {
          animationName: pop,
          animationDuration: '380ms',
          animationDelay: index * 40 + 'ms',
          animationTimingFunction: 'ease-out',
        }),
      }]}>★</Animated.Text>
    </Pressable>
  );
}

const [rating, setRating] = useState(0);
<View style={{ flexDirection: 'row', gap: 8 }}>
  {[0, 1, 2, 3, 4].map((i) => <Star key={i} index={i} rating={rating} onPress={setRating} />)}
</View>`,
  },

  {
    id: "badge-bounce",
    name: "Notification badge",
    level: "basic",
    description: "When the unread count goes up, the badge pops and the bell gives a little wiggle.",
    apis: ["withSequence", "withSpring", "ZoomIn / ZoomOut"],
    apisV4: ["animationName", "keyframes", "key remount"],
    demo: c`<div style="position:relative;width:46px;height:46px;border-radius:12px;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;font-size:20px"><span style="display:inline-block;transform-origin:50% 10%;animation:bel 2.4s ease-in-out infinite">🔔</span><b style="position:absolute;top:-8px;right:-8px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:var(--coral);color:#fff;font:700 11px/20px var(--f-mono);text-align:center;animation:bdg 2.4s ease-out infinite">3</b></div>`,
    code: c`// When the count goes up, the badge pops and the bell wiggles
const scale = useSharedValue(1);
const rotate = useSharedValue(0);

useEffect(() => {
  if (count === 0) return;
  scale.value = withSequence(
    withTiming(1.45, { duration: 120 }),
    withSpring(1, { damping: 5, stiffness: 300 }),
  );
  rotate.value = withSequence(
    withTiming(14, { duration: 60 }),
    withTiming(-12, { duration: 90 }),
    withTiming(8, { duration: 90 }),
    withTiming(0, { duration: 80 }),
  );
}, [count]);

const badge = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
const bell = useAnimatedStyle(() => ({ transform: [{ rotate: rotate.value + 'deg' }] }));

<View>
  <Animated.View style={[{ transformOrigin: 'top' }, bell]}>
    <BellIcon />
  </Animated.View>
  {count > 0 && (
    // Outer view handles mount/unmount, inner view the pop, so the transforms don't fight
    <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut} style={styles.badgePosition}>
      <Animated.View style={[styles.badge, badge]}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </Animated.View>
    </Animated.View>
  )}
</View>`,
    codeV4: c`// Reanimated 4: keying on count remounts both views, so their CSS keyframes replay on every change
const pop = {
  '0%': { transform: [{ scale: 1 }] },
  '30%': { transform: [{ scale: 1.45 }] },
  '60%': { transform: [{ scale: 0.88 }] },
  '100%': { transform: [{ scale: 1 }] },
};
const wiggle = {
  '0%': { transform: [{ rotate: '0deg' }] },
  '20%': { transform: [{ rotate: '14deg' }] },
  '45%': { transform: [{ rotate: '-12deg' }] },
  '70%': { transform: [{ rotate: '8deg' }] },
  '100%': { transform: [{ rotate: '0deg' }] },
};

<View>
  <Animated.View
    key={'bell-' + count}
    style={{ transformOrigin: 'top', animationName: wiggle, animationDuration: '400ms' }}>
    <BellIcon />
  </Animated.View>
  {count > 0 && (
    <Animated.View
      key={count}
      style={[styles.badge, styles.badgePosition, {
        animationName: pop,
        animationDuration: '400ms',
        animationTimingFunction: 'ease-out',
      }]}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </Animated.View>
  )}
</View>`,
  },

  {
    id: "scroll-progress",
    name: "Scroll progress bar",
    level: "basic",
    description: "A thin bar at the top fills as you read down an article, tied directly to the scroll offset.",
    apis: ["useAnimatedScrollHandler", "useAnimatedStyle", "scaleX"],
    apisV4: ["useAnimatedScrollHandler", "useAnimatedStyle", "scaleX"],
    demo:
      '<div style="position:relative;width:180px;height:110px;overflow:hidden;border-radius:10px;background:var(--surface);border:1px solid var(--line)">' +
      '<div style="position:absolute;z-index:1;top:0;left:0;width:100%;height:4px;background:var(--accent);transform-origin:left;animation:spg 3.6s ease-in-out infinite"></div>' +
      '<div style="display:grid;gap:7px;padding:14px 12px;animation:spl 3.6s ease-in-out infinite">' +
      scrollLines +
      "</div></div>",
    code: c`// Progress = scroll offset / (content height - viewport height)
const offset = useSharedValue(0);
const content = useSharedValue(1);
const viewport = useSharedValue(1);

const onScroll = useAnimatedScrollHandler((e) => {
  offset.value = e.contentOffset.y;
  content.value = e.contentSize.height;
  viewport.value = e.layoutMeasurement.height;
});

const bar = useAnimatedStyle(() => {
  const max = Math.max(content.value - viewport.value, 1);
  return { transform: [{ scaleX: Math.min(Math.max(offset.value / max, 0), 1) }] };
});

<View style={{ flex: 1 }}>
  <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
    {article}
  </Animated.ScrollView>
  {/* position absolute, top 0, left 0, right 0, height 3; grows from the left edge */}
  <Animated.View style={[styles.bar, { transformOrigin: 'left' }, bar]} />
</View>`,
    codeV4: c`// Scroll-driven, so Reanimated 4 uses the same scroll handler and animated style
const offset = useSharedValue(0);
const content = useSharedValue(1);
const viewport = useSharedValue(1);

const onScroll = useAnimatedScrollHandler((e) => {
  offset.value = e.contentOffset.y;
  content.value = e.contentSize.height;
  viewport.value = e.layoutMeasurement.height;
});

const bar = useAnimatedStyle(() => {
  const max = Math.max(content.value - viewport.value, 1);
  return { transform: [{ scaleX: Math.min(Math.max(offset.value / max, 0), 1) }] };
});

<View style={{ flex: 1 }}>
  <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
    {article}
  </Animated.ScrollView>
  {/* position absolute, top 0, left 0, right 0, height 3; grows from the left edge */}
  <Animated.View style={[styles.bar, { transformOrigin: 'left' }, bar]} />
</View>`,
  },

  {
    id: "segmented-control",
    name: "Segmented control",
    level: "mid",
    description: "A raised thumb slides behind the selected option with a little overshoot, like the iOS control.",
    apis: ["withSpring", "onLayout", "useAnimatedStyle"],
    apisV4: ["transitionProperty", "cubicBezier", "percentage left"],
    demo: c`<div style="position:relative;display:flex;width:186px;padding:3px;border-radius:10px;background:var(--line)"><div style="position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / 3);border-radius:8px;background:var(--surface);box-shadow:0 1px 3px rgba(0,0,0,.18);animation:sgT 4.8s cubic-bezier(.3,1.4,.5,1) infinite"></div><span style="position:relative;flex:1;text-align:center;font-size:11px;font-weight:600;padding:6px 0">Day</span><span style="position:relative;flex:1;text-align:center;font-size:11px;font-weight:600;padding:6px 0">Week</span><span style="position:relative;flex:1;text-align:center;font-size:11px;font-weight:600;padding:6px 0">Month</span></div>`,
    code: c`// The thumb springs to selected * segment width; the width comes from onLayout
const OPTIONS = ['Day', 'Week', 'Month'];
const [selected, setSelected] = useState(0);
const segment = useSharedValue(0);
const x = useSharedValue(0);

useEffect(() => {
  x.value = withSpring(selected * segment.value, { damping: 16, stiffness: 220 });
}, [selected]);

const thumb = useAnimatedStyle(() => ({
  width: segment.value,
  transform: [{ translateX: x.value }],
}));

<View
  style={styles.track} // flexDirection 'row', padding 3, borderRadius 10, light gray
  onLayout={(e) => {
    segment.value = (e.nativeEvent.layout.width - 6) / OPTIONS.length;
    x.value = selected * segment.value;
  }}>
  {/* position absolute, top/bottom/left 3, white, borderRadius 8, small shadow */}
  <Animated.View style={[styles.thumb, thumb]} />
  {OPTIONS.map((label, i) => (
    <Pressable key={label} style={styles.segment} onPress={() => setSelected(i)}>
      <Text style={[styles.label, selected === i && styles.labelActive]}>{label}</Text>
    </Pressable>
  ))}
</View>`,
    codeV4: c`// Reanimated 4: the thumb's left is a percentage and a CSS transition slides it, no measuring
const OPTIONS = ['Day', 'Week', 'Month'];
const [selected, setSelected] = useState(0);

<View style={styles.track}> {/* flexDirection 'row', padding 3, borderRadius 10, light gray */}
  {/* Absolute box inset by the padding, so percentages are of the inner width */}
  <View pointerEvents="none" style={styles.thumbArea}>
    <Animated.View style={[styles.thumb, {
      width: 100 / OPTIONS.length + '%',
      left: (selected * 100) / OPTIONS.length + '%',
      transitionProperty: 'left',
      transitionDuration: '320ms',
      transitionTimingFunction: cubicBezier(0.3, 1.4, 0.5, 1), // slight overshoot
    }]} />
  </View>
  {OPTIONS.map((label, i) => (
    <Pressable key={label} style={styles.segment} onPress={() => setSelected(i)}>
      <Text style={[styles.label, selected === i && styles.labelActive]}>{label}</Text>
    </Pressable>
  ))}
</View>`,
  },

  {
    id: "skeleton-crossfade",
    name: "Skeleton to content",
    level: "basic",
    description: "A pulsing placeholder holds the layout while loading, then crossfades into the real content in place.",
    apis: ["FadeIn", "FadeOut", "withRepeat"],
    apisV4: ["FadeIn", "FadeOut", "animationIterationCount"],
    demo: c`<div style="display:grid;width:180px"><div style="grid-area:1/1;display:flex;gap:10px;align-items:center;animation:skO 3.4s ease-in-out infinite"><i style="flex:none;width:34px;height:34px;border-radius:50%;background:var(--line)"></i><div style="flex:1;display:grid;gap:6px"><i style="display:block;height:9px;border-radius:4px;background:var(--line)"></i><i style="display:block;height:9px;width:60%;border-radius:4px;background:var(--line)"></i></div></div><div style="grid-area:1/1;display:flex;gap:10px;align-items:center;opacity:0;animation:skI 3.4s ease-in-out infinite"><i style="flex:none;width:34px;height:34px;border-radius:50%;background:var(--accent)"></i><div style="flex:1;line-height:1.35"><b style="display:block;font-size:12px">Ada Lovelace</b><span style="font-size:10px;color:var(--muted)">Posted 2 min ago</span></div></div></div>`,
    code: c`// The skeleton exits and the content enters in the same slot; the skeleton pulses meanwhile
function Skeleton() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.5, { duration: 700 }), -1, true);
  }, []);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[styles.row, pulse]}>
      <View style={[styles.avatar, styles.bone]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.line, styles.bone]} />
        <View style={[styles.line, styles.bone, { width: '60%' }]} />
      </View>
    </Animated.View>
  );
}

const [post, setPost] = useState<Post | null>(null);

<View style={{ minHeight: 48 }}> {/* fixed height so nothing jumps */}
  {post ? (
    <Animated.View key="content" entering={FadeIn.duration(300)} style={styles.row}>
      <Image source={{ uri: post.avatar }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{post.author}</Text>
        <Text style={styles.meta}>{post.time}</Text>
      </View>
    </Animated.View>
  ) : (
    // Absolute, so the exiting skeleton overlaps the entering content instead of stacking
    <Animated.View key="skeleton" exiting={FadeOut.duration(300)} style={StyleSheet.absoluteFill}>
      <Skeleton />
    </Animated.View>
  )}
</View>`,
    codeV4: c`// Reanimated 4: the pulse is a CSS animation; enter/exit still use layout animations
const pulse = { from: { opacity: 1 }, to: { opacity: 0.5 } };

function Skeleton() {
  return (
    <Animated.View style={[styles.row, {
      animationName: pulse,
      animationDuration: '700ms',
      animationIterationCount: 'infinite',
      animationDirection: 'alternate',
    }]}>
      <View style={[styles.avatar, styles.bone]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.line, styles.bone]} />
        <View style={[styles.line, styles.bone, { width: '60%' }]} />
      </View>
    </Animated.View>
  );
}

const [post, setPost] = useState<Post | null>(null);

<View style={{ minHeight: 48 }}> {/* fixed height so nothing jumps */}
  {post ? (
    <Animated.View key="content" entering={FadeIn.duration(300)} style={styles.row}>
      <Image source={{ uri: post.avatar }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{post.author}</Text>
        <Text style={styles.meta}>{post.time}</Text>
      </View>
    </Animated.View>
  ) : (
    // Absolute, so the exiting skeleton overlaps the entering content instead of stacking
    <Animated.View key="skeleton" exiting={FadeOut.duration(300)} style={StyleSheet.absoluteFill}>
      <Skeleton />
    </Animated.View>
  )}
</View>`,
  },

  {
    id: "auto-carousel",
    name: "Auto-playing carousel",
    level: "mid",
    description: "Slides advance on a timer, pause while you drag, and the pager dots follow the live scroll position.",
    apis: ["useAnimatedRef", "useAnimatedScrollHandler", "interpolate"],
    apisV4: ["useAnimatedRef", "useAnimatedScrollHandler", "interpolate"],
    demo: c`<div style="width:180px;height:96px;overflow:hidden;border-radius:10px;border:1px solid var(--line)"><div style="display:flex;width:400%;height:100%;animation:acr 7s cubic-bezier(.6,0,.2,1) infinite"><div style="flex:1;display:grid;place-items:center;color:#fff;font:700 16px var(--f-mono);background:var(--accent)">01</div><div style="flex:1;display:grid;place-items:center;color:#fff;font:700 16px var(--f-mono);background:var(--coral)">02</div><div style="flex:1;display:grid;place-items:center;color:#fff;font:700 16px var(--f-mono);background:#a78bfa">03</div><div style="flex:1;display:grid;place-items:center;color:#fff;font:700 16px var(--f-mono);background:var(--accent)">01</div></div></div>`,
    code: c`// A timer scrolls to the next page; dragging pauses it. Dots read the live offset.
const { width } = useWindowDimensions();
const ref = useAnimatedRef<Animated.ScrollView>();
const x = useSharedValue(0);
const page = useRef(0);
const dragging = useRef(false);

const onScroll = useAnimatedScrollHandler((e) => {
  x.value = e.contentOffset.x;
});

useEffect(() => {
  const id = setInterval(() => {
    if (dragging.current) return;
    page.current = (page.current + 1) % slides.length; // wraps back to the first slide
    ref.current?.scrollTo({ x: page.current * width, animated: true });
  }, 3000);
  return () => clearInterval(id);
}, [width]);

<Animated.ScrollView
  ref={ref}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onScroll={onScroll}
  scrollEventThrottle={16}
  onScrollBeginDrag={() => { dragging.current = true; }}
  onMomentumScrollEnd={(e) => {
    dragging.current = false;
    page.current = Math.round(e.nativeEvent.contentOffset.x / width);
  }}>
  {slides.map((s) => <Image key={s.id} source={s.image} style={{ width, height: 200 }} />)}
</Animated.ScrollView>

function Dot({ i, x, width }) {
  const style = useAnimatedStyle(() => {
    const p = x.value / width;
    return {
      width: interpolate(p, [i - 1, i, i + 1], [8, 22, 8], Extrapolation.CLAMP),
      opacity: interpolate(p, [i - 1, i, i + 1], [0.4, 1, 0.4], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />; // height 8, borderRadius 4
}

<View style={styles.dots}>
  {slides.map((s, i) => <Dot key={s.id} i={i} x={x} width={width} />)}
</View>`,
    codeV4: c`// Scroll-driven, so Reanimated 4 uses the same scroll handler; the timer is plain React
const { width } = useWindowDimensions();
const ref = useAnimatedRef<Animated.ScrollView>();
const x = useSharedValue(0);
const page = useRef(0);
const dragging = useRef(false);

const onScroll = useAnimatedScrollHandler((e) => {
  x.value = e.contentOffset.x;
});

useEffect(() => {
  const id = setInterval(() => {
    if (dragging.current) return;
    page.current = (page.current + 1) % slides.length; // wraps back to the first slide
    ref.current?.scrollTo({ x: page.current * width, animated: true });
  }, 3000);
  return () => clearInterval(id);
}, [width]);

<Animated.ScrollView
  ref={ref}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onScroll={onScroll}
  scrollEventThrottle={16}
  onScrollBeginDrag={() => { dragging.current = true; }}
  onMomentumScrollEnd={(e) => {
    dragging.current = false;
    page.current = Math.round(e.nativeEvent.contentOffset.x / width);
  }}>
  {slides.map((s) => <Image key={s.id} source={s.image} style={{ width, height: 200 }} />)}
</Animated.ScrollView>

function Dot({ i, x, width }) {
  const style = useAnimatedStyle(() => {
    const p = x.value / width;
    return {
      width: interpolate(p, [i - 1, i, i + 1], [8, 22, 8], Extrapolation.CLAMP),
      opacity: interpolate(p, [i - 1, i, i + 1], [0.4, 1, 0.4], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />; // height 8, borderRadius 4
}

<View style={styles.dots}>
  {slides.map((s, i) => <Dot key={s.id} i={i} x={x} width={width} />)}
</View>`,
  },

  {
    id: "reorder-list",
    name: "Drag to reorder list",
    level: "adv",
    description: "Long-press a row to lift it, drag it up or down, and the other rows slide out of its way.",
    apis: ["Gesture.Pan", "activateAfterLongPress", "useAnimatedReaction"],
    apisV4: ["Gesture.Pan", "activateAfterLongPress", "useAnimatedReaction"],
    demo:
      '<div style="display:grid;gap:6px;width:160px">' +
      reorderRow(
        "Groceries",
        "position:relative;z-index:1;border-color:var(--accent);box-shadow:0 4px 10px rgba(0,0,0,.12);animation:rlA 4.4s ease-in-out infinite",
      ) +
      reorderRow("Laundry", "animation:rlB 4.4s ease-in-out infinite") +
      reorderRow("Gym", "animation:rlC 4.4s ease-in-out infinite") +
      reorderRow("Read", "") +
      "</div>",
    code: c`// Every row's slot lives in one shared map; the lifted row swaps slots as it passes others
const ROW = 56;
const positions = useSharedValue<Record<string, number>>(
  Object.fromEntries(items.map((item, i) => [item.id, i])),
);

function Row({ id, positions, count, children }) {
  const lifted = useSharedValue(false);
  const top = useSharedValue(positions.value[id] * ROW);
  const startTop = useSharedValue(0);

  // Slide into place whenever another row takes this one's slot
  useAnimatedReaction(
    () => positions.value[id],
    (slot, prev) => {
      if (slot !== prev && !lifted.value) {
        top.value = withSpring(slot * ROW, { damping: 20, stiffness: 250 });
      }
    },
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      lifted.value = true;
      startTop.value = top.value;
    })
    .onUpdate((e) => {
      top.value = startTop.value + e.translationY;
      const to = Math.min(Math.max(Math.round(top.value / ROW), 0), count - 1);
      const from = positions.value[id];
      if (to !== from) {
        // Swap with whichever row is sitting in the target slot
        const next = { ...positions.value };
        for (const key in next) {
          if (next[key] === to) next[key] = from;
        }
        next[id] = to;
        positions.value = next;
      }
    })
    .onFinalize(() => {
      lifted.value = false;
      top.value = withSpring(positions.value[id] * ROW);
    });

  const style = useAnimatedStyle(() => ({
    top: top.value,
    zIndex: lifted.value ? 10 : 0,
    shadowOpacity: withTiming(lifted.value ? 0.2 : 0),
    transform: [{ scale: withSpring(lifted.value ? 1.03 : 1) }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, { position: 'absolute', left: 0, right: 0, height: ROW }, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Container height = items.length * ROW. Read positions.value on drop to save the new order.
<View style={{ height: items.length * ROW }}>
  {items.map((item) => (
    <Row key={item.id} id={item.id} positions={positions} count={items.length}>
      <Text>{item.title}</Text>
    </Row>
  ))}
</View>`,
    codeV4: c`// Gesture-driven, so Reanimated 4 keeps the same worklets: one shared map of row slots
const ROW = 56;
const positions = useSharedValue<Record<string, number>>(
  Object.fromEntries(items.map((item, i) => [item.id, i])),
);

function Row({ id, positions, count, children }) {
  const lifted = useSharedValue(false);
  const top = useSharedValue(positions.value[id] * ROW);
  const startTop = useSharedValue(0);

  // Slide into place whenever another row takes this one's slot
  useAnimatedReaction(
    () => positions.value[id],
    (slot, prev) => {
      if (slot !== prev && !lifted.value) {
        top.value = withSpring(slot * ROW, { damping: 20, stiffness: 250 });
      }
    },
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      lifted.value = true;
      startTop.value = top.value;
    })
    .onUpdate((e) => {
      top.value = startTop.value + e.translationY;
      const to = Math.min(Math.max(Math.round(top.value / ROW), 0), count - 1);
      const from = positions.value[id];
      if (to !== from) {
        // Swap with whichever row is sitting in the target slot
        const next = { ...positions.value };
        for (const key in next) {
          if (next[key] === to) next[key] = from;
        }
        next[id] = to;
        positions.value = next;
      }
    })
    .onFinalize(() => {
      lifted.value = false;
      top.value = withSpring(positions.value[id] * ROW);
    });

  const style = useAnimatedStyle(() => ({
    top: top.value,
    zIndex: lifted.value ? 10 : 0,
    shadowOpacity: withTiming(lifted.value ? 0.2 : 0),
    transform: [{ scale: withSpring(lifted.value ? 1.03 : 1) }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, { position: 'absolute', left: 0, right: 0, height: ROW }, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Container height = items.length * ROW. Read positions.value on drop to save the new order.
<View style={{ height: items.length * ROW }}>
  {items.map((item) => (
    <Row key={item.id} id={item.id} positions={positions} count={items.length}>
      <Text>{item.title}</Text>
    </Row>
  ))}
</View>`,
  },

  {
    id: "sheet-scale",
    name: "Sheet with receding screen",
    level: "adv",
    description: "As a modal sheet slides up, the screen behind it shrinks, rounds its corners and dims, like iOS page sheets.",
    apis: ["Gesture.Pan", "interpolate", "withSpring"],
    apisV4: ["Gesture.Pan", "interpolate", "withSpring"],
    demo: c`<div style="position:relative;width:180px;height:116px;overflow:hidden;border-radius:10px;background:#141816"><div style="position:absolute;inset:0;background:var(--surface);display:grid;align-content:start;gap:7px;padding:12px;animation:ssB 3.8s ease-in-out infinite"><i style="display:block;height:9px;width:55%;border-radius:4px;background:var(--accent)"></i><i style="display:block;height:7px;border-radius:3px;background:var(--line)"></i><i style="display:block;height:7px;width:80%;border-radius:3px;background:var(--line)"></i><i style="display:block;height:7px;width:66%;border-radius:3px;background:var(--line)"></i></div><div style="position:absolute;left:0;right:0;bottom:0;height:72%;border-radius:12px 12px 0 0;background:var(--surface);box-shadow:0 -4px 14px rgba(0,0,0,.25);animation:ssS 3.8s ease-in-out infinite"><i style="display:block;width:30px;height:4px;margin:6px auto 0;border-radius:2px;background:var(--line)"></i></div></div>`,
    code: c`// One progress value drives both the sheet and the screen behind it
const { height } = useWindowDimensions();
const SHEET = height * 0.85;
const progress = useSharedValue(0); // 0 closed, 1 open

const open = () => { progress.value = withSpring(1, { damping: 20, stiffness: 180 }); };
const close = () => { progress.value = withTiming(0, { duration: 250 }); };

// Drag down on the sheet to pull it closed
const pan = Gesture.Pan()
  .onUpdate((e) => {
    progress.value = Math.min(Math.max(1 - e.translationY / SHEET, 0), 1);
  })
  .onEnd((e) => {
    const shouldClose = e.velocityY > 800 || progress.value < 0.6;
    progress.value = shouldClose ? withTiming(0, { duration: 250 }) : withSpring(1);
  });

// The app screen shrinks, rounds its corners and moves down a touch
const screen = useAnimatedStyle(() => ({
  borderRadius: interpolate(progress.value, [0, 1], [0, 12]),
  transform: [
    { translateY: interpolate(progress.value, [0, 1], [0, 10]) },
    { scale: interpolate(progress.value, [0, 1], [1, 0.92]) },
  ],
}));
const dim = useAnimatedStyle(() => ({ opacity: progress.value * 0.4 }));
const sheet = useAnimatedStyle(() => ({
  transform: [{ translateY: (1 - progress.value) * SHEET }],
}));

<View style={{ flex: 1, backgroundColor: 'black' }}>
  <Animated.View style={[{ flex: 1, overflow: 'hidden', backgroundColor: 'white' }, screen]}>
    <AppScreen onOpen={open} />
  </Animated.View>
  <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, dim]} />
  <GestureDetector gesture={pan}>
    {/* position absolute, left/right/bottom 0, top corners rounded 12 */}
    <Animated.View style={[styles.sheet, { height: SHEET }, sheet]}>
      <View style={styles.grabber} />
      <SheetContent onClose={close} />
    </Animated.View>
  </GestureDetector>
</View>`,
    codeV4: c`// Gesture-driven, so Reanimated 4 keeps one shared progress value for both layers
const { height } = useWindowDimensions();
const SHEET = height * 0.85;
const progress = useSharedValue(0); // 0 closed, 1 open

const open = () => { progress.value = withSpring(1, { damping: 20, stiffness: 180 }); };
const close = () => { progress.value = withTiming(0, { duration: 250 }); };

// Drag down on the sheet to pull it closed
const pan = Gesture.Pan()
  .onUpdate((e) => {
    progress.value = Math.min(Math.max(1 - e.translationY / SHEET, 0), 1);
  })
  .onEnd((e) => {
    const shouldClose = e.velocityY > 800 || progress.value < 0.6;
    progress.value = shouldClose ? withTiming(0, { duration: 250 }) : withSpring(1);
  });

// The app screen shrinks, rounds its corners and moves down a touch
const screen = useAnimatedStyle(() => ({
  borderRadius: interpolate(progress.value, [0, 1], [0, 12]),
  transform: [
    { translateY: interpolate(progress.value, [0, 1], [0, 10]) },
    { scale: interpolate(progress.value, [0, 1], [1, 0.92]) },
  ],
}));
const dim = useAnimatedStyle(() => ({ opacity: progress.value * 0.4 }));
const sheet = useAnimatedStyle(() => ({
  transform: [{ translateY: (1 - progress.value) * SHEET }],
}));

<View style={{ flex: 1, backgroundColor: 'black' }}>
  <Animated.View style={[{ flex: 1, overflow: 'hidden', backgroundColor: 'white' }, screen]}>
    <AppScreen onOpen={open} />
  </Animated.View>
  <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, dim]} />
  <GestureDetector gesture={pan}>
    {/* position absolute, left/right/bottom 0, top corners rounded 12 */}
    <Animated.View style={[styles.sheet, { height: SHEET }, sheet]}>
      <View style={styles.grabber} />
      <SheetContent onClose={close} />
    </Animated.View>
  </GestureDetector>
</View>`,
  },

  {
    id: "slide-confirm",
    name: "Slide to confirm",
    level: "mid",
    description: "Drag the knob along the track to confirm. The fill follows your finger, and past the threshold it locks in, otherwise it springs back.",
    apis: ["Gesture.Pan", "withSpring", "interpolate", "runOnJS"],
    apisV4: ["Gesture.Pan", "withSpring", "interpolate", "scheduleOnRN"],
    demo: c`<div style="position:relative;width:200px;height:40px;border-radius:20px;background:var(--line);overflow:hidden"><div style="position:absolute;left:0;top:0;bottom:0;width:40px;border-radius:20px;background:var(--accent);animation:stF 4.8s ease-in-out infinite"></div><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-left:24px;font-size:11px;font-weight:600;animation:stL 4.8s linear infinite">Slide to confirm</span><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-right:24px;font-size:11px;font-weight:600;color:#fff;opacity:0;animation:stD 4.8s linear infinite">Confirmed</span><div style="position:absolute;left:4px;top:4px;width:32px;height:32px;border-radius:50%;background:var(--surface);box-shadow:0 1px 3px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;animation:stK 4.8s ease-in-out infinite"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></div></div>`,
    code: c`// The knob follows the finger along the track; past 85% it locks in and fires onConfirm
const TRACK = 280, KNOB = 48, PAD = 4;
const MAX = TRACK - KNOB - PAD * 2; // how far the knob can travel
const x = useSharedValue(0);
const done = useSharedValue(false);

const pan = Gesture.Pan()
  .enabled(!confirmed)
  .onChange((e) => {
    x.value = Math.min(Math.max(x.value + e.changeX, 0), MAX);
  })
  .onEnd((e) => {
    if (x.value > MAX * 0.85 || e.velocityX > 1200) {
      x.value = withSpring(MAX, { damping: 18, stiffness: 200 });
      if (!done.value) {
        done.value = true;
        runOnJS(onConfirm)();
      }
    } else {
      x.value = withSpring(0, { damping: 14, stiffness: 180 }); // not far enough, snap back
    }
  });

const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
const fill = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD * 2 }));
const label = useAnimatedStyle(() => ({
  opacity: interpolate(x.value, [0, MAX * 0.5], [1, 0], Extrapolation.CLAMP),
}));

// Call to reset, e.g. after the request fails
const reset = () => { done.value = false; x.value = withSpring(0); };

<View style={[styles.track, { width: TRACK, height: KNOB + PAD * 2 }]}> {/* borderRadius 999, light gray, overflow hidden */}
  <Animated.View style={[styles.fill, fill]} />  {/* absolute left/top/bottom 0, accent, borderRadius 999 */}
  <Animated.Text style={[styles.label, label]}>Slide to confirm</Animated.Text>
  <GestureDetector gesture={pan}>
    {/* absolute, top/left PAD, KNOB x KNOB circle, white, small shadow, chevron icon */}
    <Animated.View style={[styles.knob, knob]}><Chevron /></Animated.View>
  </GestureDetector>
</View>`,
    codeV4: c`import { scheduleOnRN } from 'react-native-worklets';

// Drag-driven, so Reanimated 4 still uses a shared value; scheduleOnRN replaces runOnJS
const TRACK = 280, KNOB = 48, PAD = 4;
const MAX = TRACK - KNOB - PAD * 2; // how far the knob can travel
const x = useSharedValue(0);
const done = useSharedValue(false);

const pan = Gesture.Pan()
  .enabled(!confirmed)
  .onChange((e) => {
    x.value = Math.min(Math.max(x.value + e.changeX, 0), MAX);
  })
  .onEnd((e) => {
    if (x.value > MAX * 0.85 || e.velocityX > 1200) {
      x.value = withSpring(MAX, { damping: 18, stiffness: 200 });
      if (!done.value) {
        done.value = true;
        scheduleOnRN(onConfirm);
      }
    } else {
      x.value = withSpring(0, { damping: 14, stiffness: 180 }); // not far enough, snap back
    }
  });

const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
const fill = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD * 2 }));
const label = useAnimatedStyle(() => ({
  opacity: interpolate(x.value, [0, MAX * 0.5], [1, 0], Extrapolation.CLAMP),
}));

// Call to reset, e.g. after the request fails
const reset = () => { done.value = false; x.value = withSpring(0); };

<View style={[styles.track, { width: TRACK, height: KNOB + PAD * 2 }]}> {/* borderRadius 999, light gray, overflow hidden */}
  <Animated.View style={[styles.fill, fill]} />  {/* absolute left/top/bottom 0, accent, borderRadius 999 */}
  <Animated.Text style={[styles.label, label]}>Slide to confirm</Animated.Text>
  <GestureDetector gesture={pan}>
    {/* absolute, top/left PAD, KNOB x KNOB circle, white, small shadow, chevron icon */}
    <Animated.View style={[styles.knob, knob]}><Chevron /></Animated.View>
  </GestureDetector>
</View>`,
  },
];
