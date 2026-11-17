// Flutter ports of every animation, using only Flutter's built-in animation framework (no packages).
// Snippets assume a State class; "with SingleTickerProviderStateMixin" is needed wherever an
// AnimationController is created (TickerProviderStateMixin for two or more), and controllers are disposed in dispose().
// String.raw keeps the code verbatim; snippets avoid the JS template sequence for interpolation.
import type { PlatformSnippet } from "@/lib/types";

const c = String.raw;

export const flutter: Record<string, PlatformSnippet> = {
  "fade-in": {
    apis: ["TweenAnimationBuilder", "Opacity", "Curves.easeOut"],
    code: c`// Implicit animation: runs once when the widget is first built
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: 1),
  duration: const Duration(milliseconds: 400),
  curve: Curves.easeOut,
  builder: (context, opacity, child) => Opacity(opacity: opacity, child: child),
  child: const Box(),
)`,
  },

  "slide-in": {
    apis: ["TweenAnimationBuilder", "Transform.translate", "Curves.easeOutCubic"],
    code: c`TweenAnimationBuilder<double>(
  tween: Tween(begin: -100, end: 0),
  duration: const Duration(milliseconds: 450),
  curve: Curves.easeOutCubic,
  builder: (context, x, child) => Opacity(
    opacity: 1 + x / 100, // 0 at -100, 1 at 0
    child: Transform.translate(offset: Offset(x, 0), child: child),
  ),
  child: const Box(),
)`,
  },

  "press-scale": {
    apis: ["AnimatedScale", "GestureDetector", "Curves.easeOutBack"],
    code: c`class _PressScaleState extends State<PressScale> {
  bool _pressed = false;

  void _set(bool v) => setState(() => _pressed = v);

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTapDown: (_) => _set(true),
        onTapUp: (_) => _set(false),
        onTapCancel: () => _set(false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _pressed ? 0.92 : 1,
          duration: Duration(milliseconds: _pressed ? 120 : 300),
          // easeOutBack overshoots a little on release, like a spring
          curve: _pressed ? Curves.easeOut : Curves.easeOutBack,
          child: widget.child,
        ),
      );
}`,
  },

  spin: {
    apis: ["AnimationController.repeat", "RotationTransition"],
    code: c`late final _c = AnimationController(
  vsync: this,
  duration: const Duration(milliseconds: 900),
)..repeat(); // linear, forever

@override
void dispose() {
  _c.dispose();
  super.dispose();
}

@override
Widget build(BuildContext context) => RotationTransition(turns: _c, child: const Spinner());
// Or the stock CircularProgressIndicator(), which already spins.`,
  },

  pulse: {
    apis: ["AnimationController.repeat", "AnimatedBuilder", "Transform.scale"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat();

@override
Widget build(BuildContext context) => Stack(alignment: Alignment.center, children: [
  AnimatedBuilder(
    animation: _c,
    builder: (_, child) {
      final t = Curves.easeOut.transform(_c.value);
      return Opacity(
        opacity: 0.7 * (1 - t),
        child: Transform.scale(scale: 1 + 1.4 * t, child: child),
      );
    },
    child: const Dot(size: 16),
  ),
  const Dot(size: 16),
]);`,
  },

  "progress-bar": {
    apis: ["AnimatedFractionallySizedBox", "Curves.easeOutCubic"],
    code: c`// progress: 0.0 - 1.0
Container(
  height: 8,
  clipBehavior: Clip.antiAlias,
  decoration: BoxDecoration(color: track, borderRadius: BorderRadius.circular(4)),
  alignment: Alignment.centerLeft,
  child: AnimatedFractionallySizedBox(
    duration: const Duration(milliseconds: 600),
    curve: Curves.easeOutCubic,
    widthFactor: progress,
    heightFactor: 1,
    child: const ColoredBox(color: accent),
  ),
)
// Or LinearProgressIndicator inside a TweenAnimationBuilder.`,
  },

  "color-shift": {
    apis: ["AnimatedContainer", "Curves.easeInOut"],
    code: c`// AnimatedContainer tweens color (and size, padding, radius...) whenever they change
AnimatedContainer(
  duration: const Duration(milliseconds: 300),
  curve: Curves.easeInOut,
  width: 64,
  height: 64,
  decoration: BoxDecoration(
    color: active ? accent : coral,
    borderRadius: BorderRadius.circular(12),
  ),
)`,
  },

  "entering-preset": {
    apis: ["AnimatedSwitcher", "FadeTransition", "ScaleTransition"],
    code: c`// AnimatedSwitcher animates a child in and out when it changes
AnimatedSwitcher(
  duration: const Duration(milliseconds: 300),
  transitionBuilder: (child, animation) => FadeTransition(
    opacity: animation,
    child: ScaleTransition(scale: Tween(begin: 0.8, end: 1.0).animate(animation), child: child),
  ),
  child: shown ? const InfoCard(key: ValueKey('card')) : const SizedBox.shrink(),
)
// For list rows, AnimatedList.insertItem / removeItem does the same per item.`,
  },

  "spring-bounce": {
    apis: ["AnimationController.unbounded", "SpringSimulation", "SpringDescription"],
    code: c`late final _c = AnimationController.unbounded(vsync: this, value: -200);

@override
void initState() {
  super.initState();
  // Lower damping = more bounce
  const spring = SpringDescription(mass: 1, stiffness: 180, damping: 10);
  _c.animateWith(SpringSimulation(spring, -200, 0, 0));
}

@override
Widget build(BuildContext context) => AnimatedBuilder(
  animation: _c,
  builder: (_, child) => Transform.translate(offset: Offset(0, _c.value), child: child),
  child: const Box(),
);`,
  },

  shake: {
    apis: ["AnimationController.forward", "AnimatedBuilder", "dart:math sin"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));

void shake() => _c.forward(from: 0); // call when validation fails

@override
Widget build(BuildContext context) => AnimatedBuilder(
  animation: _c,
  builder: (_, child) {
    // A sine wave of 4 swings that decays to 0
    final dx = sin(_c.value * pi * 8) * 10 * (1 - _c.value);
    return Transform.translate(offset: Offset(dx, 0), child: child);
  },
  child: const TextField(decoration: InputDecoration(labelText: 'Email')),
);`,
  },

  "stagger-list": {
    apis: ["Interval", "CurvedAnimation", "SlideTransition", "FadeTransition"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();

@override
Widget build(BuildContext context) => ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, i) {
    // Each row gets its own slice of one timeline: an index-based delay
    final start = (i * 0.08).clamp(0.0, 0.7);
    final anim = CurvedAnimation(
      parent: _c,
      curve: Interval(start, start + 0.3, curve: Curves.easeOut),
    );
    return FadeTransition(
      opacity: anim,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.3), end: Offset.zero).animate(anim),
        child: ItemRow(items[i]),
      ),
    );
  },
);`,
  },

  accordion: {
    apis: ["AnimatedSize", "AnimatedRotation"],
    code: c`Column(children: [
  ListTile(
    title: const Text('Details'),
    trailing: AnimatedRotation(
      turns: open ? 0.5 : 0,
      duration: const Duration(milliseconds: 250),
      child: const Icon(Icons.expand_more),
    ),
    onTap: () => setState(() => open = !open),
  ),
  // AnimatedSize measures the child and animates to its height
  ClipRect(
    child: AnimatedSize(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
      alignment: Alignment.topCenter,
      child: open ? const DetailsBody() : const SizedBox(width: double.infinity),
    ),
  ),
])
// ExpansionTile gives you this behaviour out of the box.`,
  },

  shimmer: {
    apis: ["ShaderMask", "LinearGradient", "GradientTransform"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();

@override
Widget build(BuildContext context) => AnimatedBuilder(
  animation: _c,
  builder: (_, child) => ShaderMask(
    blendMode: BlendMode.srcATop,
    shaderCallback: (rect) => LinearGradient(
      colors: const [Color(0xFFE6EBE8), Color(0xFFF7F9F8), Color(0xFFE6EBE8)],
      stops: const [0.35, 0.5, 0.65],
      transform: _SlideGradient(_c.value * 2 - 1), // sweep from -1 to +1 widths
    ).createShader(rect),
    child: child,
  ),
  child: const SkeletonBlocks(), // grey rounded boxes
);

class _SlideGradient extends GradientTransform {
  const _SlideGradient(this.t);
  final double t;

  @override
  Matrix4 transform(Rect bounds, {TextDirection? textDirection}) =>
      Matrix4.translationValues(bounds.width * t, 0, 0);
}`,
  },

  "typing-dots": {
    apis: ["AnimationController.repeat", "AnimatedBuilder", "Transform.translate"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();

@override
Widget build(BuildContext context) => Row(
  mainAxisSize: MainAxisSize.min,
  children: List.generate(3, (i) => AnimatedBuilder(
    animation: _c,
    builder: (_, child) {
      // Same 1.2 s cycle for every dot, shifted by 0.2 per dot
      final t = (_c.value - i * 0.2) % 1.0;
      final y = t < 0.3 ? -6 * sin(t / 0.3 * pi) : 0.0;
      return Transform.translate(offset: Offset(0, y), child: child);
    },
    child: const Padding(
      padding: EdgeInsets.symmetric(horizontal: 3),
      child: Dot(size: 8),
    ),
  )),
);`,
  },

  "toggle-switch": {
    apis: ["AnimatedContainer", "AnimatedAlign", "Curves.easeOutBack"],
    code: c`GestureDetector(
  onTap: () => onChanged(!on),
  child: AnimatedContainer(
    duration: const Duration(milliseconds: 250),
    width: 56,
    height: 32,
    padding: const EdgeInsets.all(3),
    decoration: BoxDecoration(
      color: on ? accent : track,
      borderRadius: BorderRadius.circular(16),
    ),
    child: AnimatedAlign(
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutBack, // slight overshoot, spring feel
      alignment: on ? Alignment.centerRight : Alignment.centerLeft,
      child: const CircleAvatar(radius: 13, backgroundColor: Colors.white),
    ),
  ),
)`,
  },

  "like-burst": {
    apis: ["TweenSequence", "AnimationController", "AnimatedBuilder"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
bool liked = false;

// Squash, pop past 1, then settle
late final _scale = TweenSequence([
  TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.7), weight: 20),
  TweenSequenceItem(tween: Tween(begin: 0.7, end: 1.3), weight: 30),
  TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 50),
]).animate(CurvedAnimation(parent: _c, curve: Curves.easeOut));

void toggle() {
  setState(() => liked = !liked);
  if (liked) _c.forward(from: 0);
}

@override
Widget build(BuildContext context) => GestureDetector(
  onTap: toggle,
  child: AnimatedBuilder(
    animation: _c,
    builder: (_, __) => Stack(alignment: Alignment.center, children: [
      // Ring bursting outward
      if (_c.isAnimating)
        Opacity(
          opacity: 1 - _c.value,
          child: Container(
            width: 40 + 50 * _c.value,
            height: 40 + 50 * _c.value,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: coral, width: 3),
            ),
          ),
        ),
      Transform.scale(
        scale: _scale.value,
        child: Icon(liked ? Icons.favorite : Icons.favorite_border, color: coral, size: 40),
      ),
    ]),
  ),
);`,
  },

  "drag-snap": {
    apis: ["GestureDetector.onPan", "SpringSimulation", "AnimationController.unbounded"],
    code: c`Offset offset = Offset.zero;
Offset _releasedAt = Offset.zero;

// Springs a 1 -> 0 progress and scales the release offset back to the origin
late final _c = AnimationController.unbounded(vsync: this)
  ..addListener(() => setState(() => offset = _releasedAt * _c.value));

void _release(DragEndDetails d) {
  _releasedAt = offset;
  const spring = SpringDescription(mass: 1, stiffness: 200, damping: 15);
  _c.animateWith(SpringSimulation(spring, 1, 0, 0));
}

@override
Widget build(BuildContext context) => GestureDetector(
  onPanStart: (_) => _c.stop(),
  onPanUpdate: (d) => setState(() => offset += d.delta),
  onPanEnd: _release,
  child: Transform.translate(offset: offset, child: const Box()),
);`,
  },

  "swipe-stack": {
    apis: ["GestureDetector.onPan", "SpringSimulation", "Transform.rotate"],
    code: c`Offset drag = Offset.zero;
late Animation<Offset> _anim;
late final _c = AnimationController.unbounded(vsync: this)
  ..addListener(() => setState(() => drag = _anim.value));

void _end(DragEndDetails d, double width) {
  final fling = drag.dx.abs() > width * 0.3 || d.velocity.pixelsPerSecond.dx.abs() > 800;
  final target = fling ? Offset(drag.dx.sign * width * 1.5, drag.dy) : Offset.zero;
  _anim = Tween(begin: drag, end: target).animate(_c);
  const spring = SpringDescription(mass: 1, stiffness: 150, damping: 18);
  _c.animateWith(SpringSimulation(spring, 0, 1, 0)).whenComplete(() {
    if (fling) setState(() { cards.removeAt(0); drag = Offset.zero; });
  });
}

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) => Stack(children: [
  for (final card in cards.skip(1).take(2).toList().reversed) CardView(card),
  if (cards.isNotEmpty)
    GestureDetector(
      onPanStart: (_) => _c.stop(),
      onPanUpdate: (d) => setState(() => drag += d.delta),
      onPanEnd: (d) => _end(d, box.maxWidth),
      child: Transform.translate(
        offset: drag,
        child: Transform.rotate(
          angle: drag.dx / box.maxWidth * 0.4, // tilt while dragging
          child: CardView(cards.first),
        ),
      ),
    ),
]));`,
  },

  "bottom-sheet": {
    apis: ["onVerticalDragUpdate", "SpringSimulation", "velocity"],
    code: c`// Snap points as distance from the top
static const snaps = [80.0, 400.0];
double y = 400;
late final _c = AnimationController.unbounded(vsync: this)
  ..addListener(() => setState(() => y = _c.value));

