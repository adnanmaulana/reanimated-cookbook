// Animation catalog. Demos are trusted static HTML that use the CSS variables and keyframes in app/globals.css.
import type { Animation } from "@/lib/types";
import { more } from "./animations-more";
import { extra } from "./animations-extra";
import { plus } from "./animations-plus";
import { final } from "./animations-final";

const core: Animation[] = [
  {
    "id": "fade-in",
    "name": "Fade in",
    "level": "basic",
    "description": "Fade a view from 0 to 1 opacity on mount.",
    "apis": [
      "useSharedValue",
      "withTiming"
    ],
    "demo": "<div class=\"b\" style=\"animation:fade 2.2s infinite\"></div>",
    "code": "const opacity = useSharedValue(0);\nuseEffect(() => { opacity.value = withTiming(1, { duration: 400 }); }, []);\nconst style = useAnimatedStyle(() => ({ opacity: opacity.value }));\nreturn <Animated.View style={[styles.box, style]} />;",
    "codeV4": "// Reanimated 4: a CSS animation, no shared values or hooks needed\nconst fadeIn = { from: { opacity: 0 }, to: { opacity: 1 } };\n\n<Animated.View\n  style={[styles.box, {\n    animationName: fadeIn,\n    animationDuration: '400ms',\n    animationTimingFunction: 'ease-out',\n  }]}\n/>",
    "apisV4": [
      "animationName",
      "animationDuration",
      "CSS animations"
    ]
  },
  {
    "id": "slide-in",
    "name": "Slide in",
    "level": "basic",
    "description": "Slide a view in from the left while fading it in.",
    "apis": [
      "withTiming",
      "Easing.out"
    ],
    "demo": "<div class=\"b\" style=\"animation:slide 2s cubic-bezier(.2,.8,.2,1) infinite\"></div>",
    "code": "const x = useSharedValue(-100);\nuseEffect(() => {\n  x.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) });\n}, []);\nconst style = useAnimatedStyle(() => ({\n  transform: [{ translateX: x.value }],\n  opacity: interpolate(x.value, [-100, 0], [0, 1]),\n}));",
    "codeV4": "const slideIn = {\n  from: { opacity: 0, transform: [{ translateX: -100 }] },\n  to: { opacity: 1, transform: [{ translateX: 0 }] },\n};\n\n<Animated.View\n  style={[styles.box, {\n    animationName: slideIn,\n    animationDuration: '450ms',\n    animationTimingFunction: 'ease-out',\n  }]}\n/>",
    "apisV4": [
      "animationName",
      "transform keyframes",
      "CSS animations"
    ]
  },
  {
    "id": "press-scale",
    "name": "Press scale",
    "level": "basic",
    "description": "Shrink a button slightly while pressed, spring back on release.",
    "apis": [
      "withSpring",
      "Pressable"
    ],
    "demo": "<div class=\"b\" style=\"width:110px;border-radius:999px;animation:press 1.8s infinite\"></div>",
    "code": "const scale = useSharedValue(1);\nconst style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));\nreturn (\n  <Pressable\n    onPressIn={() => (scale.value = withSpring(0.92))}\n    onPressOut={() => (scale.value = withSpring(1))}>\n    <Animated.View style={[styles.button, style]} />\n  </Pressable>\n);",
    "codeV4": "// Reanimated 4: a CSS transition reacts to the pressed state\nconst [pressed, setPressed] = useState(false);\nreturn (\n  <Pressable onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>\n    <Animated.View\n      style={[styles.button, {\n        transform: [{ scale: pressed ? 0.92 : 1 }],\n        transitionProperty: 'transform',\n        transitionDuration: '120ms',\n        transitionTimingFunction: 'ease-out',\n      }]}\n    />\n  </Pressable>\n);\n// Need a spring feel or no re-render per press? Use the worklet version from the v3 tab; it runs on v4 too.",
    "apisV4": [
      "transitionProperty",
      "transitionDuration",
      "CSS transitions"
    ]
  },
  {
    "id": "spin",
    "name": "Spin loader",
    "level": "basic",
    "description": "Infinite linear rotation for a loading indicator.",
    "apis": [
      "withRepeat",
      "Easing.linear"
    ],
    "demo": "<div style=\"width:44px;height:44px;border-radius:50%;border:4px solid var(--line);border-top-color:var(--accent);animation:spin .9s linear infinite\"></div>",
    "code": "const rot = useSharedValue(0);\nuseEffect(() => {\n  rot.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);\n}, []);\nconst style = useAnimatedStyle(() => ({ transform: [{ rotate: rot.value + 'deg' }] }));",
    "codeV4": "const spin = {\n  from: { transform: [{ rotate: '0deg' }] },\n  to: { transform: [{ rotate: '360deg' }] },\n};\n\n<Animated.View\n  style={[styles.spinner, {\n    animationName: spin,\n    animationDuration: '900ms',\n    animationIterationCount: 'infinite',\n    animationTimingFunction: 'linear',\n  }]}\n/>",
    "apisV4": [
      "animationName",
      "animationIterationCount",
      "CSS animations"
    ]
  },
  {
    "id": "pulse",
    "name": "Pulse ring",
    "level": "basic",
    "description": "A ring that expands and fades out behind a dot, on repeat. Good for live or recording states.",
    "apis": [
      "withRepeat",
      "interpolate"
    ],
    "demo": "<div style=\"position:relative;width:24px;height:24px\"><div style=\"position:absolute;inset:0;border-radius:50%;background:var(--coral);animation:ring 1.4s ease-out infinite\"></div><div style=\"position:absolute;inset:0;border-radius:50%;background:var(--coral)\"></div></div>",
    "code": "const p = useSharedValue(0);\nuseEffect(() => { p.value = withRepeat(withTiming(1, { duration: 1400 }), -1); }, []);\nconst ring = useAnimatedStyle(() => ({\n  transform: [{ scale: interpolate(p.value, [0, 1], [1, 2.4]) }],\n  opacity: interpolate(p.value, [0, 1], [0.7, 0]),\n}));\n// render <Animated.View style={[styles.dot, ring]} /> behind a static dot",
    "codeV4": "const ring = {\n  from: { opacity: 0.7, transform: [{ scale: 1 }] },\n  to: { opacity: 0, transform: [{ scale: 2.4 }] },\n};\n\n<View>\n  <Animated.View\n    style={[styles.dot, StyleSheet.absoluteFill, {\n      animationName: ring,\n      animationDuration: '1.4s',\n      animationIterationCount: 'infinite',\n      animationTimingFunction: 'ease-out',\n    }]}\n  />\n  <View style={styles.dot} />\n</View>",
    "apisV4": [
      "animationName",
      "animationIterationCount",
      "CSS animations"
    ]
  },
  {
    "id": "progress-bar",
    "name": "Progress bar",
    "level": "basic",
    "description": "Animate a bar's width to a percentage value.",
    "apis": [
      "withTiming",
      "width %"
    ],
    "demo": "<div style=\"width:70%;height:10px;border-radius:99px;background:var(--line);overflow:hidden\"><div style=\"height:100%;background:var(--accent);border-radius:99px;animation:grow 2.4s ease-out infinite\"></div></div>",
    "code": "const progress = useSharedValue(0);\nuseEffect(() => { progress.value = withTiming(percent, { duration: 600 }); }, [percent]);\nconst fill = useAnimatedStyle(() => ({ width: progress.value + '%' }));\nreturn <View style={styles.track}><Animated.View style={[styles.fill, fill]} /></View>;",
    "codeV4": "// The fill animates every time percent changes\n<View style={styles.track}>\n  <Animated.View\n    style={[styles.fill, {\n      width: percent + '%',\n      transitionProperty: 'width',\n      transitionDuration: '600ms',\n      transitionTimingFunction: 'ease-out',\n    }]}\n  />\n</View>",
    "apisV4": [
      "transitionProperty",
      "width %",
      "CSS transitions"
    ]
  },
  {
    "id": "color-shift",
    "name": "Color shift",
    "level": "basic",
    "description": "Smoothly blend between two colors based on state.",
    "apis": [
      "interpolateColor"
    ],
    "demo": "<div class=\"b\" style=\"animation:hue 2.4s ease-in-out infinite\"></div>",
    "code": "const t = useSharedValue(0);\nuseEffect(() => { t.value = withTiming(active ? 1 : 0); }, [active]);\nconst style = useAnimatedStyle(() => ({\n  backgroundColor: interpolateColor(t.value, [0, 1], ['#0B7A93', '#E2614A']),\n}));",
    "codeV4": "<Animated.View\n  style={[styles.box, {\n    backgroundColor: active ? '#E2614A' : '#0B7A93',\n    transitionProperty: 'backgroundColor',\n    transitionDuration: '300ms',\n  }]}\n/>",
    "apisV4": [
      "transitionProperty",
      "backgroundColor",
      "CSS transitions"
    ]
  },
  {
    "id": "entering-preset",
    "name": "Entering preset",
    "level": "basic",
    "description": "Use built-in layout animations for mount and unmount, no shared values needed.",
    "apis": [
      "FadeInDown",
      "FadeOut",
      "layout"
    ],
    "demo": "<div style=\"display:grid;gap:6px\"><div style=\"width:120px;height:12px;border-radius:4px;background:var(--accent);animation:downIn 2.4s 0s infinite both\"></div><div style=\"width:120px;height:12px;border-radius:4px;background:var(--accent);animation:downIn 2.4s 0.15s infinite both\"></div><div style=\"width:120px;height:12px;border-radius:4px;background:var(--accent);animation:downIn 2.4s 0.3s infinite both\"></div></div>",
    "code": "<Animated.View\n  entering={FadeInDown.duration(400).springify()}\n  exiting={FadeOut.duration(200)}\n  layout={LinearTransition}\n  style={styles.card}\n/>",
    "codeV4": "<Animated.View\n  entering={FadeInDown.duration(400).springify()}\n  exiting={FadeOut.duration(200)}\n  layout={LinearTransition}\n  style={styles.card}\n/>",
    "apisV4": [
      "FadeInDown",
      "FadeOut",
      "layout"
    ]
  },
  {
    "id": "spring-bounce",
    "name": "Spring bounce",
    "level": "mid",
    "description": "Drop a view in with a bouncy spring. Tune damping for more or less bounce.",
    "apis": [
      "withSpring",
      "damping",
      "stiffness"
    ],
    "demo": "<div class=\"b\" style=\"animation:spring 1.8s infinite\"></div>",
    "code": "const y = useSharedValue(-60);\nuseEffect(() => {\n  y.value = withSpring(0, { damping: 8, stiffness: 120, mass: 0.8 });\n}, []);\nconst style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));",
    "codeV4": "const y = useSharedValue(-60);\nuseEffect(() => {\n  y.value = withSpring(0, { damping: 8, stiffness: 120, mass: 0.8 });\n}, []);\nconst style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));",
    "apisV4": [
      "withSpring",
      "damping",
      "stiffness"
    ]
  },
  {
    "id": "shake",
    "name": "Error shake",
    "level": "mid",
    "description": "Shake an input horizontally when validation fails.",
    "apis": [
      "withSequence",
      "withRepeat"
    ],
    "demo": "<div style=\"width:150px;height:34px;border-radius:8px;border:2px solid var(--danger);animation:shake 1.8s infinite\"></div>",
    "code": "const x = useSharedValue(0);\nconst shake = () => {\n  x.value = withSequence(\n    withTiming(-10, { duration: 50 }),\n    withRepeat(withTiming(10, { duration: 100 }), 3, true),\n    withTiming(0, { duration: 50 }),\n  );\n};\nconst style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));",
    "codeV4": "const x = useSharedValue(0);\nconst shake = () => {\n  x.value = withSequence(\n    withTiming(-10, { duration: 50 }),\n    withRepeat(withTiming(10, { duration: 100 }), 3, true),\n    withTiming(0, { duration: 50 }),\n  );\n};\nconst style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));",
    "apisV4": [
      "withSequence",
      "withRepeat"
    ]
  },
  {
    "id": "stagger-list",
    "name": "Stagger list",
    "level": "mid",
    "description": "List items animate in one after another with an index-based delay.",
    "apis": [
      "FadeInUp",
      "delay(index)"
    ],
    "demo": "<div style=\"display:grid;gap:6px\"><div style=\"width:150px;height:12px;border-radius:4px;background:var(--accent);animation:up 2.4s 0s infinite both\"></div><div style=\"width:150px;height:12px;border-radius:4px;background:var(--accent);animation:up 2.4s 0.12s infinite both\"></div><div style=\"width:150px;height:12px;border-radius:4px;background:var(--accent);animation:up 2.4s 0.24s infinite both\"></div><div style=\"width:150px;height:12px;border-radius:4px;background:var(--accent);animation:up 2.4s 0.36s infinite both\"></div></div>",
    "code": "<FlatList\n  data={items}\n  renderItem={({ item, index }) => (\n    <Animated.View entering={FadeInUp.delay(index * 60).springify()}>\n      <Row item={item} />\n    </Animated.View>\n  )}\n/>",
    "codeV4": "<FlatList\n  data={items}\n  renderItem={({ item, index }) => (\n    <Animated.View entering={FadeInUp.delay(index * 60).springify()}>\n      <Row item={item} />\n    </Animated.View>\n  )}\n/>",
    "apisV4": [
      "FadeInUp",
      "delay(index)"
    ]
  },
  {
    "id": "accordion",
    "name": "Accordion",
    "level": "mid",
    "description": "Expand and collapse content to its measured height, with a rotating chevron.",
    "apis": [
      "measure",
      "useDerivedValue"
    ],
    "demo": "<div style=\"width:170px;border:1px solid var(--line);border-radius:8px;background:var(--surface);overflow:hidden\"><div style=\"height:30px;display:flex;align-items:center;padding:0 10px;font-size:12px\">Details</div><div style=\"background:var(--accent-soft);animation:open 3s ease-in-out infinite\"></div></div>",
    "code": "const open = useSharedValue(false);\nconst height = useSharedValue(0);\nconst progress = useDerivedValue(() => withTiming(open.value ? 1 : 0));\nconst body = useAnimatedStyle(() => ({ height: height.value * progress.value, overflow: 'hidden' }));\nconst chevron = useAnimatedStyle(() => ({ transform: [{ rotate: progress.value * 180 + 'deg' }] }));\n// inner content:\n<View onLayout={e => (height.value = e.nativeEvent.layout.height)} style={{ position: 'absolute' }}>\n  {children}\n</View>",
    "codeV4": "const open = useSharedValue(false);\nconst height = useSharedValue(0);\nconst progress = useDerivedValue(() => withTiming(open.value ? 1 : 0));\nconst body = useAnimatedStyle(() => ({ height: height.value * progress.value, overflow: 'hidden' }));\nconst chevron = useAnimatedStyle(() => ({ transform: [{ rotate: progress.value * 180 + 'deg' }] }));\n// inner content:\n<View onLayout={e => (height.value = e.nativeEvent.layout.height)} style={{ position: 'absolute' }}>\n  {children}\n</View>",
    "apisV4": [
      "measure",
      "useDerivedValue"
    ]
  },
  {
    "id": "shimmer",
    "name": "Skeleton shimmer",
    "level": "mid",
    "description": "Loading placeholder with a highlight sweeping across.",
    "apis": [
      "withRepeat",
      "LinearGradient"
    ],
    "demo": "<div style=\"display:grid;gap:8px;width:170px\"><div style=\"height:12px;width:100%;border-radius:4px;background:var(--line);position:relative;overflow:hidden\"><div style=\"position:absolute;inset:0;width:45%;background:var(--surface);opacity:.7;animation:shim 1.3s infinite\"></div></div><div style=\"height:12px;width:80%;border-radius:4px;background:var(--line);position:relative;overflow:hidden\"><div style=\"position:absolute;inset:0;width:45%;background:var(--surface);opacity:.7;animation:shim 1.3s infinite\"></div></div><div style=\"height:12px;width:60%;border-radius:4px;background:var(--line);position:relative;overflow:hidden\"><div style=\"position:absolute;inset:0;width:45%;background:var(--surface);opacity:.7;animation:shim 1.3s infinite\"></div></div></div>",
    "code": "const x = useSharedValue(-1);\nuseEffect(() => { x.value = withRepeat(withTiming(1, { duration: 1200 }), -1); }, []);\nconst sweep = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * width }] }));\nreturn (\n  <View style={[styles.bone, { overflow: 'hidden' }]}>\n    <Animated.View style={[StyleSheet.absoluteFill, sweep]}>\n      <LinearGradient colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}\n        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />\n    </Animated.View>\n  </View>\n);",
    "codeV4": "const sweep = {\n  from: { transform: [{ translateX: '-100%' }] },\n  to: { transform: [{ translateX: '200%' }] },\n};\n\n<View style={[styles.bone, { overflow: 'hidden' }]}>\n  <Animated.View\n    style={[StyleSheet.absoluteFill, {\n      width: '50%',\n      animationName: sweep,\n      animationDuration: '1.2s',\n      animationIterationCount: 'infinite',\n      animationTimingFunction: 'linear',\n    }]}>\n    <LinearGradient colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}\n      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />\n  </Animated.View>\n</View>",
    "apisV4": [
      "animationName",
      "translateX %",
      "LinearGradient"
    ]
  },
  {
    "id": "typing-dots",
    "name": "Typing dots",
    "level": "mid",
    "description": "Three dots bounce in sequence, like a chat typing indicator.",
    "apis": [
      "withDelay",
      "withRepeat"
    ],
    "demo": "<div style=\"display:flex;gap:6px;padding:10px 14px;background:var(--surface);border-radius:16px\"><div style=\"width:9px;height:9px;border-radius:50%;background:var(--muted);animation:dot 1.1s 0s infinite\"></div><div style=\"width:9px;height:9px;border-radius:50%;background:var(--muted);animation:dot 1.1s 0.15s infinite\"></div><div style=\"width:9px;height:9px;border-radius:50%;background:var(--muted);animation:dot 1.1s 0.3s infinite\"></div></div>",
    "code": "function Dot({ index }) {\n  const y = useSharedValue(0);\n  useEffect(() => {\n    y.value = withDelay(index * 150, withRepeat(\n      withSequence(withTiming(-6, { duration: 250 }), withTiming(0, { duration: 250 })), -1));\n  }, []);\n  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));\n  return <Animated.View style={[styles.dot, style]} />;\n}",
    "codeV4": "const bounce = {\n  '0%': { opacity: 0.4, transform: [{ translateY: 0 }] },\n  '30%': { opacity: 1, transform: [{ translateY: -6 }] },\n  '60%': { opacity: 0.4, transform: [{ translateY: 0 }] },\n  '100%': { opacity: 0.4, transform: [{ translateY: 0 }] },\n};\n\n<View style={styles.bubble}>\n  {[0, 1, 2].map(i => (\n    <Animated.View\n      key={i}\n      style={[styles.dot, {\n        animationName: bounce,\n        animationDuration: '1.1s',\n        animationIterationCount: 'infinite',\n        animationDelay: i * 150 + 'ms',\n      }]}\n    />\n  ))}\n</View>",
    "apisV4": [
      "animationName",
      "animationDelay",
      "CSS animations"
    ]
  },
  {
    "id": "toggle-switch",
    "name": "Toggle switch",
    "level": "mid",
    "description": "Custom switch: the thumb springs across and the track changes color.",
    "apis": [
      "withSpring",
      "interpolateColor"
    ],
    "demo": "<div style=\"width:56px;height:30px;border-radius:99px;padding:3px;animation:track 2.4s infinite\"><div style=\"width:24px;height:24px;border-radius:50%;background:var(--surface);animation:thumb 2.4s cubic-bezier(.3,1.4,.5,1) infinite\"></div></div>",
    "code": "const t = useSharedValue(on ? 1 : 0);\nuseEffect(() => { t.value = withSpring(on ? 1 : 0, { damping: 15 }); }, [on]);\nconst track = useAnimatedStyle(() => ({\n  backgroundColor: interpolateColor(t.value, [0, 1], ['#D8E0E4', '#0B7A93']),\n}));\nconst thumb = useAnimatedStyle(() => ({ transform: [{ translateX: t.value * 26 }] }));",
    "codeV4": "import Animated, { cubicBezier } from 'react-native-reanimated';\n\n<Pressable onPress={() => setOn(v => !v)} accessibilityRole=\"switch\" accessibilityState={{ checked: on }}>\n  <Animated.View\n    style={[styles.track, {\n      backgroundColor: on ? '#0B7A93' : '#D8E0E4',\n      transitionProperty: 'backgroundColor',\n      transitionDuration: '200ms',\n    }]}>\n    <Animated.View\n      style={[styles.thumb, {\n        transform: [{ translateX: on ? 26 : 0 }],\n        transitionProperty: 'transform',\n        transitionDuration: '250ms',\n        transitionTimingFunction: cubicBezier(0.3, 1.4, 0.5, 1),\n      }]}\n    />\n  </Animated.View>\n</Pressable>",
    "apisV4": [
      "transitionProperty",
      "cubicBezier",
      "CSS transitions"
    ]
  },
  {
    "id": "like-burst",
    "name": "Like burst",
    "level": "mid",
    "description": "Heart squashes, pops bigger and fills, with a ring bursting outward.",
    "apis": [
      "withSequence",
      "withSpring"
    ],
    "demo": "<div style=\"position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center\"><div style=\"position:absolute;inset:0;border-radius:50%;border:2px solid var(--coral);animation:burst 2s infinite\"></div><svg viewBox=\"0 0 24 24\" width=\"36\" height=\"36\" style=\"animation:heart 2s infinite;stroke:var(--coral);stroke-width:2;fill:transparent\"><path d=\"M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.7 0 5.9 3.8 4.5 7.2C19.5 16.4 12 21 12 21z\"/></svg></div>",
    "code": "const scale = useSharedValue(1);\nconst onLike = () => {\n  scale.value = withSequence(\n    withTiming(0.6, { duration: 90 }),\n    withSpring(1.25, { damping: 4 }),\n    withSpring(1),\n  );\n  setLiked(v => !v);\n};\nconst style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));",
    "codeV4": "const scale = useSharedValue(1);\nconst onLike = () => {\n  scale.value = withSequence(\n    withTiming(0.6, { duration: 90 }),\n    withSpring(1.25, { damping: 4 }),\n    withSpring(1),\n  );\n  setLiked(v => !v);\n};\nconst style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));",
    "apisV4": [
      "withSequence",
      "withSpring"
    ]
  },
  {
    "id": "drag-snap",
    "name": "Drag and snap",
    "level": "adv",
    "description": "Drag a view anywhere, then spring back to its origin on release.",
    "apis": [
      "Gesture.Pan",
      "useSharedValue",
      "withSpring"
    ],
    "demo": "<div class=\"b\" style=\"animation:drag 2.6s ease-in-out infinite\"></div>",
    "code": "const x = useSharedValue(0), y = useSharedValue(0);\nconst sx = useSharedValue(0), sy = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onStart(() => { sx.value = x.value; sy.value = y.value; })\n  .onUpdate(e => { x.value = sx.value + e.translationX; y.value = sy.value + e.translationY; })\n  .onEnd(() => { x.value = withSpring(0); y.value = withSpring(0); });\nconst style = useAnimatedStyle(() => ({\n  transform: [{ translateX: x.value }, { translateY: y.value }],\n}));\nreturn <GestureDetector gesture={pan}><Animated.View style={[styles.box, style]} /></GestureDetector>;",
    "codeV4": "const x = useSharedValue(0), y = useSharedValue(0);\nconst sx = useSharedValue(0), sy = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onStart(() => { sx.value = x.value; sy.value = y.value; })\n  .onUpdate(e => { x.value = sx.value + e.translationX; y.value = sy.value + e.translationY; })\n  .onEnd(() => { x.value = withSpring(0); y.value = withSpring(0); });\nconst style = useAnimatedStyle(() => ({\n  transform: [{ translateX: x.value }, { translateY: y.value }],\n}));\nreturn <GestureDetector gesture={pan}><Animated.View style={[styles.box, style]} /></GestureDetector>;",
    "apisV4": [
      "Gesture.Pan",
      "useSharedValue",
      "withSpring"
    ]
  },
  {
    "id": "swipe-stack",
    "name": "Swipe card stack",
    "level": "adv",
    "description": "Tinder-style cards: drag past a threshold to fling off screen, otherwise snap back.",
    "apis": [
      "Gesture.Pan",
      "runOnJS",
      "interpolate"
    ],
    "demo": "<div style=\"position:relative;width:70px;height:90px\"><div style=\"position:absolute;inset:6px -6px -6px 6px;border-radius:10px;background:var(--line)\"></div><div style=\"position:absolute;inset:0;border-radius:10px;background:var(--accent);animation:swipe 2.6s ease-in infinite\"></div></div>",
    "code": "const x = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onUpdate(e => { x.value = e.translationX; })\n  .onEnd(e => {\n    if (Math.abs(x.value) > 120 || Math.abs(e.velocityX) > 800) {\n      x.value = withTiming(Math.sign(x.value) * 500, {}, () => runOnJS(onSwiped)());\n    } else {\n      x.value = withSpring(0);\n    }\n  });\nconst style = useAnimatedStyle(() => ({\n  transform: [\n    { translateX: x.value },\n    { rotate: interpolate(x.value, [-200, 200], [-15, 15]) + 'deg' },\n  ],\n}));",
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst x = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onUpdate(e => { x.value = e.translationX; })\n  .onEnd(e => {\n    if (Math.abs(x.value) > 120 || Math.abs(e.velocityX) > 800) {\n      x.value = withTiming(Math.sign(x.value) * 500, {}, () => scheduleOnRN(onSwiped));\n    } else {\n      x.value = withSpring(0);\n    }\n  });\nconst style = useAnimatedStyle(() => ({\n  transform: [\n    { translateX: x.value },\n    { rotate: interpolate(x.value, [-200, 200], [-15, 15]) + 'deg' },\n  ],\n}));",
    "apisV4": [
      "Gesture.Pan",
      "scheduleOnRN",
      "interpolate"
    ]
  },
  {
    "id": "bottom-sheet",
    "name": "Bottom sheet",
    "level": "adv",
    "description": "Drag-to-dismiss sheet with snap points and a velocity check.",
    "apis": [
      "Gesture.Pan",
      "clamp",
      "withSpring"
    ],
    "demo": "<div style=\"position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center\"><div style=\"width:80%;height:90px;border-radius:14px 14px 0 0;background:var(--surface);border:1px solid var(--line);animation:sheet 3.2s ease-in-out infinite;display:flex;justify-content:center;padding-top:6px\"><div style=\"width:30px;height:4px;border-radius:9px;background:var(--line)\"></div></div></div>",
    "code": "const SNAPS = [0, 300]; // open, closed (translateY)\nconst y = useSharedValue(SNAPS[1]);\nconst start = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onStart(() => { start.value = y.value; })\n  .onUpdate(e => { y.value = clamp(start.value + e.translationY, 0, SNAPS[1]); })\n  .onEnd(e => {\n    const target = e.velocityY > 500 || y.value > SNAPS[1] / 2 ? SNAPS[1] : SNAPS[0];\n    y.value = withSpring(target, { damping: 20 });\n  });\nconst style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));",
    "codeV4": "const SNAPS = [0, 300]; // open, closed (translateY)\nconst y = useSharedValue(SNAPS[1]);\nconst start = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onStart(() => { start.value = y.value; })\n  .onUpdate(e => { y.value = clamp(start.value + e.translationY, 0, SNAPS[1]); })\n  .onEnd(e => {\n    const target = e.velocityY > 500 || y.value > SNAPS[1] / 2 ? SNAPS[1] : SNAPS[0];\n    y.value = withSpring(target, { damping: 20 });\n  });\nconst style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));",
    "apisV4": [
      "Gesture.Pan",
      "clamp",
      "withSpring"
    ]
  },
  {
    "id": "card-flip",
    "name": "3D card flip",
    "level": "adv",
    "description": "Flip a card to show its back face, using perspective and backface hiding.",
    "apis": [
      "rotateY",
      "perspective",
      "backfaceVisibility"
    ],
    "demo": "<div style=\"perspective:300px\"><div style=\"width:64px;height:86px;position:relative;transform-style:preserve-3d;animation:flip 3s ease-in-out infinite\"><div style=\"position:absolute;inset:0;border-radius:10px;background:var(--accent);backface-visibility:hidden\"></div><div style=\"position:absolute;inset:0;border-radius:10px;background:var(--coral);backface-visibility:hidden;transform:rotateY(180deg)\"></div></div></div>",
    "code": "const r = useSharedValue(0);\nconst flip = () => { r.value = withTiming(r.value ? 0 : 180, { duration: 500 }); };\nconst front = useAnimatedStyle(() => ({\n  transform: [{ perspective: 800 }, { rotateY: r.value + 'deg' }],\n  backfaceVisibility: 'hidden',\n}));\nconst back = useAnimatedStyle(() => ({\n  transform: [{ perspective: 800 }, { rotateY: r.value + 180 + 'deg' }],\n  backfaceVisibility: 'hidden',\n}));\n// stack both faces with position: 'absolute'",
    "codeV4": "const r = useSharedValue(0);\nconst flip = () => { r.value = withTiming(r.value ? 0 : 180, { duration: 500 }); };\nconst front = useAnimatedStyle(() => ({\n  transform: [{ perspective: 800 }, { rotateY: r.value + 'deg' }],\n  backfaceVisibility: 'hidden',\n}));\nconst back = useAnimatedStyle(() => ({\n  transform: [{ perspective: 800 }, { rotateY: r.value + 180 + 'deg' }],\n  backfaceVisibility: 'hidden',\n}));\n// stack both faces with position: 'absolute'",
    "apisV4": [
      "rotateY",
      "perspective",
      "backfaceVisibility"
    ]
  },
  {
    "id": "parallax-header",
    "name": "Collapsing header",
    "level": "adv",
    "description": "Header shrinks and its image moves slower than the list as you scroll.",
    "apis": [
      "useAnimatedScrollHandler",
      "interpolate",
      "Extrapolation"
    ],
    "demo": "<div style=\"width:140px;height:100px;border-radius:10px;overflow:hidden;background:var(--surface);border:1px solid var(--line)\"><div style=\"background:var(--accent);animation:hdr 3s ease-in-out infinite\"></div><div style=\"padding:6px;display:grid;gap:5px;animation:lst 3s ease-in-out infinite\"><div style=\"height:9px;border-radius:3px;background:var(--line)\"></div><div style=\"height:9px;border-radius:3px;background:var(--line)\"></div><div style=\"height:9px;border-radius:3px;background:var(--line)\"></div><div style=\"height:9px;border-radius:3px;background:var(--line)\"></div><div style=\"height:9px;border-radius:3px;background:var(--line)\"></div><div style=\"height:9px;border-radius:3px;background:var(--line)\"></div></div></div>",
    "code": "const scrollY = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });\nconst header = useAnimatedStyle(() => ({\n  height: interpolate(scrollY.value, [0, 150], [220, 80], Extrapolation.CLAMP),\n}));\nconst image = useAnimatedStyle(() => ({\n  transform: [{ translateY: scrollY.value * 0.5 }],\n  opacity: interpolate(scrollY.value, [0, 150], [1, 0.2], Extrapolation.CLAMP),\n}));\nreturn <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>{/* ... */}</Animated.ScrollView>;",
    "codeV4": "const scrollY = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });\nconst header = useAnimatedStyle(() => ({\n  height: interpolate(scrollY.value, [0, 150], [220, 80], Extrapolation.CLAMP),\n}));\nconst image = useAnimatedStyle(() => ({\n  transform: [{ translateY: scrollY.value * 0.5 }],\n  opacity: interpolate(scrollY.value, [0, 150], [1, 0.2], Extrapolation.CLAMP),\n}));\nreturn <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>{/* ... */}</Animated.ScrollView>;",
    "apisV4": [
      "useAnimatedScrollHandler",
      "interpolate",
      "Extrapolation"
    ]
  },
  {
    "id": "pinch-zoom",
    "name": "Pinch to zoom",
    "level": "adv",
    "description": "Pinch to scale an image with a min and max, combined with pan.",
    "apis": [
      "Gesture.Pinch",
      "Gesture.Simultaneous"
    ],
    "demo": "<div style=\"width:60px;height:60px;border-radius:8px;background:var(--accent);animation:zoom 2.8s ease-in-out infinite;display:flex;align-items:center;justify-content:center\"><div style=\"width:20px;height:20px;border-radius:50%;background:var(--surface)\"></div></div>",
    "code": "const scale = useSharedValue(1), saved = useSharedValue(1);\nconst pinch = Gesture.Pinch()\n  .onUpdate(e => { scale.value = clamp(saved.value * e.scale, 1, 4); })\n  .onEnd(() => { saved.value = scale.value; });\nconst reset = Gesture.Tap().numberOfTaps(2)\n  .onEnd(() => { scale.value = withSpring(1); saved.value = 1; });\nconst style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));\nreturn (\n  <GestureDetector gesture={Gesture.Simultaneous(pinch, reset)}>\n    <Animated.Image source={src} style={[styles.img, style]} />\n  </GestureDetector>\n);",
    "codeV4": "const scale = useSharedValue(1), saved = useSharedValue(1);\nconst pinch = Gesture.Pinch()\n  .onUpdate(e => { scale.value = clamp(saved.value * e.scale, 1, 4); })\n  .onEnd(() => { saved.value = scale.value; });\nconst reset = Gesture.Tap().numberOfTaps(2)\n  .onEnd(() => { scale.value = withSpring(1); saved.value = 1; });\nconst style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));\nreturn (\n  <GestureDetector gesture={Gesture.Simultaneous(pinch, reset)}>\n    <Animated.Image source={src} style={[styles.img, style]} />\n  </GestureDetector>\n);",
    "apisV4": [
      "Gesture.Pinch",
      "Gesture.Simultaneous"
    ]
  },
  {
    "id": "tab-indicator",
    "name": "Sliding tab indicator",
    "level": "adv",
    "description": "An underline moves and resizes to match the selected tab, using measured layouts.",
    "apis": [
      "onLayout",
      "withSpring",
      "width"
    ],
    "demo": "<div style=\"position:relative;display:flex;gap:16px;font-size:12px;padding-bottom:8px\"><span style=\"width:40px\">Home</span><span style=\"width:52px\">Explore</span><span style=\"width:40px\">You</span><div style=\"position:absolute;left:-3px;bottom:0;height:3px;border-radius:3px;background:var(--accent);animation:tab 4s cubic-bezier(.3,1.3,.5,1) infinite\"></div></div>",
    "code": "const layouts = useRef([]);\nconst x = useSharedValue(0), w = useSharedValue(0);\nuseEffect(() => {\n  const l = layouts.current[active];\n  if (l) { x.value = withSpring(l.x, { damping: 18 }); w.value = withSpring(l.width, { damping: 18 }); }\n}, [active]);\nconst indicator = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }] }));\n// each tab: onLayout={e => (layouts.current[i] = e.nativeEvent.layout)}",
    "codeV4": "const layouts = useRef([]);\nconst x = useSharedValue(0), w = useSharedValue(0);\nuseEffect(() => {\n  const l = layouts.current[active];\n  if (l) { x.value = withSpring(l.x, { damping: 18 }); w.value = withSpring(l.width, { damping: 18 }); }\n}, [active]);\nconst indicator = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }] }));\n// each tab: onLayout={e => (layouts.current[i] = e.nativeEvent.layout)}",
    "apisV4": [
      "onLayout",
      "withSpring",
      "width"
    ]
  },
  {
    "id": "swipe-delete",
    "name": "Swipe to delete",
    "level": "adv",
    "description": "Swipe a row left to reveal a delete action; collapse the row when removed.",
    "apis": [
      "Gesture.Pan",
      "activeOffsetX",
      "exiting"
    ],
    "demo": "<div style=\"position:relative;width:180px;height:42px;border-radius:8px;background:var(--danger);overflow:hidden\"><div style=\"position:absolute;right:12px;top:12px;width:40px;height:18px;border-radius:4px;background:var(--surface);opacity:.85\"></div><div style=\"position:absolute;inset:0;background:var(--surface);border:1px solid var(--line);border-radius:8px;animation:row 3s ease-in-out infinite;display:flex;align-items:center;padding:0 10px\"><div style=\"width:90px;height:9px;border-radius:3px;background:var(--line)\"></div></div></div>",
    "code": "const x = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .activeOffsetX([-10, 10])\n  .onUpdate(e => { x.value = Math.min(0, e.translationX); })\n  .onEnd(() => {\n    if (x.value < -160) runOnJS(onDelete)(id);\n    else x.value = withSpring(x.value < -60 ? -80 : 0);\n  });\nconst row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));\n// wrap the row in <Animated.View exiting={FadeOut} layout={LinearTransition}>",
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst x = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .activeOffsetX([-10, 10])\n  .onUpdate(e => { x.value = Math.min(0, e.translationX); })\n  .onEnd(() => {\n    if (x.value < -160) scheduleOnRN(onDelete, id);\n    else x.value = withSpring(x.value < -60 ? -80 : 0);\n  });\nconst row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));\n// wrap the row in <Animated.View exiting={FadeOut} layout={LinearTransition}>",
    "apisV4": [
      "Gesture.Pan",
      "activeOffsetX",
      "exiting"
    ]
  },
  {
    "id": "ripple",
    "name": "Tap ripple",
    "level": "basic",
    "description": "A circle grows from the exact tap point and fades out, clipped to the button.",
    "apis": [
      "Gesture.Tap",
      "withTiming"
    ],
    "demo": "<div style=\"position:relative;width:140px;height:44px;border-radius:10px;background:var(--accent);overflow:hidden\"><div style=\"position:absolute;left:30px;top:-40px;width:130px;height:130px;margin-left:-65px;border-radius:50%;background:var(--surface);animation:rip 1.4s ease-out infinite\"></div></div>",
    "code": "const cx = useSharedValue(0), cy = useSharedValue(0), p = useSharedValue(1);\nconst tap = Gesture.Tap().onBegin(e => {\n  cx.value = e.x; cy.value = e.y;\n  p.value = 0; p.value = withTiming(1, { duration: 500 });\n});\nconst SIZE = Math.hypot(w, h) * 2; // w, h from onLayout\nconst ripple = useAnimatedStyle(() => ({\n  position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2,\n  left: cx.value - SIZE / 2, top: cy.value - SIZE / 2,\n  backgroundColor: 'rgba(255,255,255,0.35)',\n  opacity: 1 - p.value, transform: [{ scale: p.value }],\n}));\n// parent view needs overflow: 'hidden'",
    "source": {
      "app": "Material",
      "path": "the-10-min/src/Ripple",
      "query": "ripple effect"
    },
    "codeV4": "const cx = useSharedValue(0), cy = useSharedValue(0), p = useSharedValue(1);\nconst tap = Gesture.Tap().onBegin(e => {\n  cx.value = e.x; cy.value = e.y;\n  p.value = 0; p.value = withTiming(1, { duration: 500 });\n});\nconst SIZE = Math.hypot(w, h) * 2; // w, h from onLayout\nconst ripple = useAnimatedStyle(() => ({\n  position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2,\n  left: cx.value - SIZE / 2, top: cy.value - SIZE / 2,\n  backgroundColor: 'rgba(255,255,255,0.35)',\n  opacity: 1 - p.value, transform: [{ scale: p.value }],\n}));\n// parent view needs overflow: 'hidden'",
    "apisV4": [
      "Gesture.Tap",
      "withTiming"
    ]
  },
  {
    "id": "dvd-bounce",
    "name": "DVD logo bounce",
    "level": "basic",
    "description": "Bounce a logo off the screen edges forever by running X and Y as two independent ping-pong timings.",
    "apis": [
      "withRepeat",
      "Easing.linear",
      "useAnimatedReaction"
    ],
    "demo": "<div style=\"position:absolute;width:46px;height:24px;border-radius:6px;background:var(--coral);animation:dvdx 2.3s linear infinite alternate,dvdy 1.7s linear infinite alternate\"></div>",
    "code": "const x = useSharedValue(0), y = useSharedValue(0);\nconst SPEED = 80; // px per second\nuseEffect(() => {\n  x.value = withRepeat(withTiming(W - LOGO_W, { duration: (W / SPEED) * 1000, easing: Easing.linear }), -1, true);\n  y.value = withRepeat(withTiming(H - LOGO_H, { duration: (H / SPEED) * 1000, easing: Easing.linear }), -1, true);\n}, []);\n// change color on every wall hit\nuseAnimatedReaction(\n  () => x.value <= 0 || x.value >= W - LOGO_W || y.value <= 0 || y.value >= H - LOGO_H,\n  (hit, prev) => { if (hit && !prev) runOnJS(nextColor)(); },\n);\nconst style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));",
    "source": {
      "app": "DVD screensaver",
      "path": "reanimated-2/src/DVDLogo",
      "query": "DVD logo"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst x = useSharedValue(0), y = useSharedValue(0);\nconst SPEED = 80; // px per second\nuseEffect(() => {\n  x.value = withRepeat(withTiming(W - LOGO_W, { duration: (W / SPEED) * 1000, easing: Easing.linear }), -1, true);\n  y.value = withRepeat(withTiming(H - LOGO_H, { duration: (H / SPEED) * 1000, easing: Easing.linear }), -1, true);\n}, []);\n// change color on every wall hit\nuseAnimatedReaction(\n  () => x.value <= 0 || x.value >= W - LOGO_W || y.value <= 0 || y.value >= H - LOGO_H,\n  (hit, prev) => { if (hit && !prev) scheduleOnRN(nextColor); },\n);\nconst style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));",
    "apisV4": [
      "withRepeat",
      "Easing.linear",
      "useAnimatedReaction"
    ]
  },
  {
    "id": "stroke-draw",
    "name": "Stroke draw",
    "level": "mid",
    "description": "Draw an SVG path line by line, like a signature or logo reveal.",
    "apis": [
      "useAnimatedProps",
      "strokeDashoffset",
      "react-native-svg"
    ],
    "demo": "<svg viewBox=\"0 0 120 60\" width=\"150\" height=\"75\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"4\" stroke-linecap=\"round\"><path pathLength=\"100\" stroke-dasharray=\"100\" style=\"animation:draw 3s ease-in-out infinite\" d=\"M8 44 C 20 8, 34 8, 40 30 S 58 56, 66 30 S 84 4, 92 26 S 104 52, 112 18\"/></svg>",
    "code": "import { svgPathProperties } from 'svg-path-properties';\nconst AnimatedPath = Animated.createAnimatedComponent(Path);\nconst LENGTH = new svgPathProperties(d).getTotalLength();\nconst p = useSharedValue(0);\nuseEffect(() => {\n  p.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });\n}, []);\nconst props = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - p.value) }));\nreturn (\n  <Svg viewBox=\"0 0 120 60\">\n    <AnimatedPath d={d} stroke=\"#0B7A93\" strokeWidth={4} fill=\"none\"\n      strokeDasharray={LENGTH} animatedProps={props} />\n  </Svg>\n);",
    "source": {
      "app": "Stroke animation",
      "path": "reanimated-2/src/StrokeAnimation",
      "query": "stroke animation"
    },
    "codeV4": "import { svgPathProperties } from 'svg-path-properties';\nconst AnimatedPath = Animated.createAnimatedComponent(Path);\nconst LENGTH = new svgPathProperties(d).getTotalLength();\nconst p = useSharedValue(0);\nuseEffect(() => {\n  p.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });\n}, []);\nconst props = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - p.value) }));\nreturn (\n  <Svg viewBox=\"0 0 120 60\">\n    <AnimatedPath d={d} stroke=\"#0B7A93\" strokeWidth={4} fill=\"none\"\n      strokeDasharray={LENGTH} animatedProps={props} />\n  </Svg>\n);",
    "apisV4": [
      "useAnimatedProps",
      "strokeDashoffset",
      "react-native-svg"
    ]
  },
  {
    "id": "activity-rings",
    "name": "Activity rings",
    "level": "mid",
    "description": "Three concentric progress rings fill up with an ease-out, like the Apple Watch rings.",
    "apis": [
      "useAnimatedProps",
      "strokeDashoffset",
      "react-native-svg"
    ],
    "demo": "<svg viewBox=\"0 0 100 100\" width=\"96\" height=\"96\" fill=\"none\" stroke-width=\"9\" stroke-linecap=\"round\" style=\"transform:rotate(-90deg)\"><circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"var(--line)\"/><circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"var(--coral)\" pathLength=\"100\" stroke-dasharray=\"100\" style=\"--to:22;animation:rf 3s ease-out infinite\"/><circle cx=\"50\" cy=\"50\" r=\"29\" stroke=\"var(--line)\"/><circle cx=\"50\" cy=\"50\" r=\"29\" stroke=\"var(--basic)\" pathLength=\"100\" stroke-dasharray=\"100\" style=\"--to:45;animation:rf 3s ease-out infinite\"/><circle cx=\"50\" cy=\"50\" r=\"18\" stroke=\"var(--line)\"/><circle cx=\"50\" cy=\"50\" r=\"18\" stroke=\"var(--accent)\" pathLength=\"100\" stroke-dasharray=\"100\" style=\"--to:10;animation:rf 3s ease-out infinite\"/></svg>",
    "code": "const AnimatedCircle = Animated.createAnimatedComponent(Circle);\nfunction Ring({ r, progress, color }) {\n  const C = 2 * Math.PI * r;\n  const p = useSharedValue(0);\n  useEffect(() => {\n    p.value = withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) });\n  }, [progress]);\n  const props = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.value) }));\n  return (\n    <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke={color} strokeWidth={STROKE}\n      strokeLinecap=\"round\" fill=\"none\" strokeDasharray={C} animatedProps={props} />\n  );\n}\n// <Svg style={{ transform: [{ rotate: '-90deg' }] }}> with three Rings of decreasing r",
    "source": {
      "app": "Apple Activity",
      "path": "season3/src/AppleActivity",
      "query": "Apple Activity"
    },
    "codeV4": "const AnimatedCircle = Animated.createAnimatedComponent(Circle);\nfunction Ring({ r, progress, color }) {\n  const C = 2 * Math.PI * r;\n  const p = useSharedValue(0);\n  useEffect(() => {\n    p.value = withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) });\n  }, [progress]);\n  const props = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.value) }));\n  return (\n    <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke={color} strokeWidth={STROKE}\n      strokeLinecap=\"round\" fill=\"none\" strokeDasharray={C} animatedProps={props} />\n  );\n}\n// <Svg style={{ transform: [{ rotate: '-90deg' }] }}> with three Rings of decreasing r",
    "apisV4": [
      "useAnimatedProps",
      "strokeDashoffset",
      "react-native-svg"
    ]
  },
  {
    "id": "breathe",
    "name": "Breathe bloom",
    "level": "mid",
    "description": "Six petals expand outward and rotate in a slow in-out loop, for a breathing exercise.",
    "apis": [
      "withRepeat",
      "Easing.inOut",
      "trigonometry"
    ],
    "demo": "<div style=\"position:relative;width:20px;height:20px;animation:bspin 6s ease-in-out infinite\"><div style=\"position:absolute;left:-10px;top:-10px;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:.45;--a:0deg;animation:petal 6s ease-in-out infinite\"></div><div style=\"position:absolute;left:-10px;top:-10px;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:.45;--a:60deg;animation:petal 6s ease-in-out infinite\"></div><div style=\"position:absolute;left:-10px;top:-10px;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:.45;--a:120deg;animation:petal 6s ease-in-out infinite\"></div><div style=\"position:absolute;left:-10px;top:-10px;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:.45;--a:180deg;animation:petal 6s ease-in-out infinite\"></div><div style=\"position:absolute;left:-10px;top:-10px;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:.45;--a:240deg;animation:petal 6s ease-in-out infinite\"></div><div style=\"position:absolute;left:-10px;top:-10px;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:.45;--a:300deg;animation:petal 6s ease-in-out infinite\"></div></div>",
    "code": "const p = useSharedValue(0);\nuseEffect(() => {\n  p.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);\n}, []);\nconst container = useAnimatedStyle(() => ({ transform: [{ rotate: p.value * Math.PI + 'rad' }] }));\nfunction Petal({ index, p }) {\n  const style = useAnimatedStyle(() => {\n    const a = (index / 6) * 2 * Math.PI;\n    const d = interpolate(p.value, [0, 1], [0, R / 2]);\n    return {\n      transform: [\n        { translateX: Math.cos(a) * d }, { translateY: Math.sin(a) * d },\n        { scale: interpolate(p.value, [0, 1], [0.4, 1]) },\n      ],\n    };\n  });\n  return <Animated.View style={[styles.petal, style]} />; // absolute, round, semi-transparent\n}",
    "source": {
      "app": "Headspace",
      "path": "reanimated-2/src/Breathe",
      "query": "breathe"
    },
    "codeV4": "const p = useSharedValue(0);\nuseEffect(() => {\n  p.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);\n}, []);\nconst container = useAnimatedStyle(() => ({ transform: [{ rotate: p.value * Math.PI + 'rad' }] }));\nfunction Petal({ index, p }) {\n  const style = useAnimatedStyle(() => {\n    const a = (index / 6) * 2 * Math.PI;\n    const d = interpolate(p.value, [0, 1], [0, R / 2]);\n    return {\n      transform: [\n        { translateX: Math.cos(a) * d }, { translateY: Math.sin(a) * d },\n        { scale: interpolate(p.value, [0, 1], [0.4, 1]) },\n      ],\n    };\n  });\n  return <Animated.View style={[styles.petal, style]} />; // absolute, round, semi-transparent\n}",
    "apisV4": [
      "withRepeat",
      "Easing.inOut",
      "trigonometry"
    ]
  },
  {
    "id": "swipe-reply",
    "name": "Swipe to reply",
    "level": "mid",
    "description": "Drag a chat bubble right; a reply icon grows in and a haptic fires at the threshold.",
    "apis": [
      "Gesture.Pan",
      "failOffsetY",
      "runOnJS"
    ],
    "demo": "<div style=\"position:relative;width:170px;height:40px\"><div style=\"position:absolute;left:4px;top:10px;width:20px;height:20px;border-radius:50%;background:var(--accent-soft);animation:repi 2.6s infinite\"></div><div style=\"position:absolute;inset:0;border-radius:12px 12px 12px 4px;background:var(--surface);border:1px solid var(--line);animation:rep 2.6s cubic-bezier(.3,1.3,.5,1) infinite;display:flex;align-items:center;padding:0 10px\"><div style=\"width:100px;height:8px;border-radius:3px;background:var(--line)\"></div></div></div>",
    "code": "const x = useSharedValue(0), fired = useSharedValue(false);\nconst pan = Gesture.Pan()\n  .activeOffsetX(15).failOffsetY([-10, 10]) // keep vertical list scrolling\n  .onUpdate(e => {\n    x.value = clamp(e.translationX * 0.6, 0, 80);\n    if (x.value >= 70 && !fired.value) {\n      fired.value = true;\n      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);\n    }\n  })\n  .onEnd(() => {\n    if (fired.value) runOnJS(onReply)(message);\n    x.value = withSpring(0); fired.value = false;\n  });\nconst bubble = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));\nconst icon = useAnimatedStyle(() => ({\n  opacity: x.value / 70,\n  transform: [{ scale: interpolate(x.value, [0, 70], [0.5, 1], Extrapolation.CLAMP) }],\n}));",
    "source": {
      "app": "WhatsApp",
      "path": "season3/src/WhatsApp",
      "query": "WhatsApp"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst x = useSharedValue(0), fired = useSharedValue(false);\nconst pan = Gesture.Pan()\n  .activeOffsetX(15).failOffsetY([-10, 10]) // keep vertical list scrolling\n  .onUpdate(e => {\n    x.value = clamp(e.translationX * 0.6, 0, 80);\n    if (x.value >= 70 && !fired.value) {\n      fired.value = true;\n      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);\n    }\n  })\n  .onEnd(() => {\n    if (fired.value) scheduleOnRN(onReply, message);\n    x.value = withSpring(0); fired.value = false;\n  });\nconst bubble = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));\nconst icon = useAnimatedStyle(() => ({\n  opacity: x.value / 70,\n  transform: [{ scale: interpolate(x.value, [0, 70], [0.5, 1], Extrapolation.CLAMP) }],\n}));",
    "apisV4": [
      "Gesture.Pan",
      "failOffsetY",
      "scheduleOnRN"
    ]
  },
  {
    "id": "spotify-header",
    "name": "Album header",
    "level": "mid",
    "description": "Cover art shrinks and fades as you scroll; a compact title bar fades in on top.",
    "apis": [
      "useAnimatedScrollHandler",
      "interpolate"
    ],
    "demo": "<div style=\"position:relative;width:150px;height:100px;border-radius:10px;background:var(--surface);border:1px solid var(--line);overflow:hidden;display:grid;justify-items:center;align-content:start;padding-top:8px;gap:6px\"><div style=\"position:absolute;inset:0 0 auto;height:20px;background:var(--accent-soft);animation:cov2 3s ease-in-out infinite\"></div><div style=\"width:48px;height:48px;border-radius:6px;background:var(--accent);animation:cov 3s ease-in-out infinite\"></div><div style=\"width:120px;height:8px;border-radius:3px;background:var(--line)\"></div><div style=\"width:120px;height:8px;border-radius:3px;background:var(--line)\"></div><div style=\"width:120px;height:8px;border-radius:3px;background:var(--line)\"></div></div>",
    "code": "const y = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { y.value = e.contentOffset.y; });\nconst cover = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [0, 200], [1, 0], Extrapolation.CLAMP),\n  transform: [{ scale: interpolate(y.value, [-100, 0, 200], [1.3, 1, 0.7], Extrapolation.CLAMP) }],\n}));\nconst titleBar = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [180, 240], [0, 1], Extrapolation.CLAMP),\n}));\n// sticky play button: translateY: Math.max(0, y.value - PLAY_BUTTON_Y)\nreturn <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>{/* ... */}</Animated.ScrollView>;",
    "source": {
      "app": "Spotify",
      "path": "season2/spotify-header",
      "query": "Spotify header"
    },
    "codeV4": "const y = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { y.value = e.contentOffset.y; });\nconst cover = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [0, 200], [1, 0], Extrapolation.CLAMP),\n  transform: [{ scale: interpolate(y.value, [-100, 0, 200], [1.3, 1, 0.7], Extrapolation.CLAMP) }],\n}));\nconst titleBar = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [180, 240], [0, 1], Extrapolation.CLAMP),\n}));\n// sticky play button: translateY: Math.max(0, y.value - PLAY_BUTTON_Y)\nreturn <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>{/* ... */}</Animated.ScrollView>;",
    "apisV4": [
      "useAnimatedScrollHandler",
      "interpolate"
    ]
  },
  {
    "id": "pull-refresh",
    "name": "Custom pull to refresh",
    "level": "mid",
    "description": "Pull the list down to reveal a growing, rotating icon; release past the threshold to refresh.",
    "apis": [
      "useAnimatedScrollHandler",
      "onEndDrag",
      "runOnJS"
    ],
    "demo": "<div style=\"position:relative;width:150px;height:100px;border-radius:10px;background:var(--surface);border:1px solid var(--line);overflow:hidden\"><div style=\"position:absolute;left:50%;top:8px;margin-left:-10px;animation:plo 2.8s infinite\"><div style=\"width:20px;height:20px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--accent);animation:spin .8s linear infinite\"></div></div><div style=\"padding:8px;display:grid;gap:6px;animation:pl 2.8s ease-in-out infinite\"><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div></div></div>",
    "code": "const pull = useSharedValue(0), refreshing = useSharedValue(false);\nconst onScroll = useAnimatedScrollHandler({\n  onScroll: e => { pull.value = Math.max(0, -e.contentOffset.y); },\n  onEndDrag: () => {\n    if (pull.value > 80 && !refreshing.value) {\n      refreshing.value = true;\n      runOnJS(onRefresh)(); // set refreshing.value = false when done\n    }\n  },\n});\nconst icon = useAnimatedStyle(() => ({\n  opacity: interpolate(pull.value, [0, 80], [0, 1], Extrapolation.CLAMP),\n  transform: [\n    { scale: interpolate(pull.value, [0, 80], [0.5, 1], Extrapolation.CLAMP) },\n    { rotate: pull.value * 3 + 'deg' },\n  ],\n}));\n// iOS bounce gives negative offsets. On Android, drive pull from a Gesture.Pan instead.",
    "source": {
      "app": "Google Chrome",
      "path": "season2/google-chrome-refresh",
      "query": "Chrome refresh"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst pull = useSharedValue(0), refreshing = useSharedValue(false);\nconst onScroll = useAnimatedScrollHandler({\n  onScroll: e => { pull.value = Math.max(0, -e.contentOffset.y); },\n  onEndDrag: () => {\n    if (pull.value > 80 && !refreshing.value) {\n      refreshing.value = true;\n      scheduleOnRN(onRefresh); // set refreshing.value = false when done\n    }\n  },\n});\nconst icon = useAnimatedStyle(() => ({\n  opacity: interpolate(pull.value, [0, 80], [0, 1], Extrapolation.CLAMP),\n  transform: [\n    { scale: interpolate(pull.value, [0, 80], [0.5, 1], Extrapolation.CLAMP) },\n    { rotate: pull.value * 3 + 'deg' },\n  ],\n}));\n// iOS bounce gives negative offsets. On Android, drive pull from a Gesture.Pan instead.",
    "apisV4": [
      "useAnimatedScrollHandler",
      "onEndDrag",
      "scheduleOnRN"
    ]
  },
  {
    "id": "perspective-menu",
    "name": "3D side menu",
    "level": "mid",
    "description": "The whole screen tilts back in 3D and slides right to reveal a menu behind it.",
    "apis": [
      "perspective",
      "rotateY",
      "withSpring"
    ],
    "demo": "<div style=\"position:relative;width:170px;height:100px;border-radius:10px;overflow:hidden;background:var(--accent-soft)\"><div style=\"position:absolute;left:10px;top:14px;display:grid;gap:8px\"><div style=\"width:40px;height:7px;border-radius:3px;background:var(--accent)\"></div><div style=\"width:40px;height:7px;border-radius:3px;background:var(--accent)\"></div><div style=\"width:40px;height:7px;border-radius:3px;background:var(--accent)\"></div><div style=\"width:40px;height:7px;border-radius:3px;background:var(--accent)\"></div></div><div style=\"position:absolute;inset:0;background:var(--surface);border:1px solid var(--line);animation:pm 3s ease-in-out infinite;transform-origin:left center\"></div></div>",
    "code": "const open = useSharedValue(0);\nconst toggle = () => { open.value = withSpring(open.value ? 0 : 1, { damping: 18 }); };\nconst screen = useAnimatedStyle(() => ({\n  borderRadius: open.value * 24,\n  overflow: 'hidden',\n  transform: [\n    { perspective: 1000 },\n    { translateX: open.value * width * 0.6 },\n    { rotateY: open.value * -30 + 'deg' },\n    { scale: 1 - open.value * 0.2 },\n  ],\n}));\n// <Menu style={StyleSheet.absoluteFill} /> sits behind <Animated.View style={[styles.screen, screen]} />",
    "source": {
      "app": "Menu",
      "path": "the-10-min/src/Menu",
      "query": "menu"
    },
    "codeV4": "const open = useSharedValue(0);\nconst toggle = () => { open.value = withSpring(open.value ? 0 : 1, { damping: 18 }); };\nconst screen = useAnimatedStyle(() => ({\n  borderRadius: open.value * 24,\n  overflow: 'hidden',\n  transform: [\n    { perspective: 1000 },\n    { translateX: open.value * width * 0.6 },\n    { rotateY: open.value * -30 + 'deg' },\n    { scale: 1 - open.value * 0.2 },\n  ],\n}));\n// <Menu style={StyleSheet.absoluteFill} /> sits behind <Animated.View style={[styles.screen, screen]} />",
    "apisV4": [
      "perspective",
      "rotateY",
      "withSpring"
    ]
  },
  {
    "id": "stories-cube",
    "name": "Stories cube",
    "level": "adv",
    "description": "Swipe between stories and they rotate like the faces of a 3D cube.",
    "apis": [
      "useAnimatedScrollHandler",
      "rotateY",
      "perspective"
    ],
    "demo": "<div style=\"perspective:400px\"><div style=\"position:relative;width:70px;height:90px;transform-style:preserve-3d;animation:cube 3.4s ease-in-out infinite\"><div style=\"position:absolute;inset:0;border-radius:8px;background:var(--accent);transform:translateZ(35px)\"></div><div style=\"position:absolute;inset:0;border-radius:8px;background:var(--coral);transform:rotateY(90deg) translateZ(35px)\"></div></div></div>",
    "code": "const x = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { x.value = e.contentOffset.x; });\nfunction Story({ index, children }) {\n  const style = useAnimatedStyle(() => {\n    const offset = index * width - x.value;  // 0 = on screen, +width = next page\n    const angle = interpolate(offset, [-width, 0, width], [-90, 0, 90], Extrapolation.CLAMP);\n    const edge = offset > 0 ? -width / 2 : width / 2; // rotate around the shared edge\n    return {\n      transform: [\n        { perspective: 1000 },\n        { translateX: edge }, { rotateY: angle + 'deg' }, { translateX: -edge },\n      ],\n    };\n  });\n  return <Animated.View style={[{ width, height }, style]}>{children}</Animated.View>;\n}\n// <Animated.ScrollView horizontal pagingEnabled onScroll={onScroll} scrollEventThrottle={16}>\n// Flip the sign of angle if the cube opens inward on your setup.",
    "source": {
      "app": "Instagram",
      "path": "season1/instagram-stories",
      "query": "Instagram stories"
    },
    "codeV4": "const x = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { x.value = e.contentOffset.x; });\nfunction Story({ index, children }) {\n  const style = useAnimatedStyle(() => {\n    const offset = index * width - x.value;  // 0 = on screen, +width = next page\n    const angle = interpolate(offset, [-width, 0, width], [-90, 0, 90], Extrapolation.CLAMP);\n    const edge = offset > 0 ? -width / 2 : width / 2; // rotate around the shared edge\n    return {\n      transform: [\n        { perspective: 1000 },\n        { translateX: edge }, { rotateY: angle + 'deg' }, { translateX: -edge },\n      ],\n    };\n  });\n  return <Animated.View style={[{ width, height }, style]}>{children}</Animated.View>;\n}\n// <Animated.ScrollView horizontal pagingEnabled onScroll={onScroll} scrollEventThrottle={16}>\n// Flip the sign of angle if the cube opens inward on your setup.",
    "apisV4": [
      "useAnimatedScrollHandler",
      "rotateY",
      "perspective"
    ]
  },
  {
    "id": "circular-slider",
    "name": "Bedtime circular slider",
    "level": "adv",
    "description": "Drag a knob around a circle; the arc and the time label follow the angle.",
    "apis": [
      "Gesture.Pan",
      "Math.atan2",
      "useAnimatedProps"
    ],
    "demo": "<div style=\"position:relative;width:86px;height:86px;border-radius:50%;background:var(--line)\"><div style=\"position:absolute;inset:0;border-radius:50%;background:conic-gradient(var(--accent) 0 32%,transparent 32%);animation:rot 3.4s ease-in-out infinite\"><div style=\"position:absolute;left:50%;top:-1px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:var(--surface);border:3px solid var(--accent)\"></div></div><div style=\"position:absolute;inset:12px;border-radius:50%;background:var(--stage)\"></div></div>",
    "code": "const angle = useSharedValue(-Math.PI / 2); // radians, 0 = 3 o'clock\nconst pan = Gesture.Pan().onUpdate(e => {\n  angle.value = Math.atan2(e.y - R, e.x - R); // e.x/e.y are relative to the wheel\n});\nconst knob = useAnimatedStyle(() => ({\n  transform: [\n    { translateX: R + R * Math.cos(angle.value) - KNOB / 2 },\n    { translateY: R + R * Math.sin(angle.value) - KNOB / 2 },\n  ],\n}));\nconst C = 2 * Math.PI * R;\nconst arc = useAnimatedProps(() => {\n  const t = ((angle.value + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);\n  return { strokeDashoffset: C * (1 - t) };\n});\nconst hours = useDerivedValue(() => /* map t to 0..24 */ 0);",
    "source": {
      "app": "Apple Bedtime",
      "path": "season2/apple-bedtime",
      "query": "Apple bedtime"
    },
    "codeV4": "const angle = useSharedValue(-Math.PI / 2); // radians, 0 = 3 o'clock\nconst pan = Gesture.Pan().onUpdate(e => {\n  angle.value = Math.atan2(e.y - R, e.x - R); // e.x/e.y are relative to the wheel\n});\nconst knob = useAnimatedStyle(() => ({\n  transform: [\n    { translateX: R + R * Math.cos(angle.value) - KNOB / 2 },\n    { translateY: R + R * Math.sin(angle.value) - KNOB / 2 },\n  ],\n}));\nconst C = 2 * Math.PI * R;\nconst arc = useAnimatedProps(() => {\n  const t = ((angle.value + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);\n  return { strokeDashoffset: C * (1 - t) };\n});\nconst hours = useDerivedValue(() => /* map t to 0..24 */ 0);",
    "apisV4": [
      "Gesture.Pan",
      "Math.atan2",
      "useAnimatedProps"
    ]
  },
  {
    "id": "mini-player",
    "name": "Mini to full player",
    "level": "adv",
    "description": "A mini player bar expands into a full-screen player by dragging, and snaps open or closed.",
    "apis": [
      "Gesture.Pan",
      "withSpring",
      "interpolate"
    ],
    "demo": "<div style=\"position:absolute;background:var(--accent);animation:plyr 3s ease-in-out infinite\"></div>",
    "code": "const CLOSED = height - MINI_H, OPEN = 0;\nconst y = useSharedValue(CLOSED), start = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onStart(() => { start.value = y.value; })\n  .onUpdate(e => { y.value = clamp(start.value + e.translationY, OPEN, CLOSED); })\n  .onEnd(e => {\n    const dest = e.velocityY < -500 || y.value < CLOSED / 2 ? OPEN : CLOSED;\n    y.value = withSpring(dest, { damping: 20, velocity: e.velocityY });\n  });\nconst sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));\nconst mini = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [CLOSED - 120, CLOSED], [0, 1], Extrapolation.CLAMP),\n}));\nconst full = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [OPEN, CLOSED - 120], [1, 0], Extrapolation.CLAMP),\n}));",
    "source": {
      "app": "Spotify",
      "path": "season2/spotify-player",
      "query": "Spotify player"
    },
    "codeV4": "const CLOSED = height - MINI_H, OPEN = 0;\nconst y = useSharedValue(CLOSED), start = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onStart(() => { start.value = y.value; })\n  .onUpdate(e => { y.value = clamp(start.value + e.translationY, OPEN, CLOSED); })\n  .onEnd(e => {\n    const dest = e.velocityY < -500 || y.value < CLOSED / 2 ? OPEN : CLOSED;\n    y.value = withSpring(dest, { damping: 20, velocity: e.velocityY });\n  });\nconst sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));\nconst mini = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [CLOSED - 120, CLOSED], [0, 1], Extrapolation.CLAMP),\n}));\nconst full = useAnimatedStyle(() => ({\n  opacity: interpolate(y.value, [OPEN, CLOSED - 120], [1, 0], Extrapolation.CLAMP),\n}));",
    "apisV4": [
      "Gesture.Pan",
      "withSpring",
      "interpolate"
    ]
  },
  {
    "id": "liquid-swipe",
    "name": "Liquid swipe",
    "level": "adv",
    "description": "Onboarding where the next page pours in from the edge as a bulging liquid shape.",
    "apis": [
      "Gesture.Pan",
      "useAnimatedProps",
      "SVG Path"
    ],
    "demo": "<div style=\"position:absolute;inset:0;background:var(--accent-soft)\"></div><div style=\"position:absolute;inset:0;background:var(--coral);animation:liq 3s ease-in-out infinite\"></div>",
    "code": "const AnimatedPath = Animated.createAnimatedComponent(Path);\nconst x = useSharedValue(0), y = useSharedValue(height / 2);\nconst pan = Gesture.Pan()\n  .onUpdate(e => { x.value = Math.max(0, -e.translationX); y.value = e.absoluteY; })\n  .onEnd(e => {\n    const done = x.value > width / 3 || e.velocityX < -500;\n    x.value = withSpring(done ? width * 1.6 : 0, {}, fin => { if (fin && done) runOnJS(next)(); });\n  });\nconst props = useAnimatedProps(() => {\n  const edge = Math.max(0, width - x.value * 0.5); // how far the flat edge moved\n  const bulge = Math.min(x.value * 0.6, 160);       // how far the bump sticks out\n  const r = 40 + x.value * 0.5;                     // bump height\n  const top = y.value - r, bottom = y.value + r;\n  return {\n    d: 'M ' + width + ' 0 L ' + edge + ' 0 L ' + edge + ' ' + top +\n       ' C ' + edge + ' ' + (y.value - r / 2) + ' ' + (edge - bulge) + ' ' + (y.value - r / 2) + ' ' + (edge - bulge) + ' ' + y.value +\n       ' C ' + (edge - bulge) + ' ' + (y.value + r / 2) + ' ' + edge + ' ' + (y.value + r / 2) + ' ' + edge + ' ' + bottom +\n       ' L ' + edge + ' ' + height + ' L ' + width + ' ' + height + ' Z',\n  };\n});\n// <Svg style={StyleSheet.absoluteFill}><AnimatedPath fill={nextColor} animatedProps={props} /></Svg>",
    "source": {
      "app": "Liquid Swipe",
      "path": "season3/src/LiquidSwipe",
      "query": "liquid swipe"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst AnimatedPath = Animated.createAnimatedComponent(Path);\nconst x = useSharedValue(0), y = useSharedValue(height / 2);\nconst pan = Gesture.Pan()\n  .onUpdate(e => { x.value = Math.max(0, -e.translationX); y.value = e.absoluteY; })\n  .onEnd(e => {\n    const done = x.value > width / 3 || e.velocityX < -500;\n    x.value = withSpring(done ? width * 1.6 : 0, {}, fin => { if (fin && done) scheduleOnRN(next); });\n  });\nconst props = useAnimatedProps(() => {\n  const edge = Math.max(0, width - x.value * 0.5); // how far the flat edge moved\n  const bulge = Math.min(x.value * 0.6, 160);       // how far the bump sticks out\n  const r = 40 + x.value * 0.5;                     // bump height\n  const top = y.value - r, bottom = y.value + r;\n  return {\n    d: 'M ' + width + ' 0 L ' + edge + ' 0 L ' + edge + ' ' + top +\n       ' C ' + edge + ' ' + (y.value - r / 2) + ' ' + (edge - bulge) + ' ' + (y.value - r / 2) + ' ' + (edge - bulge) + ' ' + y.value +\n       ' C ' + (edge - bulge) + ' ' + (y.value + r / 2) + ' ' + edge + ' ' + (y.value + r / 2) + ' ' + edge + ' ' + bottom +\n       ' L ' + edge + ' ' + height + ' L ' + width + ' ' + height + ' Z',\n  };\n});\n// <Svg style={StyleSheet.absoluteFill}><AnimatedPath fill={nextColor} animatedProps={props} /></Svg>",
    "apisV4": [
      "Gesture.Pan",
      "useAnimatedProps",
      "SVG Path"
    ]
  },
  {
    "id": "chart-scrub",
    "name": "Price chart scrub",
    "level": "adv",
    "description": "Drag across a line chart; a cursor follows your finger and the price label updates on the UI thread.",
    "apis": [
      "Gesture.Pan",
      "useDerivedValue",
      "ReText"
    ],
    "demo": "<div style=\"position:relative;width:180px;height:80px\"><svg viewBox=\"0 0 180 80\" width=\"180\" height=\"80\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"2.5\"><polyline points=\"4,60 24,52 44,58 64,36 84,42 104,22 124,30 144,14 164,26 176,10\"/></svg><div style=\"position:absolute;top:0;bottom:0;width:2px;background:var(--coral);animation:scrub 3.4s ease-in-out infinite\"></div></div>",
    "code": "// path built with d3-shape: line().x(...).y(...).curve(curveBasis)(points)\nconst x = useSharedValue(WIDTH);\nconst pan = Gesture.Pan()\n  .onBegin(e => { x.value = clamp(e.x, 0, WIDTH); })\n  .onUpdate(e => { x.value = clamp(e.x, 0, WIDTH); })\n  .onEnd(() => { x.value = withTiming(WIDTH); });\nconst cursor = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));\nconst price = useDerivedValue(() => {\n  const i = Math.round((x.value / WIDTH) * (points.length - 1));\n  return '$' + points[i].value.toFixed(2);\n});\n// <ReText text={price} /> from react-native-redash (animated TextInput, no re-renders)\n// dot on the curve: translateY = getYForX(parsePath(d), x.value) from react-native-redash",
    "source": {
      "app": "Coinbase",
      "path": "reanimated-2/src/Coinbase",
      "query": "Coinbase"
    },
    "codeV4": "// path built with d3-shape: line().x(...).y(...).curve(curveBasis)(points)\nconst x = useSharedValue(WIDTH);\nconst pan = Gesture.Pan()\n  .onBegin(e => { x.value = clamp(e.x, 0, WIDTH); })\n  .onUpdate(e => { x.value = clamp(e.x, 0, WIDTH); })\n  .onEnd(() => { x.value = withTiming(WIDTH); });\nconst cursor = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));\nconst price = useDerivedValue(() => {\n  const i = Math.round((x.value / WIDTH) * (points.length - 1));\n  return '$' + points[i].value.toFixed(2);\n});\n// <ReText text={price} /> from react-native-redash (animated TextInput, no re-renders)\n// dot on the curve: translateY = getYForX(parsePath(d), x.value) from react-native-redash",
    "apisV4": [
      "Gesture.Pan",
      "useDerivedValue",
      "ReText"
    ]
  },
  {
    "id": "shared-expand",
    "name": "Card to full screen",
    "level": "adv",
    "description": "A thumbnail expands into the detail screen with a shared element transition; drag down to shrink it back.",
    "apis": [
      "sharedTransitionTag",
      "Gesture.Pan",
      "native-stack"
    ],
    "demo": "<div style=\"position:absolute;inset:14px 14px auto auto;display:grid;grid-template-columns:repeat(2,42px);gap:8px\"><div style=\"height:54px;border-radius:8px;background:var(--line)\"></div><div style=\"height:54px;border-radius:8px;background:var(--line)\"></div></div><div style=\"position:absolute;background:var(--accent);animation:shx 3.2s ease-in-out infinite\"></div>",
    "code": "// List screen\n<Pressable onPress={() => navigation.navigate('Story', { id })}>\n  <Animated.Image sharedTransitionTag={'story-' + id} source={img} style={styles.thumb} />\n</Pressable>\n// Detail screen (@react-navigation/native-stack)\nconst ty = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onUpdate(e => { ty.value = Math.max(0, e.translationY); })\n  .onEnd(() => {\n    if (ty.value > 150) runOnJS(navigation.goBack)();\n    else ty.value = withSpring(0);\n  });\nconst style = useAnimatedStyle(() => ({\n  borderRadius: interpolate(ty.value, [0, 300], [0, 24], Extrapolation.CLAMP),\n  transform: [{ translateY: ty.value }, { scale: interpolate(ty.value, [0, 300], [1, 0.75], Extrapolation.CLAMP) }],\n}));\n<GestureDetector gesture={pan}>\n  <Animated.Image sharedTransitionTag={'story-' + id} source={img} style={[styles.full, style]} />\n</GestureDetector>",
    "source": {
      "app": "Snapchat",
      "path": "season1/snapchat-discovery",
      "query": "Snapchat discovery"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\n// List screen\n<Pressable onPress={() => navigation.navigate('Story', { id })}>\n  <Animated.Image sharedTransitionTag={'story-' + id} source={img} style={styles.thumb} />\n</Pressable>\n// Detail screen (@react-navigation/native-stack)\nconst ty = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onUpdate(e => { ty.value = Math.max(0, e.translationY); })\n  .onEnd(() => {\n    if (ty.value > 150) scheduleOnRN(navigation.goBack);\n    else ty.value = withSpring(0);\n  });\nconst style = useAnimatedStyle(() => ({\n  borderRadius: interpolate(ty.value, [0, 300], [0, 24], Extrapolation.CLAMP),\n  transform: [{ translateY: ty.value }, { scale: interpolate(ty.value, [0, 300], [1, 0.75], Extrapolation.CLAMP) }],\n}));\n<GestureDetector gesture={pan}>\n  <Animated.Image sharedTransitionTag={'story-' + id} source={img} style={[styles.full, style]} />\n</GestureDetector>",
    "apisV4": [
      "sharedTransitionTag",
      "Gesture.Pan",
      "native-stack"
    ]
  },
  {
    "id": "word-drag",
    "name": "Word bank drag",
    "level": "adv",
    "description": "Tap or drag word chips from a bank into a sentence line; they spring into their slots.",
    "apis": [
      "Gesture.Pan",
      "Gesture.Exclusive",
      "onLayout"
    ],
    "demo": "<div style=\"display:grid;gap:22px;justify-items:center\"><div style=\"width:150px;border-bottom:2px solid var(--line);height:22px\"></div><div style=\"display:flex;gap:6px\"><div style=\"width:34px;height:20px;border-radius:6px;background:var(--surface);border:1px solid var(--line)\"></div><div style=\"width:44px;height:20px;border-radius:6px;background:var(--surface);border:1px solid var(--accent);animation:wd 2.8s cubic-bezier(.3,1.3,.5,1) infinite\"></div><div style=\"width:30px;height:20px;border-radius:6px;background:var(--surface);border:1px solid var(--line)\"></div></div></div>",
    "code": "function Word({ word, home, slot, inSentence, onToggle, onDrop }) {\n  // home = position in the bank, slot = position in the sentence (both from onLayout)\n  const tx = useSharedValue(0), ty = useSharedValue(0);\n  useEffect(() => {\n    const target = inSentence ? slot : home;\n    tx.value = withSpring(target.x - home.x);\n    ty.value = withSpring(target.y - home.y);\n  }, [inSentence, slot]);\n  const tap = Gesture.Tap().onEnd(() => runOnJS(onToggle)(word.id));\n  const pan = Gesture.Pan()\n    .onChange(e => { tx.value += e.changeX; ty.value += e.changeY; })\n    .onEnd(e => runOnJS(onDrop)(word.id, e.absoluteY)); // parent decides bank or sentence\n  const style = useAnimatedStyle(() => ({\n    transform: [{ translateX: tx.value }, { translateY: ty.value }],\n  }));\n  return (\n    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>\n      <Animated.View style={[styles.chip, style]}><Text>{word.text}</Text></Animated.View>\n    </GestureDetector>\n  );\n}",
    "source": {
      "app": "Duolingo",
      "path": "season4/src/Duolingo",
      "query": "Duolingo"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nfunction Word({ word, home, slot, inSentence, onToggle, onDrop }) {\n  // home = position in the bank, slot = position in the sentence (both from onLayout)\n  const tx = useSharedValue(0), ty = useSharedValue(0);\n  useEffect(() => {\n    const target = inSentence ? slot : home;\n    tx.value = withSpring(target.x - home.x);\n    ty.value = withSpring(target.y - home.y);\n  }, [inSentence, slot]);\n  const tap = Gesture.Tap().onEnd(() => scheduleOnRN(onToggle, word.id));\n  const pan = Gesture.Pan()\n    .onChange(e => { tx.value += e.changeX; ty.value += e.changeY; })\n    .onEnd(e => scheduleOnRN(onDrop, word.id, e.absoluteY)); // parent decides bank or sentence\n  const style = useAnimatedStyle(() => ({\n    transform: [{ translateX: tx.value }, { translateY: ty.value }],\n  }));\n  return (\n    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>\n      <Animated.View style={[styles.chip, style]}><Text>{word.text}</Text></Animated.View>\n    </GestureDetector>\n  );\n}",
    "apisV4": [
      "Gesture.Pan",
      "Gesture.Exclusive",
      "onLayout"
    ]
  },
  {
    "id": "tab-reorder",
    "name": "Drag to reorder grid",
    "level": "adv",
    "description": "Long-press a tile, drag it over another, and the grid reshuffles around it.",
    "apis": [
      "activateAfterLongPress",
      "useAnimatedReaction",
      "shared map"
    ],
    "demo": "<div style=\"display:grid;grid-template-columns:repeat(2,38px);gap:8px\"><div style=\"height:38px;border-radius:8px;background:var(--accent);animation:swA 3s ease-in-out infinite;z-index:1;position:relative\"></div><div style=\"height:38px;border-radius:8px;background:var(--line)\"></div><div style=\"height:38px;border-radius:8px;background:var(--line)\"></div><div style=\"height:38px;border-radius:8px;background:var(--coral);animation:swD 3s ease-in-out infinite\"></div></div>",
    "code": "const positions = useSharedValue(Object.fromEntries(ids.map((id, i) => [id, i])));\nconst toXY = i => { 'worklet'; return { x: (i % COLS) * SIZE, y: Math.floor(i / COLS) * SIZE }; };\nfunction Tile({ id }) {\n  const start = toXY(positions.value[id]);\n  const tx = useSharedValue(start.x), ty = useSharedValue(start.y), active = useSharedValue(false);\n  useAnimatedReaction(() => positions.value[id], slot => {\n    if (!active.value) { const p = toXY(slot); tx.value = withSpring(p.x); ty.value = withSpring(p.y); }\n  });\n  const pan = Gesture.Pan().activateAfterLongPress(250)\n    .onStart(() => { active.value = true; })\n    .onChange(e => {\n      tx.value += e.changeX; ty.value += e.changeY;\n      const slot = clamp(Math.round(ty.value / SIZE) * COLS + Math.round(tx.value / SIZE), 0, ids.length - 1);\n      const from = positions.value[id];\n      if (slot !== from) {\n        const other = Object.keys(positions.value).find(k => positions.value[k] === slot);\n        positions.value = { ...positions.value, [id]: slot, [other]: from };\n      }\n    })\n    .onEnd(() => {\n      const p = toXY(positions.value[id]);\n      tx.value = withSpring(p.x); ty.value = withSpring(p.y); active.value = false;\n    });\n  const style = useAnimatedStyle(() => ({\n    position: 'absolute', zIndex: active.value ? 10 : 0,\n    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: withSpring(active.value ? 1.06 : 1) }],\n  }));\n  // <GestureDetector gesture={pan}><Animated.View style={[styles.tile, style]} /></GestureDetector>\n}",
    "source": {
      "app": "Google Chrome",
      "path": "season3/src/Chrome",
      "query": "Chrome tabs"
    },
    "codeV4": "const positions = useSharedValue(Object.fromEntries(ids.map((id, i) => [id, i])));\nconst toXY = i => { 'worklet'; return { x: (i % COLS) * SIZE, y: Math.floor(i / COLS) * SIZE }; };\nfunction Tile({ id }) {\n  const start = toXY(positions.value[id]);\n  const tx = useSharedValue(start.x), ty = useSharedValue(start.y), active = useSharedValue(false);\n  useAnimatedReaction(() => positions.value[id], slot => {\n    if (!active.value) { const p = toXY(slot); tx.value = withSpring(p.x); ty.value = withSpring(p.y); }\n  });\n  const pan = Gesture.Pan().activateAfterLongPress(250)\n    .onStart(() => { active.value = true; })\n    .onChange(e => {\n      tx.value += e.changeX; ty.value += e.changeY;\n      const slot = clamp(Math.round(ty.value / SIZE) * COLS + Math.round(tx.value / SIZE), 0, ids.length - 1);\n      const from = positions.value[id];\n      if (slot !== from) {\n        const other = Object.keys(positions.value).find(k => positions.value[k] === slot);\n        positions.value = { ...positions.value, [id]: slot, [other]: from };\n      }\n    })\n    .onEnd(() => {\n      const p = toXY(positions.value[id]);\n      tx.value = withSpring(p.x); ty.value = withSpring(p.y); active.value = false;\n    });\n  const style = useAnimatedStyle(() => ({\n    position: 'absolute', zIndex: active.value ? 10 : 0,\n    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: withSpring(active.value ? 1.06 : 1) }],\n  }));\n  // <GestureDetector gesture={pan}><Animated.View style={[styles.tile, style]} /></GestureDetector>\n}",
    "apisV4": [
      "activateAfterLongPress",
      "useAnimatedReaction",
      "shared map"
    ]
  },
  {
    "id": "sticky-tabs",
    "name": "Scroll-synced tabs",
    "level": "adv",
    "description": "Category tabs stick to the top and the active tab follows the section you're scrolling through.",
    "apis": [
      "useAnimatedScrollHandler",
      "useDerivedValue",
      "scrollTo"
    ],
    "demo": "<div style=\"position:relative;width:180px;height:100px;border-radius:10px;background:var(--surface);border:1px solid var(--line);overflow:hidden\"><div style=\"position:relative;display:flex;gap:16px;font-size:11px;padding:6px 10px 8px;background:var(--surface);z-index:1;border-bottom:1px solid var(--line)\"><span style=\"width:40px\">Pizza</span><span style=\"width:52px\">Burgers</span><span style=\"width:40px\">Drinks</span><div style=\"position:absolute;left:7px;bottom:0;height:3px;border-radius:3px;background:var(--accent);animation:tab 4s cubic-bezier(.3,1.3,.5,1) infinite\"></div></div><div style=\"padding:8px;display:grid;gap:6px;animation:lst 4s ease-in-out infinite\"><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div></div></div>",
    "code": "const y = useSharedValue(0);\nconst sectionsY = useSharedValue([]);   // filled from each section's onLayout\nconst tabsX = useSharedValue([]), tabsW = useSharedValue([]); // from each tab's onLayout\nconst onScroll = useAnimatedScrollHandler(e => { y.value = e.contentOffset.y; });\nconst active = useDerivedValue(() => {\n  let i = 0;\n  for (let k = 0; k < sectionsY.value.length; k++) if (y.value >= sectionsY.value[k] - HEADER_H) i = k;\n  return i;\n});\nconst indicator = useAnimatedStyle(() => ({\n  width: withSpring(tabsW.value[active.value] ?? 0),\n  transform: [{ translateX: withSpring(tabsX.value[active.value] ?? 0) }],\n}));\n// keep the active tab visible in the horizontal tab bar\nuseAnimatedReaction(() => active.value, i => scrollTo(tabBarRef, (tabsX.value[i] ?? 0) - 16, 0, true));\n// tap a tab: listRef.current.scrollTo({ y: sectionsY.value[i] - HEADER_H })",
    "source": {
      "app": "Uber Eats",
      "path": "season3/src/UberEats",
      "query": "Uber Eats"
    },
    "codeV4": "const y = useSharedValue(0);\nconst sectionsY = useSharedValue([]);   // filled from each section's onLayout\nconst tabsX = useSharedValue([]), tabsW = useSharedValue([]); // from each tab's onLayout\nconst onScroll = useAnimatedScrollHandler(e => { y.value = e.contentOffset.y; });\nconst active = useDerivedValue(() => {\n  let i = 0;\n  for (let k = 0; k < sectionsY.value.length; k++) if (y.value >= sectionsY.value[k] - HEADER_H) i = k;\n  return i;\n});\nconst indicator = useAnimatedStyle(() => ({\n  width: withSpring(tabsW.value[active.value] ?? 0),\n  transform: [{ translateX: withSpring(tabsX.value[active.value] ?? 0) }],\n}));\n// keep the active tab visible in the horizontal tab bar\nuseAnimatedReaction(() => active.value, i => scrollTo(tabBarRef, (tabsX.value[i] ?? 0) - 16, 0, true));\n// tap a tab: listRef.current.scrollTo({ y: sectionsY.value[i] - HEADER_H })",
    "apisV4": [
      "useAnimatedScrollHandler",
      "useDerivedValue",
      "scrollTo"
    ]
  },
  {
    "id": "click-wheel",
    "name": "iPod click wheel",
    "level": "adv",
    "description": "Turn a circular wheel with your finger to move a selection up and down a list, with a click on each step.",
    "apis": [
      "Gesture.Pan",
      "Math.atan2",
      "useAnimatedReaction"
    ],
    "demo": "<div style=\"position:relative;width:84px;height:84px;border-radius:50%;background:var(--surface);border:1px solid var(--line)\"><div style=\"position:absolute;inset:0;animation:rot 3s ease-in-out infinite\"><div style=\"position:absolute;left:50%;top:6px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--accent)\"></div></div><div style=\"position:absolute;inset:28px;border-radius:50%;background:var(--stage);border:1px solid var(--line)\"></div></div>",
    "code": "const angle = useSharedValue(0), last = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onBegin(e => { last.value = Math.atan2(e.y - R, e.x - R); })\n  .onUpdate(e => {\n    const a = Math.atan2(e.y - R, e.x - R);\n    let d = a - last.value;                 // unwrap across the -PI/PI seam\n    if (d > Math.PI) d -= 2 * Math.PI;\n    if (d < -Math.PI) d += 2 * Math.PI;\n    angle.value += d; last.value = a;\n  });\nconst STEP = Math.PI / 6; // 30 degrees per item\nconst selected = useDerivedValue(() => clamp(Math.round(angle.value / STEP), 0, items.length - 1));\nuseAnimatedReaction(() => selected.value, (v, prev) => {\n  if (prev !== null && v !== prev) runOnJS(Haptics.selectionAsync)();\n});\nconst highlight = useAnimatedStyle(() => ({ transform: [{ translateY: withSpring(selected.value * ROW_H) }] }));",
    "source": {
      "app": "iPod",
      "path": "season3/src/iPod",
      "query": "iPod"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nconst angle = useSharedValue(0), last = useSharedValue(0);\nconst pan = Gesture.Pan()\n  .onBegin(e => { last.value = Math.atan2(e.y - R, e.x - R); })\n  .onUpdate(e => {\n    const a = Math.atan2(e.y - R, e.x - R);\n    let d = a - last.value;                 // unwrap across the -PI/PI seam\n    if (d > Math.PI) d -= 2 * Math.PI;\n    if (d < -Math.PI) d += 2 * Math.PI;\n    angle.value += d; last.value = a;\n  });\nconst STEP = Math.PI / 6; // 30 degrees per item\nconst selected = useDerivedValue(() => clamp(Math.round(angle.value / STEP), 0, items.length - 1));\nuseAnimatedReaction(() => selected.value, (v, prev) => {\n  if (prev !== null && v !== prev) scheduleOnRN(Haptics.selectionAsync);\n});\nconst highlight = useAnimatedStyle(() => ({ transform: [{ translateY: withSpring(selected.value * ROW_H) }] }));",
    "apisV4": [
      "Gesture.Pan",
      "Math.atan2",
      "useAnimatedReaction"
    ]
  },
  {
    "id": "jelly-scroll",
    "name": "Jelly scroll",
    "level": "adv",
    "description": "List rows skew with scroll velocity and settle back with a spring, giving a wobbly feel.",
    "apis": [
      "useAnimatedScrollHandler",
      "velocity",
      "skewY"
    ],
    "demo": "<div style=\"display:grid;gap:7px;animation:jelly 2.6s ease-in-out infinite\"><div style=\"width:140px;height:16px;border-radius:5px;background:var(--accent)\"></div><div style=\"width:140px;height:16px;border-radius:5px;background:var(--accent)\"></div><div style=\"width:140px;height:16px;border-radius:5px;background:var(--accent)\"></div><div style=\"width:140px;height:16px;border-radius:5px;background:var(--accent)\"></div><div style=\"width:140px;height:16px;border-radius:5px;background:var(--accent)\"></div><div style=\"width:140px;height:16px;border-radius:5px;background:var(--accent)\"></div></div>",
    "code": "const velocity = useSharedValue(0), lastY = useSharedValue(0), lastT = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler({\n  onScroll: e => {\n    const now = Date.now(); // e.velocity is iOS only, so compute it\n    velocity.value = (e.contentOffset.y - lastY.value) / Math.max(1, now - lastT.value);\n    lastY.value = e.contentOffset.y; lastT.value = now;\n  },\n  onMomentumEnd: () => { velocity.value = 0; },\n});\nconst skew = useDerivedValue(() => withSpring(clamp(velocity.value * 6, -12, 12), { damping: 8 }));\nconst row = useAnimatedStyle(() => ({ transform: [{ skewY: skew.value + 'deg' }] }));\n// apply row style to every item (or to the content container)",
    "source": {
      "app": "Jelly scroll",
      "path": "reanimated-2/src/JellyScroll",
      "query": "jelly scroll"
    },
    "codeV4": "const velocity = useSharedValue(0), lastY = useSharedValue(0), lastT = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler({\n  onScroll: e => {\n    const now = Date.now(); // e.velocity is iOS only, so compute it\n    velocity.value = (e.contentOffset.y - lastY.value) / Math.max(1, now - lastT.value);\n    lastY.value = e.contentOffset.y; lastT.value = now;\n  },\n  onMomentumEnd: () => { velocity.value = 0; },\n});\nconst skew = useDerivedValue(() => withSpring(clamp(velocity.value * 6, -12, 12), { damping: 8 }));\nconst row = useAnimatedStyle(() => ({ transform: [{ skewY: skew.value + 'deg' }] }));\n// apply row style to every item (or to the content container)",
    "apisV4": [
      "useAnimatedScrollHandler",
      "velocity",
      "skewY"
    ]
  },
  {
    "id": "wallet-stack",
    "name": "Wallet card stack",
    "level": "adv",
    "description": "Tap a card in a stack: it rises to the top and the rest collapse to the bottom.",
    "apis": [
      "withSpring",
      "Gesture.Tap",
      "derived layout"
    ],
    "demo": "<div style=\"position:relative;width:120px;height:100px\"><div style=\"position:absolute;left:0;right:0;top:10px;height:56px;border-radius:9px;background:var(--accent);animation:wdn 3s ease-in-out infinite;z-index:0\"></div><div style=\"position:absolute;left:0;right:0;top:26px;height:56px;border-radius:9px;background:var(--coral);animation:wsel 3s ease-in-out infinite;z-index:3\"></div><div style=\"position:absolute;left:0;right:0;top:42px;height:56px;border-radius:9px;background:var(--adv);animation:wdn 3s ease-in-out infinite;z-index:2\"></div></div>",
    "code": "const selected = useSharedValue(-1);\nfunction Card({ index }) {\n  const style = useAnimatedStyle(() => {\n    const s = selected.value, isSel = s === index;\n    const y = s === -1 ? index * PEEK\n      : isSel ? 0\n      : height - 160 + (index - (index > s ? 1 : 0)) * 8; // collapsed pile at the bottom\n    return {\n      zIndex: isSel ? 100 : index,\n      transform: [\n        { translateY: withSpring(y, { damping: 18 }) },\n        { scale: withSpring(s === -1 || isSel ? 1 : 0.92) },\n      ],\n    };\n  });\n  const tap = Gesture.Tap().onEnd(() => { selected.value = selected.value === index ? -1 : index; });\n  return <GestureDetector gesture={tap}><Animated.View style={[styles.card, style]} /></GestureDetector>;\n}",
    "source": {
      "app": "Apple Wallet",
      "path": "the-10-min/src/Wallet",
      "query": "wallet"
    },
    "codeV4": "const selected = useSharedValue(-1);\nfunction Card({ index }) {\n  const style = useAnimatedStyle(() => {\n    const s = selected.value, isSel = s === index;\n    const y = s === -1 ? index * PEEK\n      : isSel ? 0\n      : height - 160 + (index - (index > s ? 1 : 0)) * 8; // collapsed pile at the bottom\n    return {\n      zIndex: isSel ? 100 : index,\n      transform: [\n        { translateY: withSpring(y, { damping: 18 }) },\n        { scale: withSpring(s === -1 || isSel ? 1 : 0.92) },\n      ],\n    };\n  });\n  const tap = Gesture.Tap().onEnd(() => { selected.value = selected.value === index ? -1 : index; });\n  return <GestureDetector gesture={tap}><Animated.View style={[styles.card, style]} /></GestureDetector>;\n}",
    "apisV4": [
      "withSpring",
      "Gesture.Tap",
      "derived layout"
    ]
  },
  {
    "id": "theme-reveal",
    "name": "Theme circle reveal",
    "level": "adv",
    "description": "Switching to dark mode spreads out as a circle from the toggle, using a snapshot of the old screen.",
    "apis": [
      "makeImageFromView",
      "Skia Mask",
      "withTiming"
    ],
    "demo": "<div style=\"position:absolute;inset:14px;display:grid;gap:7px;align-content:start\"><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div><div style=\"height:10px;border-radius:3px;background:var(--line)\"></div></div><div style=\"position:absolute;inset:0;background:var(--fg);animation:trv 3.2s ease-in-out infinite\"></div>",
    "code": "import { Canvas, Mask, Group, Rect, Circle, Image, makeImageFromView } from '@shopify/react-native-skia';\nconst r = useSharedValue(0);\nconst [overlay, setOverlay] = useState(null);\nconst toggle = async (x, y) => {           // x, y = toggle button center\n  const img = await makeImageFromView(rootRef); // snapshot of the old theme\n  setOverlay({ img, x, y });\n  setDark(d => !d);                         // new theme renders underneath\n  r.value = 0;\n  r.value = withTiming(Math.hypot(width, height), { duration: 600 }, () => runOnJS(setOverlay)(null));\n};\n{overlay && (\n  <Canvas style={StyleSheet.absoluteFill} pointerEvents=\"none\">\n    <Mask mode=\"luminance\" mask={\n      <Group>\n        <Rect x={0} y={0} width={width} height={height} color=\"white\" />\n        <Circle cx={overlay.x} cy={overlay.y} r={r} color=\"black\" />\n      </Group>}>\n      <Image image={overlay.img} x={0} y={0} width={width} height={height} />\n    </Mask>\n  </Canvas>\n)}",
    "source": {
      "app": "Telegram",
      "path": "season5/src/Telegram",
      "query": "Telegram"
    },
    "codeV4": "import { scheduleOnRN } from 'react-native-worklets';\n\nimport { Canvas, Mask, Group, Rect, Circle, Image, makeImageFromView } from '@shopify/react-native-skia';\nconst r = useSharedValue(0);\nconst [overlay, setOverlay] = useState(null);\nconst toggle = async (x, y) => {           // x, y = toggle button center\n  const img = await makeImageFromView(rootRef); // snapshot of the old theme\n  setOverlay({ img, x, y });\n  setDark(d => !d);                         // new theme renders underneath\n  r.value = 0;\n  r.value = withTiming(Math.hypot(width, height), { duration: 600 }, () => scheduleOnRN(setOverlay, null));\n};\n{overlay && (\n  <Canvas style={StyleSheet.absoluteFill} pointerEvents=\"none\">\n    <Mask mode=\"luminance\" mask={\n      <Group>\n        <Rect x={0} y={0} width={width} height={height} color=\"white\" />\n        <Circle cx={overlay.x} cy={overlay.y} r={r} color=\"black\" />\n      </Group>}>\n      <Image image={overlay.img} x={0} y={0} width={width} height={height} />\n    </Mask>\n  </Canvas>\n)}",
    "apisV4": [
      "makeImageFromView",
      "Skia Mask",
      "withTiming"
    ]
  },
  {
    "id": "picker-wheel",
    "name": "3D picker wheel",
    "level": "adv",
    "description": "A scrolling list that curves away in 3D like the iOS date picker, snapping to each row.",
    "apis": [
      "snapToInterval",
      "rotateX",
      "perspective"
    ],
    "demo": "<div style=\"position:relative;width:110px;height:100px;overflow:hidden\"><div style=\"position:absolute;left:0;right:0;top:38px;height:24px;border-radius:6px;background:var(--accent-soft)\"></div><div style=\"display:grid;gap:4px;padding-top:4px;animation:pick 3.4s ease-in-out infinite\"><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">07</div><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">08</div><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">09</div><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">10</div><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">11</div><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">12</div><div style=\"height:18px;text-align:center;font-family:var(--f-mono);font-size:13px;color:var(--fg)\">13</div></div></div>",
    "code": "const ITEM = 40;\nconst y = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { y.value = e.contentOffset.y; });\nfunction Item({ index, label }) {\n  const style = useAnimatedStyle(() => {\n    const d = (index * ITEM - y.value) / ITEM; // rows away from the center\n    return {\n      opacity: interpolate(Math.abs(d), [0, 2.5], [1, 0.2], Extrapolation.CLAMP),\n      transform: [\n        { perspective: 600 },\n        { rotateX: clamp(d * -25, -80, 80) + 'deg' },\n        { scale: interpolate(Math.abs(d), [0, 2.5], [1, 0.85], Extrapolation.CLAMP) },\n      ],\n    };\n  });\n  return <Animated.Text style={[styles.item, { height: ITEM }, style]}>{label}</Animated.Text>;\n}\n<Animated.ScrollView style={{ height: ITEM * 5 }} snapToInterval={ITEM} decelerationRate=\"fast\"\n  contentContainerStyle={{ paddingVertical: ITEM * 2 }} onScroll={onScroll} scrollEventThrottle={16}\n  showsVerticalScrollIndicator={false}>{items.map((l, i) => <Item key={l} index={i} label={l} />)}</Animated.ScrollView>",
    "source": {
      "app": "iOS picker",
      "path": "the-10-min/src/Picker",
      "query": "picker"
    },
    "codeV4": "const ITEM = 40;\nconst y = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { y.value = e.contentOffset.y; });\nfunction Item({ index, label }) {\n  const style = useAnimatedStyle(() => {\n    const d = (index * ITEM - y.value) / ITEM; // rows away from the center\n    return {\n      opacity: interpolate(Math.abs(d), [0, 2.5], [1, 0.2], Extrapolation.CLAMP),\n      transform: [\n        { perspective: 600 },\n        { rotateX: clamp(d * -25, -80, 80) + 'deg' },\n        { scale: interpolate(Math.abs(d), [0, 2.5], [1, 0.85], Extrapolation.CLAMP) },\n      ],\n    };\n  });\n  return <Animated.Text style={[styles.item, { height: ITEM }, style]}>{label}</Animated.Text>;\n}\n<Animated.ScrollView style={{ height: ITEM * 5 }} snapToInterval={ITEM} decelerationRate=\"fast\"\n  contentContainerStyle={{ paddingVertical: ITEM * 2 }} onScroll={onScroll} scrollEventThrottle={16}\n  showsVerticalScrollIndicator={false}>{items.map((l, i) => <Item key={l} index={i} label={l} />)}</Animated.ScrollView>",
    "apisV4": [
      "snapToInterval",
      "rotateX",
      "perspective"
    ]
  },
  {
    "id": "coverflow",
    "name": "Coverflow carousel",
    "level": "adv",
    "description": "Horizontal carousel where the centered item is large and flat, and the neighbors shrink and turn away.",
    "apis": [
      "useAnimatedScrollHandler",
      "rotateY",
      "snapToInterval"
    ],
    "demo": "<div style=\"position:relative;width:160px;height:90px;overflow:hidden;perspective:300px\"><div style=\"position:absolute;left:51px;top:10px;display:flex;gap:0;animation:cf 3.4s ease-in-out infinite\"><div style=\"width:58px;height:70px;display:flex;justify-content:center\"><div style=\"width:48px;height:70px;border-radius:9px;background:var(--accent)\"></div></div><div style=\"width:58px;height:70px;display:flex;justify-content:center\"><div style=\"width:48px;height:70px;border-radius:9px;background:var(--coral)\"></div></div><div style=\"width:58px;height:70px;display:flex;justify-content:center\"><div style=\"width:48px;height:70px;border-radius:9px;background:var(--adv)\"></div></div></div></div>",
    "code": "const ITEM_W = width * 0.6;\nconst x = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { x.value = e.contentOffset.x; });\nfunction Slide({ index, children }) {\n  const style = useAnimatedStyle(() => {\n    const p = (x.value - index * ITEM_W) / ITEM_W; // 0 when centered\n    return {\n      opacity: interpolate(Math.abs(p), [0, 1], [1, 0.5], Extrapolation.CLAMP),\n      transform: [\n        { perspective: 800 },\n        { rotateY: interpolate(p, [-1, 0, 1], [35, 0, -35], Extrapolation.CLAMP) + 'deg' },\n        { scale: interpolate(Math.abs(p), [0, 1], [1, 0.8], Extrapolation.CLAMP) },\n      ],\n    };\n  });\n  return <Animated.View style={[{ width: ITEM_W }, style]}>{children}</Animated.View>;\n}\n<Animated.ScrollView horizontal snapToInterval={ITEM_W} decelerationRate=\"fast\"\n  contentContainerStyle={{ paddingHorizontal: (width - ITEM_W) / 2 }}\n  onScroll={onScroll} scrollEventThrottle={16} showsHorizontalScrollIndicator={false} />",
    "source": {
      "app": "Philz Coffee",
      "path": "season4/src/PhilzCoffee",
      "query": "Philz coffee"
    },
    "codeV4": "const ITEM_W = width * 0.6;\nconst x = useSharedValue(0);\nconst onScroll = useAnimatedScrollHandler(e => { x.value = e.contentOffset.x; });\nfunction Slide({ index, children }) {\n  const style = useAnimatedStyle(() => {\n    const p = (x.value - index * ITEM_W) / ITEM_W; // 0 when centered\n    return {\n      opacity: interpolate(Math.abs(p), [0, 1], [1, 0.5], Extrapolation.CLAMP),\n      transform: [\n        { perspective: 800 },\n        { rotateY: interpolate(p, [-1, 0, 1], [35, 0, -35], Extrapolation.CLAMP) + 'deg' },\n        { scale: interpolate(Math.abs(p), [0, 1], [1, 0.8], Extrapolation.CLAMP) },\n      ],\n    };\n  });\n  return <Animated.View style={[{ width: ITEM_W }, style]}>{children}</Animated.View>;\n}\n<Animated.ScrollView horizontal snapToInterval={ITEM_W} decelerationRate=\"fast\"\n  contentContainerStyle={{ paddingHorizontal: (width - ITEM_W) / 2 }}\n  onScroll={onScroll} scrollEventThrottle={16} showsHorizontalScrollIndicator={false} />",
    "apisV4": [
      "useAnimatedScrollHandler",
      "rotateY",
      "snapToInterval"
    ]
  }
];

// The original 48, then the everyday UI additions from data/animations-more.ts and data/animations-extra.ts
export const animations: Animation[] = [...core, ...more, ...extra, ...plus, ...final];
