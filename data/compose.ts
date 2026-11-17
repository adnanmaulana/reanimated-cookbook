// Jetpack Compose (Kotlin) ports of every animation. Target: Compose 1.7+ with Material 3.
// Snippets go inside a @Composable; Accent, Coral, Track, Ink stand in for your theme colors.
// String.raw keeps the code verbatim; Kotlin string templates are written as "$x" or concatenation.
import type { PlatformSnippet } from "@/lib/types";

const c = String.raw;

export const compose: Record<string, PlatformSnippet> = {
  "fade-in": {
    apis: ["Animatable", "LaunchedEffect", "graphicsLayer"],
    code: c`val opacity = remember { Animatable(0f) }
LaunchedEffect(Unit) {
    opacity.animateTo(1f, tween(durationMillis = 400, easing = LinearOutSlowInEasing))
}

Box(
    Modifier
        .graphicsLayer { alpha = opacity.value } // draw-phase only: no recomposition per frame
        .size(64.dp)
        .background(Accent, RoundedCornerShape(12.dp))
)`,
  },

  "slide-in": {
    apis: ["Animatable", "tween", "graphicsLayer"],
    code: c`val progress = remember { Animatable(0f) }
LaunchedEffect(Unit) { progress.animateTo(1f, tween(450, easing = FastOutSlowInEasing)) }

Box(
    Modifier
        .graphicsLayer {
            translationX = (1f - progress.value) * -100.dp.toPx()
            alpha = progress.value
        }
        .size(64.dp)
        .background(Accent, RoundedCornerShape(12.dp))
)`,
  },

  "press-scale": {
    apis: ["collectIsPressedAsState", "animateFloatAsState", "spring"],
    code: c`val interaction = remember { MutableInteractionSource() }
val pressed by interaction.collectIsPressedAsState()
val scale by animateFloatAsState(
    targetValue = if (pressed) 0.92f else 1f,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
    label = "press",
)

Button(
    onClick = onClick,
    interactionSource = interaction,
    modifier = Modifier.graphicsLayer { scaleX = scale; scaleY = scale },
) { Text("Continue") }`,
  },

  spin: {
    apis: ["rememberInfiniteTransition", "infiniteRepeatable", "LinearEasing"],
    code: c`val angle by rememberInfiniteTransition(label = "spin").animateFloat(
    initialValue = 0f,
    targetValue = 360f,
    animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing)),
    label = "angle",
)

Canvas(Modifier.size(44.dp).graphicsLayer { rotationZ = angle }) {
    drawArc(Accent, startAngle = 0f, sweepAngle = 270f, useCenter = false,
        style = Stroke(4.dp.toPx(), cap = StrokeCap.Round))
}
// Or the stock CircularProgressIndicator().`,
  },

  pulse: {
    apis: ["rememberInfiniteTransition", "graphicsLayer", "LinearOutSlowInEasing"],
    code: c`val t by rememberInfiniteTransition(label = "pulse").animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(tween(1400, easing = LinearOutSlowInEasing)),
    label = "t",
)

Box(contentAlignment = Alignment.Center) {
    Box(
        Modifier
            .size(16.dp)
            .graphicsLayer {
                scaleX = 1f + 1.4f * t
                scaleY = 1f + 1.4f * t
                alpha = 0.7f * (1f - t)
            }
            .background(Coral, CircleShape)
    )
    Box(Modifier.size(16.dp).background(Coral, CircleShape))
}`,
  },

  "progress-bar": {
    apis: ["animateFloatAsState", "fillMaxWidth(fraction)", "tween"],
    code: c`// progress: 0f..1f
val animated by animateFloatAsState(
    targetValue = progress,
    animationSpec = tween(600, easing = FastOutSlowInEasing),
    label = "progress",
)

Box(Modifier.fillMaxWidth().height(8.dp).clip(CircleShape).background(Track)) {
    Box(Modifier.fillMaxHeight().fillMaxWidth(animated).background(Accent))
}
// Or LinearProgressIndicator(progress = { animated }).`,
  },

  "color-shift": {
    apis: ["animateColorAsState", "tween"],
    code: c`val color by animateColorAsState(
    targetValue = if (active) Accent else Coral,
    animationSpec = tween(300),
    label = "color",
)

Box(Modifier.size(64.dp).background(color, RoundedCornerShape(12.dp)))`,
  },

  "entering-preset": {
    apis: ["AnimatedVisibility", "fadeIn + scaleIn", "slideOutVertically"],
    code: c`// AnimatedVisibility runs enter and exit transitions on mount and unmount
AnimatedVisibility(
    visible = shown,
    enter = fadeIn() + scaleIn(initialScale = 0.8f),
    exit = fadeOut() + slideOutVertically { it / 2 },
) {
    InfoCard()
}
// For list rows: Modifier.animateItem() inside LazyColumn items.`,
  },

  "spring-bounce": {
    apis: ["Animatable", "spring(dampingRatio)", "Spring.StiffnessLow"],
    code: c`val y = remember { Animatable(-200f) }
LaunchedEffect(Unit) {
    // Lower dampingRatio = more bounce
    y.animateTo(0f, spring(dampingRatio = 0.4f, stiffness = Spring.StiffnessLow))
}

Box(
    Modifier
        .graphicsLayer { translationY = y.value.dp.toPx() }
        .size(64.dp)
        .background(Accent, RoundedCornerShape(12.dp))
)`,
  },

  shake: {
    apis: ["Animatable", "keyframes", "rememberCoroutineScope"],
    code: c`val offsetX = remember { Animatable(0f) }
val scope = rememberCoroutineScope()

fun shake() = scope.launch {
    offsetX.animateTo(0f, keyframes {
        durationMillis = 400
        -10f at 50; 10f at 100; -8f at 150; 8f at 200; -4f at 260; 4f at 320
    })
}

OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    isError = error,
    modifier = Modifier.graphicsLayer { translationX = offsetX.value.dp.toPx() },
)
// Call shake() when validation fails.`,
  },

  "stagger-list": {
    apis: ["Animatable", "LaunchedEffect + delay", "itemsIndexed"],
    code: c`LazyColumn {
    itemsIndexed(items) { index, item ->
        val progress = remember { Animatable(0f) }
        LaunchedEffect(Unit) {
            delay(index * 60L) // index-based delay
            progress.animateTo(1f, tween(350, easing = FastOutSlowInEasing))
        }
        ItemRow(
            item,
            Modifier.graphicsLayer {
                alpha = progress.value
                translationY = (1f - progress.value) * 20.dp.toPx()
            },
        )
    }
}`,
  },

  accordion: {
    apis: ["animateContentSize", "animateFloatAsState", "Modifier.rotate"],
    code: c`var open by remember { mutableStateOf(false) }
val chevron by animateFloatAsState(if (open) 180f else 0f, label = "chevron")

// animateContentSize animates to the measured height of whatever is inside
Column(Modifier.animateContentSize(tween(250))) {
    Row(
        Modifier.fillMaxWidth().clickable { open = !open }.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("Details", Modifier.weight(1f))
        Icon(Icons.Default.ExpandMore, contentDescription = null, modifier = Modifier.rotate(chevron))
    }
    if (open) Text(longText, Modifier.padding(16.dp))
}`,
  },

  shimmer: {
    apis: ["rememberInfiniteTransition", "drawWithContent", "Brush.linearGradient"],
    code: c`val x by rememberInfiniteTransition(label = "shimmer").animateFloat(
    initialValue = -1f,
    targetValue = 2f,
    animationSpec = infiniteRepeatable(tween(1200, easing = LinearEasing)),
    label = "x",
)

// Paint a moving highlight over the placeholder
fun Modifier.shimmer(x: Float) = drawWithContent {
    drawContent()
    val w = size.width
    drawRect(
        Brush.linearGradient(
            listOf(Color.Transparent, Color.White.copy(alpha = 0.6f), Color.Transparent),
            start = Offset(w * x - w * 0.3f, 0f),
            end = Offset(w * x + w * 0.3f, 0f),
        )
    )
}

Box(
    Modifier
        .fillMaxWidth()
        .height(16.dp)
        .clip(RoundedCornerShape(8.dp))
        .background(Skeleton)
        .shimmer(x)
)`,
  },

  "typing-dots": {
    apis: ["rememberInfiniteTransition", "graphicsLayer", "kotlin.math.sin"],
    code: c`val t by rememberInfiniteTransition(label = "dots").animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(tween(1200, easing = LinearEasing)),
    label = "t",
)

Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
    repeat(3) { i ->
        // Same 1.2 s cycle for every dot, shifted by 0.2 per dot
        val p = ((t - i * 0.2f) % 1f + 1f) % 1f
        val y = if (p < 0.3f) -6f * sin(p / 0.3f * PI.toFloat()) else 0f
        Box(
            Modifier
                .size(8.dp)
                .graphicsLayer { translationY = y.dp.toPx() }
                .background(Ink, CircleShape)
        )
    }
}`,
  },

  "toggle-switch": {
    apis: ["animateDpAsState", "animateColorAsState", "spring"],
    code: c`val thumbX by animateDpAsState(
    targetValue = if (on) 27.dp else 3.dp,
    animationSpec = spring(dampingRatio = 0.6f, stiffness = Spring.StiffnessMedium),
    label = "thumb",
)
val track by animateColorAsState(if (on) Accent else Track, label = "track")

Box(
    Modifier
        .size(56.dp, 32.dp)
        .background(track, CircleShape)
        .clickable { onToggle(!on) },
) {
    Box(
        Modifier
            .align(Alignment.CenterStart)
            .offset(x = thumbX)
            .size(26.dp)
            .background(Color.White, CircleShape)
    )
}
// Material 3's Switch already animates; this is the custom version.`,
  },

  "like-burst": {
    apis: ["Animatable", "keyframes", "graphicsLayer"],
    code: c`var liked by remember { mutableStateOf(false) }
val scale = remember { Animatable(1f) }
val ring = remember { Animatable(1f) } // 0..1, 1 = finished
val scope = rememberCoroutineScope()

fun toggle() {
    liked = !liked
    if (!liked) return
    scope.launch {
        // Squash, pop past 1, settle
        scale.animateTo(1f, keyframes { durationMillis = 500; 0.7f at 100; 1.3f at 250 })
    }
    scope.launch {
        ring.snapTo(0f)
        ring.animateTo(1f, tween(500, easing = LinearOutSlowInEasing))
    }
}

Box(Modifier.clickable { toggle() }, contentAlignment = Alignment.Center) {
    // Ring bursting outward
    Box(
        Modifier
            .size(40.dp)
            .graphicsLayer {
                scaleX = 0.8f + 1.4f * ring.value
                scaleY = scaleX
                alpha = 1f - ring.value
            }
            .border(3.dp, Coral, CircleShape)
    )
    Icon(
        if (liked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
        contentDescription = "Like",
        tint = Coral,
        modifier = Modifier.size(40.dp).graphicsLayer { scaleX = scale.value; scaleY = scale.value },
    )
}`,
  },

  "drag-snap": {
    apis: ["detectDragGestures", "Animatable(Offset)", "spring"],
    code: c`val offset = remember { Animatable(Offset.Zero, Offset.VectorConverter) }
val scope = rememberCoroutineScope()

Box(
    Modifier
        .offset { offset.value.round() }
        .size(64.dp)
        .background(Accent, RoundedCornerShape(12.dp))
        .pointerInput(Unit) {
            detectDragGestures(
                onDragStart = { scope.launch { offset.stop() } },
                onDrag = { change, delta ->
                    change.consume()
                    scope.launch { offset.snapTo(offset.value + delta) }
                },
                onDragEnd = {
                    scope.launch {
                        offset.animateTo(Offset.Zero, spring(dampingRatio = 0.5f, stiffness = Spring.StiffnessMediumLow))
                    }
                },
            )
        }
)`,
  },

  "swipe-stack": {
    apis: ["detectDragGestures", "VelocityTracker", "Animatable(Offset)"],
    code: c`val cards = remember { sampleCards.toMutableStateList() }
val offset = remember { Animatable(Offset.Zero, Offset.VectorConverter) }
val scope = rememberCoroutineScope()

BoxWithConstraints(Modifier.fillMaxSize()) {
    val width = constraints.maxWidth.toFloat()
    cards.drop(1).take(2).reversed().forEach { CardView(it) }
    cards.firstOrNull()?.let { top ->
        key(top.id) {
            CardView(
                top,
                Modifier
                    .offset { offset.value.round() }
                    .graphicsLayer { rotationZ = offset.value.x / width * 20f } // tilt while dragging
                    .pointerInput(Unit) {
                        val tracker = VelocityTracker()
                        detectDragGestures(
                            onDrag = { change, delta ->
                                tracker.addPosition(change.uptimeMillis, change.position)
                                scope.launch { offset.snapTo(offset.value + delta) }
                            },
                            onDragEnd = {
                                val vx = tracker.calculateVelocity().x
                                tracker.resetTracking()
                                val fling = abs(offset.value.x) > width * 0.3f || abs(vx) > 1500f
                                scope.launch {
                                    if (fling) {
                                        offset.animateTo(Offset(sign(offset.value.x) * width * 1.5f, offset.value.y), tween(250))
                                        cards.removeAt(0)
                                        offset.snapTo(Offset.Zero)
                                    } else {
                                        offset.animateTo(Offset.Zero, spring(dampingRatio = 0.7f))
                                    }
                                }
                            },
                        )
                    },
            )
        }
    }
}`,
  },

  "bottom-sheet": {
    apis: ["Modifier.draggable", "onDragStopped velocity", "Animatable.animateTo(initialVelocity)"],
    code: c`// Snap points as offsets from the top, in px
val snaps = listOf(200f, 1000f)
val y = remember { Animatable(1000f) }
val scope = rememberCoroutineScope()

BoxWithConstraints(Modifier.fillMaxSize()) {
    val height = constraints.maxHeight.toFloat()
    PageContent()
    SheetBody(
        Modifier
            .offset { IntOffset(0, y.value.roundToInt()) }
            .fillMaxSize()
            .draggable(
                orientation = Orientation.Vertical,
                state = rememberDraggableState { delta ->
                    scope.launch { y.snapTo((y.value + delta).coerceIn(snaps.first(), height)) }
                },
                onDragStopped = { velocity ->
                    val target = when {
                        velocity > 2000f -> height // fast swipe down: dismiss
                        velocity < -2000f -> snaps.first()
                        else -> (snaps + height).minBy { abs(it - y.value) }
                    }
                    y.animateTo(target, spring(stiffness = Spring.StiffnessMediumLow), initialVelocity = velocity)
                },
            )
    )
}
// Material 3 also ships ModalBottomSheet with partial and expanded states.`,
  },

  "card-flip": {
    apis: ["animateFloatAsState", "graphicsLayer.rotationY", "cameraDistance"],
    code: c`var flipped by remember { mutableStateOf(false) }
val angle by animateFloatAsState(if (flipped) 180f else 0f, tween(600), label = "flip")

Box(
    Modifier
        .size(220.dp, 140.dp)
        .graphicsLayer {
            rotationY = angle
            cameraDistance = 12f * density // perspective
        }
        .clickable { flipped = !flipped },
) {
    // Swap faces at 90°, and mirror the back so it reads correctly
    if (angle <= 90f) FrontFace()
    else Box(Modifier.graphicsLayer { rotationY = 180f }) { BackFace() }
}`,
  },

  "parallax-header": {
    apis: ["LazyListState", "graphicsLayer", "derivedStateOf"],
    code: c`val listState = rememberLazyListState()
val headerPx = with(LocalDensity.current) { 260.dp.toPx() }

Box {
    LazyColumn(state = listState) {
        item {
            Image(
                painterResource(R.drawable.header),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().height(260.dp).graphicsLayer {
                    // While the header is visible, move it at half the scroll speed
                    val scrolled = if (listState.firstVisibleItemIndex == 0) listState.firstVisibleItemScrollOffset.toFloat() else 0f
                    translationY = scrolled * 0.5f
                    alpha = 1f - scrolled / headerPx
                },
            )
        }
        items(rows) { RowItem(it) }
    }
    // Compact bar fades in as the header scrolls away
    val barAlpha by remember {
        derivedStateOf {
            if (listState.firstVisibleItemIndex > 0) 1f
            else (listState.firstVisibleItemScrollOffset / headerPx).coerceIn(0f, 1f)
        }
    }
    TopAppBar(title = { Text("Title") }, modifier = Modifier.graphicsLayer { alpha = barAlpha })
}
// Material 3 alternative: LargeTopAppBar + TopAppBarDefaults.exitUntilCollapsedScrollBehavior().`,
  },

  "pinch-zoom": {
    apis: ["detectTransformGestures", "graphicsLayer", "coerceIn"],
    code: c`var scale by remember { mutableFloatStateOf(1f) }
var offset by remember { mutableStateOf(Offset.Zero) }

Image(
    painterResource(R.drawable.photo),
    contentDescription = null,
    modifier = Modifier
        .fillMaxSize()
        .pointerInput(Unit) {
            // One detector for pinch and pan together
            detectTransformGestures { _, pan, zoom, _ ->
                scale = (scale * zoom).coerceIn(1f, 4f)
                offset += pan
            }
        }
        .graphicsLayer {
            scaleX = scale
            scaleY = scale
            translationX = offset.x
            translationY = offset.y
        },
)`,
  },

  "tab-indicator": {
    apis: ["onGloballyPositioned", "animateFloatAsState", "spring"],
    code: c`var selected by remember { mutableIntStateOf(0) }
val bounds = remember { mutableStateMapOf<Int, Pair<Float, Float>>() } // left, width in px
val spec = spring<Float>(stiffness = Spring.StiffnessMediumLow)
val left by animateFloatAsState(bounds[selected]?.first ?: 0f, spec, label = "left")
val width by animateFloatAsState(bounds[selected]?.second ?: 0f, spec, label = "width")
val density = LocalDensity.current

Box {
    Row {
        tabs.forEachIndexed { i, title ->
            Text(
                title,
                Modifier
                    // Measured layout of each tab
                    .onGloballyPositioned { bounds[i] = it.positionInParent().x to it.size.width.toFloat() }
                    .clickable { selected = i }
                    .padding(horizontal = 16.dp, vertical = 12.dp),
            )
        }
    }
    Box(
        Modifier
            .align(Alignment.BottomStart)
            .offset { IntOffset(left.roundToInt(), 0) }
            .width(with(density) { width.toDp() })
            .height(3.dp)
            .background(Accent)
    )
}
// Material 3's TabRow animates its indicator the same way.`,
  },

  "swipe-delete": {
    apis: ["SwipeToDismissBox", "rememberSwipeToDismissBoxState", "Modifier.animateItem"],
    code: c`// SwipeToDismissBox reveals the background; animateItem collapses the row
LazyColumn {
    items(items, key = { it.id }) { item ->
        val state = rememberSwipeToDismissBoxState(
            confirmValueChange = {
                if (it == SwipeToDismissBoxValue.EndToStart) items.remove(item)
                true
            },
        )
        SwipeToDismissBox(
            state = state,
            enableDismissFromStartToEnd = false,
            backgroundContent = {
                Box(
                    Modifier.fillMaxSize().background(Color.Red).padding(end = 24.dp),
                    contentAlignment = Alignment.CenterEnd,
                ) { Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.White) }
            },
            modifier = Modifier.animateItem(), // Compose 1.7+
        ) {
            ItemRow(item)
        }
    }
}`,
  },

  ripple: {
    apis: ["Modifier.clickable", "ripple()", "clip"],
    code: c`// Material's ripple grows from the touch point, clipped by the modifier before it
Box(
    Modifier
        .clip(RoundedCornerShape(12.dp))
        .background(Accent)
        .clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = ripple(color = Color.White), // androidx.compose.material3.ripple
            onClick = onClick,
        )
        .padding(horizontal = 24.dp, vertical = 16.dp),
) {
    Text("Tap me", color = Color.White)
}`,
  },

  "dvd-bounce": {
    apis: ["rememberInfiniteTransition", "RepeatMode.Reverse", "Modifier.offset"],
    code: c`val transition = rememberInfiniteTransition(label = "dvd")
// Two independent ping-pongs with different periods
val x by transition.animateFloat(
    0f, 1f, infiniteRepeatable(tween(3100, easing = LinearEasing), RepeatMode.Reverse), label = "x",
)
val y by transition.animateFloat(
    0f, 1f, infiniteRepeatable(tween(2300, easing = LinearEasing), RepeatMode.Reverse), label = "y",
)

BoxWithConstraints(Modifier.fillMaxSize()) {
    val density = LocalDensity.current
    val maxX = constraints.maxWidth - with(density) { 80.dp.roundToPx() }
    val maxY = constraints.maxHeight - with(density) { 40.dp.roundToPx() }
    Logo(
        Modifier
            .offset { IntOffset((x * maxX).roundToInt(), (y * maxY).roundToInt()) }
            .size(80.dp, 40.dp)
    )
}`,
  },

  "stroke-draw": {
    apis: ["PathMeasure.getSegment", "PathParser", "Canvas"],
    code: c`val progress = remember { Animatable(0f) }
LaunchedEffect(Unit) { progress.animateTo(1f, tween(2000, easing = FastOutSlowInEasing)) }

val path = remember { PathParser().parsePathString(svgPathData).toPath() } // an SVG "d" string
val measure = remember { PathMeasure() }
val partial = remember { Path() }

Canvas(Modifier.size(200.dp, 120.dp)) {
    measure.setPath(path, forceClosed = false)
    partial.reset()
    // Copy the first N% of the path (one contour; measure each contour for multi-stroke logos)
    measure.getSegment(0f, measure.length * progress.value, partial, startWithMoveTo = true)
    drawPath(partial, Accent, style = Stroke(4.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
}`,
  },

  "activity-rings": {
    apis: ["Canvas.drawArc", "Animatable", "LinearOutSlowInEasing"],
    code: c`val goals = listOf(0.8f, 0.65f, 0.9f)
val colors = listOf(Color(0xFFFA114F), Color(0xFF92E82A), Color(0xFF1EEAEF))
val progress = remember { Animatable(0f) }
LaunchedEffect(Unit) { progress.animateTo(1f, tween(1400, easing = LinearOutSlowInEasing)) }

Canvas(Modifier.size(200.dp)) {
    val stroke = 18.dp.toPx()
    goals.forEachIndexed { i, goal ->
        val inset = stroke / 2 + i * (stroke + 4.dp.toPx())
        val topLeft = Offset(inset, inset)
        val arcSize = Size(size.width - inset * 2, size.height - inset * 2)
        drawArc(colors[i].copy(alpha = 0.2f), 0f, 360f, false, topLeft, arcSize, style = Stroke(stroke))
        drawArc(colors[i], -90f, 360f * goal * progress.value, false, topLeft, arcSize,
            style = Stroke(stroke, cap = StrokeCap.Round))
    }
}`,
  },

  breathe: {
    apis: ["rememberInfiniteTransition", "RepeatMode.Reverse", "graphicsLayer"],
    code: c`// 4 s in, 4 s out, forever
val t by rememberInfiniteTransition(label = "breathe").animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(tween(4000, easing = FastOutSlowInEasing), RepeatMode.Reverse),
    label = "t",
)

Box(
    Modifier.size(240.dp).graphicsLayer {
        rotationZ = 60f * t
        scaleX = 0.4f + 0.6f * t
        scaleY = scaleX
    },
    contentAlignment = Alignment.Center,
) {
    repeat(6) { i ->
        val a = i * PI / 3
        Box(
            Modifier
                // Petals move out from the center
                .offset { IntOffset((sin(a) * 45.dp.toPx() * t).roundToInt(), (-cos(a) * 45.dp.toPx() * t).roundToInt()) }
                .size(80.dp)
                .background(Teal.copy(alpha = 0.5f), CircleShape)
        )
    }
}`,
  },

  "swipe-reply": {
    apis: ["Modifier.draggable", "LocalHapticFeedback", "Animatable"],
    code: c`val dx = remember { Animatable(0f) }
val haptics = LocalHapticFeedback.current
val scope = rememberCoroutineScope()
val threshold = with(LocalDensity.current) { 64.dp.toPx() }
var armed by remember { mutableStateOf(false) }

Box(contentAlignment = Alignment.CenterStart) {
    // Reply icon grows in as the bubble moves
    val p = (dx.value / threshold).coerceIn(0f, 1f)
    Icon(
        Icons.AutoMirrored.Filled.Reply, contentDescription = null,
        modifier = Modifier.padding(start = 16.dp).graphicsLayer { scaleX = p; scaleY = p; alpha = p },
    )
    Bubble(
        Modifier
            .offset { IntOffset(dx.value.roundToInt(), 0) }
            .draggable(
                orientation = Orientation.Horizontal,
                state = rememberDraggableState { delta ->
                    val next = (dx.value + delta).coerceIn(0f, threshold * 1.5f)
                    scope.launch { dx.snapTo(next) }
                    if (next > threshold && !armed) haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    armed = next > threshold
                },
                onDragStopped = {
                    if (armed) onReply()
                    armed = false
                    dx.animateTo(0f, spring(dampingRatio = 0.6f))
                },
            )
    )
}`,
  },

  "spotify-header": {
    apis: ["LazyListState", "derivedStateOf", "graphicsLayer"],
    code: c`val listState = rememberLazyListState()
val rangePx = with(LocalDensity.current) { 250.dp.toPx() }
// 0 at the top, 1 after 250 dp of scrolling
val t by remember {
    derivedStateOf {
        if (listState.firstVisibleItemIndex > 0) 1f
        else (listState.firstVisibleItemScrollOffset / rangePx).coerceIn(0f, 1f)
    }
}

Box {
    // Cover shrinks and fades
    CoverArt(
        Modifier
            .align(Alignment.TopCenter)
            .padding(top = 60.dp)
            .size(220.dp)
            .graphicsLayer { scaleX = 1f - 0.4f * t; scaleY = scaleX; alpha = 1f - t }
    )
    LazyColumn(state = listState) {
        item { Spacer(Modifier.height(300.dp)) }
        items(tracks) { TrackRow(it) }
    }
    // Compact bar fades in over the last 30%
    CompactTitleBar(Modifier.graphicsLayer { alpha = ((t - 0.7f) / 0.3f).coerceIn(0f, 1f) })
}`,
  },

  "pull-refresh": {
    apis: ["PullToRefreshBox", "rememberPullToRefreshState", "distanceFraction"],
    code: c`// Material 3 PullToRefreshBox with a custom indicator driven by the pull distance
val state = rememberPullToRefreshState()
val scope = rememberCoroutineScope()
var refreshing by remember { mutableStateOf(false) }
val spin by rememberInfiniteTransition(label = "spin").animateFloat(
    0f, 360f, infiniteRepeatable(tween(800, easing = LinearEasing)), label = "spin",
)

PullToRefreshBox(
    isRefreshing = refreshing,
    onRefresh = {
        scope.launch {
            refreshing = true
            load()
            refreshing = false
        }
    },
    state = state,
    indicator = {
        val f = state.distanceFraction.coerceAtMost(1f) // 1 = at the threshold
        Icon(
            Icons.Default.Refresh, contentDescription = null,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp)
                .graphicsLayer {
                    scaleX = 0.5f + 0.5f * f
                    scaleY = scaleX
                    alpha = if (refreshing) 1f else f
                    rotationZ = if (refreshing) spin else f * 180f
                },
        )
    },
) {
    LazyColumn(Modifier.fillMaxSize()) { items(rows) { RowItem(it) } }
}`,
  },

  "perspective-menu": {
    apis: ["graphicsLayer.rotationY", "TransformOrigin", "animateFloatAsState"],
    code: c`var open by remember { mutableStateOf(false) }
val t by animateFloatAsState(
    targetValue = if (open) 1f else 0f,
    animationSpec = spring(dampingRatio = 0.85f, stiffness = Spring.StiffnessLow),
    label = "menu",
)

Box(Modifier.fillMaxSize()) {
    SideMenu() // sits behind the screen
    HomeScreen(
        onMenu = { open = !open },
        modifier = Modifier.graphicsLayer {
            transformOrigin = TransformOrigin(0f, 0.5f)
            cameraDistance = 10f * density
            rotationY = -30f * t // tilt back
            translationX = size.width * 0.6f * t
            scaleX = 1f - 0.15f * t
            scaleY = scaleX
            shape = RoundedCornerShape((24 * t).dp)
            clip = true
            shadowElevation = 20.dp.toPx() * t
        },
    )
}`,
  },

  "stories-cube": {
    apis: ["HorizontalPager", "currentPageOffsetFraction", "graphicsLayer.rotationY"],
    code: c`val pager = rememberPagerState { stories.size }

HorizontalPager(state = pager, beyondViewportPageCount = 1) { page ->
    StoryView(
        stories[page],
        Modifier.graphicsLayer {
            // -1..1 for the two faces on screen
            val d = (page - pager.currentPage) - pager.currentPageOffsetFraction
            cameraDistance = 12f * density
            // Rotate around the shared edge
            transformOrigin = TransformOrigin(if (d < 0) 1f else 0f, 0.5f)
            rotationY = d * 90f
        },
    )
}`,
  },

  "circular-slider": {
    apis: ["detectDragGestures", "atan2", "Canvas.drawArc"],
    code: c`var angle by remember { mutableFloatStateOf(0f) } // radians, 0 = 12 o'clock
val minutes = (angle / (2 * PI) * 24 * 60).toInt()

Box(contentAlignment = Alignment.Center) {
    Canvas(
        Modifier.size(260.dp).pointerInput(Unit) {
            fun update(p: Offset) {
                val v = p - Offset(size.width / 2f, size.height / 2f)
                angle = ((atan2(v.x, -v.y) + 2 * PI) % (2 * PI)).toFloat()
            }
            detectDragGestures(onDragStart = ::update) { change, _ -> update(change.position) }
        }
    ) {
        val stroke = 24.dp.toPx()
        val r = size.minDimension / 2 - stroke
        drawCircle(Track, r, style = Stroke(stroke))
        drawArc(
            Accent, -90f, Math.toDegrees(angle.toDouble()).toFloat(), false,
            topLeft = center - Offset(r, r), size = Size(r * 2, r * 2),
            style = Stroke(stroke, cap = StrokeCap.Round),
        )
        drawCircle(Color.White, 14.dp.toPx(), center + Offset(sin(angle) * r, -cos(angle) * r)) // knob
    }
    Text("%02d:%02d".format(minutes / 60, minutes % 60), style = MaterialTheme.typography.displaySmall)
}`,
  },

  "mini-player": {
    apis: ["Modifier.draggable", "Animatable", "onDragStopped velocity"],
    code: c`// progress: 0 = mini bar, 1 = full screen
val progress = remember { Animatable(0f) }
val scope = rememberCoroutineScope()
val miniHeight = 64.dp

BoxWithConstraints(Modifier.fillMaxSize()) {
    val rangePx = constraints.maxHeight - with(LocalDensity.current) { miniHeight.toPx() }
    HomeScreen()
    Box(
        Modifier
            .align(Alignment.BottomCenter)
            .fillMaxWidth()
            .height(miniHeight + (maxHeight - miniHeight) * progress.value)
            .clickable { scope.launch { progress.animateTo(1f, spring(dampingRatio = 0.85f)) } }
            .draggable(
                orientation = Orientation.Vertical,
                state = rememberDraggableState { delta ->
                    scope.launch { progress.snapTo((progress.value - delta / rangePx).coerceIn(0f, 1f)) }
                },
                onDragStopped = { velocity ->
                    val open = if (abs(velocity) > 1000f) velocity < 0 else progress.value > 0.5f
                    progress.animateTo(if (open) 1f else 0f, spring(dampingRatio = 0.85f), initialVelocity = -velocity / rangePx)
                },
            )
    ) {
        MiniBar(Modifier.graphicsLayer { alpha = (1f - progress.value * 3f).coerceAtLeast(0f) })
        FullPlayer(Modifier.graphicsLayer { alpha = progress.value })
    }
}`,
  },

  "liquid-swipe": {
    apis: ["Shape", "Outline.Generic", "graphicsLayer.clip"],
    code: c`class LiquidShape(private val progress: Float, private val centerY: Float) : Shape {
    override fun createOutline(size: Size, layoutDirection: LayoutDirection, density: Density): Outline {
        val x = size.width * (1 - progress)                                      // reveal edge
        val bulge = with(density) { (80 * (1 - progress) + 20).dp.toPx() }      // flattens as it fills
        val r = size.height * 0.25f * (0.4f + progress)                         // bulge height
        return Outline.Generic(Path().apply {
            moveTo(size.width, 0f)
            lineTo(x, 0f)
            lineTo(x, centerY - r)
            cubicTo(x, centerY - r / 2, x - bulge, centerY - r / 2, x - bulge, centerY)
            cubicTo(x - bulge, centerY + r / 2, x, centerY + r / 2, x, centerY + r)
            lineTo(x, size.height)
            lineTo(size.width, size.height)
            close()
        })
    }
}

val progress = remember { Animatable(0f) }
var centerY by remember { mutableFloatStateOf(800f) }
val scope = rememberCoroutineScope()

Box(
    Modifier.fillMaxSize().pointerInput(Unit) {
        detectDragGestures(
            onDrag = { change, delta ->
                centerY = change.position.y
                scope.launch { progress.snapTo((progress.value - delta.x / size.width).coerceIn(0f, 1f)) }
            },
            onDragEnd = {
                scope.launch { progress.animateTo(if (progress.value > 0.4f) 1f else 0f, spring(dampingRatio = 0.8f)) }
            },
        )
    }
) {
    CurrentPage()
    NextPage(Modifier.graphicsLayer { shape = LiquidShape(progress.value, centerY); clip = true })
}`,
  },

  "chart-scrub": {
    apis: ["detectHorizontalDragGestures", "Canvas.drawPath", "onSizeChanged"],
    code: c`// prices: List<Float>
var scrubX by remember { mutableStateOf<Float?>(null) }
var width by remember { mutableIntStateOf(1) }
val last = prices.lastIndex
val i = scrubX?.let { (it / width * last).roundToInt().coerceIn(0, last) } ?: last

Column {
    Text("$" + "%.2f".format(prices[i]), style = MaterialTheme.typography.headlineMedium)
    Canvas(
        Modifier
            .fillMaxWidth()
            .height(200.dp)
            .onSizeChanged { width = it.width }
            .pointerInput(Unit) {
                detectHorizontalDragGestures(
                    onDragStart = { scrubX = it.x },
                    onDragEnd = { scrubX = null },
                    onDragCancel = { scrubX = null },
                ) { change, _ -> scrubX = change.position.x.coerceIn(0f, size.width.toFloat()) }
            }
    ) {
        val min = prices.min()
        val max = prices.max()
        fun pt(k: Int) = Offset(k * size.width / last, size.height * (1 - (prices[k] - min) / (max - min)))
        drawPath(
            Path().apply { moveTo(pt(0).x, pt(0).y); for (k in 1..last) lineTo(pt(k).x, pt(k).y) },
            Accent, style = Stroke(2.dp.toPx()),
        )
        if (scrubX != null) {
            drawLine(Ink.copy(alpha = 0.3f), Offset(pt(i).x, 0f), Offset(pt(i).x, size.height))
            drawCircle(Accent, 5.dp.toPx(), pt(i))
        }
    }
}`,
  },

  "shared-expand": {
    apis: ["SharedTransitionLayout", "Modifier.sharedBounds", "AnimatedContent"],
    code: c`// Compose 1.7+ (@OptIn(ExperimentalSharedTransitionApi::class))
var selected by remember { mutableStateOf<Item?>(null) }

SharedTransitionLayout {
    AnimatedContent(targetState = selected, label = "expand") { item ->
        if (item == null) {
            LazyVerticalGrid(GridCells.Fixed(2)) {
                items(items) { thumb ->
                    Thumb(
                        thumb,
                        Modifier
                            .sharedBounds(rememberSharedContentState(thumb.id), this@AnimatedContent)
                            .clickable { selected = thumb },
                    )
                }
            }
        } else {
            var dragY by remember { mutableFloatStateOf(0f) }
            Detail(
                item,
                Modifier
                    .sharedBounds(rememberSharedContentState(item.id), this@AnimatedContent)
                    .graphicsLayer {
                        translationY = dragY
                        val s = 1f - (dragY / 3000f).coerceIn(0f, 0.3f) // shrink while dragging down
                        scaleX = s
                        scaleY = s
                    }
                    .draggable(
                        orientation = Orientation.Vertical,
                        state = rememberDraggableState { dragY = (dragY + it).coerceAtLeast(0f) },
                        onDragStopped = { if (dragY > 300f) selected = null else dragY = 0f },
                    ),
            )
        }
    }
}`,
  },

  "word-drag": {
    apis: ["LookaheadScope", "movableContentOf", "Modifier.animateBounds (1.8+)"],
    code: c`// LookaheadScope + movableContentOf keep each chip's identity while it moves between rows,
// and animateBounds (Compose 1.8+, experimental) springs it into its new slot.
val bank = remember { mutableStateListOf("I", "like", "green", "apples") }
val answer = remember { mutableStateListOf<String>() }

fun move(w: String) {
    if (answer.remove(w)) bank.add(w) else if (bank.remove(w)) answer.add(w)
}

LookaheadScope {
    val chips = remember {
        (bank + answer).associateWith { w ->
            movableContentOf {
                WordChip(
                    w,
                    Modifier
                        .animateBounds(
                            this@LookaheadScope,
                            boundsTransform = { _, _ -> spring(dampingRatio = 0.7f, stiffness = Spring.StiffnessMediumLow) },
                        )
                        .clickable { move(w) },
                )
            }
        }
    }
    Column(verticalArrangement = Arrangement.spacedBy(32.dp)) {
        FlowRow(Modifier.fillMaxWidth().heightIn(min = 56.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            answer.forEach { chips.getValue(it)() }
        }
        HorizontalDivider()
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            bank.forEach { chips.getValue(it)() }
        }
    }
}
// Dragging: add detectDragGestures that offsets the chip and calls move(w) when released over the answer row.`,
  },

  "tab-reorder": {
    apis: ["detectDragGesturesAfterLongPress", "LazyGridState.layoutInfo", "Modifier.animateItem"],
    code: c`val tabs = remember { sampleTabs.toMutableStateList() } // List<BrowserTab>
val grid = rememberLazyGridState()
var draggingId by remember { mutableStateOf<String?>(null) }
var finger by remember { mutableStateOf(Offset.Zero) }
var grab by remember { mutableStateOf(Offset.Zero) } // finger position inside the tile

fun itemAt(p: Offset) = grid.layoutInfo.visibleItemsInfo.firstOrNull { IntRect(it.offset, it.size).contains(p.round()) }

LazyVerticalGrid(
    columns = GridCells.Fixed(2),
    state = grid,
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp),
    modifier = Modifier.pointerInput(Unit) {
        detectDragGesturesAfterLongPress(
            onDragStart = { p ->
                itemAt(p)?.let { draggingId = it.key as String; finger = p; grab = p - it.offset.toOffset() }
            },
            onDrag = { change, delta ->
                change.consume()
                finger += delta
                val from = tabs.indexOfFirst { it.id == draggingId }
                val over = itemAt(finger)?.index
                if (from >= 0 && over != null && over != from) tabs.add(over, tabs.removeAt(from)) // reshuffle
            },
            onDragEnd = { draggingId = null },
            onDragCancel = { draggingId = null },
        )
    },
) {
    items(tabs, key = { it.id }) { tab ->
        val dragging = tab.id == draggingId
        TabTile(
            tab,
            if (dragging) {
                Modifier.zIndex(1f).graphicsLayer {
                    // Follow the finger, measured from the tile's current slot
                    val slot = grid.layoutInfo.visibleItemsInfo.firstOrNull { it.key == tab.id }?.offset?.toOffset() ?: return@graphicsLayer
                    translationX = finger.x - grab.x - slot.x
                    translationY = finger.y - grab.y - slot.y
                    scaleX = 1.05f
                    scaleY = 1.05f
                }
            } else {
                Modifier.animateItem() // the other tiles animate into their new slots
            },
        )
    }
}`,
  },

  "sticky-tabs": {
    apis: ["stickyHeader", "ScrollableTabRow", "animateScrollToItem"],
    code: c`val listState = rememberLazyListState()
val scope = rememberCoroutineScope()
// Flat list index of each section title (item 0 is the hero, item 1 the sticky tabs)
val sectionStart = remember(sections) {
    sections.runningFold(2) { acc, s -> acc + 1 + s.items.size }.dropLast(1)
}
val active by remember {
    derivedStateOf { sectionStart.indexOfLast { it <= listState.firstVisibleItemIndex + 1 }.coerceAtLeast(0) }
}

LazyColumn(state = listState) {
    item { HeaderImage() }
    stickyHeader { // sticks to the top
        // ScrollableTabRow slides its indicator and keeps the active tab in view
        ScrollableTabRow(selectedTabIndex = active) {
            sections.forEachIndexed { i, s ->
                Tab(
                    selected = i == active,
                    onClick = { scope.launch { listState.animateScrollToItem(sectionStart[i]) } },
                    text = { Text(s.title) },
                )
            }
        }
    }
    sections.forEach { s ->
        item { SectionTitle(s.title) }
        items(s.items) { MenuItem(it) }
    }
}`,
  },

  "click-wheel": {
    apis: ["detectDragGestures", "atan2", "HapticFeedbackType.TextHandleMove"],
    code: c`var selected by remember { mutableIntStateOf(0) }
val haptics = LocalHapticFeedback.current
val step = (PI / 6).toFloat() // 30° of rotation per item

Box(
    Modifier
        .size(220.dp)
        .background(WheelGrey, CircleShape)
        .pointerInput(Unit) {
            var last = 0f
            var acc = 0f
            fun angleOf(p: Offset) = atan2(p.y - size.height / 2f, p.x - size.width / 2f)
            detectDragGestures(onDragStart = { last = angleOf(it); acc = 0f }) { change, _ ->
                val a = angleOf(change.position)
                var d = a - last
                if (d > PI) d -= (2 * PI).toFloat() // unwrap across ±180°
                if (d < -PI) d += (2 * PI).toFloat()
                acc += d
                last = a
                while (abs(acc) >= step) {
                    val dir = if (acc > 0) 1 else -1
                    acc -= dir * step
                    selected = (selected + dir).coerceIn(0, items.lastIndex)
                    haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove) // the click
                }
            }
        }
)`,
  },

  "jelly-scroll": {
    apis: ["NestedScrollConnection", "drawWithContent + skew Matrix", "spring"],
    code: c`// Skew rows by the scroll velocity; a spring settles the skew back to 0
val skew = remember { Animatable(0f) }
val scope = rememberCoroutineScope()

val connection = remember {
    object : NestedScrollConnection {
        override fun onPostScroll(consumed: Offset, available: Offset, source: NestedScrollSource): Offset {
            scope.launch { skew.snapTo((consumed.y / 400f).coerceIn(-0.25f, 0.25f)) } // px per frame ≈ velocity
            return Offset.Zero
        }

        override suspend fun onPostFling(consumed: Velocity, available: Velocity): Velocity {
            skew.animateTo(0f, spring(dampingRatio = 0.35f, stiffness = Spring.StiffnessLow))
            return Velocity.Zero
        }
    }
}

LazyColumn(Modifier.nestedScroll(connection)) {
    items(rows) { row ->
        RowItem(
            row,
            Modifier.drawWithContent {
                val m = Matrix().apply { values[Matrix.SkewY] = skew.value }
                // Shear around the row's vertical center line
                withTransform({ translate(top = -skew.value * size.width / 2); transform(m) }) {
                    this@drawWithContent.drawContent()
                }
            },
        )
    }
}`,
  },

  "wallet-stack": {
    apis: ["animateDpAsState", "Modifier.zIndex", "spring"],
    code: c`var selected by remember { mutableStateOf<Int?>(null) }

BoxWithConstraints(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
    cards.forEachIndexed { i, card ->
        val top by animateDpAsState(
            targetValue = when (val s = selected) {
                null -> 40.dp + 60.dp * i                                          // fanned stack
                i -> 40.dp                                                          // rises to the top
                else -> maxHeight - 120.dp + 10.dp * (if (i < s) i else i - 1)     // the others collapse at the bottom
            },
            animationSpec = spring(dampingRatio = 0.8f, stiffness = Spring.StiffnessMediumLow),
            label = "card$i",
        )
        WalletCard(
            card,
            Modifier
                .offset(y = top)
                .fillMaxWidth()
                .height(200.dp)
                .zIndex(if (selected == i) 1f else 0f)
                .clickable { selected = if (selected == i) null else i },
        )
    }
}`,
  },

  "theme-reveal": {
    apis: ["drawWithContent", "clipPath", "Animatable"],
    code: c`// Draw the new theme over the old one, clipped to a circle growing from the toggle.
// Compose can draw both themes at once, so no snapshot of the old screen is needed.
var dark by remember { mutableStateOf(false) }
var origin by remember { mutableStateOf(Offset.Zero) }
val reveal = remember { Animatable(1f) }
val scope = rememberCoroutineScope()

fun toggle(at: Offset) { // at: position in root coordinates
    origin = at
    dark = !dark
    scope.launch {
        reveal.snapTo(0f)
        reveal.animateTo(1f, tween(600, easing = FastOutSlowInEasing))
    }
}

Box(Modifier.fillMaxSize()) {
    AppTheme(dark = !dark) { Screen(onToggle = ::toggle) } // old theme underneath
    AppTheme(dark = dark) {                                // new theme on top
        Screen(
            onToggle = ::toggle,
            modifier = Modifier.drawWithContent {
                val maxR = hypot(size.width, size.height) // reaches every corner
                clipPath(Path().apply { addOval(Rect(origin, maxR * reveal.value)) }) {
                    this@drawWithContent.drawContent()
                }
            },
        )
    }
}`,
  },

  "picker-wheel": {
    apis: ["rememberSnapFlingBehavior", "LazyListState.layoutInfo", "graphicsLayer.rotationX"],
    code: c`val state = rememberLazyListState()
val itemHeight = 40.dp
val itemPx = with(LocalDensity.current) { itemHeight.toPx() }

LazyColumn(
    state = state,
    flingBehavior = rememberSnapFlingBehavior(state),           // snap to each row
    contentPadding = PaddingValues(vertical = itemHeight * 2),  // first and last rows can reach the middle
    modifier = Modifier.height(itemHeight * 5),
) {
    items(24) { i ->
        Text(
            "%02d".format(i),
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier.height(itemHeight).fillMaxWidth().wrapContentHeight().graphicsLayer {
                // Distance from the center, in rows
                val info = state.layoutInfo.visibleItemsInfo.firstOrNull { it.index == i } ?: return@graphicsLayer
                val center = (state.layoutInfo.viewportStartOffset + state.layoutInfo.viewportEndOffset) / 2f
                val d = (info.offset + itemPx / 2 - center) / itemPx
                rotationX = (d * -20f).coerceIn(-80f, 80f) // curve away like a cylinder
                alpha = 1f - (abs(d) * 0.25f).coerceAtMost(0.7f)
                cameraDistance = 8f * density
            },
        )
    }
}`,
  },

  coverflow: {
    apis: ["HorizontalPager", "contentPadding", "graphicsLayer.rotationY"],
    code: c`val pager = rememberPagerState { items.size }

HorizontalPager(
    state = pager,
    contentPadding = PaddingValues(horizontal = 100.dp), // neighbors peek in
    modifier = Modifier.height(260.dp),
) { page ->
    Cover(
        items[page],
        Modifier.graphicsLayer {
            val d = ((page - pager.currentPage) - pager.currentPageOffsetFraction).coerceIn(-1f, 1f) // 0 = centered
            rotationY = d * -50f // neighbors turn away
            val s = 1f - 0.25f * abs(d)
            scaleX = s           // and shrink
            scaleY = s
            cameraDistance = 12f * density
        },
    )
}`,
  },

  // ---------- everyday UI additions ----------

  "count-up": {
    apis: ["animateIntAsState", "tween", "fontFeatureSettings \"tnum\""],
    code: c`var target by remember { mutableIntStateOf(0) }
LaunchedEffect(Unit) { target = 1280 }
val value by animateIntAsState(target, tween(1200, easing = FastOutSlowInEasing), label = "count")

Text(
    "%,d".format(value),
    style = MaterialTheme.typography.displayMedium.copy(fontFeatureSettings = "tnum"), // fixed-width digits
)`,
  },

  toast: {
    apis: ["AnimatedVisibility", "slideInVertically", "LaunchedEffect + delay"],
    code: c`var visible by remember { mutableStateOf(false) }
var text by remember { mutableStateOf("") }
var shownAt by remember { mutableLongStateOf(0L) }

fun show(message: String) {
    text = message
    visible = true
    shownAt = System.nanoTime() // restarts the timer for a new toast
}

LaunchedEffect(shownAt) {
    if (visible) { delay(2500); visible = false } // auto dismiss
}

Box(Modifier.fillMaxSize()) {
    PageContent(onSave = { show("Saved") })
    AnimatedVisibility(
        visible = visible,
        enter = slideInVertically(spring(dampingRatio = 0.7f)) { -it } + fadeIn(),
        exit = slideOutVertically { -it } + fadeOut(),
        modifier = Modifier.align(Alignment.TopCenter).statusBarsPadding().padding(16.dp),
    ) {
        Toast(text)
    }
}
// Material 3's Snackbar + SnackbarHostState is the stock bottom version.`,
  },

  "menu-morph": {
    apis: ["animateFloatAsState", "graphicsLayer", "rotationZ"],
    code: c`var open by remember { mutableStateOf(false) }
val t by animateFloatAsState(if (open) 1f else 0f, tween(250), label = "menu")
val line = Modifier.size(28.dp, 3.dp).background(Ink, CircleShape)

// Lines are 3 dp tall with a 6 dp gap, so the outer ones travel 9 dp to the middle
Column(
    Modifier.clickable { open = !open }.padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(6.dp),
) {
    // graphicsLayer goes first so the transform applies to the line's background
    Box(Modifier.graphicsLayer { translationY = 9.dp.toPx() * t; rotationZ = 45f * t }.then(line))
    Box(Modifier.graphicsLayer { alpha = 1f - t }.then(line))
    Box(Modifier.graphicsLayer { translationY = -9.dp.toPx() * t; rotationZ = -45f * t }.then(line))
}`,
  },

  "floating-label": {
    apis: ["OutlinedTextField", "label", "Material 3"],
    code: c`// Material 3's OutlinedTextField animates its label on focus or input
var email by remember { mutableStateOf("") }

OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    label = { Text("Email") }, // sits inside, floats up when focused or filled
    singleLine = true,
)`,
  },

  marquee: {
    apis: ["Modifier.basicMarquee", "MarqueeSpacing", "velocity"],
    code: c`// Built in: basicMarquee scrolls overflowing content in a seamless loop
Row(
    Modifier
        .fillMaxWidth()
        .basicMarquee(
            iterations = Int.MAX_VALUE,
            initialDelayMillis = 0,
            repeatDelayMillis = 0,
            spacing = MarqueeSpacing(8.dp), // gap between the end and the next copy
            velocity = 40.dp,               // per second
        ),
    horizontalArrangement = Arrangement.spacedBy(8.dp),
) {
    items.forEach { LogoPill(it) }
}`,
  },

  "success-check": {
    apis: ["Animatable", "spring", "PathMeasure.getSegment"],
    code: c`val scale = remember { Animatable(0f) }
val draw = remember { Animatable(0f) }
LaunchedEffect(Unit) {
    launch { scale.animateTo(1f, spring(dampingRatio = 0.45f, stiffness = Spring.StiffnessMediumLow)) }
    delay(250)
    draw.animateTo(1f, tween(350, easing = LinearOutSlowInEasing))
}

val measure = remember { PathMeasure() }
val partial = remember { Path() }

Canvas(Modifier.size(56.dp).graphicsLayer { scaleX = scale.value; scaleY = scale.value }) {
    drawCircle(Accent)
    val s = size.width / 52f
    val check = Path().apply { moveTo(15 * s, 27 * s); lineTo(22 * s, 34 * s); lineTo(37 * s, 19 * s) }
    measure.setPath(check, forceClosed = false)
    partial.reset()
    measure.getSegment(0f, measure.length * draw.value, partial, startWithMoveTo = true) // first N% of the check
    drawPath(partial, Color.White, style = Stroke(4 * s, cap = StrokeCap.Round, join = StrokeJoin.Round))
}`,
  },

  "fab-menu": {
    apis: ["animateFloatAsState", "tween(delayMillis)", "CubicBezierEasing"],
    code: c`var open by remember { mutableStateOf(false) }
val icons = listOf(Icons.Default.PhotoCamera, Icons.Default.Image, Icons.Default.AttachFile)
val rotation by animateFloatAsState(if (open) 45f else 0f, label = "fab")
val overshoot = CubicBezierEasing(0.3f, 1.4f, 0.5f, 1f)

Box(contentAlignment = Alignment.BottomCenter) {
    icons.forEachIndexed { i, icon ->
        // Stagger: each action waits a little longer (reversed when closing)
        val delay = (if (open) i else icons.lastIndex - i) * 40
        val t by animateFloatAsState(
            targetValue = if (open) 1f else 0f,
            animationSpec = tween(300, delayMillis = delay, easing = overshoot),
            label = "action$i",
        )
        SmallFloatingActionButton(
            onClick = { },
            modifier = Modifier.graphicsLayer {
                translationY = -(i + 1) * 64.dp.toPx() * t
                scaleX = 0.3f + 0.7f * t
                scaleY = scaleX
                alpha = t.coerceIn(0f, 1f)
            },
        ) { Icon(icon, contentDescription = null) }
    }
    FloatingActionButton(onClick = { open = !open }) {
        Icon(Icons.Default.Add, contentDescription = "Actions", modifier = Modifier.rotate(rotation)) // + becomes ✕
    }
}`,
  },

  "page-dots": {
    apis: ["HorizontalPager", "currentPageOffsetFraction", "Modifier.width"],
    code: c`val pager = rememberPagerState { pages.size }

Column {
    HorizontalPager(state = pager, modifier = Modifier.weight(1f)) { PageContent(pages[it]) }
    Row(
        Modifier.align(Alignment.CenterHorizontally).padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        repeat(pages.size) { i ->
            // Fractional distance from the scroll position: the pill follows the swipe
            val d = abs(pager.currentPage + pager.currentPageOffsetFraction - i).coerceAtMost(1f)
            Box(
                Modifier
                    .height(8.dp)
                    .width(22.dp - 14.dp * d)
                    .background(Accent.copy(alpha = 1f - 0.65f * d), CircleShape)
            )
        }
    }
}`,
  },

  "hide-header": {
    apis: ["TopAppBarDefaults.enterAlwaysScrollBehavior", "nestedScroll", "Scaffold"],
    code: c`// Material 3: enterAlways hides the bar on scroll down and shows it on any scroll up
val scrollBehavior = TopAppBarDefaults.enterAlwaysScrollBehavior()

Scaffold(
    modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
    topBar = { TopAppBar(title = { Text("Inbox") }, scrollBehavior = scrollBehavior) },
) { padding ->
    LazyColumn(contentPadding = padding) {
        items(rows) { RowItem(it) }
    }
}`,
  },

  "button-loading": {
    apis: ["animateDpAsState", "AnimatedContent", "CircularProgressIndicator"],
    code: c`var loading by remember { mutableStateOf(false) }
val scope = rememberCoroutineScope()
val width by animateDpAsState(if (loading) 52.dp else 220.dp, tween(300, easing = FastOutSlowInEasing), label = "width")

Box(
    Modifier
        .size(width, 52.dp) // shrinks into a circle
        .clip(CircleShape)
        .background(Accent)
        .clickable(enabled = !loading) {
            scope.launch {
                loading = true
                pay()
                loading = false
            }
        },
    contentAlignment = Alignment.Center,
) {
    // Crossfade the label and the spinner
    AnimatedContent(targetState = loading, transitionSpec = { fadeIn() togetherWith fadeOut() }, label = "content") { busy ->
        if (busy) CircularProgressIndicator(Modifier.size(22.dp), color = Color.White, strokeWidth = 2.5.dp)
        else Text("Pay now", color = Color.White, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false)
    }
}`,
  },

  // ---------- everyday UI additions, second batch ----------
  confetti: {
    apis: ["Animatable", "Canvas", "withTransform"],
    code: c`// One Animatable is the clock (seconds); Canvas draws every piece from it
data class Piece(val angle: Float, val speed: Float, val spin: Float, val color: Color)

@Composable
fun Confetti(trigger: Int, modifier: Modifier = Modifier) {
    val colors = listOf(Coral, Color(0xFFF59E0B), Color(0xFF10B981), Accent, Color(0xFFA855F7))
    var pieces by remember { mutableStateOf(emptyList<Piece>()) }
    val time = remember { Animatable(0f) }

    LaunchedEffect(trigger) {
        if (trigger == 0) return@LaunchedEffect // bump trigger to fire
        pieces = List(40) { i ->
            Piece(
                angle = (-PI / 2).toFloat() + (Random.nextFloat() - 0.5f) * 1.6f, // mostly upward
                speed = 450f + Random.nextFloat() * 350f,                         // dp per second
                spin = (Random.nextFloat() - 0.5f) * 1440f,                        // degrees per second
                color = colors[i % colors.size],
            )
        }
        time.snapTo(0f)
        time.animateTo(1.6f, tween(1600, easing = LinearEasing))
    }

    Canvas(modifier.fillMaxSize()) {
        val t = time.value
        if (t == 0f || t >= 1.6f) return@Canvas
        val alpha = if (t > 1.2f) (1.6f - t) / 0.4f else 1f
        pieces.forEach { p ->
            val x = (cos(p.angle) * p.speed * t).dp.toPx()
            val y = (sin(p.angle) * p.speed * t + 0.5f * 900f * t * t).dp.toPx() // gravity 900 dp/s²
            withTransform({
                translate(center.x + x, center.y + y)
                rotate(p.spin * t, pivot = Offset.Zero)
            }) {
                drawRect(p.color, topLeft = Offset(-3.dp.toPx(), -5.dp.toPx()), size = Size(6.dp.toPx(), 10.dp.toPx()), alpha = alpha)
            }
        }
    }
}`,
  },

  "star-rating": {
    apis: ["Animatable", "spring(dampingRatio)", "animateColorAsState"],
    code: c`// Each star snaps small and springs back with overshoot when it turns on
@Composable
fun StarRating(rating: Int, onRate: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        repeat(5) { i ->
            val on = i < rating
            val scale = remember { Animatable(1f) }
            LaunchedEffect(on) {
                if (on) {
                    delay(i * 40L) // stagger a multi-star jump
                    scale.snapTo(0.6f)
                    scale.animateTo(1f, spring(dampingRatio = 0.35f, stiffness = Spring.StiffnessMedium))
                }
            }
            val color by animateColorAsState(if (on) Color(0xFFF5B301) else Track, label = "star")
            Icon(
                Icons.Rounded.Star,
                contentDescription = "Rate " + (i + 1),
                tint = color,
                modifier = Modifier
                    .size(36.dp)
                    .graphicsLayer { scaleX = scale.value; scaleY = scale.value }
                    .clickable { onRate(i + 1) },
            )
        }
    }
}`,
  },

  "badge-bounce": {
    apis: ["BadgedBox", "Animatable", "keyframes"],
    code: c`// Animatables restart whenever count changes: the badge pops and the bell wiggles
@Composable
fun BellBadge(count: Int) {
    val scale = remember { Animatable(1f) }
    val angle = remember { Animatable(0f) }

    LaunchedEffect(count) {
        if (count == 0) return@LaunchedEffect
        launch {
            scale.animateTo(1.45f, tween(120))
            scale.animateTo(1f, spring(dampingRatio = 0.3f, stiffness = Spring.StiffnessMedium))
        }
        angle.animateTo(0f, keyframes {
            durationMillis = 400
            14f at 60
            -12f at 150
            8f at 260
        })
    }

    BadgedBox(
        badge = {
            if (count > 0) {
                Badge(Modifier.graphicsLayer { scaleX = scale.value; scaleY = scale.value }) {
                    Text(if (count > 99) "99+" else count.toString())
                }
            }
        },
    ) {
        Icon(
            Icons.Outlined.Notifications,
            contentDescription = "Notifications",
            modifier = Modifier.graphicsLayer {
                rotationZ = angle.value
                transformOrigin = TransformOrigin(0.5f, 0f) // swing from the top
            },
        )
    }
}`,
  },

  "scroll-progress": {
    apis: ["rememberScrollState", "ScrollState.maxValue", "LinearProgressIndicator"],
    code: c`// ScrollState exposes value and maxValue; their ratio is the progress
val scroll = rememberScrollState()

Box(Modifier.fillMaxSize()) {
    Column(Modifier.verticalScroll(scroll)) { Article() }
    LinearProgressIndicator(
        // maxValue is Int.MAX_VALUE until the first layout, which reads as 0 here
        progress = { if (scroll.maxValue in 1 until Int.MAX_VALUE) scroll.value.toFloat() / scroll.maxValue else 0f },
        modifier = Modifier.fillMaxWidth().height(3.dp).align(Alignment.TopCenter),
        color = Accent,
        trackColor = Color.Transparent,
        drawStopIndicator = {},
    )
}`,
  },

  "segmented-control": {
    apis: ["BoxWithConstraints", "animateDpAsState", "spring"],
    code: c`// The thumb's offset animates to selected * segment width
@Composable
fun Segmented(options: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    BoxWithConstraints(
        Modifier
            .fillMaxWidth()
            .height(36.dp)
            .background(Track, RoundedCornerShape(10.dp))
            .padding(3.dp),
    ) {
        val segment = maxWidth / options.size
        val x by animateDpAsState(
            segment * selected,
            spring(dampingRatio = 0.7f, stiffness = Spring.StiffnessMediumLow),
            label = "thumb",
        )
        Box(
            Modifier
                .offset { IntOffset(x.roundToPx(), 0) }
                .width(segment)
                .fillMaxHeight()
                .shadow(2.dp, RoundedCornerShape(8.dp))
                .background(Color.White, RoundedCornerShape(8.dp)),
        )
        Row(Modifier.fillMaxSize()) {
            options.forEachIndexed { i, label ->
                Box(
                    Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clickable(interactionSource = null, indication = null) { onSelect(i) },
                    contentAlignment = Alignment.Center,
                ) {
                    Text(label, fontWeight = if (i == selected) FontWeight.SemiBold else FontWeight.Normal)
                }
            }
        }
    }
}`,
  },

  "skeleton-crossfade": {
    apis: ["Crossfade", "rememberInfiniteTransition", "RepeatMode.Reverse"],
    code: c`// Crossfade swaps the skeleton for the content; an infinite transition pulses the bones
@Composable
fun PostSlot(post: Post?) {
    Crossfade(targetState = post, animationSpec = tween(300), label = "post") { p ->
        if (p == null) PostSkeleton() else PostRow(p)
    }
}

@Composable
fun PostSkeleton() {
    val pulse by rememberInfiniteTransition(label = "pulse").animateFloat(
        initialValue = 1f,
        targetValue = 0.5f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "alpha",
    )
    val bone = Track
    Row(Modifier.graphicsLayer { alpha = pulse }, verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(40.dp).background(bone, CircleShape))
        Spacer(Modifier.width(12.dp))
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Box(Modifier.size(140.dp, 10.dp).background(bone, RoundedCornerShape(4.dp)))
            Box(Modifier.size(90.dp, 10.dp).background(bone, RoundedCornerShape(4.dp)))
        }
    }
}`,
  },

  "auto-carousel": {
    apis: ["HorizontalPager", "animateScrollToPage", "collectIsDraggedAsState"],
    code: c`// HorizontalPager plus a LaunchedEffect loop that restarts (and so pauses) while dragging
@Composable
fun AutoCarousel(slides: List<Int>) { // drawable ids
    val pager = rememberPagerState { slides.size }
    val dragging by pager.interactionSource.collectIsDraggedAsState()

    LaunchedEffect(dragging) {
        if (dragging) return@LaunchedEffect
        while (true) {
            delay(3000)
            pager.animateScrollToPage((pager.currentPage + 1) % slides.size, animationSpec = tween(500))
        }
    }

    Box {
        HorizontalPager(pager, Modifier.fillMaxWidth().height(200.dp)) { i ->
            Image(painterResource(slides[i]), null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        }
        Row(
            Modifier.align(Alignment.BottomCenter).padding(bottom = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            repeat(slides.size) { i ->
                // 1 on the current page, 0 elsewhere, in between mid-swipe
                val t = (1f - abs(pager.currentPage + pager.currentPageOffsetFraction - i)).coerceIn(0f, 1f)
                Box(
                    Modifier
                        .height(8.dp)
                        .width(8.dp + 14.dp * t)
                        .background(Color.White.copy(alpha = 0.5f + 0.5f * t), CircleShape),
                )
            }
        }
    }
}`,
  },

  "reorder-list": {
    apis: ["detectDragGesturesAfterLongPress", "Modifier.animateItem", "zIndex"],
    code: c`// Long-press drag moves the item within the list; animateItem() slides the others
@Composable
fun ReorderList(initial: List<String>) {
    var list by remember { mutableStateOf(initial) }
    var dragged by remember { mutableStateOf<String?>(null) }
    var dragY by remember { mutableFloatStateOf(0f) }
    val rowPx = with(LocalDensity.current) { 56.dp.toPx() }

    LazyColumn {
        items(list, key = { it }) { item ->
            val lifted = item == dragged
            val elevation by animateDpAsState(if (lifted) 8.dp else 0.dp, label = "lift")
            Surface(
                shadowElevation = elevation,
                modifier = Modifier
                    .then(if (lifted) Modifier.zIndex(1f).graphicsLayer { translationY = dragY } else Modifier.animateItem())
                    .fillMaxWidth()
                    .height(56.dp)
                    .pointerInput(item) {
                        detectDragGesturesAfterLongPress(
                            onDragStart = { dragged = item; dragY = 0f },
                            onDrag = { change, amount ->
                                change.consume()
                                dragY += amount.y
                                val from = list.indexOf(item)
                                val to = (from + (dragY / rowPx).roundToInt()).coerceIn(0, list.lastIndex)
                                if (to != from) {
                                    list = list.toMutableList().apply { add(to, removeAt(from)) }
                                    dragY -= (to - from) * rowPx // stay under the finger after the move
                                }
                            },
                            onDragEnd = { dragged = null },
                            onDragCancel = { dragged = null },
                        )
                    },
            ) {
                Row(Modifier.padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.DragHandle, contentDescription = null)
                    Spacer(Modifier.width(12.dp))
                    Text(item)
                }
            }
        }
    }
}`,
  },

  "sheet-scale": {
    apis: ["Animatable", "graphicsLayer", "Modifier.draggable"],
    code: c`// One Animatable drives the sheet offset and the scale of the screen behind it
@Composable
fun SheetScale() {
    val progress = remember { Animatable(0f) } // 0 closed, 1 open
    val scope = rememberCoroutineScope()

    BoxWithConstraints(Modifier.fillMaxSize().background(Color.Black)) {
        val sheetPx = constraints.maxHeight * 0.85f
        // The screen shrinks, rounds its corners and moves down a touch
        Box(
            Modifier.fillMaxSize().graphicsLayer {
                val p = progress.value
                scaleX = 1f - 0.08f * p
                scaleY = 1f - 0.08f * p
                translationY = 10.dp.toPx() * p
                shape = RoundedCornerShape((12 * p).dp)
                clip = true
            },
        ) {
            AppScreen(onOpen = { scope.launch { progress.animateTo(1f, spring(dampingRatio = 0.9f, stiffness = 300f)) } })
        }
        // Dim layer; it has no pointer input, so touches pass through
        Box(Modifier.fillMaxSize().graphicsLayer { alpha = 0.4f * progress.value }.background(Color.Black))
        Surface(
            shape = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(maxHeight * 0.85f)
                .graphicsLayer { translationY = (1f - progress.value) * sheetPx }
                .draggable(
                    orientation = Orientation.Vertical,
                    state = rememberDraggableState { dy ->
                        scope.launch { progress.snapTo((progress.value - dy / sheetPx).coerceIn(0f, 1f)) }
                    },
                    onDragStopped = { velocity ->
                        val close = velocity > 2000f || progress.value < 0.6f
                        progress.animateTo(if (close) 0f else 1f, tween(250))
                    },
                ),
        ) {
            SheetContent(onClose = { scope.launch { progress.animateTo(0f, tween(250)) } })
        }
    }
}`,
  },
  "slide-confirm": {
    apis: ["Animatable", "draggable", "rememberDraggableState", "spring"],
    code: c`// An Animatable holds the knob offset in px; drag snaps it, release animates it
@Composable
fun SlideToConfirm(onConfirm: () -> Unit) {
    val knob = 48.dp
    val pad = 4.dp
    val density = LocalDensity.current
    val travel = with(density) { (280.dp - knob - pad * 2).toPx() }
    val x = remember { Animatable(0f) }
    var confirmed by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Box(
        Modifier
            .width(280.dp)
            .height(knob + pad * 2)
            .clip(CircleShape)
            .background(Track),
        contentAlignment = Alignment.CenterStart,
    ) {
        Box(
            Modifier
                .fillMaxHeight()
                .width(with(density) { x.value.toDp() } + knob + pad * 2)
                .background(Accent, CircleShape),
        )
        Text(
            "Slide to confirm",
            Modifier
                .align(Alignment.Center)
                .graphicsLayer { alpha = (1f - x.value / (travel * 0.5f)).coerceIn(0f, 1f) },
            fontWeight = FontWeight.SemiBold,
        )
        Box(
            Modifier
                .padding(pad)
                .offset { IntOffset(x.value.roundToInt(), 0) }
                .size(knob)
                .shadow(2.dp, CircleShape)
                .background(Color.White, CircleShape)
                .draggable(
                    orientation = Orientation.Horizontal,
                    enabled = !confirmed,
                    state = rememberDraggableState { delta ->
                        scope.launch { x.snapTo((x.value + delta).coerceIn(0f, travel)) }
                    },
                    onDragStopped = { velocity ->
                        val lockIn = x.value > travel * 0.85f || velocity > 1200f
                        if (lockIn) { confirmed = true; onConfirm() }
                        x.animateTo(
                            if (lockIn) travel else 0f,
                            spring(dampingRatio = if (lockIn) 0.9f else 0.6f, stiffness = 300f),
                            initialVelocity = velocity,
                        )
                    },
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Accent)
        }
    }
}`,
  },
  typewriter: {
    apis: ["LaunchedEffect", "rememberInfiniteTransition", "delay"],
    code: c`// A coroutine reveals characters; an infinite transition blinks the caret
var shown by remember(text) { mutableIntStateOf(0) }
LaunchedEffect(text) {
    for (i in 1..text.length) { delay(45); shown = i }
}
val blink by rememberInfiniteTransition(label = "caret").animateFloat(
    initialValue = 1f, targetValue = 0f,
    animationSpec = infiniteRepeatable(tween(450, easing = { if (it < 0.5f) 0f else 1f })), // hard step
    label = "blink",
)

Row(verticalAlignment = Alignment.CenterVertically) {
    Text(text.take(shown), fontFamily = FontFamily.Monospace, fontWeight = FontWeight.SemiBold)
    Box(Modifier.padding(start = 2.dp).size(2.dp, 20.dp).graphicsLayer { alpha = blink }.background(Accent))
}`,
  },
  "word-rotate": {
    apis: ["AnimatedContent", "slideInVertically", "togetherWith"],
    code: c`// AnimatedContent slides the new word up from below and the old one up and out
val words = listOf("faster", "smoother", "together")
var i by remember { mutableIntStateOf(0) }
LaunchedEffect(Unit) { while (true) { delay(2000); i = (i + 1) % words.size } }

Row(verticalAlignment = Alignment.CenterVertically) {
    Text("Build ", style = MaterialTheme.typography.headlineSmall)
    AnimatedContent(
        targetState = i,
        transitionSpec = {
            (slideInVertically(spring(dampingRatio = 0.6f)) { it } + fadeIn()) togetherWith
                (slideOutVertically { -it } + fadeOut())
        },
        label = "word",
    ) { index ->
        Text(words[index], color = Accent, style = MaterialTheme.typography.headlineSmall)
    }
}`,
  },
  "text-reveal": {
    apis: ["Animatable", "LaunchedEffect", "graphicsLayer"],
    code: c`// One Animatable per word, each started 80 ms after the previous
val words = remember(title) { title.split(" ") }
val progress = remember(title) { words.map { Animatable(0f) } }
LaunchedEffect(title) {
    progress.forEachIndexed { i, a ->
        launch { delay(80L * i); a.animateTo(1f, spring(dampingRatio = 0.6f, stiffness = 300f)) }
    }
}

FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
    words.forEachIndexed { i, word ->
        Text(
            word,
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.graphicsLayer {
                alpha = progress[i].value.coerceIn(0f, 1f)
                translationY = (1 - progress[i].value) * 14.dp.toPx()
            },
        )
    }
}`,
  },
  "wave-bars": {
    apis: ["rememberInfiniteTransition", "StartOffset", "RepeatMode.Reverse"],
    code: c`// One infinite transition, each bar starting at a different offset
val t = rememberInfiniteTransition(label = "eq")
val offsets = listOf(0, 300, 600, 150, 450)

Row(Modifier.height(44.dp), horizontalArrangement = Arrangement.spacedBy(5.dp), verticalAlignment = Alignment.Bottom) {
    offsets.forEach { offset ->
        val s by t.animateFloat(
            initialValue = 0.3f, targetValue = 1f,
            animationSpec = infiniteRepeatable(
                tween(450, easing = FastOutSlowInEasing),
                RepeatMode.Reverse,
                initialStartOffset = StartOffset(offset),
            ),
            label = "bar",
        )
        Box(
            Modifier.width(6.dp).fillMaxHeight()
                .graphicsLayer { scaleY = s; transformOrigin = TransformOrigin(0.5f, 1f) }
                .background(Accent, RoundedCornerShape(3.dp)),
        )
    }
}`,
  },
  "spinner-arc": {
    apis: ["CircularProgressIndicator", "drawArc", "rememberInfiniteTransition"],
    code: c`// Built in: Material 3's indeterminate CircularProgressIndicator is this exact spinner
CircularProgressIndicator(Modifier.size(48.dp), color = Accent, strokeWidth = 5.dp, strokeCap = StrokeCap.Round)

// By hand: rotate and stretch an arc
val t = rememberInfiniteTransition(label = "spin")
val angle by t.animateFloat(0f, 360f, infiniteRepeatable(tween(1600, easing = LinearEasing)), label = "angle")
val sweep by t.animateFloat(18f, 270f, infiniteRepeatable(tween(700, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "sweep")

Canvas(Modifier.size(48.dp)) {
    drawArc(Accent, startAngle = angle, sweepAngle = sweep, useCenter = false,
        topLeft = Offset(2.5.dp.toPx(), 2.5.dp.toPx()),
        size = Size(size.width - 5.dp.toPx(), size.height - 5.dp.toPx()),
        style = Stroke(5.dp.toPx(), cap = StrokeCap.Round))
}`,
  },
  checkbox: {
    apis: ["animateFloatAsState", "animateColorAsState", "PathMeasure"],
    code: c`// One progress drives the fill color and how much of the check path is drawn
val p by animateFloatAsState(if (checked) 1f else 0f, tween(220), label = "check")
val scale by animateFloatAsState(if (checked) 1f else 0.94f, spring(dampingRatio = 0.4f), label = "scale")
val fill by animateColorAsState(if (checked) Accent else Color.Transparent, label = "fill")
val border by animateColorAsState(if (checked) Accent else Track, label = "border")

Canvas(
    Modifier.size(26.dp).graphicsLayer { scaleX = scale; scaleY = scale }
        .toggleable(value = checked, role = Role.Checkbox, onValueChange = onCheckedChange),
) {
    val r = CornerRadius(7.dp.toPx())
    drawRoundRect(fill, cornerRadius = r)
    drawRoundRect(border, cornerRadius = r, style = Stroke(2.dp.toPx()))
    val check = Path().apply {
        moveTo(size.width * 0.22f, size.height * 0.52f)
        lineTo(size.width * 0.42f, size.height * 0.7f)
        lineTo(size.width * 0.78f, size.height * 0.32f)
    }
    val measure = PathMeasure().apply { setPath(check, false) }
    val partial = Path().also { measure.getSegment(0f, measure.length * p, it, true) }
    drawPath(partial, Color.White, style = Stroke(3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
}`,
  },
  stepper: {
    apis: ["AnimatedContent", "targetState > initialState", "SizeTransform"],
    code: c`// AnimatedContent compares old and new values to pick the slide direction
var value by remember { mutableIntStateOf(3) }

Row(verticalAlignment = Alignment.CenterVertically) {
    IconButton(onClick = { value = maxOf(0, value - 1) }) { Icon(Icons.Default.Remove, null) }
    AnimatedContent(
        targetState = value,
        transitionSpec = {
            val up = targetState > initialState
            (slideInVertically { if (up) it else -it } + fadeIn()) togetherWith
                (slideOutVertically { if (up) -it else it } + fadeOut()) using SizeTransform(clip = true)
        },
        label = "count",
    ) { v ->
        Text("$v", Modifier.width(32.dp), textAlign = TextAlign.Center, fontWeight = FontWeight.Bold)
    }
    IconButton(onClick = { value++ }) { Icon(Icons.Default.Add, null) }
}`,
  },
  "step-progress": {
    apis: ["animateFloatAsState", "animateColorAsState", "tween(delayMillis)"],
    code: c`// The line animates to step / (n - 1); each dot changes color once the line reaches it
val steps = listOf("Cart", "Address", "Payment", "Done")
val fraction by animateFloatAsState(step / (steps.size - 1f), tween(400, easing = FastOutSlowInEasing), label = "fill")

Box(Modifier.fillMaxWidth().height(14.dp), contentAlignment = Alignment.CenterStart) {
    Box(Modifier.padding(horizontal = 7.dp).fillMaxWidth().height(4.dp).background(Track, CircleShape))
    Box(Modifier.padding(horizontal = 7.dp).fillMaxWidth(fraction).height(4.dp).background(Accent, CircleShape))
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        steps.indices.forEach { i ->
            val reached = i <= step
            val color by animateColorAsState(if (reached) Accent else Track, tween(150, delayMillis = if (reached) 300 else 0), label = "dot")
            Box(Modifier.size(14.dp).background(color, CircleShape))
        }
    }
}`,
  },
  "gradient-border": {
    apis: ["Brush.sweepGradient", "rememberInfiniteTransition", "drawWithContent"],
    code: c`// A sweep gradient drawn rotated behind the content; padding leaves a 2dp rim
val angle by rememberInfiniteTransition(label = "border")
    .animateFloat(0f, 360f, infiniteRepeatable(tween(3000, easing = LinearEasing)), label = "angle")
val brush = Brush.sweepGradient(listOf(Accent, Coral, Amber, Accent))

Box(
    Modifier
        .clip(RoundedCornerShape(16.dp))
        .drawBehind { rotate(angle) { drawCircle(brush, radius = size.maxDimension) } }
        .padding(2.dp)
        .background(Color.White, RoundedCornerShape(14.dp))
        .padding(horizontal = 24.dp, vertical = 20.dp),
) {
    Text("Pro plan", fontWeight = FontWeight.Bold)
}`,
  },
  "copy-feedback": {
    apis: ["AnimatedContent", "scaleIn / scaleOut", "LocalClipboardManager"],
    code: c`// AnimatedContent pops between the icons; a LaunchedEffect swaps back after 1.5 s
val clipboard = LocalClipboardManager.current
var copied by remember { mutableStateOf(false) }
LaunchedEffect(copied) { if (copied) { delay(1500); copied = false } }

TextButton(onClick = { clipboard.setText(AnnotatedString(text)); copied = true }) {
    AnimatedContent(
        targetState = copied,
        transitionSpec = {
            (scaleIn(spring(dampingRatio = 0.5f)) + fadeIn()) togetherWith (scaleOut() + fadeOut())
        },
        label = "copy",
    ) { done ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(if (done) Icons.Default.Check else Icons.Default.ContentCopy, null,
                tint = if (done) Color(0xFF2BA84A) else LocalContentColor.current)
            Spacer(Modifier.width(6.dp))
            Text(if (done) "Copied" else "Copy")
        }
    }
}`,
  },
  "password-strength": {
    apis: ["animateFloatAsState", "lerp(Color)", "fillMaxWidth(fraction)"],
    code: c`// One animated score drives both the bar's width and its color
val colors = listOf(Color(0xFFE5484D), Color(0xFFF76B15), Color(0xFFF5B301), Color(0xFF7CC23A), Color(0xFF2BA84A))
val labels = listOf("Too weak", "Weak", "Okay", "Good", "Strong")
val score = scorePassword(password) // 0..4
val s by animateFloatAsState(if (password.isEmpty()) -1f else score.toFloat(), tween(300), label = "score")

fun colorAt(v: Float): Color {
    val i = v.toInt().coerceIn(0, 3)
    return lerp(colors[i], colors[i + 1], (v - i).coerceIn(0f, 1f))
}

Column {
    OutlinedTextField(password, { password = it }, visualTransformation = PasswordVisualTransformation())
    Spacer(Modifier.height(8.dp))
    Box(Modifier.fillMaxWidth().height(6.dp).clip(CircleShape).background(Track)) {
        Box(Modifier.fillMaxWidth(((s + 1) / 5).coerceIn(0f, 1f)).fillMaxHeight().background(colorAt(maxOf(s, 0f))))
    }
    Text(if (password.isEmpty()) "" else labels[score], style = MaterialTheme.typography.labelMedium)
}`,
  },
  odometer: {
    apis: ["animateIntAsState", "graphicsLayer.translationY", "clipToBounds"],
    code: c`// Each digit is a column 0..9 shifted up by digit * rowHeight with a springy offset
@Composable
fun Digit(value: Int) {
    val h = 34.dp
    val y by animateFloatAsState(value.toFloat(), spring(dampingRatio = 0.6f, stiffness = 200f), label = "digit")
    Box(Modifier.height(h).clipToBounds()) {
        Column(Modifier.wrapContentHeight(Alignment.Top, unbounded = true).graphicsLayer { translationY = -y * h.toPx() }) {
            (0..9).forEach { d -> Text("$d", Modifier.height(h), fontSize = 26.sp, fontFamily = FontFamily.Monospace) }
        }
    }
}

// Key from the right so columns keep their animation state when the number gains a digit
val chars = value.toString().reversed()
CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
    Row { chars.forEachIndexed { i, ch -> key(i) { Digit(ch.digitToInt()) } } }
}`,
  },
  tooltip: {
    apis: ["TooltipBox", "AnimatedVisibility", "TransformOrigin"],
    code: c`// Built in: Material 3 TooltipBox shows a plain tooltip on long press
TooltipBox(
    positionProvider = TooltipDefaults.rememberPlainTooltipPositionProvider(),
    tooltip = { PlainTooltip { Text("Saved to library") } },
    state = rememberTooltipState(),
) {
    Icon(Icons.Outlined.BookmarkBorder, contentDescription = "Bookmark")
}

// Custom pop: scale in from the arrow tip (bottom center)
AnimatedVisibility(
    visible,
    enter = scaleIn(spring(dampingRatio = 0.55f, stiffness = 500f), initialScale = 0.6f,
        transformOrigin = TransformOrigin(0.5f, 1f)) + fadeIn(),
    exit = scaleOut(tween(120), targetScale = 0.6f, transformOrigin = TransformOrigin(0.5f, 1f)) + fadeOut(tween(120)),
) {
    Bubble("Saved to library")
}`,
  },
  "expand-search": {
    apis: ["animateDpAsState", "FocusRequester", "AnimatedVisibility"],
    code: c`// The pill's width animates; the field fades in and grabs focus once open
var open by remember { mutableStateOf(false) }
val focus = remember { FocusRequester() }
val full = LocalConfiguration.current.screenWidthDp.dp - 32.dp
val width by animateDpAsState(
    if (open) full else 40.dp,
    if (open) spring(dampingRatio = 0.7f, stiffness = 400f) else tween(220),
    label = "width",
)
LaunchedEffect(open) { if (open) focus.requestFocus() }

Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
    Row(
        Modifier.width(width).height(40.dp).clip(CircleShape).background(Track),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = { open = true }, Modifier.size(40.dp)) { Icon(Icons.Default.Search, null) }
        AnimatedVisibility(open, Modifier.weight(1f), enter = fadeIn(tween(150, delayMillis = 140)), exit = fadeOut(tween(80))) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                BasicTextField(query, { query = it }, Modifier.weight(1f).focusRequester(focus))
                TextButton(onClick = { open = false }) { Text("Cancel") }
            }
        }
    }
}`,
  },
  "chip-select": {
    apis: ["FilterChip", "animateContentSize", "FlowRow"],
    code: c`// FilterChip animates its leading check; animateContentSize lets the row reflow smoothly
FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
    tags.forEach { tag ->
        val on = tag in selected
        FilterChip(
            selected = on,
            onClick = { selected = if (on) selected - tag else selected + tag },
            label = { Text(tag) },
            leadingIcon = {
                AnimatedVisibility(on, enter = scaleIn(spring(dampingRatio = 0.5f)) + expandHorizontally(), exit = scaleOut() + shrinkHorizontally()) {
                    Icon(Icons.Default.Check, null, Modifier.size(FilterChipDefaults.IconSize))
                }
            },
            modifier = Modifier.animateContentSize(spring(dampingRatio = 0.7f)),
        )
    }
}`,
  },
  "tab-bubble": {
    apis: ["animateContentSize", "AnimatedVisibility", "animateColorAsState"],
    code: c`// The active tab's pill grows to fit its label; others shrink back to just the icon
Row(Modifier.fillMaxWidth().padding(8.dp), horizontalArrangement = Arrangement.SpaceAround) {
    tabs.forEachIndexed { i, tab ->
        val on = i == active
        val bg by animateColorAsState(if (on) AccentSoft else Color.Transparent, label = "pill")
        Row(
            Modifier
                .clip(CircleShape)
                .background(bg)
                .clickable { active = i }
                .padding(horizontal = 14.dp, vertical = 8.dp)
                .animateContentSize(spring(dampingRatio = 0.7f, stiffness = 300f)),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(tab.icon, tab.label, tint = if (on) Accent else Color.Gray)
            AnimatedVisibility(on, enter = fadeIn(tween(150, delayMillis = 80)) + expandHorizontally(), exit = fadeOut(tween(80)) + shrinkHorizontally()) {
                Text(tab.label, Modifier.padding(start = 6.dp), color = Accent, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}`,
  },
  "range-slider": {
    apis: ["RangeSlider", "pointerInput", "detectHorizontalDragGestures"],
    code: c`// Material 3 ships it: RangeSlider animates both thumbs and keeps them in order
var range by remember { mutableStateOf(20f..80f) }

RangeSlider(
    value = range,
    onValueChange = { range = it },
    valueRange = 0f..100f,
    onValueChangeFinished = { onChange(range.start.roundToInt(), range.endInclusive.roundToInt()) },
)

// Custom thumbs: pointerInput per thumb, clamping against the other
// Modifier.pointerInput(Unit) { detectHorizontalDragGestures { _, dx -> lo = (lo + dx).coerceIn(0f, hi - gap) } }`,
  },
  joystick: {
    apis: ["Animatable<Offset>", "detectDragGestures", "spring"],
    code: c`// Clamp the drag to the ring's radius; on release, spring the Offset back to zero
val knob = remember { Animatable(Offset.Zero, Offset.VectorConverter) }
val scope = rememberCoroutineScope()
val r = with(LocalDensity.current) { 50.dp.toPx() }

Box(
    Modifier.size(140.dp).background(Track, CircleShape)
        .pointerInput(Unit) {
            detectDragGestures(
                onDragEnd = { scope.launch { knob.animateTo(Offset.Zero, spring(dampingRatio = 0.45f, stiffness = 400f)) } },
            ) { change, drag ->
                change.consume()
                val next = knob.value + drag
                val d = next.getDistance()
                scope.launch { knob.snapTo(if (d > r) next * (r / d) else next) }
            }
        },
    contentAlignment = Alignment.Center,
) {
    Box(Modifier.offset { knob.value.round() }.size(40.dp).shadow(4.dp, CircleShape).background(Accent, CircleShape))
}
// direction: knob.value / r (each axis -1..1)`,
  },
  "image-compare": {
    apis: ["detectHorizontalDragGestures", "drawWithContent", "clipRect"],
    code: c`// Draw the "after" image clipped to the divider; drag (or tap) moves the divider
var split by remember { mutableFloatStateOf(0.5f) }

Box(
    Modifier.fillMaxWidth().height(220.dp).clip(RoundedCornerShape(16.dp))
        .pointerInput(Unit) { detectTapGestures { split = (it.x / size.width).coerceIn(0f, 1f) } }
        .pointerInput(Unit) {
            detectHorizontalDragGestures { change, _ -> split = (change.position.x / size.width).coerceIn(0f, 1f) }
        },
) {
    Image(before, null, Modifier.matchParentSize(), contentScale = ContentScale.Crop)
    Image(
        after, null,
        Modifier.matchParentSize().drawWithContent { clipRect(right = size.width * split) { this@drawWithContent.drawContent() } },
        contentScale = ContentScale.Crop,
    )
    BoxWithConstraints(Modifier.matchParentSize()) {
        Box(Modifier.offset(x = maxWidth * split - 1.dp).width(2.dp).fillMaxHeight().background(Color.White))
        Box(Modifier.offset(x = maxWidth * split - 14.dp).align(Alignment.CenterStart).size(28.dp).background(Color.White, CircleShape))
    }
}`,
  },
  "side-drawer": {
    apis: ["ModalNavigationDrawer", "AnchoredDraggableState", "graphicsLayer"],
    code: c`// Built in: ModalNavigationDrawer drags open from the edge, dims the screen and flings shut
val drawerState = rememberDrawerState(DrawerValue.Closed)
val scope = rememberCoroutineScope()

ModalNavigationDrawer(
    drawerState = drawerState,
    drawerContent = { ModalDrawerSheet(Modifier.width(280.dp)) { Menu() } },
    scrimColor = Color.Black.copy(alpha = 0.45f),
) {
    // Nudge the screen with the drawer's progress (offset goes -width..0)
    val width = with(LocalDensity.current) { 280.dp.toPx() }
    Screen(
        onMenu = { scope.launch { drawerState.open() } },
        modifier = Modifier.graphicsLayer {
            val p = 1f + drawerState.currentOffset / width // 0 closed, 1 open
            translationX = p.coerceIn(0f, 1f) * 40.dp.toPx()
        },
    )
}`,
  },
  "otp-input": {
    apis: ["BasicTextField(decorationBox)", "Animatable", "AnimatedContent"],
    code: c`// BasicTextField draws its own boxes via decorationBox; an Animatable shakes the row
val len = 4
var code by remember { mutableStateOf("") }
val shake = remember { Animatable(0f) }
val scope = rememberCoroutineScope()

BasicTextField(
    value = code,
    onValueChange = { new ->
        code = new.filter(Char::isDigit).take(len)
        if (code.length == len && !verify(code)) scope.launch {
            shake.animateTo(0f, keyframes { durationMillis = 250; -10f at 50; 10f at 100; -6f at 150 })
            code = ""
        }
    },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
    modifier = Modifier.semantics { contentType = ContentType.SmsOtpCode },
    decorationBox = {
        Row(Modifier.graphicsLayer { translationX = shake.value.dp.toPx() }, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(len) { i ->
                val active = i == code.length
                val border by animateColorAsState(if (active) Accent else Track, label = "border")
                Box(Modifier.size(44.dp, 54.dp).border(2.dp, border, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                    AnimatedContent(code.getOrNull(i), transitionSpec = { scaleIn(spring(dampingRatio = 0.45f), 0.3f) togetherWith fadeOut() }, label = "digit") { ch ->
                        Text(ch?.toString() ?: "", fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    },
)`,
  },
  "scroll-top-fab": {
    apis: ["derivedStateOf", "AnimatedVisibility", "animateScrollToItem"],
    code: c`// derivedStateOf turns the scroll position into one boolean; AnimatedVisibility pops the button
val listState = rememberLazyListState()
val scope = rememberCoroutineScope()
val show by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 || listState.firstVisibleItemScrollOffset > 400 } }

Box(Modifier.fillMaxSize()) {
    LazyColumn(state = listState) { items(items) { Row(it) } }
    AnimatedVisibility(
        show,
        Modifier.align(Alignment.BottomEnd).padding(20.dp, 32.dp),
        enter = scaleIn(spring(dampingRatio = 0.5f), initialScale = 0.6f) + fadeIn() + slideInVertically { it / 2 },
        exit = scaleOut(targetScale = 0.6f) + fadeOut() + slideOutVertically { it / 2 },
    ) {
        SmallFloatingActionButton(onClick = { scope.launch { listState.animateScrollToItem(0) } }) {
            Icon(Icons.Default.ArrowUpward, "Back to top")
        }
    }
}`,
  },
  "layout-toggle": {
    apis: ["LookaheadScope", "animateBounds", "LazyVerticalGrid"],
    code: c`// Compose 1.8: animateBounds inside a LookaheadScope glides each item to its new size and spot
var grid by remember { mutableStateOf(false) }

TextButton(onClick = { grid = !grid }) { Text(if (grid) "List view" else "Grid view") }

LookaheadScope {
    FlowRow(
        Modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        maxItemsInEachRow = if (grid) 2 else 1,
    ) {
        items.forEach { item ->
            key(item.id) {
                ItemCard(
                    item, compact = !grid,
                    modifier = Modifier
                        .animateBounds(this@LookaheadScope, boundsTransform = { _, _ -> spring(dampingRatio = 0.75f, stiffness = 300f) })
                        .weight(1f)
                        .height(if (grid) 140.dp else 72.dp),
                )
            }
        }
    }
}
// For lazy lists, Modifier.animateItem() animates placement inside one LazyColumn/LazyGrid`,
  },
  "keyboard-avoid": {
    apis: ["WindowInsets.ime", "imePadding", "enableEdgeToEdge"],
    code: c`// With edge-to-edge on, the IME inset animates every frame as the keyboard slides
// Activity: enableEdgeToEdge() and android:windowSoftInputMode="adjustResize"
Column(Modifier.fillMaxSize()) {
    LazyColumn(Modifier.weight(1f), reverseLayout = true) { items(messages) { MessageRow(it) } }
    Row(
        Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .navigationBarsPadding()
            .imePadding() // follows the keyboard frame by frame
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        OutlinedTextField(draft, { draft = it }, Modifier.weight(1f), placeholder = { Text("Message") })
        IconButton(onClick = send) { Icon(Icons.AutoMirrored.Filled.Send, "Send") }
    }
}`,
  },
  "tilt-card": {
    apis: ["graphicsLayer.rotationX / rotationY", "cameraDistance", "Animatable"],
    code: c`// Finger position maps to rotationX/Y in graphicsLayer; cameraDistance sets the perspective
val rx = remember { Animatable(0f) }
val ry = remember { Animatable(0f) }
val scope = rememberCoroutineScope()
val max = 12f

Box(
    Modifier
        .size(260.dp, 160.dp)
        .graphicsLayer {
            rotationX = rx.value
            rotationY = ry.value
            cameraDistance = 12 * density
            val lifted = if (rx.value != 0f || ry.value != 0f) 1.04f else 1f
            scaleX = lifted; scaleY = lifted
        }
        .clip(RoundedCornerShape(16.dp))
        .pointerInput(Unit) {
            awaitEachGesture {
                var e = awaitFirstDown()
                do {
                    val p = e.position
                    scope.launch { ry.snapTo(((p.x / size.width) * 2 - 1).coerceIn(-1f, 1f) * max) }
                    scope.launch { rx.snapTo(-((p.y / size.height) * 2 - 1).coerceIn(-1f, 1f) * max) }
                    e = awaitPointerEvent().changes.first()
                } while (e.pressed)
                scope.launch { rx.animateTo(0f, spring(dampingRatio = 0.4f)) }
                scope.launch { ry.animateTo(0f, spring(dampingRatio = 0.4f)) }
            }
        },
) {
    CardContent()
}`,
  },
  "gyro-parallax": {
    apis: ["SensorManager", "TYPE_GAME_ROTATION_VECTOR", "animateFloatAsState"],
    code: c`// Read pitch/roll from the rotation-vector sensor; each layer offsets by its depth
@Composable
fun rememberTilt(): State<Offset> {
    val context = LocalContext.current
    val tilt = remember { mutableStateOf(Offset.Zero) }
    DisposableEffect(Unit) {
        val sm = context.getSystemService(SensorManager::class.java)
        val listener = object : SensorEventListener {
            val m = FloatArray(9); val o = FloatArray(3)
            override fun onSensorChanged(e: SensorEvent) {
                SensorManager.getRotationMatrixFromVector(m, e.values)
                SensorManager.getOrientation(m, o) // azimuth, pitch, roll in radians
                tilt.value = Offset(o[2].coerceIn(-0.6f, 0.6f), (o[1] + 0.6f).coerceIn(-0.6f, 0.6f))
            }
            override fun onAccuracyChanged(s: Sensor?, a: Int) {}
        }
        sm.registerListener(listener, sm.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR), SensorManager.SENSOR_DELAY_GAME)
        onDispose { sm.unregisterListener(listener) }
    }
    return tilt
}

val tilt by rememberTilt()
Box(Modifier.size(300.dp, 200.dp).clip(RoundedCornerShape(20.dp))) {
    layers.forEach { layer ->
        val x by animateFloatAsState(tilt.x * layer.depth * 40, spring(stiffness = 300f), label = "x")
        val y by animateFloatAsState(tilt.y * layer.depth * 40, spring(stiffness = 300f), label = "y")
        Image(layer.image, null, Modifier.requiredSize(380.dp, 280.dp).graphicsLayer { translationX = x.dp.toPx(); translationY = y.dp.toPx() })
    }
}`,
  },
  "emoji-reactions": {
    apis: ["detectDragGesturesAfterLongPress", "animateFloatAsState", "TransformOrigin"],
    code: c`// Long press, then drag: open the bar and track which emoji is under the finger
val emoji = listOf("👍", "❤️", "😂", "😮", "😢", "😡")
var open by remember { mutableStateOf(false) }
var hovered by remember { mutableIntStateOf(-1) }
val sizePx = with(LocalDensity.current) { 44.dp.toPx() }
val barScale by animateFloatAsState(if (open) 1f else 0.6f, spring(dampingRatio = 0.5f), label = "bar")
val barAlpha by animateFloatAsState(if (open) 1f else 0f, label = "alpha")

Box {
    Row(
        Modifier.offset(y = (-56).dp)
            .graphicsLayer { scaleX = barScale; scaleY = barScale; alpha = barAlpha; transformOrigin = TransformOrigin(0f, 1f) }
            .shadow(6.dp, CircleShape).background(Color.White, CircleShape).padding(horizontal = 8.dp, vertical = 4.dp),
    ) {
        emoji.forEachIndexed { i, e ->
            val s by animateFloatAsState(if (hovered == i) 1.6f else if (hovered >= 0) 0.85f else 1f, spring(dampingRatio = 0.5f), label = "s")
            Text(e, Modifier.width(44.dp).graphicsLayer { scaleX = s; scaleY = s; transformOrigin = TransformOrigin(0.5f, 1f) },
                fontSize = 30.sp, textAlign = TextAlign.Center)
        }
    }
    LikeButton(
        Modifier.pointerInput(Unit) {
            detectDragGesturesAfterLongPress(
                onDragStart = { open = true },
                onDragEnd = { if (hovered >= 0) onReact(emoji[hovered]); open = false; hovered = -1 },
                onDragCancel = { open = false; hovered = -1 },
            ) { change, _ ->
                val p = change.position
                val i = ((p.x - 8.dp.toPx()) / sizePx).toInt()
                hovered = if (p.y < 0 && i in emoji.indices) i else -1
            }
        },
    )
}
// Note: an onClick on LikeButton for a quick tap; open = true on onDragStart fires after the long press`,
  },
  "context-menu": {
    apis: ["combinedClickable(onLongClick)", "DropdownMenu", "onGloballyPositioned"],
    code: c`// Long press squeezes the bubble, then lifts it and opens a DropdownMenu anchored below it
var open by remember { mutableStateOf(false) }
val interaction = remember { MutableInteractionSource() }
val pressed by interaction.collectIsPressedAsState()
val scale by animateFloatAsState(
    when { open -> 1.04f; pressed -> 0.95f; else -> 1f },
    if (pressed && !open) tween(350) else spring(dampingRatio = 0.6f),
    label = "scale",
)
val lift by animateDpAsState(if (open) 12.dp else 0.dp, spring(dampingRatio = 0.6f), label = "lift")
val haptics = LocalHapticFeedback.current

Box {
    Bubble(
        message,
        Modifier
            .graphicsLayer { scaleX = scale; scaleY = scale; translationY = -lift.toPx() }
            .shadow(lift, RoundedCornerShape(16.dp))
            .combinedClickable(interactionSource = interaction, indication = null, onClick = {}, onLongClick = {
                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                open = true
            }),
    )
    // DropdownMenu brings its own scale-and-fade from the anchor
    DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
        DropdownMenuItem(text = { Text("Reply") }, leadingIcon = { Icon(Icons.AutoMirrored.Filled.Reply, null) }, onClick = { open = false })
        DropdownMenuItem(text = { Text("Copy") }, leadingIcon = { Icon(Icons.Default.ContentCopy, null) }, onClick = { open = false })
        DropdownMenuItem(text = { Text("Delete", color = MaterialTheme.colorScheme.error) }, leadingIcon = { Icon(Icons.Default.Delete, null) }, onClick = { open = false })
    }
}
// For the dimmed backdrop, show a full-screen Popup scrim with animateFloatAsState alpha while open`,
  },
  "fly-to-cart": {
    apis: ["onGloballyPositioned", "Animatable", "positionInRoot"],
    code: c`// Record both positions in root coordinates; fly a copy in a root-level overlay along an arc
var from by remember { mutableStateOf(Offset.Zero) }
var to by remember { mutableStateOf(Offset.Zero) }
val t = remember { Animatable(0f) }
val bump = remember { Animatable(1f) }
var flying by remember { mutableStateOf(false) }
val scope = rememberCoroutineScope()

fun fly() = scope.launch {
    flying = true
    t.snapTo(0f)
    t.animateTo(1f, tween(700, easing = FastOutSlowInEasing))
    flying = false
    addToCart(product)
    bump.animateTo(1.3f, tween(100)); bump.animateTo(1f, spring(dampingRatio = 0.3f))
}

Box(Modifier.fillMaxSize()) {
    CartIcon(Modifier.graphicsLayer { scaleX = bump.value; scaleY = bump.value }
        .onGloballyPositioned { to = it.positionInRoot() + Offset(it.size.width / 2f, it.size.height / 2f) })
    ProductImage(Modifier.size(72.dp).onGloballyPositioned { from = it.positionInRoot() + Offset(it.size.width / 2f, it.size.height / 2f) })
    Button(onClick = { fly() }) { Text("Add to cart") }
    if (flying) {
        ProductImage(
            Modifier.size(72.dp).graphicsLayer {
                val p = t.value
                val half = 36.dp.toPx()
                translationX = from.x + (to.x - from.x) * p - half
                translationY = from.y + (to.y - from.y) * p - sin(PI * p).toFloat() * 120.dp.toPx() - half
                scaleX = 1 - 0.75f * p; scaleY = scaleX
            },
        )
    }
}`,
  },
  "wave-fill": {
    apis: ["Canvas", "rememberInfiniteTransition", "clipPath"],
    code: c`// The phase loops forever; the level animates to the progress; both feed one Canvas
val phase by rememberInfiniteTransition(label = "wave")
    .animateFloat(0f, 2 * PI.toFloat(), infiniteRepeatable(tween(1800, easing = LinearEasing)), label = "phase")
val level by animateFloatAsState(progress, tween(900, easing = EaseOutCubic), label = "level")

Canvas(Modifier.size(120.dp)) {
    val circle = Path().apply { addOval(Rect(Offset.Zero, size)) }
    drawCircle(AccentSoft)
    clipPath(circle) {
        val top = size.height * (1 - level)
        val wave = Path().apply {
            moveTo(0f, top)
            var x = 0f
            while (x <= size.width) {
                lineTo(x, top + 6.dp.toPx() * sin(x / size.width * 2 * PI.toFloat() + phase))
                x += 4f
            }
            lineTo(size.width, size.height); lineTo(0f, size.height); close()
        }
        drawPath(wave, Accent)
    }
    drawCircle(Accent, style = Stroke(3.dp.toPx()))
}`,
  },
  "spring-chain": {
    apis: ["Animatable<Offset>", "snapshotFlow", "spring"],
    code: c`// Each dot springs toward the one in front; snapshotFlow re-targets it whenever the leader moves
val count = 6
val dots = remember { List(count) { Animatable(Offset(300f, 300f), Offset.VectorConverter) } }
val scope = rememberCoroutineScope()

dots.forEachIndexed { i, dot ->
    if (i > 0) LaunchedEffect(i) {
        snapshotFlow { dots[i - 1].value }.collect { target ->
            launch { dot.animateTo(target, spring(dampingRatio = 0.6f, stiffness = 300f)) }
        }
    }
}

Box(
    Modifier.fillMaxSize().pointerInput(Unit) {
        detectDragGestures { change, drag ->
            change.consume()
            scope.launch { dots[0].snapTo(dots[0].value + drag) }
        }
    },
) {
    for (i in count - 1 downTo 0) {
        val s = 1 - i * 0.12f
        Box(
            Modifier
                .offset { (dots[i].value - Offset(18.dp.toPx(), 18.dp.toPx())).round() }
                .size(36.dp)
                .graphicsLayer { scaleX = s; scaleY = s; alpha = s }
                .background(Accent, CircleShape),
        )
    }
}`,
  },
  "shape-morph": {
    apis: ["graphics-shapes Morph", "RoundedPolygon", "toPath()"],
    code: c`// androidx.graphics:graphics-shapes morphs between any two RoundedPolygons
val circle = remember { RoundedPolygon.circle(numVertices = 8) }
val square = remember { RoundedPolygon(4, rounding = CornerRounding(0.3f)) }
val blob = remember { RoundedPolygon.star(6, innerRadius = 0.75f, rounding = CornerRounding(0.5f)) }
val toSquare = remember { Morph(circle, square) }
val toBlob = remember { Morph(square, blob) }

val t by rememberInfiniteTransition(label = "morph")
    .animateFloat(0f, 2f, infiniteRepeatable(tween(3000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "t")

Canvas(Modifier.size(120.dp).graphicsLayer { rotationZ = t * 45f }) {
    val path = (if (t < 1f) toSquare.toPath(t) else toBlob.toPath(t - 1f)).asComposePath()
    // shapes are unit-sized around the origin: scale and center them
    translate(size.width / 2, size.height / 2) {
        scale(size.minDimension / 2, pivot = Offset.Zero) { drawPath(path, Accent) }
    }
}`,
  },
  "spin-wheel": {
    apis: ["Animatable", "tween(CubicBezierEasing)", "snapshotFlow"],
    code: c`// Choose the prize, then animate to whole turns plus the angle that brings it under the pointer
val prizes = listOf("10%", "Free ship", "5%", "Try again", "20%", "Gift")
val seg = 360f / prizes.size
val rotation = remember { Animatable(0f) }
val pointer = remember { Animatable(0f) }
val scope = rememberCoroutineScope()
val haptics = LocalHapticFeedback.current

// Each segment edge that passes the pointer: tick and flick the pointer
LaunchedEffect(Unit) {
    snapshotFlow { (rotation.value / seg).toInt() }.drop(1).collect {
        haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        launch { pointer.snapTo(-18f); pointer.animateTo(0f, spring(dampingRatio = 0.3f, stiffness = 800f)) }
    }
}

fun spin() = scope.launch {
    if (rotation.isRunning) return@launch
    val prize = prizes.indices.random()
    val jitter = (Random.nextFloat() - 0.5f) * seg * 0.7f
    val base = rotation.value - rotation.value % 360f
    rotation.animateTo(base + 360f * 6 + (360f - (prize * seg + seg / 2)) + jitter,
        tween(4500, easing = CubicBezierEasing(0.15f, 0.75f, 0.2f, 1f)))
    onWin(prizes[prize])
}

Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Icon(Icons.Default.ArrowDropDown, null, Modifier.size(36.dp).zIndex(1f)
        .graphicsLayer { rotationZ = pointer.value; transformOrigin = TransformOrigin(0.5f, 0f) })
    Canvas(Modifier.size(260.dp).graphicsLayer { rotationZ = rotation.value }) {
        prizes.indices.forEach { i ->
            drawArc(WheelColors[i % WheelColors.size], startAngle = i * seg - 90f, sweepAngle = seg, useCenter = true)
        }
    }
    Button(onClick = { spin() }) { Text("Spin") }
}`,
  },
};