void _end(DragEndDetails d, double height) {
  final v = d.velocity.pixelsPerSecond.dy;
  final double target;
  if (v > 1200) {
    target = height; // fast swipe down: dismiss
  } else if (v < -1200) {
    target = snaps.first;
  } else {
    target = [...snaps, height].reduce((a, b) => (a - y).abs() < (b - y).abs() ? a : b);
  }
  const spring = SpringDescription(mass: 1, stiffness: 300, damping: 30);
  _c.value = y;
  _c.animateWith(SpringSimulation(spring, y, target, v));
}

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) => Stack(children: [
  const PageContent(),
  Positioned(
    left: 0, right: 0, top: y, height: box.maxHeight,
    child: GestureDetector(
      onVerticalDragStart: (_) => _c.stop(),
      onVerticalDragUpdate: (d) =>
          setState(() => y = (y + d.delta.dy).clamp(snaps.first, box.maxHeight)),
      onVerticalDragEnd: (d) => _end(d, box.maxHeight),
      child: const SheetBody(),
    ),
  ),
]));
// DraggableScrollableSheet(snap: true, snapSizes: [...]) covers the common case.`,
  },

  "card-flip": {
    apis: ["Matrix4.rotateY", "setEntry(3, 2) perspective", "AnimatedBuilder"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));

void flip() => _c.isCompleted ? _c.reverse() : _c.forward();

@override
Widget build(BuildContext context) => GestureDetector(
  onTap: flip,
  child: AnimatedBuilder(
    animation: _c,
    builder: (context, _) {
      final angle = Curves.easeInOut.transform(_c.value) * pi;
      return Transform(
        alignment: Alignment.center,
        transform: Matrix4.identity()
          ..setEntry(3, 2, 0.001) // perspective
          ..rotateY(angle),
        // No backface-visibility in Flutter: swap faces at 90° and mirror the back
        child: angle > pi / 2
            ? Transform(alignment: Alignment.center, transform: Matrix4.rotationY(pi), child: const BackFace())
            : const FrontFace(),
      );
    },
  ),
);`,
  },

  "parallax-header": {
    apis: ["SliverAppBar", "FlexibleSpaceBar", "CollapseMode.parallax"],
    code: c`// SliverAppBar + FlexibleSpaceBar handle the collapse and the parallax image
CustomScrollView(slivers: [
  SliverAppBar(
    pinned: true,
    stretch: true,
    expandedHeight: 260,
    flexibleSpace: FlexibleSpaceBar(
      title: const Text('Title'),
      collapseMode: CollapseMode.parallax, // image moves slower than the list
      background: Image.asset('assets/header.jpg', fit: BoxFit.cover),
    ),
  ),
  SliverList.builder(
    itemCount: 30,
    itemBuilder: (_, i) => ListTile(title: Text('Row $i')),
  ),
])`,
  },

  "pinch-zoom": {
    apis: ["InteractiveViewer", "TransformationController"],
    code: c`// InteractiveViewer combines pinch and pan, with a min and max scale
final _t = TransformationController();

InteractiveViewer(
  transformationController: _t,
  minScale: 1,
  maxScale: 4,
  clipBehavior: Clip.none,
  // Optional: snap back to 1x when the fingers lift
  onInteractionEnd: (_) {
    if (_t.value.getMaxScaleOnAxis() < 1.05) _t.value = Matrix4.identity();
  },
  child: Image.asset('assets/photo.jpg'),
)`,
  },

  "tab-indicator": {
    apis: ["AnimatedPositioned", "GlobalKey", "RenderBox.localToGlobal"],
    code: c`// Measure each tab, then animate the underline's left and width
final _rowKey = GlobalKey();
late final _keys = List.generate(tabs.length, (_) => GlobalKey());
int selected = 0;
Rect indicator = Rect.zero;

void select(int i) {
  final tab = _keys[i].currentContext!.findRenderObject() as RenderBox;
  final row = _rowKey.currentContext!.findRenderObject() as RenderBox;
  final pos = tab.localToGlobal(Offset.zero, ancestor: row);
  setState(() { selected = i; indicator = pos & tab.size; });
}

@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) => select(0)); // measure after the first layout
}

@override
Widget build(BuildContext context) => Stack(key: _rowKey, children: [
  Row(children: [
    for (var i = 0; i < tabs.length; i++)
      TextButton(key: _keys[i], onPressed: () => select(i), child: Text(tabs[i])),
  ]),
  AnimatedPositioned(
    duration: const Duration(milliseconds: 300),
    curve: Curves.easeOutCubic,
    left: indicator.left, width: indicator.width, bottom: 0, height: 3,
    child: const ColoredBox(color: accent),
  ),
]);
// Material's TabBar does the same with its animated indicator.`,
  },

  "swipe-delete": {
    apis: ["Dismissible", "DismissDirection.endToStart", "resizeDuration"],
    code: c`// Dismissible handles the swipe, the revealed action and the row collapse
Dismissible(
  key: ValueKey(item.id),
  direction: DismissDirection.endToStart,
  background: Container(
    color: Colors.red,
    alignment: Alignment.centerRight,
    padding: const EdgeInsets.only(right: 24),
    child: const Icon(Icons.delete, color: Colors.white),
  ),
  resizeDuration: const Duration(milliseconds: 250), // the collapse
  onDismissed: (_) => setState(() => items.remove(item)),
  child: ItemRow(item),
)`,
  },

  ripple: {
    apis: ["InkWell", "Material", "splashColor"],
    code: c`// Material's InkWell grows a ripple from the tap point, clipped to the shape
Material(
  color: accent,
  borderRadius: BorderRadius.circular(12),
  clipBehavior: Clip.antiAlias,
  child: InkWell(
    onTap: onTap,
    splashColor: Colors.white24,
    splashFactory: InkRipple.splashFactory, // classic ripple instead of the M3 sparkle
    child: const Padding(
      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Text('Tap me', style: TextStyle(color: Colors.white)),
    ),
  ),
)`,
  },

  "dvd-bounce": {
    apis: ["repeat(reverse: true)", "Listenable.merge", "TickerProviderStateMixin"],
    code: c`// Two controllers with different periods ping-pong X and Y independently
// (needs TickerProviderStateMixin for two controllers)
late final _x = AnimationController(vsync: this, duration: const Duration(milliseconds: 3100))
  ..repeat(reverse: true);
late final _y = AnimationController(vsync: this, duration: const Duration(milliseconds: 2300))
  ..repeat(reverse: true);

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) => AnimatedBuilder(
  animation: Listenable.merge([_x, _y]),
  builder: (_, child) => Transform.translate(
    offset: Offset(_x.value * (box.maxWidth - 80), _y.value * (box.maxHeight - 40)),
    child: child,
  ),
  child: const Logo(width: 80, height: 40),
));`,
  },

  "stroke-draw": {
    apis: ["CustomPainter", "Path.computeMetrics", "PathMetric.extractPath"],
    code: c`class StrokePainter extends CustomPainter {
  StrokePainter(this.path, this.progress) : super(repaint: progress);
  final Path path;
  final Animation<double> progress;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round
      ..color = accent;
    // Draw the first N% of every contour
    for (final metric in path.computeMetrics()) {
      canvas.drawPath(metric.extractPath(0, metric.length * progress.value), paint);
    }
  }

  @override
  bool shouldRepaint(StrokePainter old) => old.path != path;
}

// _c = AnimationController(vsync: this, duration: const Duration(seconds: 2))..forward();
// signaturePath: build a Path, or parse SVG "d" data with the path_drawing package.
CustomPaint(
  size: const Size(200, 120),
  painter: StrokePainter(signaturePath, CurvedAnimation(parent: _c, curve: Curves.easeInOut)),
)`,
  },

  "activity-rings": {
    apis: ["CustomPainter", "Canvas.drawArc", "Curves.easeOutCubic"],
    code: c`class RingsPainter extends CustomPainter {
  RingsPainter(this.t) : super(repaint: t);
  final Animation<double> t;
  static const goals = [0.8, 0.65, 0.9];
  static const colors = [Color(0xFFFA114F), Color(0xFF92E82A), Color(0xFF1EEAEF)];

  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    for (var i = 0; i < 3; i++) {
      final r = size.shortestSide / 2 - 10 - i * 22;
      final stroke = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 18
        ..strokeCap = StrokeCap.round;
      canvas.drawCircle(c, r, stroke..color = colors[i].withValues(alpha: 0.2));
      canvas.drawArc(Rect.fromCircle(center: c, radius: r), -pi / 2,
          2 * pi * goals[i] * t.value, false, stroke..color = colors[i]);
    }
  }

  @override
  bool shouldRepaint(RingsPainter old) => false;
}

// _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..forward();
CustomPaint(
  size: const Size.square(200),
  painter: RingsPainter(CurvedAnimation(parent: _c, curve: Curves.easeOutCubic)),
)`,
  },

  breathe: {
    apis: ["repeat(reverse: true)", "Curves.easeInOut", "Transform.rotate"],
    code: c`// 4 s in, 4 s out, forever
late final _c = AnimationController(vsync: this, duration: const Duration(seconds: 4))
  ..repeat(reverse: true);

@override
Widget build(BuildContext context) => AnimatedBuilder(
  animation: _c,
  builder: (_, __) {
    final t = Curves.easeInOut.transform(_c.value);
    return Transform.rotate(
      angle: t * pi / 3,
      child: Stack(alignment: Alignment.center, children: [
        for (var i = 0; i < 6; i++)
          Transform.rotate(
            angle: i * pi / 3,
            child: Transform.translate(
              offset: Offset(0, -40 * t), // petals move out from the center
              child: Opacity(opacity: 0.6, child: Petal(size: 50 + 30 * t)),
            ),
          ),
      ]),
    );
  },
);`,
  },

  "swipe-reply": {
    apis: ["onHorizontalDragUpdate", "HapticFeedback", "Curves.easeOutBack"],
    code: c`static const threshold = 64.0;
double dx = 0;
bool _armed = false;
late Animation<double> _back;
late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 250))
  ..addListener(() => setState(() => dx = _back.value));

@override
Widget build(BuildContext context) => GestureDetector(
  onHorizontalDragUpdate: (d) {
    setState(() => dx = (dx + d.delta.dx).clamp(0.0, 100.0));
    if (!_armed && dx > threshold) {
      _armed = true;
      HapticFeedback.mediumImpact(); // fires once at the threshold
    } else if (_armed && dx < threshold) {
      _armed = false;
    }
  },
  onHorizontalDragEnd: (_) {
    if (_armed) widget.onReply();
    _armed = false;
    _back = Tween(begin: dx, end: 0.0).animate(CurvedAnimation(parent: _c, curve: Curves.easeOutBack));
    _c.forward(from: 0);
  },
  child: Stack(alignment: Alignment.centerLeft, children: [
    // Reply icon grows in as the bubble moves
    Padding(
      padding: const EdgeInsets.only(left: 16),
      child: Transform.scale(scale: (dx / threshold).clamp(0.0, 1.0), child: const Icon(Icons.reply)),
    ),
    Transform.translate(offset: Offset(dx, 0), child: const Bubble()),
  ]),
);`,
  },

  "spotify-header": {
    apis: ["ScrollController", "AnimatedBuilder", "Opacity"],
    code: c`final _scroll = ScrollController();

// 0 at the top, 1 after 250 px of scrolling
double get t => _scroll.hasClients ? (_scroll.offset / 250).clamp(0.0, 1.0) : 0.0;

@override
Widget build(BuildContext context) => Stack(children: [
  // Cover shrinks and fades
  AnimatedBuilder(
    animation: _scroll,
    builder: (_, child) => Positioned(
      top: 60, left: 0, right: 0,
      child: Opacity(
        opacity: 1 - t,
        child: Transform.scale(scale: 1 - 0.4 * t, child: child),
      ),
    ),
    child: const Center(child: Cover(size: 220)),
  ),
  ListView(controller: _scroll, padding: const EdgeInsets.only(top: 300), children: tracks),
  // Compact bar fades in over the last 30%
  AnimatedBuilder(
    animation: _scroll,
    builder: (_, child) => Opacity(opacity: ((t - 0.7) / 0.3).clamp(0.0, 1.0), child: child),
    child: const CompactTitleBar(),
  ),
]);`,
  },

  "pull-refresh": {
    apis: ["NotificationListener<ScrollNotification>", "BouncingScrollPhysics", "AnimationController.repeat"],
    code: c`static const threshold = 80.0;
double pull = 0;
bool refreshing = false;
late final _spin = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));

Future<void> _refresh() async {
  setState(() => refreshing = true);
  _spin.repeat();
  await widget.onRefresh();
  _spin.stop();
  setState(() => refreshing = false);
}

@override
Widget build(BuildContext context) => NotificationListener<ScrollNotification>(
  onNotification: (n) {
    if (n is ScrollUpdateNotification) {
      final p = (-n.metrics.pixels).clamp(0.0, 150.0); // overscroll at the top
      // Finger lifted (no drag details) while past the threshold: refresh once
      if (n.dragDetails == null && p > threshold && !refreshing) _refresh();
      setState(() => pull = p);
    }
    return false;
  },
  child: Stack(alignment: Alignment.topCenter, children: [
    Positioned(
      top: 16,
      child: AnimatedBuilder(
        animation: _spin,
        builder: (_, child) {
          final f = (pull / threshold).clamp(0.0, 1.0);
          return Opacity(
            opacity: refreshing ? 1 : f,
            child: Transform.rotate(
              angle: refreshing ? _spin.value * 2 * pi : f * pi,
              child: Transform.scale(scale: 0.5 + 0.5 * f, child: child),
            ),
          );
        },
        child: const Icon(Icons.refresh, size: 32),
      ),
    ),
    ListView(
      physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
      children: rows,
    ),
  ]),
);
// RefreshIndicator is the stock Material version.`,
  },

  "perspective-menu": {
    apis: ["Matrix4.rotateY", "setEntry(3, 2) perspective", "AnimationController"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 450));

void toggle() => _c.isCompleted ? _c.reverse() : _c.forward();

@override
Widget build(BuildContext context) => Stack(children: [
  const SideMenu(), // sits behind the screen
  AnimatedBuilder(
    animation: _c,
    builder: (context, child) {
      final t = Curves.easeOutCubic.transform(_c.value);
      return Transform(
        alignment: Alignment.centerLeft,
        transform: Matrix4.identity()
          ..setEntry(3, 2, 0.0012)
          ..translate(MediaQuery.sizeOf(context).width * 0.6 * t)
          ..rotateY(-0.5 * t) // tilt back
          ..scale(1 - 0.15 * t),
        child: ClipRRect(borderRadius: BorderRadius.circular(24 * t), child: child),
      );
    },
    child: HomeScreen(onMenu: toggle),
  ),
]);`,
  },

  "stories-cube": {
    apis: ["PageView", "PageController.page", "Matrix4.rotateY"],
    code: c`// Each page rotates around the shared edge, driven by the PageView's position
final _pages = PageController();

@override
Widget build(BuildContext context) => PageView.builder(
  controller: _pages,
  itemCount: stories.length,
  itemBuilder: (context, i) => AnimatedBuilder(
    animation: _pages,
    builder: (context, child) {
      final page = _pages.hasClients && _pages.position.haveDimensions ? _pages.page! : 0.0;
      final d = i - page; // -1..1 for the two faces on screen
      return Transform(
        // Incoming face hinges on its left edge, outgoing face on its right
        alignment: d > 0 ? Alignment.centerLeft : Alignment.centerRight,
        transform: Matrix4.identity()
          ..setEntry(3, 2, 0.001)
          ..rotateY(d * pi / 2),
        child: child,
      );
    },
    child: StoryView(stories[i]),
  ),
);`,
  },

  "circular-slider": {
    apis: ["GestureDetector.onPan", "atan2", "CustomPainter"],
    code: c`double angle = 0; // radians, 0 = 12 o'clock

void _update(Offset local, Size size) {
  final v = local - size.center(Offset.zero);
  setState(() => angle = (atan2(v.dx, -v.dy) + 2 * pi) % (2 * pi));
}

String hm(int m) => (m ~/ 60).toString().padLeft(2, '0') + ':' + (m % 60).toString().padLeft(2, '0');

@override
Widget build(BuildContext context) {
  const size = Size.square(260);
  final minutes = (angle / (2 * pi) * 24 * 60).round();
  return GestureDetector(
    onPanDown: (d) => _update(d.localPosition, size),
    onPanUpdate: (d) => _update(d.localPosition, size),
    child: CustomPaint(
      size: size,
      painter: ArcPainter(angle),
      child: SizedBox.fromSize(size: size, child: Center(child: Text(hm(minutes)))),
    ),
  );
}

class ArcPainter extends CustomPainter {
  ArcPainter(this.angle);
  final double angle;

  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    final r = size.width / 2 - 20;
    final stroke = Paint()..style = PaintingStyle.stroke..strokeWidth = 24..strokeCap = StrokeCap.round;
    canvas.drawCircle(c, r, stroke..color = track);
    canvas.drawArc(Rect.fromCircle(center: c, radius: r), -pi / 2, angle, false, stroke..color = accent);
    canvas.drawCircle(c + Offset(sin(angle), -cos(angle)) * r, 14, Paint()..color = Colors.white); // knob
  }

  @override
  bool shouldRepaint(ArcPainter old) => old.angle != angle;
}`,
  },

  "mini-player": {
    apis: ["AnimationController.fling", "onVerticalDragUpdate", "Positioned"],
    code: c`// _c.value: 0 = mini bar, 1 = full screen
late final _c = AnimationController(vsync: this);
static const miniHeight = 64.0;

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) {
  final range = box.maxHeight - miniHeight;
  return Stack(children: [
    const HomeScreen(),
    AnimatedBuilder(
      animation: _c,
      builder: (context, _) => Positioned(
        left: 0, right: 0, bottom: 0,
        height: miniHeight + range * _c.value,
        child: GestureDetector(
          onTap: () => _c.fling(),
          onVerticalDragUpdate: (d) => _c.value -= d.delta.dy / range,
          onVerticalDragEnd: (d) {
            final v = -d.velocity.pixelsPerSecond.dy / range;
            final open = v.abs() > 1 ? v > 0 : _c.value > 0.5;
            _c.fling(velocity: open ? max(v, 1) : min(v, -1)); // spring to 0 or 1
          },
          child: Stack(fit: StackFit.expand, children: [
            Opacity(opacity: (1 - _c.value * 3).clamp(0.0, 1.0), child: const MiniBar()),
            Opacity(opacity: _c.value, child: const FullPlayer()),
          ]),
        ),
      ),
    ),
  ]);
});`,
  },

  "liquid-swipe": {
    apis: ["CustomClipper<Path>", "ClipPath", "Path.cubicTo"],
    code: c`// Clip the next page with a bulging wave whose reveal follows the drag
class LiquidClipper extends CustomClipper<Path> {
  LiquidClipper(this.progress, this.centerY);
  final double progress; // 0 = small tab at the right edge, 1 = full page
  final double centerY;

  @override
  Path getClip(Size size) {
    final x = size.width * (1 - progress);           // reveal edge
    final bulge = 80 * (1 - progress) + 20;          // bulge flattens as it fills
    final r = size.height * 0.25 * (0.4 + progress); // bulge height
    return Path()
      ..moveTo(size.width, 0)
      ..lineTo(x, 0)
      ..lineTo(x, centerY - r)
      ..cubicTo(x, centerY - r / 2, x - bulge, centerY - r / 2, x - bulge, centerY)
      ..cubicTo(x - bulge, centerY + r / 2, x, centerY + r / 2, x, centerY + r)
      ..lineTo(x, size.height)
      ..lineTo(size.width, size.height)
      ..close();
  }

  @override
  bool shouldReclip(LiquidClipper old) => old.progress != progress || old.centerY != centerY;
}

// Drag: _c.value -= d.delta.dx / width; dragY = d.localPosition.dy
// Release: _c.fling(velocity: _c.value > 0.4 ? 1 : -1)
AnimatedBuilder(
  animation: _c,
  builder: (_, __) => Stack(children: [
    const CurrentPage(),
    ClipPath(clipper: LiquidClipper(_c.value, dragY), child: const NextPage()),
  ]),
)`,
  },

  "chart-scrub": {
    apis: ["onHorizontalDragUpdate", "CustomPainter", "setState"],
    code: c`double? scrubX;

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) {
  final size = Size(box.maxWidth, 200);
  final last = prices.length - 1;
  final i = scrubX == null ? last : (scrubX! / size.width * last).round().clamp(0, last);
  return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text('\$' + prices[i].toStringAsFixed(2), style: Theme.of(context).textTheme.headlineMedium),
    GestureDetector(
      onHorizontalDragStart: (d) => setState(() => scrubX = d.localPosition.dx),
      onHorizontalDragUpdate: (d) => setState(() => scrubX = d.localPosition.dx.clamp(0.0, size.width)),
      onHorizontalDragEnd: (_) => setState(() => scrubX = null),
      child: CustomPaint(
        size: size,
        // Draws the line Path; when cursorIndex != null, a vertical rule and a dot at that point
        painter: ChartPainter(prices, cursorIndex: scrubX == null ? null : i),
      ),
    ),
  ]);
});
// For very long series, keep scrubX in a ValueNotifier so only the label and painter rebuild.`,
  },

  "shared-expand": {
    apis: ["Hero", "PageRouteBuilder", "Navigator.pop"],
    code: c`// Thumbnail: Hero flies it into the detail route
GestureDetector(
  onTap: () => Navigator.of(context).push(PageRouteBuilder(
    opaque: false,
    transitionDuration: const Duration(milliseconds: 350),
    pageBuilder: (_, anim, __) => FadeTransition(opacity: anim, child: Detail(item)),
  )),
  child: Hero(tag: item.id, child: Thumb(item)),
)

// Detail: drag down to shrink it, release past 120 px to fly back
class _DetailState extends State<Detail> {
  Offset drag = Offset.zero;

  @override
  Widget build(BuildContext context) {
    final scale = (1 - drag.dy / 1000).clamp(0.7, 1.0);
    return GestureDetector(
      onPanUpdate: (d) => setState(() => drag += d.delta),
      onPanEnd: (_) {
        if (drag.dy > 120) {
          Navigator.pop(context); // the Hero animates back to the thumbnail
        } else {
          setState(() => drag = Offset.zero);
        }
      },
      child: Transform.translate(
        offset: drag,
        child: Transform.scale(
          scale: scale,
          child: Hero(tag: widget.item.id, child: FullImage(widget.item)),
        ),
      ),
    );
  }
}`,
  },

  "word-drag": {
    apis: ["Draggable", "DragTarget", "TweenAnimationBuilder", "Curves.elasticOut"],
    code: c`List<String> bank = ['I', 'like', 'green', 'apples'];
List<String> answer = [];

void move(String w, {required bool toAnswer}) => setState(() {
  (toAnswer ? bank : answer).remove(w);
  (toAnswer ? answer : bank).add(w);
});

// A chip that springs into its slot whenever it lands in a new line
Widget chip(String w, {required bool inAnswer}) => TweenAnimationBuilder<double>(
  key: ValueKey((inAnswer ? 'a-' : 'b-') + w),
  tween: Tween(begin: 0.6, end: 1),
  duration: const Duration(milliseconds: 500),
  curve: Curves.elasticOut,
  builder: (_, s, child) => Transform.scale(scale: s, child: child),
  child: Draggable<String>(
    data: w,
    feedback: Material(color: Colors.transparent, child: WordChip(w, lifted: true)),
    childWhenDragging: WordChip(w, ghost: true),
    child: GestureDetector(
      onTap: () => move(w, toAnswer: !inAnswer),
      child: WordChip(w),
    ),
  ),
);

@override
Widget build(BuildContext context) => Column(children: [
  DragTarget<String>(
    onAcceptWithDetails: (d) { if (bank.contains(d.data)) move(d.data, toAnswer: true); },
    builder: (context, _, __) => Container(
      constraints: const BoxConstraints(minHeight: 56),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: line))),
      child: Wrap(spacing: 8, children: [for (final w in answer) chip(w, inAnswer: true)]),
    ),
  ),
  const SizedBox(height: 32),
  DragTarget<String>(
    onAcceptWithDetails: (d) { if (answer.contains(d.data)) move(d.data, toAnswer: false); },
    builder: (context, _, __) => Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [for (final w in bank) chip(w, inAnswer: false)],
    ),
  ),
]);`,
  },

  "tab-reorder": {
    apis: ["LongPressDraggable", "DragTarget", "AnimatedPositioned"],
    code: c`// Tiles are placed with AnimatedPositioned, so changing the order animates the grid
static const cols = 2, tileH = 160.0, gap = 12.0;
List<BrowserTab> tabs = sampleTabs;

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) {
  final tileW = (box.maxWidth - gap) / cols;
  final rows = (tabs.length / cols).ceil();
  return SizedBox(
    height: rows * (tileH + gap),
    child: Stack(children: [
      for (final tab in tabs)
        AnimatedPositioned(
          key: ValueKey(tab.id),
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          left: (tabs.indexOf(tab) % cols) * (tileW + gap),
          top: (tabs.indexOf(tab) ~/ cols) * (tileH + gap),
          width: tileW,
          height: tileH,
          child: DragTarget<BrowserTab>(
            // Hovering another tile moves the dragged one into its slot
            onWillAcceptWithDetails: (d) {
              if (d.data != tab) {
                setState(() {
                  final to = tabs.indexOf(tab);
                  tabs.remove(d.data);
                  tabs.insert(to, d.data);
                });
              }
              return true;
            },
            builder: (context, _, __) => LongPressDraggable<BrowserTab>(
              data: tab,
              feedback: SizedBox(
                width: tileW,
                height: tileH,
                child: Transform.scale(scale: 1.05, child: TabTile(tab, lifted: true)),
              ),
              childWhenDragging: const SizedBox.shrink(),
              child: TabTile(tab),
            ),
          ),
        ),
    ]),
  );
});`,
  },

  "sticky-tabs": {
    apis: ["SliverPersistentHeader(pinned)", "Scrollable.ensureVisible", "ScrollController"],
    code: c`// One key per section; the active tab is the last section whose top has passed the bar
final _scroll = ScrollController();
late final _keys = List.generate(sections.length, (_) => GlobalKey());
int active = 0;
static const barBottom = 140.0; // status bar + app bar + tab bar

@override
void initState() {
  super.initState();
  _scroll.addListener(() {
    var i = 0;
    for (var k = 0; k < _keys.length; k++) {
      final box = _keys[k].currentContext?.findRenderObject() as RenderBox?;
      if (box != null && box.localToGlobal(Offset.zero).dy <= barBottom) i = k;
    }
    if (i != active) setState(() => active = i);
  });
}

void jump(int i) => Scrollable.ensureVisible(
  _keys[i].currentContext!,
  duration: const Duration(milliseconds: 400),
  curve: Curves.easeInOut,
);

@override
Widget build(BuildContext context) => CustomScrollView(controller: _scroll, slivers: [
  const SliverAppBar(expandedHeight: 200, flexibleSpace: FlexibleSpaceBar(background: HeaderImage())),
  // pinned: the tab row sticks under the app bar; it scrolls itself to keep the active tab visible
  SliverPersistentHeader(pinned: true, delegate: TabsBarDelegate(active: active, onTap: jump)),
  for (var i = 0; i < sections.length; i++)
    SliverToBoxAdapter(child: KeyedSubtree(key: _keys[i], child: SectionView(sections[i]))),
]);`,
  },

  "click-wheel": {
    apis: ["GestureDetector.onPan", "atan2", "HapticFeedback.selectionClick"],
    code: c`static const step = pi / 6; // 30° of rotation per item
double? _lastAngle;
double _acc = 0;
int selected = 0;

void _onPan(Offset local, Size size) {
  final v = local - size.center(Offset.zero);
  final a = atan2(v.dy, v.dx);
  if (_lastAngle != null) {
    var d = a - _lastAngle!;
    if (d > pi) d -= 2 * pi; // unwrap across ±180°
    if (d < -pi) d += 2 * pi;
    _acc += d;
    while (_acc.abs() >= step) {
      final dir = _acc > 0 ? 1 : -1;
      _acc -= dir * step;
      setState(() => selected = (selected + dir).clamp(0, items.length - 1));
      HapticFeedback.selectionClick(); // the click
    }
  }
  _lastAngle = a;
}

@override
Widget build(BuildContext context) => GestureDetector(
  onPanStart: (_) { _lastAngle = null; _acc = 0; },
  onPanUpdate: (d) => _onPan(d.localPosition, const Size.square(220)),
  child: const ClickWheel(size: 220),
);`,
  },

  "jelly-scroll": {
    apis: ["NotificationListener<ScrollNotification>", "Matrix4.skewY", "SpringSimulation"],
    code: c`// Skew rows by the scroll velocity, then let a spring settle the skew back to 0
late final _skew = AnimationController.unbounded(vsync: this);

bool _onScroll(ScrollNotification n) {
  if (n is ScrollUpdateNotification) {
    final v = n.scrollDelta ?? 0; // px per frame ≈ velocity
    _skew.value = (v / 400).clamp(-0.25, 0.25);
  } else if (n is ScrollEndNotification) {
    const spring = SpringDescription(mass: 1, stiffness: 120, damping: 8);
    _skew.animateWith(SpringSimulation(spring, _skew.value, 0, 0));
  }
  return false;
}

@override
Widget build(BuildContext context) => NotificationListener<ScrollNotification>(
  onNotification: _onScroll,
  child: ListView.builder(
    itemCount: 50,
    itemBuilder: (_, i) => AnimatedBuilder(
      animation: _skew,
      builder: (_, child) => Transform(
        alignment: Alignment.center,
        transform: Matrix4.skewY(_skew.value),
        child: child,
      ),
      child: ItemRow(i),
    ),
  ),
);`,
  },

  "wallet-stack": {
    apis: ["AnimatedPositioned", "Curves.easeOutBack"],
    code: c`int? selected;

double _top(int i, double height) {
  if (selected == null) return 40.0 + i * 60;  // fanned stack
  if (i == selected) return 40;                // rises to the top
  final rest = i < selected! ? i : i - 1;      // the others collapse at the bottom
  return height - 120 + rest * 10;
}

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) => Stack(children: [
  for (var i = 0; i < cards.length; i++)
    AnimatedPositioned(
      duration: const Duration(milliseconds: 450),
      curve: Curves.easeOutBack,
      left: 16,
      right: 16,
      height: 200,
      top: _top(i, box.maxHeight),
      child: GestureDetector(
        onTap: () => setState(() => selected = selected == i ? null : i),
        child: WalletCard(cards[i]),
      ),
    ),
]));`,
  },

  "theme-reveal": {
    apis: ["ClipPath", "CustomClipper<Path>", "Theme"],
    code: c`// Render the new theme on top, clipped to a circle growing from the toggle.
// Flutter can build both themes at once, so no snapshot of the old screen is needed.
late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 600), value: 1);
bool dark = false;
Offset origin = Offset.zero;

void toggle(Offset tapGlobal) {
  setState(() { origin = tapGlobal; dark = !dark; });
  _c.forward(from: 0);
}

@override
Widget build(BuildContext context) => LayoutBuilder(builder: (context, box) {
  final maxR = sqrt(pow(box.maxWidth, 2) + pow(box.maxHeight, 2)); // reaches every corner
  return Stack(children: [
    Theme(data: dark ? lightTheme : darkTheme, child: Screen(onToggle: toggle)), // old
    AnimatedBuilder(
      animation: _c,
      builder: (_, child) => ClipPath(
        clipper: CircleClipper(origin, maxR * Curves.easeInOut.transform(_c.value)),
        child: child,
      ),
      child: Theme(data: dark ? darkTheme : lightTheme, child: Screen(onToggle: toggle)), // new
    ),
  ]);
});

class CircleClipper extends CustomClipper<Path> {
  CircleClipper(this.center, this.radius);
  final Offset center;
  final double radius;

  @override
  Path getClip(Size size) => Path()..addOval(Rect.fromCircle(center: center, radius: radius));

  @override
  bool shouldReclip(CircleClipper old) => old.radius != radius || old.center != center;
}`,
  },

  "picker-wheel": {
    apis: ["ListWheelScrollView", "FixedExtentScrollPhysics", "diameterRatio"],
    code: c`// ListWheelScrollView curves rows on a cylinder and snaps to each item
SizedBox(
  height: 200,
  child: ListWheelScrollView.useDelegate(
    itemExtent: 40,
    diameterRatio: 1.4, // smaller = stronger curve
    perspective: 0.003,
    useMagnifier: true,
    magnification: 1.15,
    physics: const FixedExtentScrollPhysics(), // snap
    onSelectedItemChanged: (_) => HapticFeedback.selectionClick(),
    childDelegate: ListWheelChildBuilderDelegate(
      childCount: 24,
      builder: (_, i) => Center(child: Text(i.toString().padLeft(2, '0'))),
    ),
  ),
)
// CupertinoPicker wraps the same widget with iOS styling.`,
  },

  coverflow: {
    apis: ["PageView", "viewportFraction", "Matrix4.rotateY"],
    code: c`final _pages = PageController(viewportFraction: 0.5);

@override
Widget build(BuildContext context) => SizedBox(
  height: 260,
  child: PageView.builder(
    controller: _pages,
    itemCount: items.length,
    itemBuilder: (context, i) => AnimatedBuilder(
      animation: _pages,
      builder: (context, child) {
        final page = _pages.hasClients && _pages.position.haveDimensions ? _pages.page! : 0.0;
        final d = (i - page).clamp(-1.0, 1.0); // 0 = centered
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.002)
            ..rotateY(-d * 0.9)          // neighbors turn away
            ..scale(1 - 0.25 * d.abs()), // and shrink
          child: child,
        );
      },
      child: Cover(items[i]),
    ),
  ),
);`,
  },

  // ---------- everyday UI additions ----------

  "count-up": {
    apis: ["TweenAnimationBuilder", "Curves.easeOutCubic", "FontFeature.tabularFigures"],
    code: c`TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: 1280),
  duration: const Duration(milliseconds: 1200),
  curve: Curves.easeOutCubic,
  builder: (context, v, _) => Text(
    v.round().toString(),
    style: const TextStyle(
      fontSize: 32,
      fontWeight: FontWeight.bold,
      fontFeatures: [FontFeature.tabularFigures()], // digits keep a fixed width
    ),
  ),
)
// Change "end" later and it animates from the current value to the new one.`,
  },

  toast: {
    apis: ["AnimatedSlide", "AnimatedOpacity", "Timer"],
    code: c`// A top toast; ScaffoldMessenger.showSnackBar is the stock bottom version
bool visible = false;
String text = '';
Timer? _timer;

void show(String message) {
  _timer?.cancel();
  setState(() { text = message; visible = true; });
  _timer = Timer(const Duration(milliseconds: 2500), () => setState(() => visible = false)); // auto dismiss
}

@override
Widget build(BuildContext context) => Stack(children: [
  const PageContent(),
  Positioned(
    top: MediaQuery.paddingOf(context).top + 8,
    left: 16,
    right: 16,
    child: AnimatedSlide(
      offset: visible ? Offset.zero : const Offset(0, -2),
      duration: const Duration(milliseconds: 350),
      curve: visible ? Curves.easeOutBack : Curves.easeIn,
      child: AnimatedOpacity(
        opacity: visible ? 1 : 0,
        duration: const Duration(milliseconds: 250),
        child: Toast(text: text),
      ),
    ),
  ),
]);`,
  },

  "menu-morph": {
    apis: ["AnimatedIcon", "AnimatedIcons.menu_close", "AnimationController"],
    code: c`// Built in: AnimatedIcons.menu_close morphs ≡ into ✕
late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));

IconButton(
  onPressed: () => _c.isDismissed ? _c.forward() : _c.reverse(),
  icon: AnimatedIcon(icon: AnimatedIcons.menu_close, progress: _c, size: 28),
)
// Other built-ins: menu_arrow, play_pause, arrow_menu, close_menu...`,
  },

  "floating-label": {
    apis: ["InputDecoration.labelText", "FloatingLabelBehavior.auto", "floatingLabelStyle"],
    code: c`// Material's InputDecoration floats the label for you, animated
TextField(
  decoration: InputDecoration(
    labelText: 'Email',
    floatingLabelBehavior: FloatingLabelBehavior.auto, // floats when focused or filled
    floatingLabelStyle: TextStyle(color: Theme.of(context).colorScheme.primary),
    border: const OutlineInputBorder(),
  ),
)`,
  },

  marquee: {
    apis: ["AnimationController.repeat", "OverflowBox", "Transform.translate"],
    code: c`// Two copies in a row, slid left by one copy's width on a linear loop
late final _c = AnimationController(vsync: this, duration: const Duration(seconds: 12))..repeat();
final _rowKey = GlobalKey();
double _w = 0;

@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) => setState(() =>
      _w = (_rowKey.currentContext!.findRenderObject() as RenderBox).size.width));
}

// Every item carries the same right padding, so the two copies tile exactly
Widget copy({Key? key}) => Row(key: key, mainAxisSize: MainAxisSize.min, children: items);

@override
Widget build(BuildContext context) => SizedBox(
  height: 40,
  child: ClipRect(
    child: AnimatedBuilder(
      animation: _c,
      builder: (_, child) => Transform.translate(offset: Offset(-_w * _c.value, 0), child: child),
      child: OverflowBox(
        maxWidth: double.infinity,
        alignment: Alignment.centerLeft,
        child: Row(mainAxisSize: MainAxisSize.min, children: [copy(key: _rowKey), copy()]),
      ),
    ),
  ),
);`,
  },

  "success-check": {
    apis: ["Interval", "ScaleTransition", "PathMetric.extractPath"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..forward();
late final _scale = CurvedAnimation(parent: _c, curve: const Interval(0, 0.5, curve: Curves.elasticOut));
late final _draw = CurvedAnimation(parent: _c, curve: const Interval(0.4, 1, curve: Curves.easeOutCubic));

@override
Widget build(BuildContext context) => ScaleTransition(
  scale: _scale,
  child: Container(
    width: 56,
    height: 56,
    decoration: const BoxDecoration(color: accent, shape: BoxShape.circle),
    child: CustomPaint(painter: CheckPainter(_draw)),
  ),
);

class CheckPainter extends CustomPainter {
  CheckPainter(this.t) : super(repaint: t);
  final Animation<double> t;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 52;
    final path = Path()..moveTo(15 * s, 27 * s)..lineTo(22 * s, 34 * s)..lineTo(37 * s, 19 * s);
    final metric = path.computeMetrics().first;
    canvas.drawPath(
      metric.extractPath(0, metric.length * t.value), // draw the first N% of the check
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4 * s
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(CheckPainter old) => false;
}`,
  },

  "fab-menu": {
    apis: ["Interval", "Curves.easeOutBack", "RotationTransition"],
    code: c`late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 350));
static const icons = [Icons.photo_camera, Icons.image, Icons.attach_file];

@override
Widget build(BuildContext context) => SizedBox(
  width: 56,
  height: 56 + icons.length * 60.0,
  child: Stack(alignment: Alignment.bottomCenter, children: [
    for (var i = 0; i < icons.length; i++)
      AnimatedBuilder(
        animation: _c,
        builder: (_, child) {
          // Stagger: each action uses a later slice of the same timeline
          final t = Interval(i * 0.15, 0.55 + i * 0.15, curve: Curves.easeOutBack).transform(_c.value);
          return IgnorePointer(
            ignoring: _c.isDismissed,
            child: Transform.translate(
              offset: Offset(0, -(i + 1) * 60 * t),
              child: Opacity(
                opacity: t.clamp(0.0, 1.0),
                child: Transform.scale(scale: 0.3 + 0.7 * t, child: child),
              ),
            ),
          );
        },
        child: FloatingActionButton.small(heroTag: null, onPressed: () {}, child: Icon(icons[i])),
      ),
    FloatingActionButton(
      onPressed: () => _c.isDismissed ? _c.forward() : _c.reverse(),
      child: RotationTransition(
        turns: Tween(begin: 0.0, end: 0.125).animate(_c), // 45°: + becomes ✕
        child: const Icon(Icons.add),
      ),
    ),
  ]),
);`,
  },

  "page-dots": {
    apis: ["PageController.page", "AnimatedBuilder", "PageView"],
    code: c`final _pages = PageController();

@override
Widget build(BuildContext context) => Column(children: [
  Expanded(child: PageView(controller: _pages, children: pages)),
  AnimatedBuilder(
    animation: _pages,
    builder: (_, __) {
      final page = _pages.hasClients && _pages.position.haveDimensions ? _pages.page! : 0.0;
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(pages.length, (i) {
          final d = (page - i).abs().clamp(0.0, 1.0); // 0 = active; fractional while swiping
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: 22 - 14 * d,
            height: 8,
            decoration: BoxDecoration(
              color: accent.withValues(alpha: 1 - 0.65 * d),
              borderRadius: BorderRadius.circular(4),
            ),
          );
        }),
      );
    },
  ),
]);`,
  },

  "hide-header": {
    apis: ["SliverAppBar(floating, snap)", "CustomScrollView"],
    code: c`// SliverAppBar with floating + snap: hides on scroll down, returns on any scroll up
CustomScrollView(slivers: [
  const SliverAppBar(
    title: Text('Inbox'),
    floating: true, // comes back as soon as you scroll up
    snap: true,     // and animates fully in or out, never half-way
  ),
  SliverList.builder(
    itemCount: 50,
    itemBuilder: (_, i) => ListTile(title: Text('Row $i')),
  ),
])`,
  },

  "button-loading": {
    apis: ["AnimatedContainer", "AnimatedSwitcher", "CircularProgressIndicator"],
    code: c`bool loading = false;

Future<void> _submit() async {
  setState(() => loading = true);
  await widget.onPay();
  if (mounted) setState(() => loading = false);
}

@override
Widget build(BuildContext context) => GestureDetector(
  onTap: loading ? null : _submit,
  child: AnimatedContainer(
    duration: const Duration(milliseconds: 300),
    curve: Curves.easeInOut,
    width: loading ? 52 : 220, // shrinks into a circle
    height: 52,
    alignment: Alignment.center,
    clipBehavior: Clip.antiAlias,
    decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(26)),
    child: AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      child: loading
          ? const SizedBox(
              key: ValueKey('spinner'),
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
            )
          : const Text(
              'Pay now',
              key: ValueKey('label'),
              maxLines: 1,
              softWrap: false,
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
    ),
  ),
);`,
  },

  // ---------- everyday UI additions, second batch ----------
  confetti: {
    apis: ["AnimationController", "CustomPainter", "repaint: listenable"],
    code: c`// One controller is the clock; a CustomPainter draws every piece from it (import 'dart:math')
late final controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600));
final random = Random();
List<Piece> pieces = [];

void fire() {
  pieces = List.generate(40, (i) => Piece(
    angle: -pi / 2 + (random.nextDouble() - 0.5) * 1.6, // mostly upward
    speed: 450 + random.nextDouble() * 350,              // px per second
    spin: (random.nextDouble() - 0.5) * 8 * pi,          // radians per second
    color: Colors.primaries[i % Colors.primaries.length],
  ));
  controller.forward(from: 0);
}

// Stack this over the screen
IgnorePointer(
  child: CustomPaint(size: Size.infinite, painter: ConfettiPainter(pieces, controller)),
);

class Piece {
  Piece({required this.angle, required this.speed, required this.spin, required this.color});
  final double angle, speed, spin;
  final Color color;
}

class ConfettiPainter extends CustomPainter {
  ConfettiPainter(this.pieces, this.progress) : super(repaint: progress); // repaints every tick
  final List<Piece> pieces;
  final Animation<double> progress;
  static const gravity = 900.0; // px per second²

  @override
  void paint(Canvas canvas, Size size) {
    if (progress.value == 0 || progress.value == 1) return;
    final t = progress.value * 1.6; // seconds
    final origin = size.center(Offset.zero);
    final fade = t > 1.2 ? (1.6 - t) / 0.4 : 1.0;
    final paint = Paint();
    for (final p in pieces) {
      final x = cos(p.angle) * p.speed * t;
      final y = sin(p.angle) * p.speed * t + 0.5 * gravity * t * t;
      paint.color = p.color.withValues(alpha: fade.clamp(0.0, 1.0));
      canvas.save();
      canvas.translate(origin.dx + x, origin.dy + y);
      canvas.rotate(p.spin * t);
      canvas.drawRect(const Rect.fromLTWH(-3, -5, 6, 10), paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(ConfettiPainter old) => old.pieces != pieces;
}`,
  },

  "star-rating": {
    apis: ["TweenAnimationBuilder", "Curves.elasticOut", "ValueKey"],
    code: c`// A new key restarts each star's tween when it turns on, so it pops in with an elastic curve
int rating = 0;

Row(
  mainAxisSize: MainAxisSize.min,
  children: List.generate(5, (i) {
    final on = i < rating;
    return GestureDetector(
      onTap: () => setState(() => rating = i + 1),
      child: TweenAnimationBuilder<double>(
        key: ValueKey('star-$i-$on'),
        tween: Tween(begin: on ? 0.5 : 1.0, end: 1.0),
        duration: Duration(milliseconds: 500 + i * 40), // later stars settle a touch later
        curve: Curves.elasticOut,
        builder: (context, scale, child) => Transform.scale(scale: scale, child: child),
        child: Padding(
          padding: const EdgeInsets.all(4),
          child: Icon(
            on ? Icons.star_rounded : Icons.star_outline_rounded,
            size: 36,
            color: on ? const Color(0xFFF5B301) : Colors.grey.shade400,
          ),
        ),
      ),
    );
  }),
);`,
  },

  "badge-bounce": {
    apis: ["AnimationController", "TweenSequence", "didUpdateWidget"],
    code: c`// One short controller restarts whenever count goes up: the badge pops, the bell wiggles
class BellBadge extends StatefulWidget {
  const BellBadge({super.key, required this.count});
  final int count;
  @override
  State<BellBadge> createState() => BellBadgeState();
}

class BellBadgeState extends State<BellBadge> with SingleTickerProviderStateMixin {
  late final pop = AnimationController(vsync: this, duration: const Duration(milliseconds: 450));
  late final scale = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.45), weight: 25),
    TweenSequenceItem(tween: Tween(begin: 1.45, end: 1.0).chain(CurveTween(curve: Curves.elasticOut)), weight: 75),
  ]).animate(pop);
  late final wiggle = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 0.0, end: 0.25), weight: 1),
    TweenSequenceItem(tween: Tween(begin: 0.25, end: -0.2), weight: 1),
    TweenSequenceItem(tween: Tween(begin: -0.2, end: 0.12), weight: 1),
    TweenSequenceItem(tween: Tween(begin: 0.12, end: 0.0), weight: 1),
  ]).animate(pop);

  @override
  void didUpdateWidget(covariant BellBadge old) {
    super.didUpdateWidget(old);
    if (widget.count > old.count) pop.forward(from: 0);
  }

  @override
  void dispose() {
    pop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: pop,
    builder: (context, _) => Stack(
      clipBehavior: Clip.none,
      children: [
        Transform.rotate(
          angle: wiggle.value, // radians
          alignment: Alignment.topCenter,
          child: const Icon(Icons.notifications_outlined, size: 28),
        ),
        if (widget.count > 0)
          Positioned(
            top: -6,
            right: -8,
            child: Transform.scale(
              scale: scale.value,
              child: Container(
                height: 20,
                constraints: const BoxConstraints(minWidth: 20),
                padding: const EdgeInsets.symmetric(horizontal: 5),
                alignment: Alignment.center,
                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                child: Text(
                  widget.count > 99 ? '99+' : widget.count.toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ),
      ],
    ),
  );
}`,
  },

  "scroll-progress": {
    apis: ["ScrollController", "ListenableBuilder", "LinearProgressIndicator"],
    code: c`// The bar's value is offset / maxScrollExtent, rebuilt on every scroll tick
final controller = ScrollController(); // dispose it in dispose()

Stack(
  children: [
    ListView(controller: controller, children: article),
    Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: ListenableBuilder(
        listenable: controller,
        builder: (context, _) {
          final ready = controller.hasClients && controller.position.hasContentDimensions;
          final max = ready ? controller.position.maxScrollExtent : 0.0;
          final progress = max > 0 ? (controller.offset / max).clamp(0.0, 1.0) : 0.0;
          return LinearProgressIndicator(value: progress, minHeight: 3);
        },
      ),
    ),
  ],
);`,
  },

  "segmented-control": {
    apis: ["AnimatedAlign", "FractionallySizedBox", "Curves.easeOutBack"],
    code: c`// AnimatedAlign slides the thumb: Alignment x runs from -1 (first segment) to 1 (last)
const options = ['Day', 'Week', 'Month'];
int selected = 0;

Container(
  height: 36,
  padding: const EdgeInsets.all(3),
  decoration: BoxDecoration(color: Colors.black12, borderRadius: BorderRadius.circular(10)),
  child: Stack(
    children: [
      AnimatedAlign(
        alignment: Alignment(-1 + 2 * selected / (options.length - 1), 0),
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutBack, // slight overshoot
        child: FractionallySizedBox(
          widthFactor: 1 / options.length,
          heightFactor: 1,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 3, offset: Offset(0, 1))],
            ),
          ),
        ),
      ),
      Positioned.fill(
        child: Row(
          children: [
            for (var i = 0; i < options.length; i++)
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => setState(() => selected = i),
                  child: Center(
                    child: Text(
                      options[i],
                      style: TextStyle(fontWeight: selected == i ? FontWeight.w600 : FontWeight.w400),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    ],
  ),
);`,
  },

  "skeleton-crossfade": {
    apis: ["AnimatedSwitcher", "layoutBuilder", "FadeTransition"],
    code: c`// AnimatedSwitcher crossfades by key; layoutBuilder stacks old and new so nothing jumps
AnimatedSwitcher(
  duration: const Duration(milliseconds: 300),
  layoutBuilder: (current, previous) => Stack(
    alignment: Alignment.topLeft,
    children: [...previous, if (current != null) current],
  ),
  child: post == null
      ? const PostSkeleton(key: ValueKey('skeleton'))
      : PostRow(post: post!, key: const ValueKey('content')),
);

// The placeholder pulses while it waits
class PostSkeleton extends StatefulWidget {
  const PostSkeleton({super.key});
  @override
  State<PostSkeleton> createState() => PostSkeletonState();
}

class PostSkeletonState extends State<PostSkeleton> with SingleTickerProviderStateMixin {
  late final pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 700))
    ..repeat(reverse: true);

  @override
  void dispose() {
    pulse.dispose();
    super.dispose();
  }

  Widget bone(double width, double height, double radius) => Container(
    width: width,
    height: height,
    decoration: BoxDecoration(color: Colors.black12, borderRadius: BorderRadius.circular(radius)),
  );

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: Tween(begin: 1.0, end: 0.5).animate(pulse),
    child: Row(
      children: [
        bone(40, 40, 20),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [bone(140, 10, 4), const SizedBox(height: 6), bone(90, 10, 4)],
        ),
      ],
    ),
  );
}`,
  },

  "auto-carousel": {
    apis: ["PageController.animateToPage", "Timer.periodic", "Listener"],
    code: c`// A periodic Timer calls animateToPage; a finger on the pager pauses it (import 'dart:async')
final controller = PageController();
Timer? timer;
int page = 0;

@override
void initState() {
  super.initState();
  start();
}

void start() {
  timer?.cancel();
  timer = Timer.periodic(const Duration(seconds: 3), (_) {
    page = (page + 1) % slides.length; // wraps back to the first slide
    controller.animateToPage(page, duration: const Duration(milliseconds: 500), curve: Curves.easeInOutCubic);
  });
}

@override
void dispose() {
  timer?.cancel();
  controller.dispose();
  super.dispose();
}

Stack(
  alignment: Alignment.bottomCenter,
  children: [
    Listener(
      onPointerDown: (_) => timer?.cancel(),
      onPointerUp: (_) => start(),
      child: SizedBox(
        height: 200,
        child: PageView.builder(
          controller: controller,
          itemCount: slides.length,
          onPageChanged: (i) => page = i,
          itemBuilder: (context, i) => Image(image: slides[i], fit: BoxFit.cover),
        ),
      ),
    ),
    // Dots follow the fractional page while it scrolls
    AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final p = controller.hasClients && controller.position.haveDimensions ? controller.page ?? 0.0 : 0.0;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < slides.length; i++)
                Builder(builder: (context) {
                  final t = (1 - (p - i).abs()).clamp(0.0, 1.0).toDouble();
                  return Container(
                    width: 8 + 14 * t,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.5 + 0.5 * t),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
            ],
          ),
        );
      },
    ),
  ],
);`,
  },

  "reorder-list": {
    apis: ["ReorderableListView", "proxyDecorator", "onReorder"],
    code: c`// ReorderableListView is built in: long-press a row to lift it, the others slide aside
ReorderableListView.builder(
  itemCount: items.length,
  onReorder: (from, to) => setState(() {
    if (to > from) to -= 1; // the list reports the index before removal
    items.insert(to, items.removeAt(from));
  }),
  // Style the lifted row: grow a little and raise its elevation as it lifts
  proxyDecorator: (child, index, animation) => AnimatedBuilder(
    animation: animation,
    builder: (context, child) {
      final t = Curves.easeOut.transform(animation.value);
      return Transform.scale(
        scale: 1 + 0.03 * t,
        child: Material(elevation: 8 * t, borderRadius: BorderRadius.circular(10), child: child),
      );
    },
    child: child,
  ),
  itemBuilder: (context, i) => ListTile(
    key: ValueKey(items[i].id), // keys are required
    title: Text(items[i].title),
    leading: const Icon(Icons.drag_indicator),
  ),
);`,
  },

  "sheet-scale": {
    apis: ["AnimationController", "Transform.scale", "onVerticalDragUpdate"],
    code: c`// One controller drives the sheet slide and the scale of the page behind it.
// Flutter 3.29+ also ships the iOS version as showCupertinoSheet; this is the hand-rolled one.
late final sheet = AnimationController(vsync: this, duration: const Duration(milliseconds: 350));

void open() => sheet.animateTo(1, curve: Curves.easeOutCubic);
void close() => sheet.animateBack(0, curve: Curves.easeInCubic);

@override
Widget build(BuildContext context) {
  final height = MediaQuery.sizeOf(context).height * 0.85;
  return ColoredBox(
    color: Colors.black,
    child: AnimatedBuilder(
      animation: sheet,
      child: AppScreen(onOpen: open), // built once, not every frame
      builder: (context, screen) {
        final t = sheet.value; // linear, so the sheet tracks the finger while dragging
        return Stack(
          children: [
            Transform.translate(
              offset: Offset(0, 10 * t),
              child: Transform.scale(
                scale: 1 - 0.08 * t,
                child: ClipRRect(borderRadius: BorderRadius.circular(12 * t), child: screen),
              ),
            ),
            IgnorePointer(
              child: ColoredBox(color: Colors.black.withValues(alpha: 0.4 * t), child: const SizedBox.expand()),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: height,
              child: Transform.translate(
                offset: Offset(0, (1 - t) * height),
                child: GestureDetector(
                  onVerticalDragUpdate: (d) => sheet.value -= d.delta.dy / height,
                  onVerticalDragEnd: (d) {
                    final fling = d.velocity.pixelsPerSecond.dy > 800;
                    fling || sheet.value < 0.6 ? close() : open();
                  },
                  child: Material(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    child: SheetContent(onClose: close),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    ),
  );
}`,
  },
  "slide-confirm": {
    apis: ["AnimationController", "GestureDetector.onHorizontalDragUpdate", "SpringSimulation"],
    code: c`// One controller (0..1) holds the knob position; dragging writes it, release springs it
const track = 280.0, knob = 48.0, pad = 4.0;
const travel = track - knob - pad * 2;
late final AnimationController slide = AnimationController(vsync: this);
bool confirmed = false;

void release(double velocity) {
  final lockIn = slide.value > 0.85 || velocity > 1200;
  final spring = SpringDescription.withDampingRatio(mass: 1, stiffness: 200, ratio: lockIn ? 0.9 : 0.6);
  slide.animateWith(SpringSimulation(spring, slide.value, lockIn ? 1 : 0, velocity / travel));
  if (lockIn && !confirmed) {
    setState(() => confirmed = true);
    onConfirm();
  }
}

AnimatedBuilder(
  animation: slide,
  builder: (context, _) {
    final x = slide.value * travel;
    return Container(
      width: track,
      height: knob + pad * 2,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(color: Colors.black12, borderRadius: BorderRadius.circular(999)),
      child: Stack(
        children: [
          Positioned(
            left: 0, top: 0, bottom: 0,
            width: x + knob + pad * 2,
            child: DecoratedBox(
              decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(999)),
            ),
          ),
          Center(
            child: Opacity(
              opacity: (1 - slide.value * 2).clamp(0.0, 1.0),
              child: const Text('Slide to confirm', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ),
          Positioned(
            left: pad + x,
            top: pad,
            child: GestureDetector(
              onHorizontalDragUpdate: confirmed
                  ? null
                  : (d) => slide.value = (slide.value + d.delta.dx / travel).clamp(0.0, 1.0),
              onHorizontalDragEnd: confirmed ? null : (d) => release(d.velocity.pixelsPerSecond.dx),
              child: Container(
                width: knob,
                height: knob,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 3, offset: Offset(0, 1))],
                ),
                child: Icon(Icons.chevron_right, color: accent),
              ),
            ),
          ),
        ],
      ),
    );
  },
);`,
  },
  typewriter: {
    apis: ["AnimationController", "IntTween", "AnimatedBuilder"],
    code: c`// One controller reveals characters (IntTween), a second one blinks the caret
late final AnimationController typing = AnimationController(
  vsync: this,
  duration: Duration(milliseconds: 45 * text.length),
)..forward();
late final AnimationController caret = AnimationController(
  vsync: this,
  duration: const Duration(milliseconds: 900),
)..repeat();
late final Animation<int> shown = IntTween(begin: 0, end: text.length).animate(typing);

Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    AnimatedBuilder(
      animation: shown,
      builder: (_, __) => Text(text.substring(0, shown.value), style: mono),
    ),
    AnimatedBuilder(
      animation: caret,
      builder: (_, __) => Opacity(
        opacity: caret.value < 0.5 ? 1 : 0, // hard blink, no fade
        child: Container(width: 2, height: 20, margin: const EdgeInsets.only(left: 2), color: accent),
      ),
    ),
  ],
);`,
  },
  "word-rotate": {
    apis: ["AnimatedSwitcher", "SlideTransition", "Timer.periodic"],
    code: c`// AnimatedSwitcher with a custom transition: new word slides up from below, old one up and out
const words = ['faster', 'smoother', 'together'];
int i = 0;
late final Timer timer = Timer.periodic(const Duration(seconds: 2), (_) {
  setState(() => i = (i + 1) % words.length);
});

Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    const Text('Build ', style: title),
    ClipRect(
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        switchInCurve: Curves.easeOutBack,
        transitionBuilder: (child, anim) {
          final incoming = child.key == ValueKey(i);
          final offset = Tween<Offset>(
            begin: incoming ? const Offset(0, 1) : const Offset(0, -1),
            end: Offset.zero,
          ).animate(anim);
          return SlideTransition(position: offset, child: FadeTransition(opacity: anim, child: child));
        },
        child: Text(words[i], key: ValueKey(i), style: title.copyWith(color: accent)),
      ),
    ),
  ],
);
// cancel the timer in dispose()`,
  },
  "text-reveal": {
    apis: ["AnimationController", "Interval", "SlideTransition"],
    code: c`// One controller, a staggered Interval per word
late final AnimationController c = AnimationController(
  vsync: this,
  duration: Duration(milliseconds: 450 + 80 * words.length),
)..forward();
final words = title.split(' ');

Wrap(
  children: [
    for (var i = 0; i < words.length; i++)
      Builder(builder: (_) {
        final start = (80 * i) / (450 + 80 * words.length);
        final anim = CurvedAnimation(
          parent: c,
          curve: Interval(start, (start + 0.6).clamp(0.0, 1.0), curve: Curves.easeOutBack),
        );
        return FadeTransition(
          opacity: anim,
          child: SlideTransition(
            position: Tween(begin: const Offset(0, 0.5), end: Offset.zero).animate(anim),
            child: Text(words[i] + ' ', style: titleStyle),
          ),
        );
      }),
  ],
);`,
  },
  "wave-bars": {
    apis: ["AnimationController", "repeat(reverse: true)", "ScaleTransition"],
    code: c`// One controller per bar, each started part-way through its cycle
final offsets = [0.0, 0.66, 0.33, 0.85, 0.5];
late final List<AnimationController> bars = [
  for (final o in offsets)
    AnimationController(vsync: this, duration: const Duration(milliseconds: 450), value: o)
      ..repeat(reverse: true),
];

SizedBox(
  height: 44,
  child: Row(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.end,
    children: [
      for (final b in bars)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 2.5),
          child: AnimatedBuilder(
            animation: b,
            builder: (_, __) => Container(
              width: 6,
              height: 44 * (0.3 + 0.7 * Curves.easeInOut.transform(b.value)),
              decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(3)),
            ),
          ),
        ),
    ],
  ),
);
// needs TickerProviderStateMixin (several controllers)`,
  },
  "spinner-arc": {
    apis: ["CircularProgressIndicator", "CustomPainter", "AnimationController"],
    code: c`// Built in: an indeterminate CircularProgressIndicator is exactly this arc spinner
const SizedBox(
  width: 48,
  height: 48,
  child: CircularProgressIndicator(strokeWidth: 5, strokeCap: StrokeCap.round),
);

// By hand, to control the timing: rotate the canvas, stretch the sweep
class ArcPainter extends CustomPainter {
  ArcPainter(this.t) : super(repaint: t);
  final Animation<double> t; // repeating 0..1 controller, 1600ms
  @override
  void paint(Canvas canvas, Size size) {
    final sweep = 0.1 + 0.65 * (0.5 - (t.value * 2 % 1 - 0.5).abs()) * 2; // 10%..75% of the ring
    final paint = Paint()
      ..color = accent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(Offset.zero & size, t.value * 2 * pi, sweep * 2 * pi, false, paint);
  }
  @override
  bool shouldRepaint(ArcPainter old) => false;
}`,
  },
  checkbox: {
    apis: ["AnimatedContainer", "TweenAnimationBuilder", "PathMetric"],
    code: c`// AnimatedContainer fills the box; a painter draws the check up to t
GestureDetector(
  onTap: () => setState(() => checked = !checked),
  child: AnimatedScale(
    scale: checked ? 1 : 0.94,
    duration: const Duration(milliseconds: 220),
    curve: Curves.elasticOut,
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: 26,
      height: 26,
      decoration: BoxDecoration(
        color: checked ? accent : Colors.transparent,
        border: Border.all(color: checked ? accent : Colors.black26, width: 2),
        borderRadius: BorderRadius.circular(7),
      ),
      child: TweenAnimationBuilder<double>(
        tween: Tween(end: checked ? 1 : 0),
        duration: const Duration(milliseconds: 220),
        builder: (_, t, __) => CustomPaint(painter: CheckPainter(t)),
      ),
    ),
  ),
);

class CheckPainter extends CustomPainter {
  CheckPainter(this.t);
  final double t;
  @override
  void paint(Canvas canvas, Size s) {
    final path = Path()
      ..moveTo(s.width * 0.22, s.height * 0.52)
      ..lineTo(s.width * 0.42, s.height * 0.7)
      ..lineTo(s.width * 0.78, s.height * 0.32);
    final metric = path.computeMetrics().first;
    canvas.drawPath(
      metric.extractPath(0, metric.length * t),
      Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 3..strokeCap = StrokeCap.round,
    );
  }
  @override
  bool shouldRepaint(CheckPainter old) => old.t != t;
}`,
  },
  stepper: {
    apis: ["AnimatedSwitcher", "SlideTransition", "ValueKey"],
    code: c`// The slide direction depends on which button was pressed
int value = 3;
int dir = 1;
void change(int d) => setState(() { dir = d; value = max(0, value + d); });

Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    IconButton(onPressed: () => change(-1), icon: const Icon(Icons.remove)),
    SizedBox(
      width: 32,
      child: ClipRect(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 220),
          transitionBuilder: (child, anim) {
            final incoming = child.key == ValueKey(value);
            final from = incoming ? Offset(0, dir * 0.8) : Offset(0, -dir * 0.8);
            return SlideTransition(
              position: Tween(begin: from, end: Offset.zero).animate(anim),
              child: FadeTransition(opacity: anim, child: child),
            );
          },
          child: Text('$value', key: ValueKey(value), textAlign: TextAlign.center, style: valueStyle),
        ),
      ),
    ),
    IconButton(onPressed: () => change(1), icon: const Icon(Icons.add)),
  ],
);`,
  },
  "step-progress": {
    apis: ["TweenAnimationBuilder", "FractionallySizedBox", "AnimatedContainer"],
    code: c`// The fill tweens to step / (n - 1); each dot animates its color once reached
const steps = ['Cart', 'Address', 'Payment', 'Done'];

SizedBox(
  height: 14,
  child: Stack(
    alignment: Alignment.centerLeft,
    children: [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 7),
        child: Stack(children: [
          Container(height: 4, color: Colors.black12),
          TweenAnimationBuilder<double>(
            tween: Tween(end: step / (steps.length - 1)),
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOut,
            builder: (_, f, __) => FractionallySizedBox(
              widthFactor: f,
              child: Container(height: 4, color: accent),
            ),
          ),
        ]),
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          for (var i = 0; i < steps.length; i++)
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 14,
              height: 14,
              decoration: BoxDecoration(shape: BoxShape.circle, color: i <= step ? accent : Colors.black12),
            ),
        ],
      ),
    ],
  ),
);`,
  },
  "gradient-border": {
    apis: ["RotationTransition", "SweepGradient", "ClipRRect"],
    code: c`// A SweepGradient square spins behind the card; ClipRRect plus a 2px inset leave only the rim
late final AnimationController spin = AnimationController(
  vsync: this,
  duration: const Duration(seconds: 3),
)..repeat();

ClipRRect(
  borderRadius: BorderRadius.circular(16),
  child: SizedBox(
    width: w,
    height: h,
    child: Stack(
      alignment: Alignment.center,
      children: [
        OverflowBox(
          maxWidth: diag,
          maxHeight: diag, // diag = sqrt(w * w + h * h)
          child: RotationTransition(
            turns: spin,
            child: Container(
              width: diag,
              height: diag,
              decoration: const BoxDecoration(
                gradient: SweepGradient(colors: [accent, coral, amber, accent]),
              ),
            ),
          ),
        ),
        Positioned.fill(
          child: Container(
            margin: const EdgeInsets.all(2),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
            child: child,
          ),
        ),
      ],
    ),
  ),
);`,
  },
  "copy-feedback": {
    apis: ["AnimatedSwitcher", "ScaleTransition", "Clipboard"],
    code: c`// AnimatedSwitcher pops between the two icons; a timer swaps back
bool copied = false;
Timer? timer;

Future<void> copy() async {
  await Clipboard.setData(ClipboardData(text: text));
  setState(() => copied = true);
  timer?.cancel();
  timer = Timer(const Duration(milliseconds: 1500), () => setState(() => copied = false));
}

TextButton.icon(
  onPressed: copy,
  icon: AnimatedSwitcher(
    duration: const Duration(milliseconds: 220),
    switchInCurve: Curves.easeOutBack,
    transitionBuilder: (child, anim) => ScaleTransition(scale: anim, child: child),
    child: copied
        ? const Icon(Icons.check, key: ValueKey('check'), color: Colors.green)
        : const Icon(Icons.copy, key: ValueKey('copy')),
  ),
  label: AnimatedSwitcher(
    duration: const Duration(milliseconds: 180),
    child: Text(copied ? 'Copied' : 'Copy', key: ValueKey(copied)),
  ),
);`,
  },
  "password-strength": {
    apis: ["TweenAnimationBuilder", "Color.lerp", "FractionallySizedBox"],
    code: c`// One tween on the score drives both width and color, so they move together
const colors = [Color(0xFFE5484D), Color(0xFFF76B15), Color(0xFFF5B301), Color(0xFF7CC23A), Color(0xFF2BA84A)];
const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
final score = scorePassword(password); // 0..4

Color colorAt(double s) {
  final i = s.floor().clamp(0, 3);
  return Color.lerp(colors[i], colors[i + 1], s - i)!;
}

Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    TextField(obscureText: true, onChanged: (v) => setState(() => password = v)),
    const SizedBox(height: 8),
    ClipRRect(
      borderRadius: BorderRadius.circular(3),
      child: Container(
        height: 6,
        color: Colors.black12,
        alignment: Alignment.centerLeft,
        child: TweenAnimationBuilder<double>(
          tween: Tween(end: password.isEmpty ? -1 : score.toDouble()),
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
          builder: (_, s, __) => FractionallySizedBox(
            widthFactor: (s + 1) / 5,
            child: Container(color: colorAt(max(s, 0))),
          ),
        ),
      ),
    ),
    Text(password.isEmpty ? '' : labels[score]),
  ],
);`,
  },
  odometer: {
    apis: ["AnimatedSlide", "ClipRect", "Curves.easeOutBack"],
    code: c`// Each digit is a column 0..9 that AnimatedSlide moves by -digit rows
class Digit extends StatelessWidget {
  const Digit(this.value, {super.key});
  final int value;
  static const h = 34.0;
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: h,
      child: ClipRect(
        child: OverflowBox(
          alignment: Alignment.topCenter,
          maxHeight: h * 10,
          child: AnimatedSlide(
            offset: Offset(0, -value / 10), // fraction of the column's own height
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeOutBack,
            child: Column(children: [
              for (var d = 0; d < 10; d++) SizedBox(height: h, child: Text('$d', style: digitStyle)),
            ]),
          ),
        ),
      ),
    );
  }
}

// Key from the right so columns keep their state when the number gains a digit
final chars = value.toString().split('').reversed.toList();
Row(
  mainAxisSize: MainAxisSize.min,
  textDirection: TextDirection.rtl,
  children: [for (var i = 0; i < chars.length; i++) Digit(int.parse(chars[i]), key: ValueKey(i))],
);`,
  },
  tooltip: {
    apis: ["AnimatedScale", "AnimatedOpacity", "alignment"],
    code: c`// Flutter's Tooltip widget fades; for the springy pop, scale from the arrow tip yourself
Column(
  mainAxisSize: MainAxisSize.min,
  children: [
    AnimatedOpacity(
      opacity: visible ? 1 : 0,
      duration: Duration(milliseconds: visible ? 200 : 120),
      child: AnimatedScale(
        scale: visible ? 1 : 0.6,
        alignment: Alignment.bottomCenter, // grow out of the anchor
        duration: Duration(milliseconds: visible ? 260 : 120),
        curve: visible ? Curves.easeOutBack : Curves.easeIn,
        child: Column(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(color: ink, borderRadius: BorderRadius.circular(8)),
            child: const Text('Saved to library', style: TextStyle(color: Colors.white)),
          ),
          CustomPaint(size: const Size(10, 5), painter: ArrowPainter(ink)), // small down-pointing triangle
        ]),
      ),
    ),
    const SizedBox(height: 6),
    GestureDetector(
      onLongPressStart: (_) => setState(() => visible = true),
      onLongPressEnd: (_) => setState(() => visible = false),
      child: const Icon(Icons.bookmark_outline),
    ),
  ],
);`,
  },
  "expand-search": {
    apis: ["AnimatedContainer", "AnimatedOpacity", "FocusNode"],
    code: c`// AnimatedContainer stretches the pill; the field fades in after it widens
bool open = false;
final focus = FocusNode();

void toggle(bool v) {
  setState(() => open = v);
  v ? focus.requestFocus() : focus.unfocus();
}

Align(
  alignment: Alignment.centerRight,
  child: AnimatedContainer(
    duration: Duration(milliseconds: open ? 280 : 220),
    curve: open ? Curves.easeOutBack : Curves.easeIn,
    width: open ? MediaQuery.sizeOf(context).width - 32 : 40,
    height: 40,
    clipBehavior: Clip.antiAlias,
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
    child: Row(children: [
      IconButton(onPressed: () => toggle(true), icon: const Icon(Icons.search, size: 18)),
      Expanded(
        child: AnimatedOpacity(
          opacity: open ? 1 : 0,
          duration: const Duration(milliseconds: 150),
          child: TextField(focusNode: focus, decoration: const InputDecoration.collapsed(hintText: 'Search recipes…')),
        ),
      ),
      if (open) TextButton(onPressed: () => toggle(false), child: const Text('Cancel')),
    ]),
  ),
);`,
  },
  "chip-select": {
    apis: ["FilterChip", "AnimatedSize", "Wrap"],
    code: c`// FilterChip already animates its check mark in; AnimatedSize smooths the reflow
AnimatedSize(
  duration: const Duration(milliseconds: 250),
  curve: Curves.easeOutBack,
  child: Wrap(
    spacing: 8,
    children: [
      for (final tag in tags)
        FilterChip(
          label: Text(tag),
          selected: selected.contains(tag),
          showCheckmark: true,
          selectedColor: accent,
          checkmarkColor: Colors.white,
          labelStyle: TextStyle(color: selected.contains(tag) ? Colors.white : null),
          onSelected: (on) => setState(() => on ? selected.add(tag) : selected.remove(tag)),
        ),
    ],
  ),
);
// The chips next to the toggled one jump; for gliding neighbours, wrap each chip in an
// AnimatedSize too (each one animates its own width change)`,
  },
  "tab-bubble": {
    apis: ["AnimatedContainer", "AnimatedSize", "AnimatedSwitcher"],
    code: c`// The active tab's pill grows to fit its label; the others shrink back to an icon
Row(
  mainAxisAlignment: MainAxisAlignment.spaceAround,
  children: [
    for (var i = 0; i < tabs.length; i++)
      GestureDetector(
        onTap: () => setState(() => active = i),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutBack,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: i == active ? accentSoft : Colors.transparent,
            borderRadius: BorderRadius.circular(99),
          ),
          child: AnimatedSize(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutBack,
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(tabs[i].icon, color: i == active ? accent : Colors.grey),
              if (i == active) ...[
                const SizedBox(width: 6),
                Text(tabs[i].label, style: const TextStyle(color: accent, fontWeight: FontWeight.w600)),
              ],
            ]),
          ),
        ),
      ),
  ],
);`,
  },
  "range-slider": {
    apis: ["RangeSlider", "GestureDetector", "Positioned"],
    code: c`// Material ships it: RangeSlider animates the thumbs and keeps them apart
RangeValues values = const RangeValues(20, 80);

RangeSlider(
  values: values,
  min: 0,
  max: 100,
  minThumbSeparation: 12,
  onChanged: (v) => setState(() => values = v),
  onChangeEnd: (v) => onChange(v.start.round(), v.end.round()),
);

// Custom look: two Positioned thumbs, each clamped by the other
GestureDetector(
  onHorizontalDragUpdate: (d) => setState(() {
    lo = (lo + d.delta.dx).clamp(0, hi - thumb);
  }),
  child: Transform.translate(offset: Offset(lo - thumb / 2, 0), child: thumbWidget),
);`,
  },
  joystick: {
    apis: ["GestureDetector", "SpringSimulation", "AnimationController.unbounded"],
    code: c`// Clamp the drag to the ring; on release a spring brings the knob home
const r = 50.0;
Offset knob = Offset.zero;
late final AnimationController home = AnimationController.unbounded(vsync: this)
  ..addListener(() => setState(() => knob = Offset.lerp(releasedAt, Offset.zero, home.value)!));
Offset releasedAt = Offset.zero;

GestureDetector(
  onPanStart: (_) => home.stop(),
  onPanUpdate: (d) => setState(() {
    final next = knob + d.delta;
    knob = next.distance > r ? next / next.distance * r : next;
  }),
  onPanEnd: (_) {
    releasedAt = knob;
    home.animateWith(SpringSimulation(
      SpringDescription.withDampingRatio(mass: 1, stiffness: 220, ratio: 0.5), 0, 1, 0,
    ));
  },
  child: Container(
    width: 140,
    height: 140,
    decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.black12),
    alignment: Alignment.center,
    child: Transform.translate(
      offset: knob,
      child: const CircleAvatar(radius: 20, backgroundColor: accent),
    ),
  ),
);
// direction for your game: knob / r (each axis -1..1)`,
  },
  "image-compare": {
    apis: ["GestureDetector", "ClipRect", "Align.widthFactor"],
    code: c`// The "after" image is clipped to the divider position with Align.widthFactor
double split = 0.5;

LayoutBuilder(builder: (context, box) {
  void move(double dx) => setState(() => split = (dx / box.maxWidth).clamp(0.0, 1.0));
  return GestureDetector(
    onTapDown: (d) => move(d.localPosition.dx),
    onHorizontalDragUpdate: (d) => move(d.localPosition.dx),
    child: Stack(children: [
      Positioned.fill(child: Image(image: before, fit: BoxFit.cover)),
      Positioned.fill(
        child: ClipRect(
          child: Align(
            alignment: Alignment.centerLeft,
            widthFactor: split,
            child: Image(image: after, fit: BoxFit.cover, width: box.maxWidth, height: box.maxHeight),
          ),
        ),
      ),
      Positioned(
        left: split * box.maxWidth - 20,
        top: 0,
        bottom: 0,
        width: 40,
        child: Stack(alignment: Alignment.center, children: [
          Container(width: 2, color: Colors.white),
          const CircleAvatar(radius: 14, backgroundColor: Colors.white, child: Icon(Icons.code, size: 14)),
        ]),
      ),
    ]),
  );
});`,
  },
  "side-drawer": {
    apis: ["AnimationController", "GestureDetector", "fling"],
    code: c`// One controller (0 closed, 1 open): drawer slides, scrim fades, screen nudges
const drawerWidth = 280.0;
late final AnimationController open = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));

GestureDetector(
  onHorizontalDragUpdate: (d) => open.value += d.delta.dx / drawerWidth,
  onHorizontalDragEnd: (d) {
    final v = d.velocity.pixelsPerSecond.dx / drawerWidth;
    if (v.abs() > 1.5) {
      open.fling(velocity: v);
    } else {
      open.value > 0.5 ? open.forward() : open.reverse();
    }
  },
  child: AnimatedBuilder(
    animation: open,
    builder: (_, __) => Stack(children: [
      Transform.translate(offset: Offset(open.value * 40, 0), child: screen),
      if (open.value > 0)
        GestureDetector(
          onTap: open.reverse,
          child: ColoredBox(color: Colors.black.withValues(alpha: 0.45 * open.value), child: const SizedBox.expand()),
        ),
      Positioned(
        left: (open.value - 1) * drawerWidth,
        top: 0,
        bottom: 0,
        width: drawerWidth,
        child: const Material(elevation: 8, child: Menu()),
      ),
    ]),
  ),
);
// Scaffold(drawer: ...) gives you a ready-made version of this`,
  },
  "otp-input": {
    apis: ["TextField", "AnimatedScale", "TweenSequence"],
    code: c`// A hidden TextField owns the keyboard; the boxes render its text
const len = 4;
final controller = TextEditingController();
late final AnimationController shake = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
late final Animation<double> dx = TweenSequence([
  TweenSequenceItem(tween: Tween(begin: 0.0, end: -10.0), weight: 1),
  TweenSequenceItem(tween: Tween(begin: -10.0, end: 10.0), weight: 1),
  TweenSequenceItem(tween: Tween(begin: 10.0, end: -6.0), weight: 1),
  TweenSequenceItem(tween: Tween(begin: -6.0, end: 0.0), weight: 1),
]).animate(shake);

Future<void> onChanged(String code) async {
  setState(() {});
  if (code.length == len && !await verify(code)) {
    shake.forward(from: 0);
    controller.clear();
  }
}

Stack(children: [
  Opacity(opacity: 0, child: TextField(controller: controller, maxLength: len, autofocus: true,
    keyboardType: TextInputType.number, autofillHints: const [AutofillHints.oneTimeCode], onChanged: onChanged)),
  AnimatedBuilder(
    animation: dx,
    builder: (_, child) => Transform.translate(offset: Offset(dx.value, 0), child: child),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      for (var i = 0; i < len; i++)
        AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: 44, height: 54, margin: const EdgeInsets.all(4),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(width: 2, color: i == controller.text.length ? accent : Colors.black12),
          ),
          child: i < controller.text.length
              ? TweenAnimationBuilder<double>(
                  key: ValueKey(controller.text[i] + '$i'),
                  tween: Tween(begin: 0.3, end: 1),
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.elasticOut,
                  builder: (_, s, child) => Transform.scale(scale: s, child: child),
                  child: Text(controller.text[i], style: digitStyle),
                )
              : null,
        ),
    ]),
  ),
]);`,
  },
  "scroll-top-fab": {
    apis: ["ScrollController", "AnimatedScale", "animateTo"],
    code: c`// Listen to the scroll offset, flip a bool past 400, let AnimatedScale/Opacity do the rest
final scroll = ScrollController();
bool show = false;

@override
void initState() {
  super.initState();
  scroll.addListener(() {
    final next = scroll.offset > 400;
    if (next != show) setState(() => show = next);
  });
}

Stack(children: [
  ListView(controller: scroll, children: items),
  Positioned(
    right: 20,
    bottom: 32,
    child: AnimatedSlide(
      offset: show ? Offset.zero : const Offset(0, 0.5),
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOutBack,
      child: AnimatedScale(
        scale: show ? 1 : 0.6,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutBack,
        child: AnimatedOpacity(
          opacity: show ? 1 : 0,
          duration: const Duration(milliseconds: 200),
          child: FloatingActionButton.small(
            onPressed: () => scroll.animateTo(0, duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic),
            child: const Icon(Icons.arrow_upward),
          ),
        ),
      ),
    ),
  ),
]);`,
  },
  "layout-toggle": {
    apis: ["AnimatedPositioned", "AnimatedContainer", "LayoutBuilder"],
    code: c`// Compute each item's rect for both layouts; AnimatedPositioned glides between them
LayoutBuilder(builder: (context, box) {
  const gap = 10.0, rowH = 72.0;
  final cell = (box.maxWidth - gap) / 2;
  Rect rectFor(int i) => grid
      ? Rect.fromLTWH((i % 2) * (cell + gap), (i ~/ 2) * (cell + gap), cell, cell)
      : Rect.fromLTWH(0, i * (rowH + gap), box.maxWidth, rowH);
  final count = items.length;
  final height = grid ? ((count + 1) ~/ 2) * (cell + gap) : count * (rowH + gap);

  return AnimatedContainer(
    duration: const Duration(milliseconds: 400),
    height: height,
    child: Stack(children: [
      for (var i = 0; i < count; i++)
        AnimatedPositioned.fromRect(
          key: ValueKey(items[i].id),
          rect: rectFor(i),
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOutBack,
          child: ItemCard(item: items[i], compact: !grid),
        ),
    ]),
  );
});`,
  },
  "keyboard-avoid": {
    apis: ["MediaQuery.viewInsetsOf", "resizeToAvoidBottomInset", "AnimatedPadding"],
    code: c`// Flutter rebuilds every frame while the keyboard animates, so the inset already tracks it
Scaffold(
  resizeToAvoidBottomInset: false, // do it ourselves, frame by frame
  body: Column(children: [
    Expanded(child: ListView(reverse: true, children: messages)),
    Padding(
      // viewInsets.bottom is the keyboard height at this frame of its animation
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        top: false,
        child: Row(children: [
          const Expanded(child: TextField(decoration: InputDecoration(hintText: 'Message'))),
          IconButton(onPressed: send, icon: const Icon(Icons.send)),
        ]),
      ),
    ),
  ]),
);
// The default (resizeToAvoidBottomInset: true) also follows the keyboard; turning it off
// lets you move only the bar, or add your own curve`,
  },
  "tilt-card": {
    apis: ["Transform", "Matrix4.rotateX", "setEntry(3, 2)"],
    code: c`// Finger position maps to rotateX/rotateY; setEntry(3, 2) adds perspective
Offset tilt = Offset.zero; // -1..1 on each axis
const maxAngle = 0.21; // ~12 degrees

GestureDetector(
  onPanUpdate: (d) => setState(() => tilt = Offset(
    (d.localPosition.dx / w * 2 - 1).clamp(-1.0, 1.0),
    (d.localPosition.dy / h * 2 - 1).clamp(-1.0, 1.0),
  )),
  onPanEnd: (_) => setState(() => tilt = Offset.zero),
  child: TweenAnimationBuilder<Offset>(
    tween: Tween(end: tilt), // eases back to flat on release
    duration: const Duration(milliseconds: 300),
    curve: Curves.easeOutBack,
    builder: (_, t, child) => Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()
        ..setEntry(3, 2, 0.0016)
        ..rotateX(-t.dy * maxAngle)
        ..rotateY(t.dx * maxAngle),
      child: Stack(children: [
        child!,
        Positioned.fill(
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment(t.dx - 1, -1),
                  end: Alignment(t.dx + 1, 1),
                  colors: [Colors.transparent, Colors.white.withValues(alpha: 0.35 * t.distance), Colors.transparent],
                ),
              ),
            ),
          ),
        ),
      ]),
    ),
    child: SizedBox(width: w, height: h, child: card),
  ),
);`,
  },
  "gyro-parallax": {
    apis: ["sensors_plus", "TweenAnimationBuilder", "Transform.translate"],
    code: c`// Flutter has no built-in sensor API; sensors_plus is the standard first-party plugin
import 'package:sensors_plus/sensors_plus.dart';

Offset tilt = Offset.zero;
late final StreamSubscription sub = accelerometerEventStream().listen((e) {
  // gravity spread across x/y says how the phone is tilted; ~9.8 = fully on its side
  setState(() => tilt = Offset((-e.x / 9.8).clamp(-0.6, 0.6), ((e.y - 6) / 9.8).clamp(-0.6, 0.6)));
});

Widget layer(double depth, Widget child) => TweenAnimationBuilder<Offset>(
  tween: Tween(end: tilt * depth * 40),
  duration: const Duration(milliseconds: 200), // smooths sensor jitter
  builder: (_, o, child) => Transform.translate(offset: o, child: child),
  child: child,
);

ClipRRect(
  borderRadius: BorderRadius.circular(20),
  child: Stack(fit: StackFit.expand, children: [
    layer(-0.3, OverflowBox(maxWidth: w + 80, maxHeight: h + 80, child: sky)),
    layer(0.4, OverflowBox(maxWidth: w + 80, maxHeight: h + 80, child: mountains)),
    layer(1, OverflowBox(maxWidth: w + 80, maxHeight: h + 80, child: foreground)),
  ]),
);
// cancel sub in dispose()`,
  },
  "emoji-reactions": {
    apis: ["onLongPressMoveUpdate", "OverlayPortal", "AnimatedScale"],
    code: c`// Long press opens the bar; the same gesture's move updates pick the hovered emoji
const emoji = ['👍', '❤️', '😂', '😮', '😢', '😡'];
const size = 44.0;
bool open = false;
int hovered = -1;

GestureDetector(
  onTap: () => onReact('👍'),
  onLongPressStart: (_) => setState(() => open = true),
  onLongPressMoveUpdate: (d) {
    final p = d.localPosition; // relative to the Like button; the bar sits barY above it
    final overBar = p.dy < 0 && p.dy > -barY - size;
    final i = ((p.dx - 8) / size).floor();
    setState(() => hovered = overBar && i >= 0 && i < emoji.length ? i : -1);
  },
  onLongPressEnd: (_) {
    if (hovered >= 0) onReact(emoji[hovered]);
    setState(() { open = false; hovered = -1; });
  },
  child: Stack(clipBehavior: Clip.none, children: [
    const LikeButton(),
    Positioned(
      bottom: barY,
      left: 0,
      child: AnimatedScale(
        scale: open ? 1 : 0.6,
        alignment: Alignment.bottomLeft,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutBack,
        child: AnimatedOpacity(
          opacity: open ? 1 : 0,
          duration: const Duration(milliseconds: 150),
          child: ReactionBar(children: [
            for (var i = 0; i < emoji.length; i++)
              AnimatedSlide(
                offset: Offset(0, hovered == i ? -0.3 : 0),
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOutBack,
                child: AnimatedScale(
                  scale: hovered == i ? 1.6 : hovered >= 0 ? 0.85 : 1,
                  alignment: Alignment.bottomCenter,
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOutBack,
                  child: SizedBox(width: size, child: Text(emoji[i], textAlign: TextAlign.center, style: const TextStyle(fontSize: 30))),
                ),
              ),
          ]),
        ),
      ),
    ),
  ]),
);
// Hit-testing note: keep the bar inside the Stack bounds or wrap it in an OverlayPortal`,
  },
  "context-menu": {
    apis: ["CupertinoContextMenu", "OverlayEntry", "localToGlobal"],
    code: c`// Built in: CupertinoContextMenu does the squeeze, lift, blur and menu
CupertinoContextMenu(
  actions: [
    CupertinoContextMenuAction(trailingIcon: CupertinoIcons.reply, onPressed: () => Navigator.pop(context), child: const Text('Reply')),
    CupertinoContextMenuAction(trailingIcon: CupertinoIcons.doc_on_doc, onPressed: () => Navigator.pop(context), child: const Text('Copy')),
    CupertinoContextMenuAction(isDestructiveAction: true, trailingIcon: CupertinoIcons.delete, onPressed: () => Navigator.pop(context), child: const Text('Delete')),
  ],
  child: Bubble(message: message),
);

// Custom version: find the bubble on screen, then animate a copy in an OverlayEntry
final box = bubbleKey.currentContext!.findRenderObject() as RenderBox;
final rect = box.localToGlobal(Offset.zero) & box.size;
// Overlay: scrim (FadeTransition), the bubble at rect lifted with SlideTransition(-12px) + ScaleTransition(1.04),
// and a menu at rect.bottomLeft scaling from Alignment.topLeft with Curves.easeOutBack`,
  },
  "fly-to-cart": {
    apis: ["OverlayEntry", "localToGlobal", "AnimationController"],
    code: c`// Measure both widgets, then fly a copy in the Overlay along a sine arc
Future<void> fly() async {
  final a = productKey.currentContext!.findRenderObject() as RenderBox;
  final b = cartKey.currentContext!.findRenderObject() as RenderBox;
  final from = a.localToGlobal(Offset.zero);
  final to = b.localToGlobal(b.size.center(Offset.zero)) - a.size.center(Offset.zero);
  final c = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
  final t = CurvedAnimation(parent: c, curve: Curves.easeInOutQuad);

  final entry = OverlayEntry(builder: (_) => AnimatedBuilder(
    animation: t,
    builder: (_, child) {
      final p = Offset.lerp(from, to, t.value)! - Offset(0, sin(pi * t.value) * 120); // the arc
      return Positioned(
        left: p.dx,
        top: p.dy,
        child: IgnorePointer(child: Transform.scale(scale: 1 - 0.75 * t.value, child: child)),
      );
    },
    child: SizedBox.fromSize(size: a.size, child: Image(image: product.image)),
  ));
  Overlay.of(context).insert(entry);
  await c.forward();
  entry.remove();
  c.dispose();
  cartBump.forward(from: 0); // a TweenSequence 1 -> 1.3 -> 1 on the cart icon's ScaleTransition
  addToCart(product);
}`,
  },
  "wave-fill": {
    apis: ["CustomPainter", "AnimationController.repeat", "ClipOval"],
    code: c`// A painter draws a sine wave at the current level; one controller loops the phase
late final AnimationController phase = AnimationController(vsync: this, duration: const Duration(milliseconds: 1800))..repeat();

TweenAnimationBuilder<double>(
  tween: Tween(end: progress), // 0..1
  duration: const Duration(milliseconds: 900),
  curve: Curves.easeOutCubic,
  builder: (_, level, __) => Container(
    width: 120,
    height: 120,
    decoration: BoxDecoration(shape: BoxShape.circle, color: accentSoft, border: Border.all(color: accent, width: 3)),
    child: ClipOval(child: CustomPaint(painter: WavePainter(phase, level))),
  ),
);

class WavePainter extends CustomPainter {
  WavePainter(this.phase, this.level) : super(repaint: phase);
  final Animation<double> phase;
  final double level;
  @override
  void paint(Canvas canvas, Size s) {
    final top = s.height * (1 - level);
    final path = Path()..moveTo(0, top);
    for (double x = 0; x <= s.width; x += 4) {
      path.lineTo(x, top + 6 * sin(x / s.width * 2 * pi + phase.value * 2 * pi));
    }
    path..lineTo(s.width, s.height)..lineTo(0, s.height)..close();
    canvas.drawPath(path, Paint()..color = accent);
  }
  @override
  bool shouldRepaint(WavePainter old) => old.level != level;
}`,
  },
  "spring-chain": {
    apis: ["Ticker", "SpringSimulation", "CustomMultiChildLayout"],
    code: c`// A Ticker steps a tiny spring per dot every frame, each chasing the dot before it
const count = 6;
final pos = List<Offset>.filled(count, const Offset(100, 100));
final vel = List<Offset>.filled(count, Offset.zero);
late final Ticker ticker = createTicker((_) => step())..start();

void step() {
  const k = 120.0, damping = 14.0, dt = 1 / 60;
  setState(() {
    for (var i = 1; i < count; i++) {
      final force = (pos[i - 1] - pos[i]) * k - vel[i] * damping; // spring toward the leader
      vel[i] += force * dt;
      pos[i] += vel[i] * dt;
    }
  });
}

GestureDetector(
  onPanUpdate: (d) => pos[0] += d.delta,
  child: Stack(children: [
    for (var i = count - 1; i >= 0; i--)
      Positioned(
        left: pos[i].dx - 18,
        top: pos[i].dy - 18,
        child: Opacity(
          opacity: 1 - i * 0.12,
          child: Transform.scale(scale: 1 - i * 0.12, child: const CircleAvatar(radius: 18, backgroundColor: accent)),
        ),
      ),
  ]),
);
// needs SingleTickerProviderStateMixin; dispose the ticker`,
  },
  "shape-morph": {
    apis: ["ShapeBorder.lerp", "TweenSequence", "AnimatedBuilder"],
    code: c`// Flutter can lerp between ShapeBorders: circle -> rounded square -> star, and back
late final AnimationController c = AnimationController(vsync: this, duration: const Duration(milliseconds: 3000))
  ..repeat(reverse: true);
final shapes = TweenSequence<ShapeBorder?>([
  TweenSequenceItem(tween: ShapeBorderTween(begin: const CircleBorder(), end: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))), weight: 1),
  TweenSequenceItem(tween: ShapeBorderTween(begin: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), end: const StarBorder(points: 6, innerRadiusRatio: 0.7, pointRounding: 0.6)), weight: 1),
]).animate(CurvedAnimation(parent: c, curve: Curves.easeInOutCubic));

AnimatedBuilder(
  animation: c,
  builder: (_, __) => Transform.rotate(
    angle: c.value * pi / 2,
    child: Container(
      width: 120,
      height: 120,
      decoration: ShapeDecoration(color: accent, shape: shapes.value!),
    ),
  ),
);`,
  },
  "spin-wheel": {
    apis: ["AnimationController", "Tween<double>", "RotationTransition"],
    code: c`// Choose the prize, then tween to whole turns plus the angle that brings it under the pointer
const prizes = ['10%', 'Free ship', '5%', 'Try again', '20%', 'Gift'];
final seg = 1 / prizes.length; // in turns
late final AnimationController c = AnimationController(vsync: this, duration: const Duration(milliseconds: 4500));
Animation<double> turns = const AlwaysStoppedAnimation(0);
int lastEdge = 0;

void spin() {
  if (c.isAnimating) return;
  final prize = Random().nextInt(prizes.length);
  final jitter = (Random().nextDouble() - 0.5) * seg * 0.7;
  final from = turns.value % 1;
  final to = from.floorToDouble() + 6 + (1 - (prize * seg + seg / 2)) + jitter;
  turns = Tween(begin: from, end: to).animate(CurvedAnimation(parent: c, curve: const Cubic(0.15, 0.75, 0.2, 1)))
    ..addListener(() {
      final edge = (turns.value / seg).floor(); // a segment edge passed the pointer
      if (edge != lastEdge) { lastEdge = edge; HapticFeedback.selectionClick(); flap.forward(from: 0); }
    });
  setState(() {});
  c.forward(from: 0).then((_) => onWin(prizes[prize]));
}

Column(children: [
  RotationTransition(turns: flapAngle, alignment: Alignment.topCenter, child: const Pointer()), // flap: short TweenSequence 0 -> -0.05 -> 0
  RotationTransition(turns: turns, child: CustomPaint(size: const Size.square(260), painter: WheelPainter(prizes))),
  FilledButton(onPressed: spin, child: const Text('Spin')),
]);`,
  },
};
