// SwiftUI ports of every animation. Target: iOS 17+; a few snippets mark iOS 18-only APIs.
// Snippets show the relevant properties and body; placeholder views (Box, CardView...) stand in for your own.
// String.raw keeps Swift backslashes (key paths) verbatim.
import type { PlatformSnippet } from "@/lib/types";

const c = String.raw;

export const swiftui: Record<string, PlatformSnippet> = {
  "fade-in": {
    apis: ["withAnimation", ".opacity", ".easeOut"],
    code: c`struct FadeIn: View {
    @State private var visible = false

    var body: some View {
        Box()
            .opacity(visible ? 1 : 0)
            .onAppear {
                withAnimation(.easeOut(duration: 0.4)) { visible = true }
            }
    }
}`,
  },

  "slide-in": {
    apis: ["withAnimation", ".offset", ".opacity"],
    code: c`@State private var shown = false

Box()
    .offset(x: shown ? 0 : -100)
    .opacity(shown ? 1 : 0)
    .onAppear {
        withAnimation(.easeOut(duration: 0.45)) { shown = true }
    }`,
  },

  "press-scale": {
    apis: ["ButtonStyle", "configuration.isPressed", ".spring"],
    code: c`// A ButtonStyle gets the pressed state for free
struct PressScaleStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

Button("Continue") { submit() }
    .buttonStyle(PressScaleStyle())`,
  },

  spin: {
    apis: [".rotationEffect", ".repeatForever(autoreverses: false)", ".linear"],
    code: c`@State private var spinning = false

Circle()
    .trim(from: 0, to: 0.75)
    .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 4, lineCap: .round))
    .frame(width: 44, height: 44)
    .rotationEffect(.degrees(spinning ? 360 : 0))
    .animation(.linear(duration: 0.9).repeatForever(autoreverses: false), value: spinning)
    .onAppear { spinning = true }
// Or the stock ProgressView().`,
  },

  pulse: {
    apis: [".scaleEffect", ".repeatForever(autoreverses: false)", ".easeOut"],
    code: c`@State private var pulsing = false

ZStack {
    Circle()
        .fill(Color.red.opacity(0.5))
        .scaleEffect(pulsing ? 2.4 : 1)
        .opacity(pulsing ? 0 : 0.7)
        .animation(.easeOut(duration: 1.4).repeatForever(autoreverses: false), value: pulsing)
    Circle().fill(Color.red)
}
.frame(width: 16, height: 16)
.onAppear { pulsing = true }`,
  },

  "progress-bar": {
    apis: ["GeometryReader", ".animation(_:value:)", "Capsule"],
    code: c`// progress: 0...1
GeometryReader { geo in
    ZStack(alignment: .leading) {
        Capsule().fill(Color.gray.opacity(0.2))
        Capsule()
            .fill(Color.accentColor)
            .frame(width: geo.size.width * progress)
    }
}
.frame(height: 8)
.animation(.easeOut(duration: 0.6), value: progress)
// Or ProgressView(value: progress), which animates the same way inside withAnimation.`,
  },

  "color-shift": {
    apis: [".fill", ".animation(_:value:)", ".easeInOut"],
    code: c`// Colors interpolate like any other animatable value
RoundedRectangle(cornerRadius: 12)
    .fill(isActive ? Color.teal : Color.pink)
    .frame(width: 64, height: 64)
    .animation(.easeInOut(duration: 0.3), value: isActive)`,
  },

  "entering-preset": {
    apis: [".transition", "AnyTransition.combined", "withAnimation"],
    code: c`// Transitions run when a view is inserted or removed inside withAnimation
VStack {
    if isShown {
        CardView()
            .transition(.scale(scale: 0.8).combined(with: .opacity))
    }
    Button("Toggle") {
        withAnimation(.spring(duration: 0.35)) { isShown.toggle() }
    }
}
// Other presets: .slide, .move(edge: .bottom), .push(from: .trailing), .blurReplace`,
  },

  "spring-bounce": {
    apis: [".spring(response:dampingFraction:)", "withAnimation", ".offset"],
    code: c`@State private var dropped = false

Box()
    .offset(y: dropped ? 0 : -200)
    .onAppear {
        // Lower dampingFraction = more bounce
        withAnimation(.spring(response: 0.55, dampingFraction: 0.45)) { dropped = true }
    }
// iOS 17 also has presets: .bouncy, .snappy, .smooth`,
  },

  shake: {
    apis: ["GeometryEffect", "animatableData", "withAnimation"],
    code: c`// A GeometryEffect turns one animated number into a side-to-side shake
struct Shake: GeometryEffect {
    var travel: CGFloat = 10
    var shakes: CGFloat = 4
    var animatableData: CGFloat

    func effectValue(size: CGSize) -> ProjectionTransform {
        let x = travel * sin(animatableData * .pi * shakes * 2)
        return ProjectionTransform(CGAffineTransform(translationX: x, y: 0))
    }
}

@State private var attempts = 0

TextField("Email", text: $email)
    .modifier(Shake(animatableData: CGFloat(attempts)))
    .onSubmit {
        if !isValid(email) {
            withAnimation(.linear(duration: 0.4)) { attempts += 1 } // each failure = one shake
        }
    }`,
  },

  "stagger-list": {
    apis: [".animation(_:value:)", "Animation.delay", "ForEach enumerated"],
    code: c`@State private var shown = false

VStack(spacing: 12) {
    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
        ItemRow(item)
            .opacity(shown ? 1 : 0)
            .offset(y: shown ? 0 : 20)
            // Index-based delay
            .animation(.easeOut(duration: 0.35).delay(Double(index) * 0.06), value: shown)
    }
}
.onAppear { shown = true }`,
  },

  accordion: {
    apis: ["withAnimation", ".transition(.move)", ".rotationEffect"],
    code: c`@State private var open = false

VStack(alignment: .leading, spacing: 0) {
    Button {
        withAnimation(.easeInOut(duration: 0.25)) { open.toggle() }
    } label: {
        HStack {
            Text("Details")
            Spacer()
            Image(systemName: "chevron.down")
                .rotationEffect(.degrees(open ? 180 : 0))
        }
    }
    if open {
        Text(longText)
            .padding(.top, 8)
            .transition(.opacity.combined(with: .move(edge: .top)))
    }
}
.clipped()
// DisclosureGroup animates its content height for you.`,
  },

  shimmer: {
    apis: ["ViewModifier", "LinearGradient", ".mask", ".repeatForever"],
    code: c`struct Shimmer: ViewModifier {
    @State private var phase: CGFloat = -1

    func body(content: Content) -> some View {
        content
            .overlay {
                GeometryReader { geo in
                    LinearGradient(colors: [.clear, .white.opacity(0.6), .clear],
                                   startPoint: .leading, endPoint: .trailing)
                        .frame(width: geo.size.width * 0.6)
                        .offset(x: phase * geo.size.width * 1.3) // sweep from off-left to off-right
                }
                .mask(content)
            }
            .onAppear {
                withAnimation(.linear(duration: 1.2).repeatForever(autoreverses: false)) { phase = 1 }
            }
    }
}

RoundedRectangle(cornerRadius: 8)
    .fill(Color.gray.opacity(0.2))
    .frame(height: 16)
    .modifier(Shimmer())
// For text placeholders: .redacted(reason: .placeholder).modifier(Shimmer())`,
  },

  "typing-dots": {
    apis: ["TimelineView(.animation)", ".offset", "sin"],
    code: c`// TimelineView redraws every frame; each dot reads the clock with its own offset
TimelineView(.animation) { context in
    let t = context.date.timeIntervalSinceReferenceDate
    HStack(spacing: 6) {
        ForEach(0..<3) { i in
            // Same 1.2 s cycle for every dot, shifted by 0.2 s
            let p = (t - Double(i) * 0.2).truncatingRemainder(dividingBy: 1.2) / 1.2
            Circle()
                .frame(width: 8, height: 8)
                .offset(y: p < 0.3 ? -6 * sin(p / 0.3 * .pi) : 0)
        }
    }
}`,
  },

  "toggle-switch": {
    apis: ["ZStack alignment", "withAnimation(.spring)", ".onTapGesture"],
    code: c`@Binding var isOn: Bool

ZStack(alignment: isOn ? .trailing : .leading) {
    Capsule()
        .fill(isOn ? Color.teal : Color.gray.opacity(0.3))
    Circle()
        .fill(.white)
        .padding(3)
        .shadow(radius: 1)
}
.frame(width: 56, height: 32)
.onTapGesture {
    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) { isOn.toggle() }
}
// To keep Toggle semantics, put this body in a custom ToggleStyle.`,
  },

  "like-burst": {
    apis: [".keyframeAnimator", "SpringKeyframe", "LinearKeyframe"],
    code: c`@State private var liked = false

ZStack {
    // Ring bursting outward, replayed every time liked changes
    Circle()
        .stroke(Color.pink, lineWidth: 3)
        .frame(width: 40, height: 40)
        .keyframeAnimator(initialValue: 0.0, trigger: liked) { ring, t in
            ring
                .scaleEffect(0.8 + 1.4 * t)
                .opacity(liked && t > 0 && t < 1 ? 1 - t : 0)
        } keyframes: { _ in
            KeyframeTrack { LinearKeyframe(1.0, duration: 0.5) }
        }

    Image(systemName: liked ? "heart.fill" : "heart")
        .font(.system(size: 36))
        .foregroundStyle(.pink)
        // Squash, pop past 1, settle
        .keyframeAnimator(initialValue: 1.0, trigger: liked) { heart, scale in
            heart.scaleEffect(scale)
        } keyframes: { _ in
            KeyframeTrack {
                SpringKeyframe(0.7, duration: 0.1)
                SpringKeyframe(1.3, duration: 0.15)
                SpringKeyframe(1.0, duration: 0.3)
            }
        }
}
.onTapGesture { liked.toggle() }`,
  },

  "drag-snap": {
    apis: ["DragGesture", ".offset", ".spring"],
    code: c`@State private var offset: CGSize = .zero

Box()
    .offset(offset)
    .gesture(
        DragGesture()
            .onChanged { offset = $0.translation }
            .onEnded { _ in
                withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) { offset = .zero }
            }
    )`,
  },

  "swipe-stack": {
    apis: ["DragGesture", "predictedEndTranslation", "withAnimation completion"],
    code: c`@State private var cards = Card.samples
@State private var drag: CGSize = .zero

var body: some View {
    ZStack {
        ForEach(cards.reversed()) { card in
            let isTop = card.id == cards.first?.id
            CardView(card)
                .offset(isTop ? drag : .zero)
                .rotationEffect(.degrees(isTop ? Double(drag.width / 20) : 0)) // tilt while dragging
                .allowsHitTesting(isTop)
                .gesture(swipe)
        }
    }
}

var swipe: some Gesture {
    DragGesture()
        .onChanged { drag = $0.translation }
        .onEnded { value in
            // Use the predicted end so a quick flick also counts
            if abs(value.predictedEndTranslation.width) > 300 {
                withAnimation(.easeOut(duration: 0.25)) {
                    drag.width = value.translation.width > 0 ? 600 : -600
                } completion: {
                    cards.removeFirst()
                    drag = .zero
                }
            } else {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) { drag = .zero }
            }
        }
}`,
  },

  "bottom-sheet": {
    apis: ["DragGesture.velocity", ".interpolatingSpring", "presentationDetents"],
    code: c`// Snap points as offsets from the top of the screen
@State private var offset: CGFloat = 400
@State private var dragStart: CGFloat?
let snaps: [CGFloat] = [80, 400]

GeometryReader { geo in
    SheetBody()
        .frame(height: geo.size.height)
        .offset(y: offset)
        .gesture(
            DragGesture()
                .onChanged { v in
                    let start = dragStart ?? offset
                    dragStart = start
                    offset = max(snaps[0], start + v.translation.height)
                }
                .onEnded { v in
                    dragStart = nil
                    let velocity = v.velocity.height // iOS 17
                    let target: CGFloat
                    if velocity > 1200 { target = geo.size.height }   // fast swipe down: dismiss
                    else if velocity < -1200 { target = snaps[0] }
                    else { target = (snaps + [geo.size.height]).min { abs($0 - offset) < abs($1 - offset) }! }
                    withAnimation(.interpolatingSpring(stiffness: 300, damping: 30)) { offset = target }
                }
        )
}
// For a system sheet: .sheet { ... }.presentationDetents([.fraction(0.5), .large])`,
  },

  "card-flip": {
    apis: ["Animatable", ".rotation3DEffect", "perspective"],
    code: c`// An Animatable modifier receives every intermediate angle, so it can swap faces at 90°
struct Flip<Back: View>: ViewModifier, Animatable {
    var angle: Double
    let back: Back
    var animatableData: Double {
        get { angle }
        set { angle = newValue }
    }

    func body(content: Content) -> some View {
        ZStack {
            if angle < 90 {
                content
            } else {
                back.rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0)) // mirror the back
            }
        }
        .rotation3DEffect(.degrees(angle), axis: (x: 0, y: 1, z: 0), perspective: 0.5)
    }
}

@State private var flipped = false

FrontFace()
    .modifier(Flip(angle: flipped ? 180 : 0, back: BackFace()))
    .onTapGesture {
        withAnimation(.easeInOut(duration: 0.6)) { flipped.toggle() }
    }`,
  },

  "parallax-header": {
    apis: ["GeometryReader", "frame(in: .scrollView)", ".offset"],
    code: c`ScrollView {
    VStack(spacing: 0) {
        GeometryReader { geo in
            let y = geo.frame(in: .scrollView).minY // > 0 when pulled down, < 0 when scrolled
            Image("header")
                .resizable()
                .scaledToFill()
                .frame(width: geo.size.width, height: 260 + max(0, y))
                // Stretch on pull; move at half speed while scrolling away
                .offset(y: y > 0 ? -y : -y * 0.5)
                .clipped()
        }
        .frame(height: 260)

        LazyVStack {
            ForEach(rows) { RowView($0) }
        }
    }
}
.ignoresSafeArea(edges: .top)`,
  },

  "pinch-zoom": {
    apis: ["MagnifyGesture", "DragGesture", ".simultaneously", "@GestureState"],
    code: c`@State private var scale: CGFloat = 1
@GestureState private var pinch: CGFloat = 1
@State private var offset: CGSize = .zero
@GestureState private var pan: CGSize = .zero

Image("photo")
    .resizable()
    .scaledToFit()
    .scaleEffect(min(max(scale * pinch, 1), 4))
    .offset(x: offset.width + pan.width, y: offset.height + pan.height)
    .gesture(
        MagnifyGesture() // iOS 17
            .updating($pinch) { v, state, _ in state = v.magnification }
            .onEnded { v in scale = min(max(scale * v.magnification, 1), 4) }
            .simultaneously(with:
                DragGesture()
                    .updating($pan) { v, state, _ in state = v.translation }
                    .onEnded { v in
                        offset.width += v.translation.width
                        offset.height += v.translation.height
                    }
            )
    )`,
  },

  "tab-indicator": {
    apis: ["matchedGeometryEffect", "@Namespace", "withAnimation"],
    code: c`@Namespace private var ns
@State private var selected = 0

HStack(spacing: 24) {
    ForEach(tabs.indices, id: \.self) { i in
        Text(tabs[i])
            .padding(.vertical, 8)
            .overlay(alignment: .bottom) {
                if selected == i {
                    Capsule()
                        .frame(height: 3)
                        // One indicator id: SwiftUI moves and resizes it between tabs
                        .matchedGeometryEffect(id: "indicator", in: ns)
                }
            }
            .onTapGesture {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) { selected = i }
            }
    }
}`,
  },

  "swipe-delete": {
    apis: [".swipeActions", "Button(role: .destructive)", "withAnimation"],
    code: c`// List rows get swipe actions and an animated collapse on delete
List {
    ForEach(items) { item in
        ItemRow(item)
            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                Button(role: .destructive) {
                    withAnimation { items.removeAll { $0.id == item.id } }
                } label: {
                    Label("Delete", systemImage: "trash")
                }
            }
    }
}
// Outside a List: an HStack with a red button behind the row, moved by a DragGesture.`,
  },

  ripple: {
    apis: ["onTapGesture(coordinateSpace:)", ".scaleEffect", ".clipShape"],
    code: c`// SwiftUI has no built-in ripple: grow a circle from the tap location
struct RippleView: View {
    let point: CGPoint
    @State private var grown = false

    var body: some View {
        Circle()
            .fill(.white.opacity(0.35))
            .frame(width: 20, height: 20)
            .scaleEffect(grown ? 30 : 0)
            .opacity(grown ? 0 : 1)
            .position(point)
            .onAppear { withAnimation(.easeOut(duration: 0.5)) { grown = true } }
    }
}

struct Ripple: Identifiable { let id = UUID(); let point: CGPoint }
@State private var ripples: [Ripple] = []

Text("Tap me")
    .frame(maxWidth: .infinity, minHeight: 52)
    .background(Color.teal)
    .overlay { ForEach(ripples) { RippleView(point: $0.point) } }
    .clipShape(RoundedRectangle(cornerRadius: 12)) // clip the ripple to the button
    .onTapGesture(coordinateSpace: .local) { location in // iOS 17
        let r = Ripple(point: location)
        ripples.append(r)
        Task {
            try? await Task.sleep(for: .milliseconds(500))
            ripples.removeAll { $0.id == r.id }
        }
    }`,
  },

  "dvd-bounce": {
    apis: [".repeatForever()", "separate .offset(x:) / .offset(y:)", ".linear"],
    code: c`@State private var atRight = false
@State private var atBottom = false

GeometryReader { geo in
    Logo()
        .frame(width: 80, height: 40)
        // Two modifiers, so each axis keeps its own animation
        .offset(x: atRight ? geo.size.width - 80 : 0)
        .offset(y: atBottom ? geo.size.height - 40 : 0)
        .onAppear {
            // Two independent ping-pongs with different periods
            withAnimation(.linear(duration: 3.1).repeatForever()) { atRight = true }
            withAnimation(.linear(duration: 2.3).repeatForever()) { atBottom = true }
        }
}`,
  },

  "stroke-draw": {
    apis: ["Shape.trim(from:to:)", "StrokeStyle", "withAnimation"],
    code: c`@State private var progress: CGFloat = 0

SignatureShape() // any Shape, e.g. one built from an SVG path
    .trim(from: 0, to: progress)
    .stroke(Color.teal, style: StrokeStyle(lineWidth: 4, lineCap: .round, lineJoin: .round))
    .frame(width: 200, height: 120)
    .onAppear {
        withAnimation(.easeInOut(duration: 2)) { progress = 1 }
    }

struct SignatureShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.midY))
        p.addCurve(to: CGPoint(x: rect.maxX, y: rect.midY),
                   control1: CGPoint(x: rect.width * 0.3, y: rect.minY),
                   control2: CGPoint(x: rect.width * 0.7, y: rect.maxY))
        return p
    }
}`,
  },

  "activity-rings": {
    apis: ["Circle().trim", ".rotationEffect(-90°)", ".easeOut"],
    code: c`struct Ring: View {
    let goal: Double
    let color: Color
    let size: CGFloat
    @State private var progress = 0.0

    var body: some View {
        ZStack {
            Circle().stroke(color.opacity(0.2), lineWidth: 18)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(color, style: StrokeStyle(lineWidth: 18, lineCap: .round))
                .rotationEffect(.degrees(-90)) // start at 12 o'clock
        }
        .frame(width: size, height: size)
        .onAppear { withAnimation(.easeOut(duration: 1.4)) { progress = goal } }
    }
}

ZStack {
    Ring(goal: 0.8, color: .red, size: 200)
    Ring(goal: 0.65, color: .green, size: 156)
    Ring(goal: 0.9, color: .cyan, size: 112)
}`,
  },

  breathe: {
    apis: [".repeatForever(autoreverses: true)", ".easeInOut", ".rotationEffect"],
    code: c`@State private var inhale = false

ZStack {
    ForEach(0..<6) { i in
        Circle()
            .fill(Color.teal.opacity(0.5))
            .frame(width: 80, height: 80)
            .offset(y: inhale ? -45 : 0) // petals move out from the center
            .rotationEffect(.degrees(Double(i) * 60))
    }
}
.scaleEffect(inhale ? 1 : 0.4)
.rotationEffect(.degrees(inhale ? 60 : 0))
.onAppear {
    // 4 s in, 4 s out, forever
    withAnimation(.easeInOut(duration: 4).repeatForever(autoreverses: true)) { inhale = true }
}`,
  },

  "swipe-reply": {
    apis: ["DragGesture", ".sensoryFeedback", ".spring"],
    code: c`@State private var dx: CGFloat = 0
@State private var armed = false
let threshold: CGFloat = 64

ZStack(alignment: .leading) {
    // Reply icon grows in as the bubble moves
    Image(systemName: "arrowshape.turn.up.left.fill")
        .scaleEffect(min(dx / threshold, 1))
        .opacity(min(dx / threshold, 1))
        .padding(.leading, 16)
    Bubble()
        .offset(x: dx)
}
.sensoryFeedback(.impact, trigger: armed) { _, isArmed in isArmed } // haptic at the threshold
.gesture(
    DragGesture(minimumDistance: 10)
        .onChanged { v in
            dx = min(max(0, v.translation.width), 100)
            armed = dx > threshold
        }
        .onEnded { _ in
            if armed { onReply() }
            armed = false
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) { dx = 0 }
        }
)`,
  },

  "spotify-header": {
    apis: ["onScrollGeometryChange (iOS 18)", ".scaleEffect", ".opacity"],
    code: c`@State private var scrollY: CGFloat = 0

ZStack(alignment: .top) {
    let t = min(max(scrollY / 250, 0), 1) // 0 at the top, 1 after 250 pt

    // Cover shrinks and fades
    CoverArt()
        .frame(width: 220, height: 220)
        .scaleEffect(1 - 0.4 * t)
        .opacity(1 - t)
        .padding(.top, 60)

    ScrollView {
        Color.clear.frame(height: 300)
        TrackList()
    }
    .onScrollGeometryChange(for: CGFloat.self) { $0.contentOffset.y + $0.contentInsets.top } action: { _, y in
        scrollY = y
    }

    // Compact bar fades in over the last 30%
    CompactTitleBar()
        .opacity(min(max((t - 0.7) / 0.3, 0), 1))
}`,
  },

  "pull-refresh": {
    apis: ["onScrollGeometryChange (iOS 18)", "onScrollPhaseChange (iOS 18)", ".refreshable"],
    code: c`// .refreshable gives the system spinner; for a custom one, read the overscroll yourself
@State private var pull: CGFloat = 0
@State private var refreshing = false
let threshold: CGFloat = 80

ZStack(alignment: .top) {
    let f = min(pull / threshold, 1)
    Image(systemName: "arrow.clockwise")
        .font(.title)
        .scaleEffect(0.5 + 0.5 * f)
        .rotationEffect(.degrees(Double(f) * 180))
        .symbolEffect(.rotate, isActive: refreshing) // iOS 18: spins while loading
        .opacity(refreshing ? 1 : f)
        .padding(.top, 16)

    ScrollView { Rows() }
        .onScrollGeometryChange(for: CGFloat.self) { -($0.contentOffset.y + $0.contentInsets.top) } action: { _, y in
            pull = max(0, y)
        }
        .onScrollPhaseChange { old, new in
            // Finger lifted while past the threshold
            if old == .interacting, new != .interacting, pull > threshold, !refreshing {
                refreshing = true
                Task {
                    await load()
                    refreshing = false
                }
            }
        }
}`,
  },

  "perspective-menu": {
    apis: [".rotation3DEffect(anchor:perspective:)", ".scaleEffect", ".spring"],
    code: c`@State private var open = false

ZStack(alignment: .leading) {
    MenuView() // sits behind the screen
    HomeView(onMenu: {
        withAnimation(.spring(response: 0.45, dampingFraction: 0.85)) { open.toggle() }
    })
    .clipShape(RoundedRectangle(cornerRadius: open ? 24 : 0))
    .rotation3DEffect(.degrees(open ? -30 : 0), axis: (x: 0, y: 1, z: 0),
                      anchor: .leading, perspective: 0.6) // tilt back
    .scaleEffect(open ? 0.85 : 1)
    .offset(x: open ? 240 : 0)
    .shadow(radius: open ? 20 : 0)
}`,
  },

  "stories-cube": {
    apis: [".visualEffect", ".scrollTargetBehavior(.paging)", ".rotation3DEffect"],
    code: c`// A paging ScrollView; each page rotates around its shared edge based on its position
ScrollView(.horizontal) {
    LazyHStack(spacing: 0) {
        ForEach(stories) { story in
            StoryView(story)
                .containerRelativeFrame(.horizontal)
                .visualEffect { content, proxy in
                    let progress = proxy.frame(in: .scrollView).minX / proxy.size.width // -1...1 on screen
                    return content.rotation3DEffect(
                        .degrees(progress * -90),
                        axis: (x: 0, y: 1, z: 0),
                        anchor: progress > 0 ? .leading : .trailing,
                        perspective: 0.6
                    )
                }
        }
    }
    .scrollTargetLayout()
}
.scrollTargetBehavior(.paging)
.scrollIndicators(.hidden)`,
  },

  "circular-slider": {
    apis: ["DragGesture(minimumDistance: 0)", "atan2", "Circle().trim"],
    code: c`@State private var angle: Double = 0 // radians, 0 = 12 o'clock
let size: CGFloat = 260

var minutes: Int { Int(angle / (2 * .pi) * 24 * 60) }

var body: some View {
    ZStack {
        Circle().stroke(Color.gray.opacity(0.2), lineWidth: 24)
        Circle()
            .trim(from: 0, to: angle / (2 * .pi))
            .stroke(Color.indigo, style: StrokeStyle(lineWidth: 24, lineCap: .round))
            .rotationEffect(.degrees(-90))
        Circle() // knob
            .fill(.white)
            .frame(width: 28, height: 28)
            .offset(y: -(size / 2 - 12))
            .rotationEffect(.radians(angle))
        Text(String(format: "%02d:%02d", minutes / 60, minutes % 60))
            .font(.largeTitle.monospacedDigit())
    }
    .frame(width: size, height: size)
    .gesture(
        DragGesture(minimumDistance: 0).onChanged { v in
            let dx = v.location.x - size / 2
            let dy = v.location.y - size / 2
            var a = Double(atan2(dx, -dy))
            if a < 0 { a += 2 * .pi }
            angle = a
        }
    )
}`,
  },

  "mini-player": {
    apis: ["DragGesture", "predictedEndTranslation", ".spring"],
    code: c`// progress: 0 = mini bar, 1 = full screen
@State private var progress: CGFloat = 0
@State private var drag: CGFloat = 0
let miniHeight: CGFloat = 64

GeometryReader { geo in
    let range = geo.size.height - miniHeight
    let p = min(max(progress - drag / range, 0), 1)
    ZStack(alignment: .top) {
        MiniBar().opacity(max(0, 1 - p * 3))
        FullPlayer().opacity(p)
    }
    .frame(height: miniHeight + range * p)
    .frame(maxHeight: .infinity, alignment: .bottom)
    .onTapGesture {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { progress = 1 }
    }
    .gesture(
        DragGesture()
            .onChanged { drag = $0.translation.height }
            .onEnded { v in
                let projected = progress - v.predictedEndTranslation.height / range
                withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                    progress = projected > 0.5 ? 1 : 0
                    drag = 0
                }
            }
    )
}`,
  },

  "liquid-swipe": {
    apis: ["Shape", "AnimatablePair", ".clipShape"],
    code: c`struct LiquidShape: Shape {
    var progress: CGFloat // 0 = small tab at the right edge, 1 = full page
    var centerY: CGFloat
    var animatableData: AnimatablePair<CGFloat, CGFloat> {
        get { AnimatablePair(progress, centerY) }
        set { progress = newValue.first; centerY = newValue.second }
    }

    func path(in rect: CGRect) -> Path {
        let x = rect.width * (1 - progress)           // reveal edge
        let bulge = 80 * (1 - progress) + 20          // bulge flattens as it fills
        let r = rect.height * 0.25 * (0.4 + progress) // bulge height
        var p = Path()
        p.move(to: CGPoint(x: rect.width, y: 0))
        p.addLine(to: CGPoint(x: x, y: 0))
        p.addLine(to: CGPoint(x: x, y: centerY - r))
        p.addCurve(to: CGPoint(x: x - bulge, y: centerY),
                   control1: CGPoint(x: x, y: centerY - r / 2), control2: CGPoint(x: x - bulge, y: centerY - r / 2))
        p.addCurve(to: CGPoint(x: x, y: centerY + r),
                   control1: CGPoint(x: x - bulge, y: centerY + r / 2), control2: CGPoint(x: x, y: centerY + r / 2))
        p.addLine(to: CGPoint(x: x, y: rect.height))
        p.addLine(to: CGPoint(x: rect.width, y: rect.height))
        p.closeSubpath()
        return p
    }
}

@State private var progress: CGFloat = 0
@State private var centerY: CGFloat = 400

GeometryReader { geo in
    ZStack {
        CurrentPage()
        NextPage().clipShape(LiquidShape(progress: progress, centerY: centerY))
    }
    .gesture(
        DragGesture()
            .onChanged { v in
                progress = min(max(-v.translation.width / geo.size.width, 0), 1)
                centerY = v.location.y
            }
            .onEnded { v in
                let done = -v.predictedEndTranslation.width > geo.size.width * 0.5
                withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) { progress = done ? 1 : 0 }
            }
    )
}`,
  },

  "chart-scrub": {
    apis: ["Swift Charts", ".chartXSelection", ".contentTransition(.numericText())"],
    code: c`import Charts

@State private var selectedIndex: Int?

VStack(alignment: .leading) {
    let point = prices[selectedIndex ?? prices.count - 1]
    Text(point.value, format: .currency(code: "USD"))
        .font(.largeTitle.monospacedDigit())
        .contentTransition(.numericText()) // digits roll as you scrub

    Chart(prices) { p in
        LineMark(x: .value("Time", p.index), y: .value("Price", p.value))
        if p.index == selectedIndex {
            RuleMark(x: .value("Time", p.index))
            PointMark(x: .value("Time", p.index), y: .value("Price", p.value))
        }
    }
    .chartXSelection(value: $selectedIndex) // iOS 17: drag across to scrub
    .frame(height: 200)
}`,
  },

  "shared-expand": {
    apis: ["matchedGeometryEffect", "@Namespace", "DragGesture"],
    code: c`@Namespace private var ns
@State private var selected: Item?
@State private var drag: CGSize = .zero

ZStack {
    LazyVGrid(columns: [GridItem(), GridItem()]) {
        ForEach(items) { item in
            if selected?.id == item.id {
                Color.clear.aspectRatio(1, contentMode: .fit) // hold the slot
            } else {
                Thumb(item)
                    .matchedGeometryEffect(id: item.id, in: ns)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { selected = item }
                    }
            }
        }
    }
    if let item = selected {
        Detail(item)
            .matchedGeometryEffect(id: item.id, in: ns)
            .scaleEffect(1 - min(max(drag.height, 0) / 1000, 0.3)) // shrink while dragging down
            .offset(drag)
            .gesture(
                DragGesture()
                    .onChanged { drag = $0.translation }
                    .onEnded { v in
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                            if v.translation.height > 120 { selected = nil }
                            drag = .zero
                        }
                    }
            )
    }
}
// Across NavigationStack screens (iOS 18): .matchedTransitionSource + .navigationTransition(.zoom(...))`,
  },

  "word-drag": {
    apis: ["matchedGeometryEffect", ".draggable", ".dropDestination"],
    code: c`@Namespace private var ns
@State private var bank = ["I", "like", "green", "apples"]
@State private var answer: [String] = []

func move(_ w: String) {
    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
        if let i = answer.firstIndex(of: w) { answer.remove(at: i); bank.append(w) }
        else if let i = bank.firstIndex(of: w) { bank.remove(at: i); answer.append(w) }
    }
}

var body: some View {
    VStack(spacing: 32) {
        // The same id in both rows makes a chip fly from one to the other
        HStack {
            ForEach(answer, id: \.self) { w in
                WordChip(w).matchedGeometryEffect(id: w, in: ns).onTapGesture { move(w) }
            }
        }
        .frame(maxWidth: .infinity, minHeight: 56)
        .overlay(alignment: .bottom) { Divider() }
        .dropDestination(for: String.self) { words, _ in
            words.filter { bank.contains($0) }.forEach { move($0) }
            return true
        }

        HStack {
            ForEach(bank, id: \.self) { w in
                WordChip(w).matchedGeometryEffect(id: w, in: ns).onTapGesture { move(w) }.draggable(w)
            }
        }
    }
}
// For long sentences, swap the HStacks for a wrapping Layout.`,
  },

  "tab-reorder": {
    apis: [".draggable", ".dropDestination(isTargeted:)", "LazyVGrid"],
    code: c`@State private var tabs = BrowserTab.samples
@State private var dragging: BrowserTab?

LazyVGrid(columns: [GridItem(spacing: 12), GridItem(spacing: 12)], spacing: 12) {
    ForEach(tabs) { tab in
        TabTile(tab)
            .opacity(dragging?.id == tab.id ? 0.4 : 1)
            .draggable(tab.id.uuidString) { // a long press starts the drag
                TabTile(tab)
                    .frame(width: 160, height: 200)
                    .onAppear { dragging = tab }
            }
            .dropDestination(for: String.self) { _, _ in
                dragging = nil
                return true
            } isTargeted: { over in
                // Hovering another tile moves the dragged one into its slot; the grid animates the rest
                guard over, let d = dragging, d.id != tab.id,
                      let from = tabs.firstIndex(where: { $0.id == d.id }),
                      let to = tabs.firstIndex(where: { $0.id == tab.id }) else { return }
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    tabs.move(fromOffsets: IndexSet(integer: from), toOffset: to > from ? to + 1 : to)
                }
            }
    }
}`,
  },

  "sticky-tabs": {
    apis: ["LazyVStack(pinnedViews: .sectionHeaders)", ".scrollPosition(id:)", "ScrollViewReader"],
    code: c`@State private var active: String?

ScrollViewReader { proxy in
    ScrollView {
        LazyVStack(spacing: 0, pinnedViews: .sectionHeaders) {
            HeaderImage()
            Section {
                ForEach(sections) { section in
                    SectionView(section).id(section.id)
                }
            } header: {
                // Sticks to the top; scroll its chips so the active one stays visible
                TabsBar(sections: sections, active: active) { id in
                    withAnimation { proxy.scrollTo(id, anchor: .top) }
                }
            }
        }
        .scrollTargetLayout()
    }
    // iOS 17: the id of the top-most visible section
    .scrollPosition(id: $active, anchor: .top)
}`,
  },

  "click-wheel": {
    apis: ["DragGesture(minimumDistance: 0)", "atan2", ".sensoryFeedback(.selection)"],
    code: c`@State private var selected = 0
@State private var lastAngle: Double?
@State private var accumulated = 0.0
let step = Double.pi / 6 // 30° of rotation per item
let size: CGFloat = 220

ClickWheel()
    .frame(width: size, height: size)
    .sensoryFeedback(.selection, trigger: selected) // the click
    .gesture(
        DragGesture(minimumDistance: 0)
            .onChanged { v in
                let a = atan2(Double(v.location.y - size / 2), Double(v.location.x - size / 2))
                if let last = lastAngle {
                    var d = a - last
                    if d > .pi { d -= 2 * .pi } // unwrap across ±180°
                    if d < -.pi { d += 2 * .pi }
                    accumulated += d
                    while abs(accumulated) >= step {
                        let dir = accumulated > 0 ? 1 : -1
                        accumulated -= Double(dir) * step
                        selected = min(max(selected + dir, 0), items.count - 1)
                    }
                }
                lastAngle = a
            }
            .onEnded { _ in
                lastAngle = nil
                accumulated = 0
            }
    )`,
  },

  "jelly-scroll": {
    apis: ["GeometryEffect", "onScrollGeometryChange (iOS 18)", ".spring"],
    code: c`// Vertical shear around the row's center, animatable so a spring can drive it
struct Skew: GeometryEffect {
    var amount: CGFloat
    var animatableData: CGFloat {
        get { amount }
        set { amount = newValue }
    }

    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(a: 1, b: amount, c: 0, d: 1, tx: 0, ty: -amount * size.width / 2))
    }
}

@State private var skew: CGFloat = 0

ScrollView {
    LazyVStack {
        ForEach(rows) { row in
            RowView(row)
                .modifier(Skew(amount: skew))
                .animation(.spring(response: 0.35, dampingFraction: 0.4), value: skew) // wobbly settle
        }
    }
}
.onScrollGeometryChange(for: CGFloat.self) { $0.contentOffset.y } action: { old, new in
    skew = min(max((new - old) / 400, -0.25), 0.25) // points per frame ≈ velocity
}
.onScrollPhaseChange { _, phase in
    if phase == .idle { skew = 0 }
}`,
  },

  "wallet-stack": {
    apis: [".offset", ".zIndex", ".spring"],
    code: c`@State private var selected: Int?

var body: some View {
    GeometryReader { geo in
        ZStack(alignment: .top) {
            ForEach(cards.indices, id: \.self) { i in
                WalletCard(cards[i])
                    .frame(height: 200)
                    .offset(y: top(i, height: geo.size.height))
                    .zIndex(selected == i ? 1 : 0)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
                            selected = selected == i ? nil : i
                        }
                    }
            }
        }
        .padding(.horizontal, 16)
    }
}

func top(_ i: Int, height: CGFloat) -> CGFloat {
    guard let s = selected else { return 40 + CGFloat(i) * 60 } // fanned stack
    if i == s { return 40 }                                     // rises to the top
    let rest = i < s ? i : i - 1                                // the others collapse at the bottom
    return height - 120 + CGFloat(rest) * 10
}`,
  },

  "theme-reveal": {
    apis: [".mask", ".environment(\\.colorScheme)", "withAnimation"],
    code: c`// Draw the new theme over the old one, masked by a circle growing from the toggle
@State private var dark = false
@State private var origin: CGPoint = .zero
@State private var progress: CGFloat = 1 // 1 = fully revealed

var body: some View {
    GeometryReader { geo in
        let maxR = hypot(geo.size.width, geo.size.height) // reaches every corner
        ZStack {
            screen(dark: !dark) // old theme underneath
            screen(dark: dark)  // new theme on top
                .mask {
                    Circle()
                        .frame(width: maxR * 2 * progress, height: maxR * 2 * progress)
                        .position(origin)
                }
        }
    }
    .ignoresSafeArea()
}

func screen(dark: Bool) -> some View {
    Screen(onToggle: toggle).environment(\.colorScheme, dark ? .dark : .light)
}

func toggle(at point: CGPoint) { // point in global coordinates
    origin = point
    dark.toggle()
    progress = 0
    Task { @MainActor in // next run loop, so the change from 0 animates
        withAnimation(.easeInOut(duration: 0.6)) { progress = 1 }
    }
}`,
  },

  "picker-wheel": {
    apis: [".scrollTransition", ".scrollTargetBehavior(.viewAligned)", "Picker(.wheel)"],
    code: c`// Picker(...).pickerStyle(.wheel) is the native one; this is the custom version
@State private var selected: Int? = 0

ScrollView {
    LazyVStack(spacing: 0) {
        ForEach(0..<24, id: \.self) { i in
            Text(String(format: "%02d", i))
                .font(.title2.monospacedDigit())
                .frame(height: 40)
                .scrollTransition(.interactive, axis: .vertical) { content, phase in
                    content // phase.value: -1 at the top edge, 0 centered, 1 at the bottom
                        .rotation3DEffect(.degrees(phase.value * -60), axis: (x: 1, y: 0, z: 0), perspective: 0.5)
                        .opacity(1 - abs(phase.value) * 0.6)
                        .scaleEffect(1 - abs(phase.value) * 0.2)
                }
        }
    }
    .scrollTargetLayout()
}
.frame(height: 200)
.contentMargins(.vertical, 80, for: .scrollContent) // lets the first and last rows reach the middle
.scrollTargetBehavior(.viewAligned)                 // snap to rows
.scrollPosition(id: $selected, anchor: .center)
.sensoryFeedback(.selection, trigger: selected)`,
  },

  coverflow: {
    apis: [".scrollTransition", ".rotation3DEffect", ".scrollTargetBehavior(.viewAligned)"],
    code: c`ScrollView(.horizontal) {
    LazyHStack(spacing: 0) {
        ForEach(items) { item in
            Cover(item)
                .frame(width: 180, height: 180)
                .scrollTransition(.interactive, axis: .horizontal) { content, phase in
                    content
                        .rotation3DEffect(.degrees(phase.value * -50), axis: (x: 0, y: 1, z: 0), perspective: 0.5) // turn away
                        .scaleEffect(1 - abs(phase.value) * 0.25) // and shrink
                }
        }
    }
    .scrollTargetLayout()
}
.contentMargins(.horizontal, 100, for: .scrollContent) // center the first and last items
.scrollTargetBehavior(.viewAligned)
.scrollIndicators(.hidden)`,
  },

  // ---------- everyday UI additions ----------

  "count-up": {
    apis: ["Animatable", "animatableData", ".contentTransition(.numericText())"],
    code: c`// An Animatable view receives every in-between value, so the label counts up
struct CountingText: View, Animatable {
    var value: Double
    var animatableData: Double {
        get { value }
        set { value = newValue }
    }

    var body: some View {
        Text(Int(value).formatted())
            .font(.largeTitle.bold().monospacedDigit()) // digits keep a fixed width
    }
}

@State private var value = 0.0

CountingText(value: value)
    .onAppear { withAnimation(.easeOut(duration: 1.2)) { value = 1280 } }
// Rolling digits instead: Text(value, format: .number).contentTransition(.numericText(value: value))`,
  },

  toast: {
    apis: [".transition(.move(edge: .top))", ".task(id:)", "withAnimation"],
    code: c`@State private var toast: String?

ZStack(alignment: .top) {
    PageContent()
    if let toast {
        ToastView(text: toast)
            .padding(.horizontal, 16)
            .transition(.move(edge: .top).combined(with: .opacity))
            .task(id: toast) { // auto dismiss; restarts if a new toast replaces this one
                try? await Task.sleep(for: .seconds(2.5))
                withAnimation(.easeIn(duration: 0.2)) { self.toast = nil }
            }
    }
}

func show(_ message: String) {
    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) { toast = message }
}`,
  },

  "menu-morph": {
    apis: [".rotationEffect", ".offset", ".contentTransition(.symbolEffect)"],
    code: c`@State private var open = false

// Lines are 3 pt tall with a 6 pt gap, so the outer ones travel 9 pt to the middle
VStack(spacing: 6) {
    Capsule().frame(width: 28, height: 3)
        .rotationEffect(.degrees(open ? 45 : 0))
        .offset(y: open ? 9 : 0)
    Capsule().frame(width: 28, height: 3)
        .opacity(open ? 0 : 1)
    Capsule().frame(width: 28, height: 3)
        .rotationEffect(.degrees(open ? -45 : 0))
        .offset(y: open ? -9 : 0)
}
.contentShape(Rectangle())
.onTapGesture { withAnimation(.easeInOut(duration: 0.25)) { open.toggle() } }
// SF Symbols version: Image(systemName: open ? "xmark" : "line.3.horizontal")
//     .contentTransition(.symbolEffect(.replace))`,
  },

  "floating-label": {
    apis: ["@FocusState", ".scaleEffect(anchor:)", ".animation(_:value:)"],
    code: c`@State private var text = ""
@FocusState private var focused: Bool

var up: Bool { focused || !text.isEmpty }

ZStack(alignment: .leading) {
    Text("Email")
        .foregroundStyle(up ? Color.accentColor : .secondary)
        .scaleEffect(up ? 0.8 : 1, anchor: .leading)
        .offset(y: up ? -24 : 0)
        .allowsHitTesting(false)
    TextField("", text: $text)
        .focused($focused)
}
.padding(.horizontal, 12)
.frame(height: 52)
.overlay(RoundedRectangle(cornerRadius: 8).stroke(focused ? Color.accentColor : .gray.opacity(0.4)))
.animation(.easeOut(duration: 0.18), value: up)`,
  },

  marquee: {
    apis: ["onGeometryChange", ".repeatForever(autoreverses: false)", ".fixedSize"],
    code: c`// Two copies side by side, offset by one copy's width on a linear loop
@State private var width: CGFloat = 0
@State private var running = false

var copy: some View {
    HStack(spacing: 8) { ForEach(items) { LogoPill($0) } }
        .padding(.trailing, 8) // same as the spacing, so the copies tile exactly
}

var body: some View {
    HStack(spacing: 0) {
        copy.onGeometryChange(for: CGFloat.self) { $0.size.width } action: { width = $0 }
        copy
    }
    .fixedSize()
    .offset(x: running ? -width : 0)
    .frame(maxWidth: .infinity, alignment: .leading)
    .clipped()
    .onChange(of: width) {
        withAnimation(.linear(duration: width / 40).repeatForever(autoreverses: false)) { running = true } // ~40 pt/s
    }
}`,
  },

  "success-check": {
    apis: ["Shape.trim", ".spring", ".sensoryFeedback(.success)"],
    code: c`struct Check: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.width * 0.29, y: r.height * 0.52))
        p.addLine(to: CGPoint(x: r.width * 0.42, y: r.height * 0.65))
        p.addLine(to: CGPoint(x: r.width * 0.71, y: r.height * 0.37))
        return p
    }
}

@State private var shown = false
@State private var drawn = false

Circle()
    .fill(Color.accentColor)
    .frame(width: 56, height: 56)
    .overlay {
        Check()
            .trim(from: 0, to: drawn ? 1 : 0) // the check draws itself
            .stroke(.white, style: StrokeStyle(lineWidth: 4, lineCap: .round, lineJoin: .round))
    }
    .scaleEffect(shown ? 1 : 0)
    .onAppear {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.5)) { shown = true }
        withAnimation(.easeOut(duration: 0.35).delay(0.25)) { drawn = true }
    }
    .sensoryFeedback(.success, trigger: drawn)`,
  },

  "fab-menu": {
    apis: [".animation(_:value:)", "Animation.delay", ".rotationEffect"],
    code: c`@State private var open = false
let actions = ["camera", "photo", "paperclip"]

ZStack(alignment: .bottom) {
    ForEach(Array(actions.enumerated()), id: \.offset) { i, icon in
        Button { } label: {
            Image(systemName: icon)
                .frame(width: 44, height: 44)
                .background(.thinMaterial, in: Circle())
        }
        .scaleEffect(open ? 1 : 0.3)
        .opacity(open ? 1 : 0)
        .offset(y: open ? -CGFloat(i + 1) * 60 : 0)
        .allowsHitTesting(open)
        // Stagger: later items wait a little longer (reversed when closing)
        .animation(.spring(response: 0.35, dampingFraction: 0.6)
            .delay(Double(open ? i : actions.count - 1 - i) * 0.04), value: open)
    }
    Button { open.toggle() } label: {
        Image(systemName: "plus")
            .font(.title2.bold())
            .foregroundStyle(.white)
            .frame(width: 56, height: 56)
            .background(Color.accentColor, in: Circle())
            .rotationEffect(.degrees(open ? 45 : 0)) // + becomes ✕
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: open)
    }
}`,
  },

  "page-dots": {
    apis: ["onScrollGeometryChange (iOS 18)", ".scrollTargetBehavior(.paging)", "Capsule"],
    code: c`@State private var progress: CGFloat = 0 // fractional page, follows the swipe

VStack {
    ScrollView(.horizontal) {
        LazyHStack(spacing: 0) {
            ForEach(pages.indices, id: \.self) { i in
                PageView(pages[i]).containerRelativeFrame(.horizontal)
            }
        }
        .scrollTargetLayout()
    }
    .scrollTargetBehavior(.paging)
    .scrollIndicators(.hidden)
    .onScrollGeometryChange(for: CGFloat.self) { $0.contentOffset.x / max($0.containerSize.width, 1) } action: { _, p in
        progress = p
    }

    HStack(spacing: 6) {
        ForEach(pages.indices, id: \.self) { i in
            let d = min(abs(progress - CGFloat(i)), 1) // 0 = active
            Capsule()
                .fill(Color.accentColor.opacity(1 - 0.65 * d))
                .frame(width: 22 - 14 * d, height: 8)
        }
    }
}`,
  },

  "hide-header": {
    apis: ["onScrollGeometryChange (iOS 18)", ".offset", ".toolbarVisibility"],
    code: c`@State private var hidden = false

ScrollView {
    LazyVStack { ForEach(rows) { RowView($0) } }
        .padding(.top, 56)
}
.onScrollGeometryChange(for: CGFloat.self) { $0.contentOffset.y } action: { old, new in
    guard new > 0 else { hidden = false; return } // always show at the top
    if new != old { hidden = new > old }          // direction of travel
}
.overlay(alignment: .top) {
    HeaderBar()
        .frame(height: 56)
        .offset(y: hidden ? -120 : 0)
        .animation(.easeInOut(duration: 0.25), value: hidden)
}
// Inside a NavigationStack: .toolbarVisibility(hidden ? .hidden : .visible, for: .navigationBar)`,
  },

  "button-loading": {
    apis: [".animation(_:value:)", "ProgressView", "Capsule"],
    code: c`@State private var loading = false

Button {
    Task {
        loading = true
        await pay()
        loading = false
    }
} label: {
    ZStack {
        Text("Pay now").bold().lineLimit(1).fixedSize().opacity(loading ? 0 : 1)
        ProgressView().tint(.white).opacity(loading ? 1 : 0)
    }
    .foregroundStyle(.white)
    .frame(width: loading ? 52 : 220, height: 52) // shrinks into a circle
    .background(Color.accentColor, in: Capsule())
    .clipShape(Capsule())
}
.disabled(loading)
.animation(.easeInOut(duration: 0.3), value: loading)`,
  },

  // ---------- everyday UI additions, second batch ----------
  confetti: {
    apis: ["TimelineView(.animation)", "Canvas", "GraphicsContext"],
    code: c`// TimelineView redraws every frame; Canvas draws each piece from the time since the burst
struct Piece { let angle, speed, spin: Double; let color: Color }

struct Confetti: View {
    var trigger: Int // bump it to fire
    @State private var start: Date?
    @State private var pieces: [Piece] = []
    private let colors: [Color] = [.pink, .orange, .green, .blue, .purple]

    var body: some View {
        TimelineView(.animation(paused: start == nil)) { timeline in
            Canvas { gc, size in
                guard let start else { return }
                let t = timeline.date.timeIntervalSince(start)
                guard t < 1.6 else { return }
                let origin = CGPoint(x: size.width / 2, y: size.height / 2)
                gc.opacity = t > 1.2 ? (1.6 - t) / 0.4 : 1
                for p in pieces {
                    let x = cos(p.angle) * p.speed * t
                    let y = sin(p.angle) * p.speed * t + 0.5 * 900 * t * t // gravity 900 pt/s²
                    var piece = gc
                    piece.translateBy(x: origin.x + x, y: origin.y + y)
                    piece.rotate(by: .radians(p.spin * t))
                    piece.fill(Path(CGRect(x: -3, y: -5, width: 6, height: 10)), with: .color(p.color))
                }
            }
        }
        .allowsHitTesting(false)
        .onChange(of: trigger) {
            pieces = (0..<40).map { i in
                Piece(angle: -.pi / 2 + .random(in: -0.8...0.8),
                      speed: .random(in: 450...800),
                      spin: .random(in: -12...12),
                      color: colors[i % colors.count])
            }
            start = .now
            // Stop the timeline once the burst is over
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.7) { start = nil }
        }
    }
}`,
  },

  "star-rating": {
    apis: ["symbolEffect(.bounce)", "contentTransition", "spring"],
    code: c`// Each star bounces when its state changes; the delay staggers a multi-star jump
@State private var rating = 0

HStack(spacing: 8) {
    ForEach(1...5, id: \.self) { i in
        Image(systemName: i <= rating ? "star.fill" : "star")
            .font(.title)
            .foregroundStyle(i <= rating ? Color.yellow : Color.gray.opacity(0.4))
            .contentTransition(.symbolEffect(.replace))
            .symbolEffect(.bounce, value: i <= rating)
            .scaleEffect(i <= rating ? 1 : 0.92)
            .animation(.spring(response: 0.3, dampingFraction: 0.45).delay(Double(i) * 0.04), value: rating)
            .onTapGesture { rating = i }
            .accessibilityLabel("Rate \(i)")
    }
}`,
  },

  "badge-bounce": {
    apis: ["keyframeAnimator", "symbolEffect(.wiggle)", "transition(.scale)"],
    code: c`// The badge pops with keyframes and the bell wiggles whenever count changes
ZStack(alignment: .topTrailing) {
    Image(systemName: "bell")
        .font(.title2)
        .symbolEffect(.wiggle, value: count) // iOS 18; use .bounce on iOS 17
    if count > 0 {
        Text(count > 99 ? "99+" : "\(count)")
            .font(.caption2.bold())
            .monospacedDigit()
            .foregroundStyle(.white)
            .padding(.horizontal, 5)
            .frame(minWidth: 20, minHeight: 20)
            .background(.red, in: Capsule())
            .keyframeAnimator(initialValue: 1.0, trigger: count) { badge, scale in
                badge.scaleEffect(scale)
            } keyframes: { _ in
                CubicKeyframe(1.45, duration: 0.12)
                SpringKeyframe(1.0, duration: 0.35, spring: .bouncy)
            }
            .offset(x: 8, y: -6)
            .transition(.scale.combined(with: .opacity))
    }
}
.animation(.spring, value: count > 0)`,
  },

  "scroll-progress": {
    apis: ["onScrollGeometryChange", "overlay", "GeometryReader"],
    code: c`// iOS 18: onScrollGeometryChange reports offset and sizes; map them to 0...1
@State private var progress = 0.0

ScrollView {
    article
}
.onScrollGeometryChange(for: Double.self) { geo in
    let range = geo.contentSize.height - geo.containerSize.height
    guard range > 0 else { return 0 }
    return min(max((geo.contentOffset.y + geo.contentInsets.top) / range, 0), 1)
} action: { _, value in
    progress = value
}
.overlay(alignment: .top) {
    GeometryReader { proxy in
        Rectangle()
            .fill(.tint)
            .frame(width: proxy.size.width * progress, height: 3)
    }
    .frame(height: 3)
}`,
  },

  "segmented-control": {
    apis: ["matchedGeometryEffect", "@Namespace", "withAnimation(.spring)"],
    code: c`// matchedGeometryEffect moves one thumb between segments
@Namespace private var thumb
@State private var selected = 0
let options = ["Day", "Week", "Month"]

HStack(spacing: 0) {
    ForEach(options.indices, id: \.self) { i in
        Text(options[i])
            .font(.subheadline.weight(selected == i ? .semibold : .regular))
            .frame(maxWidth: .infinity, minHeight: 30)
            .background {
                if selected == i {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(.background)
                        .shadow(color: .black.opacity(0.15), radius: 2, y: 1)
                        .matchedGeometryEffect(id: "thumb", in: thumb)
                }
            }
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) { selected = i }
            }
    }
}
.padding(3)
.background(.quaternary, in: RoundedRectangle(cornerRadius: 10))`,
  },

  "skeleton-crossfade": {
    apis: ["redacted(reason: .placeholder)", "transition(.opacity)", "repeatForever"],
    code: c`// .redacted turns the real row into a placeholder; a transition crossfades when data lands
@State private var post: Post?
@State private var pulsing = false

ZStack(alignment: .topLeading) {
    if let post {
        PostRow(post: post)
            .transition(.opacity.combined(with: .offset(y: 4)))
    } else {
        PostRow(post: .placeholder) // sample data, same layout as the real thing
            .redacted(reason: .placeholder)
            .opacity(pulsing ? 0.5 : 1)
            .animation(.easeInOut(duration: 0.7).repeatForever(), value: pulsing)
            .onAppear { pulsing = true }
            .transition(.opacity)
    }
}
.animation(.easeInOut(duration: 0.3), value: post == nil)`,
  },

  "auto-carousel": {
    apis: ["scrollPosition(id:)", "scrollTargetBehavior(.paging)", "onScrollPhaseChange"],
    code: c`// A timer advances scrollPosition; paging snaps each slide. Dragging pauses the timer.
@State private var page: Int? = 0
@State private var dragging = false
let timer = Timer.publish(every: 3, on: .main, in: .common).autoconnect()

ScrollView(.horizontal) {
    LazyHStack(spacing: 0) {
        ForEach(slides.indices, id: \.self) { i in
            slides[i].image
                .resizable()
                .scaledToFill()
                .containerRelativeFrame(.horizontal)
                .clipped()
                .id(i)
        }
    }
    .scrollTargetLayout()
}
.scrollTargetBehavior(.paging)
.scrollPosition(id: $page)
.scrollIndicators(.hidden)
.frame(height: 200)
.onScrollPhaseChange { _, phase in dragging = phase == .interacting } // iOS 18
.onReceive(timer) { _ in
    guard !dragging else { return }
    withAnimation(.easeInOut(duration: 0.5)) { page = ((page ?? 0) + 1) % slides.count }
}
.overlay(alignment: .bottom) {
    HStack(spacing: 6) {
        ForEach(slides.indices, id: \.self) { i in
            Capsule()
                .fill(.white.opacity(page == i ? 1 : 0.5))
                .frame(width: page == i ? 22 : 8, height: 8)
        }
    }
    .padding(.bottom, 10)
    .animation(.spring(duration: 0.3), value: page)
}`,
  },

  "reorder-list": {
    apis: ["List", "onMove", "move(fromOffsets:toOffset:)"],
    code: c`// List + onMove: long-press a row and drag it; List lifts it and slides the others aside
@State private var items = ["Groceries", "Laundry", "Gym", "Read"]

List {
    ForEach(items, id: \.self) { item in
        Label(item, systemImage: "line.3.horizontal")
    }
    .onMove { from, to in
        items.move(fromOffsets: from, toOffset: to)
    }
}
// For a custom, non-List layout use .draggable(item) on rows and .dropDestination on the container`,
  },

  "sheet-scale": {
    apis: [".sheet", "DragGesture", "scaleEffect"],
    code: c`// On iPhone the system page sheet already does this: .sheet at the .large detent
// shrinks and rounds the screen behind it.
//   .sheet(isPresented: $showing) { SheetContent().presentationDetents([.large]) }
// The custom version below drives both layers from one progress value for full control.
struct SheetScale: View {
    @State private var progress: CGFloat = 0 // 0 closed, 1 open

    var body: some View {
        GeometryReader { proxy in
            let height = proxy.size.height * 0.85
            ZStack(alignment: .bottom) {
                Color.black.ignoresSafeArea()
                AppScreen(onOpen: { withAnimation(.spring(duration: 0.4)) { progress = 1 } })
                    .clipShape(RoundedRectangle(cornerRadius: 12 * progress))
                    .scaleEffect(1 - 0.08 * progress)
                    .offset(y: 10 * progress)
                Color.black.opacity(0.4 * progress)
                    .ignoresSafeArea()
                    .allowsHitTesting(false)
                SheetContent(onClose: { withAnimation(.easeIn(duration: 0.25)) { progress = 0 } })
                    .frame(maxWidth: .infinity)
                    .frame(height: height)
                    .background(.background, in: UnevenRoundedRectangle(topLeadingRadius: 12, topTrailingRadius: 12))
                    .offset(y: (1 - progress) * height)
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                progress = min(max(1 - value.translation.height / height, 0), 1)
                            }
                            .onEnded { value in
                                let close = value.predictedEndTranslation.height > height * 0.5 || progress < 0.6
                                withAnimation(.spring(duration: 0.35)) { progress = close ? 0 : 1 }
                            }
                    )
            }
        }
    }
}`,
  },
  "slide-confirm": {
    apis: ["DragGesture", "withAnimation(.spring)", "GeometryReader"],
    code: c`// The knob's offset follows the drag; on release it either locks in or springs home
let knob: CGFloat = 48, pad: CGFloat = 4
@State private var x: CGFloat = 0
@State private var confirmed = false

GeometryReader { geo in
    let travel = geo.size.width - knob - pad * 2
    ZStack(alignment: .leading) {
        Capsule().fill(.quaternary)
        Capsule().fill(Color.accentColor)
            .frame(width: x + knob + pad * 2)
        Text(confirmed ? "Confirmed" : "Slide to confirm")
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(confirmed ? .white : .primary)
            .opacity(confirmed ? 1 : max(0, 1 - x / (travel * 0.5)))
            .frame(maxWidth: .infinity)
        Circle()
            .fill(.white)
            .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
            .overlay(Image(systemName: "chevron.right").fontWeight(.bold).foregroundStyle(Color.accentColor))
            .frame(width: knob, height: knob)
            .offset(x: pad + x)
            .gesture(
                DragGesture()
                    .onChanged { g in
                        guard !confirmed else { return }
                        x = min(max(g.translation.width, 0), travel)
                    }
                    .onEnded { g in
                        guard !confirmed else { return }
                        let lockIn = x > travel * 0.85 || g.predictedEndTranslation.width > travel
                        withAnimation(.spring(response: 0.35, dampingFraction: lockIn ? 0.9 : 0.6)) {
                            x = lockIn ? travel : 0
                            confirmed = lockIn
                        }
                        if lockIn { onConfirm() }
                    }
            )
    }
    .clipShape(Capsule())
}
.frame(width: 280, height: knob + pad * 2)
.sensoryFeedback(.success, trigger: confirmed)`,
  },
  typewriter: {
    apis: ["Task.sleep", "PhaseAnimator", "prefix(_:)"],
    code: c`// A task reveals one character at a time; PhaseAnimator blinks the caret
@State private var shown = 0

HStack(spacing: 2) {
    Text(String(text.prefix(shown))).font(.body.monospaced().weight(.semibold))
    PhaseAnimator([true, false]) { on in
        Rectangle().fill(Color.accentColor).frame(width: 2, height: 20).opacity(on ? 1 : 0)
    } animation: { _ in .linear(duration: 0).delay(0.45) } // hard blink
}
.task(id: text) {
    shown = 0
    for i in 1...text.count {
        try? await Task.sleep(for: .milliseconds(45))
        shown = i
    }
}`,
  },
  "word-rotate": {
    apis: ["contentTransition", ".push(from:)", ".id()"],
    code: c`// Changing the id swaps the view; a push transition slides the new word up from below
let words = ["faster", "smoother", "together"]
@State private var i = 0

HStack(spacing: 6) {
    Text("Build")
    Text(words[i])
        .foregroundStyle(Color.accentColor)
        .id(i)
        .transition(.push(from: .bottom))
}
.font(.title2.bold())
.clipped()
.task {
    while !Task.isCancelled {
        try? await Task.sleep(for: .seconds(2))
        withAnimation(.spring(response: 0.45, dampingFraction: 0.7)) { i = (i + 1) % words.count }
    }
}`,
  },
  "text-reveal": {
    apis: ["withAnimation.delay", "offset", "opacity"],
    code: c`// One flag, a growing delay per word
@State private var visible = false
let words = title.split(separator: " ").map(String.init)

HStack(spacing: 6) {
    ForEach(words.indices, id: \.self) { i in
        Text(words[i])
            .opacity(visible ? 1 : 0)
            .offset(y: visible ? 0 : 14)
            .animation(.spring(response: 0.45, dampingFraction: 0.7).delay(Double(i) * 0.08), value: visible)
    }
}
.font(.title2.bold())
.onAppear { visible = true }
// iOS 18: TextRenderer can animate each glyph instead of each word`,
  },
  "wave-bars": {
    apis: ["repeatForever(autoreverses:)", "scaleEffect(anchor:)", "delay"],
    code: c`// Each bar repeats forever with its own start delay
@State private var on = false
let delays = [0.0, 0.3, 0.6, 0.15, 0.45]

HStack(alignment: .bottom, spacing: 5) {
    ForEach(delays.indices, id: \.self) { i in
        Capsule()
            .fill(Color.accentColor)
            .frame(width: 6, height: 44)
            .scaleEffect(y: on ? 1 : 0.3, anchor: .bottom)
            .animation(.easeInOut(duration: 0.45).repeatForever(autoreverses: true).delay(delays[i]), value: on)
    }
}
.frame(height: 44)
.onAppear { on = true }`,
  },
  "spinner-arc": {
    apis: ["trim(from:to:)", "rotationEffect", "repeatForever"],
    code: c`// Built in: ProgressView() is the system spinner. For the Material arc, trim a circle and rotate it
@State private var spin = false
@State private var stretch = false

Circle()
    .trim(from: 0, to: stretch ? 0.75 : 0.05)
    .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 5, lineCap: .round))
    .frame(width: 48, height: 48)
    .rotationEffect(.degrees(spin ? 360 : 0))
    .onAppear {
        withAnimation(.linear(duration: 1.6).repeatForever(autoreverses: false)) { spin = true }
        withAnimation(.easeInOut(duration: 0.7).repeatForever(autoreverses: true)) { stretch = true }
    }`,
  },
  checkbox: {
    apis: ["trim(from:to:)", "symbolEffect", "spring"],
    code: c`// The check is a Shape trimmed from 0 to 1; the box fill and scale animate with it
struct CheckShape: Shape {
    func path(in r: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: r.width * 0.22, y: r.height * 0.52))
            p.addLine(to: CGPoint(x: r.width * 0.42, y: r.height * 0.7))
            p.addLine(to: CGPoint(x: r.width * 0.78, y: r.height * 0.32))
        }
    }
}

@State private var checked = false

RoundedRectangle(cornerRadius: 7)
    .fill(checked ? Color.accentColor : .clear)
    .strokeBorder(checked ? Color.accentColor : .secondary, lineWidth: 2)
    .overlay(
        CheckShape()
            .trim(from: 0, to: checked ? 1 : 0)
            .stroke(.white, style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
    )
    .frame(width: 26, height: 26)
    .scaleEffect(checked ? 1 : 0.94)
    .animation(.spring(response: 0.3, dampingFraction: 0.5), value: checked)
    .onTapGesture { checked.toggle() }
    .accessibilityAddTraits(.isToggle)`,
  },
  stepper: {
    apis: ["contentTransition(.numericText)", "withAnimation", "monospacedDigit"],
    code: c`// numericText rolls the digits up or down depending on whether the value grew
@State private var value = 3

HStack(spacing: 16) {
    Button { withAnimation(.snappy) { value = max(0, value - 1) } } label: { Image(systemName: "minus") }
    Text("\(value)")
        .font(.title3.bold().monospacedDigit())
        .contentTransition(.numericText(value: Double(value))) // direction follows the change
        .frame(minWidth: 32)
    Button { withAnimation(.snappy) { value += 1 } } label: { Image(systemName: "plus") }
}
.buttonStyle(.bordered)
.buttonBorderShape(.circle)`,
  },
  "step-progress": {
    apis: ["GeometryReader", "animation(value:)", "delay"],
    code: c`// The fill width follows step / (n - 1); dots light up just after the line reaches them
let steps = ["Cart", "Address", "Payment", "Done"]

GeometryReader { geo in
    let track = geo.size.width - 14
    ZStack(alignment: .leading) {
        Capsule().fill(.quaternary).frame(height: 4).padding(.horizontal, 7)
        Capsule().fill(Color.accentColor)
            .frame(width: track * CGFloat(step) / CGFloat(steps.count - 1), height: 4)
            .padding(.leading, 7)
            .animation(.easeInOut(duration: 0.4), value: step)
        HStack {
            ForEach(steps.indices, id: \.self) { i in
                Circle()
                    .fill(i <= step ? Color.accentColor : Color(.systemGray4))
                    .frame(width: 14, height: 14)
                    .scaleEffect(i == step ? 1.2 : 1)
                    .animation(.spring.delay(i <= step ? 0.3 : 0), value: step)
                if i < steps.count - 1 { Spacer() }
            }
        }
    }
}
.frame(height: 14)`,
  },
  "gradient-border": {
    apis: ["AngularGradient", "rotationEffect", "repeatForever"],
    code: c`// A rotating AngularGradient, masked to a stroke around the card
@State private var angle = 0.0

RoundedRectangle(cornerRadius: 16)
    .fill(.background)
    .overlay(
        RoundedRectangle(cornerRadius: 16)
            .strokeBorder(
                AngularGradient(colors: [.blue, .pink, .orange, .blue], center: .center, angle: .degrees(angle)),
                lineWidth: 3
            )
    )
    .overlay(Text("Pro plan").bold())
    .frame(width: 200, height: 80)
    .onAppear {
        withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) { angle = 360 }
    }`,
  },
  "copy-feedback": {
    apis: ["contentTransition(.symbolEffect)", "sensoryFeedback", "UIPasteboard"],
    code: c`// The SF Symbol swaps with a symbol transition; a task swaps it back
@State private var copied = false

Button {
    UIPasteboard.general.string = text
    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { copied = true }
} label: {
    Label(copied ? "Copied" : "Copy", systemImage: copied ? "checkmark" : "doc.on.doc")
        .contentTransition(.symbolEffect(.replace))
        .foregroundStyle(copied ? .green : .primary)
}
.sensoryFeedback(.success, trigger: copied) { _, new in new }
.task(id: copied) {
    guard copied else { return }
    try? await Task.sleep(for: .seconds(1.5))
    withAnimation { copied = false }
}`,
  },
  "password-strength": {
    apis: ["GeometryReader", "animation(value:)", "Color"],
    code: c`// Width and color both derive from the score, so one animation moves them together
let colors: [Color] = [.red, .orange, .yellow, .mint, .green]
let labels = ["Too weak", "Weak", "Okay", "Good", "Strong"]
@State private var password = ""
var score: Int { scorePassword(password) } // 0...4

VStack(alignment: .leading, spacing: 6) {
    SecureField("Password", text: $password).textFieldStyle(.roundedBorder)
    GeometryReader { geo in
        ZStack(alignment: .leading) {
            Capsule().fill(.quaternary)
            Capsule()
                .fill(colors[score])
                .frame(width: password.isEmpty ? 0 : geo.size.width * CGFloat(score + 1) / 5)
        }
    }
    .frame(height: 6)
    .animation(.easeOut(duration: 0.3), value: score)
    .animation(.easeOut(duration: 0.3), value: password.isEmpty)
    Text(password.isEmpty ? " " : labels[score]).font(.caption).contentTransition(.opacity)
}`,
  },
  odometer: {
    apis: ["contentTransition(.numericText)", "monospacedDigit", "spring"],
    code: c`// Built in: numericText rolls each changed digit like an odometer
@State private var value = 148

Text("\(value)")
    .font(.system(size: 34, weight: .bold, design: .monospaced))
    .contentTransition(.numericText(value: Double(value)))
    .animation(.spring(response: 0.5, dampingFraction: 0.7), value: value)

// For a literal column of 0-9 per digit, stack them and offset by -digit * rowHeight:
// VStack { ForEach(0..<10) { Text("\($0)").frame(height: h) } }
//     .offset(y: -CGFloat(digit) * h).frame(height: h, alignment: .top).clipped()`,
  },
  tooltip: {
    apis: ["popoverTip / TipKit", "scaleEffect(anchor:)", "transition"],
    code: c`// A custom bubble scaled from its bottom center so it grows out of the anchor
@State private var visible = false

Image(systemName: "bookmark")
    .font(.title2)
    .overlay(alignment: .top) {
        if visible {
            Text("Saved to library")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.white)
                .padding(.horizontal, 10).padding(.vertical, 6)
                .background(.black, in: RoundedRectangle(cornerRadius: 8))
                .fixedSize()
                .offset(y: -40)
                .transition(.scale(scale: 0.6, anchor: .bottom).combined(with: .opacity))
        }
    }
    .onLongPressGesture(minimumDuration: 0.3) {} onPressingChanged: { pressing in
        withAnimation(pressing ? .spring(response: 0.3, dampingFraction: 0.6) : .easeIn(duration: 0.12)) {
            visible = pressing
        }
    }
// For onboarding hints, TipKit's .popoverTip(tip) gives the system version`,
  },
  "expand-search": {
    apis: ["@FocusState", "frame(width:)", "spring"],
    code: c`// The capsule's width animates; the field focuses as it opens
@State private var open = false
@FocusState private var focused: Bool

HStack(spacing: 8) {
    Image(systemName: "magnifyingglass")
        .onTapGesture { withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) { open = true }; focused = true }
    if open {
        TextField("Search recipes…", text: $query)
            .focused($focused)
            .transition(.opacity.animation(.easeIn.delay(0.12)))
        Button("Cancel") {
            focused = false
            withAnimation(.easeIn(duration: 0.22)) { open = false }
        }
        .transition(.opacity)
    }
}
.padding(.horizontal, 12)
.frame(width: open ? nil : 40, height: 40)
.frame(maxWidth: open ? .infinity : 40, alignment: .leading)
.background(.thinMaterial, in: Capsule())
.frame(maxWidth: .infinity, alignment: .trailing)`,
  },
  "chip-select": {
    apis: ["matchedGeometryEffect", "transition(.scale)", "spring"],
    code: c`// Inserting the check icon changes the chip's width; withAnimation reflows the row
@State private var selected: Set<String> = ["Vegan"]

HStack(spacing: 8) {
    ForEach(tags, id: \.self) { tag in
        let on = selected.contains(tag)
        HStack(spacing: 4) {
            if on { Image(systemName: "checkmark").transition(.scale.combined(with: .opacity)) }
            Text(tag)
        }
        .font(.subheadline.weight(.semibold))
        .padding(.horizontal, 12).padding(.vertical, 7)
        .foregroundStyle(on ? .white : .primary)
        .background(on ? Color.accentColor : Color(.systemGray6), in: Capsule())
        .onTapGesture {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                if on { selected.remove(tag) } else { selected.insert(tag) }
            }
        }
    }
}`,
  },
  "tab-bubble": {
    apis: ["matchedGeometryEffect", "@Namespace", "spring"],
    code: c`// One pill shared between tabs with matchedGeometryEffect; only the active tab shows its label
@Namespace private var pill
@State private var active = 0

HStack {
    ForEach(tabs.indices, id: \.self) { i in
        HStack(spacing: 6) {
            Image(systemName: tabs[i].icon)
            if i == active { Text(tabs[i].label).fixedSize().transition(.opacity) }
        }
        .foregroundStyle(i == active ? Color.accentColor : .secondary)
        .padding(.horizontal, 14).padding(.vertical, 8)
        .background {
            if i == active {
                Capsule().fill(Color.accentColor.opacity(0.15)).matchedGeometryEffect(id: "pill", in: pill)
            }
        }
        .onTapGesture { withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) { active = i } }
        .frame(maxWidth: .infinity)
    }
}
.padding(8)
.background(.background, in: RoundedRectangle(cornerRadius: 20))`,
  },
  "range-slider": {
    apis: ["DragGesture", "GeometryReader", "clamped"],
    code: c`// Two thumbs, each dragged within [0, other - gap]
@State private var lo: CGFloat = 0.2
@State private var hi: CGFloat = 0.8
let thumb: CGFloat = 24

GeometryReader { geo in
    let w = geo.size.width
    let gap = thumb / w
    ZStack(alignment: .leading) {
        Capsule().fill(.quaternary).frame(height: 4)
        Capsule().fill(Color.accentColor)
            .frame(width: (hi - lo) * w, height: 4)
            .offset(x: lo * w)
        Circle().fill(.white).shadow(radius: 2).frame(width: thumb)
            .offset(x: lo * w - thumb / 2)
            .gesture(DragGesture(coordinateSpace: .named("track")).onChanged { g in lo = min(max(g.location.x / w, 0), hi - gap) }
                .onEnded { _ in report() })
        Circle().fill(.white).shadow(radius: 2).frame(width: thumb)
            .offset(x: hi * w - thumb / 2)
            .gesture(DragGesture(coordinateSpace: .named("track")).onChanged { g in hi = max(min(g.location.x / w, 1), lo + gap) }
                .onEnded { _ in report() })
    }
    .coordinateSpace(name: "track")
}
.frame(height: thumb)`,
  },
  joystick: {
    apis: ["DragGesture", "offset", "interpolatingSpring"],
    code: c`// Clamp the drag to the ring's radius; spring home on release
@State private var knob: CGSize = .zero
let r: CGFloat = 50

Circle()
    .fill(.quaternary)
    .frame(width: 140, height: 140)
    .overlay(
        Circle().fill(Color.accentColor).frame(width: 40, height: 40)
            .shadow(radius: 4, y: 2)
            .offset(knob)
            .gesture(
                DragGesture()
                    .onChanged { g in
                        let t = g.translation
                        let d = hypot(t.width, t.height)
                        let k = d > r ? r / d : 1
                        knob = CGSize(width: t.width * k, height: t.height * k)
                    }
                    .onEnded { _ in
                        withAnimation(.interpolatingSpring(stiffness: 220, damping: 12)) { knob = .zero }
                    }
            )
    )
// direction: knob.width / r, knob.height / r`,
  },
  "image-compare": {
    apis: ["DragGesture(minimumDistance: 0)", "mask", "GeometryReader"],
    code: c`// The "after" image is masked by a rectangle whose width follows the finger
@State private var split: CGFloat = 0.5

GeometryReader { geo in
    let w = geo.size.width
    ZStack(alignment: .leading) {
        Image("before").resizable().scaledToFill()
        Image("after").resizable().scaledToFill()
            .mask(alignment: .leading) { Rectangle().frame(width: split * w) }
        Rectangle().fill(.white).frame(width: 2)
            .overlay(Circle().fill(.white).frame(width: 28).overlay(Image(systemName: "arrow.left.and.right").font(.caption)))
            .offset(x: split * w - 1)
    }
    .contentShape(Rectangle())
    .gesture(DragGesture(minimumDistance: 0).onChanged { g in split = min(max(g.location.x / w, 0), 1) })
}
.frame(height: 220)
.clipShape(RoundedRectangle(cornerRadius: 16))`,
  },
  "side-drawer": {
    apis: ["DragGesture", "predictedEndTranslation", "spring"],
    code: c`// progress 0...1 drives the drawer offset, the dim and the screen nudge
@State private var progress: CGFloat = 0
@GestureState private var drag: CGFloat = 0
let width: CGFloat = 280
var p: CGFloat { min(max(progress + drag / width, 0), 1) }

ZStack(alignment: .leading) {
    Screen(onMenu: { withAnimation(.spring) { progress = 1 } })
        .offset(x: p * 40)
    Color.black.opacity(0.45 * p)
        .ignoresSafeArea()
        .allowsHitTesting(p > 0)
        .onTapGesture { withAnimation(.spring) { progress = 0 } }
    Menu()
        .frame(width: width)
        .frame(maxHeight: .infinity)
        .background(.background)
        .offset(x: (p - 1) * width)
}
.gesture(
    DragGesture()
        .updating($drag) { g, s, _ in s = g.translation.width }
        .onEnded { g in
            let end = progress + g.predictedEndTranslation.width / width
            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) { progress = end > 0.5 ? 1 : 0 }
        }
)`,
  },
  "otp-input": {
    apis: ["@FocusState", "phaseAnimator / keyframeAnimator", "transition(.scale)"],
    code: c`// A hidden TextField takes input; a keyframeAnimator shakes the row on a wrong code
@State private var code = ""
@State private var fails = 0
@FocusState private var focused: Bool
let length = 4

ZStack {
    TextField("", text: $code)
        .keyboardType(.numberPad)
        .textContentType(.oneTimeCode)
        .focused($focused)
        .opacity(0)
        .onChange(of: code) { _, new in
            code = String(new.filter(\.isNumber).prefix(length))
            if code.count == length && !verify(code) { fails += 1; code = "" }
        }
    HStack(spacing: 8) {
        ForEach(0..<length, id: \.self) { i in
            let chars = Array(code)
            RoundedRectangle(cornerRadius: 10)
                .strokeBorder(i == chars.count ? Color.accentColor : Color(.systemGray4), lineWidth: 2)
                .frame(width: 44, height: 54)
                .overlay {
                    if i < chars.count {
                        Text(String(chars[i])).font(.title2.bold().monospaced())
                            .transition(.scale(scale: 0.3).combined(with: .opacity))
                    }
                }
        }
    }
    .animation(.spring(response: 0.3, dampingFraction: 0.5), value: code)
    .keyframeAnimator(initialValue: 0.0, trigger: fails) { row, x in row.offset(x: x) } keyframes: { _ in
        KeyframeTrack {
            LinearKeyframe(-10, duration: 0.05); LinearKeyframe(10, duration: 0.05)
            LinearKeyframe(-6, duration: 0.05); LinearKeyframe(0, duration: 0.05)
        }
    }
}
.onTapGesture { focused = true }`,
  },
  "scroll-top-fab": {
    apis: ["onScrollGeometryChange", "ScrollViewReader", "transition"],
    code: c`// iOS 18: onScrollGeometryChange reports the offset; ScrollViewReader jumps back up
@State private var show = false

ScrollViewReader { proxy in
    ScrollView {
        Color.clear.frame(height: 0).id("top")
        content
    }
    .onScrollGeometryChange(for: Bool.self) { $0.contentOffset.y > 400 } action: { _, past in
        withAnimation(.spring(response: 0.35, dampingFraction: 0.6)) { show = past }
    }
    .overlay(alignment: .bottomTrailing) {
        if show {
            Button { withAnimation { proxy.scrollTo("top") } } label: {
                Image(systemName: "arrow.up").bold().padding(14)
                    .background(Color.accentColor, in: Circle()).foregroundStyle(.white)
            }
            .padding(24)
            .transition(.scale(scale: 0.6).combined(with: .opacity).combined(with: .offset(y: 24)))
        }
    }
}
// iOS 17: read the offset with a GeometryReader in a background and a PreferenceKey`,
  },
  "layout-toggle": {
    apis: ["AnyLayout", "GridLayout / VStackLayout", "matchedGeometryEffect"],
    code: c`// AnyLayout switches the container while keeping view identity, so items animate to new frames
@State private var grid = false

let layout = grid
    ? AnyLayout(GridLayout(horizontalSpacing: 10, verticalSpacing: 10))
    : AnyLayout(VStackLayout(spacing: 10))

Button(grid ? "List view" : "Grid view") {
    withAnimation(.spring(response: 0.45, dampingFraction: 0.75)) { grid.toggle() }
}

layout {
    // For a 2-column grid, wrap each pair in GridRow; a LazyVGrid will not animate between modes
    ForEach(items) { item in
        ItemCard(item: item, compact: !grid)
            .frame(maxWidth: .infinity)
            .frame(height: grid ? 140 : 72)
    }
}
.padding()`,
  },
  "keyboard-avoid": {
    apis: ["safeAreaInset(edge: .bottom)", "keyboard avoidance", "scrollDismissesKeyboard"],
    code: c`// SwiftUI moves bottom insets with the keyboard on its own, matching the keyboard's curve
ScrollView {
    LazyVStack { ForEach(messages) { MessageRow(message: $0) } }
}
.defaultScrollAnchor(.bottom)
.scrollDismissesKeyboard(.interactively) // drag the list to pull the keyboard down with your finger
.safeAreaInset(edge: .bottom) {
    HStack {
        TextField("Message", text: $draft, axis: .vertical)
            .textFieldStyle(.roundedBorder)
        Button(action: send) { Image(systemName: "arrow.up.circle.fill").font(.title) }
    }
    .padding(8)
    .background(.bar)
}
// Opt a view out with .ignoresSafeArea(.keyboard)`,
  },
  "tilt-card": {
    apis: ["rotation3DEffect", "DragGesture(minimumDistance: 0)", "spring"],
    code: c`// The finger position maps to two 3D rotations; perspective comes with rotation3DEffect
@State private var tilt: CGSize = .zero // -1...1
let maxAngle = 12.0

CardView()
    .frame(width: 260, height: 160)
    .overlay(
        LinearGradient(colors: [.clear, .white.opacity(0.35), .clear],
                       startPoint: UnitPoint(x: tilt.width, y: 0), endPoint: UnitPoint(x: tilt.width + 1, y: 1))
            .opacity(abs(tilt.width) + abs(tilt.height))
            .allowsHitTesting(false)
    )
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .rotation3DEffect(.degrees(-tilt.height * maxAngle), axis: (x: 1, y: 0, z: 0), perspective: 0.6)
    .rotation3DEffect(.degrees(tilt.width * maxAngle), axis: (x: 0, y: 1, z: 0), perspective: 0.6)
    .scaleEffect(tilt == .zero ? 1 : 1.04)
    .gesture(
        DragGesture(minimumDistance: 0)
            .onChanged { g in
                withAnimation(.interactiveSpring) {
                    tilt = CGSize(width: min(max(g.location.x / 130 - 1, -1), 1),
                                  height: min(max(g.location.y / 80 - 1, -1), 1))
                }
            }
            .onEnded { _ in withAnimation(.spring(response: 0.4, dampingFraction: 0.5)) { tilt = .zero } }
    )`,
  },
  "gyro-parallax": {
    apis: ["CMMotionManager", "deviceMotion.attitude", "offset"],
    code: c`// Core Motion reports pitch and roll; each layer offsets by its depth
import CoreMotion

@Observable final class Motion {
    var pitch = 0.0, roll = 0.0
    private let manager = CMMotionManager()
    func start() {
        manager.deviceMotionUpdateInterval = 1 / 60
        manager.startDeviceMotionUpdates(to: .main) { [weak self] m, _ in
            guard let a = m?.attitude else { return }
            self?.pitch = min(max(a.pitch - 0.6, -0.6), 0.6) // 0.6 rad = phone held tilted
            self?.roll = min(max(a.roll, -0.6), 0.6)
        }
    }
    func stop() { manager.stopDeviceMotionUpdates() }
}

@State private var motion = Motion()

ZStack {
    ForEach(layers) { layer in
        Image(layer.image).resizable().scaledToFill().padding(-40)
            .offset(x: motion.roll * layer.depth * 40, y: motion.pitch * layer.depth * 40)
    }
}
.frame(width: 300, height: 200)
.clipShape(RoundedRectangle(cornerRadius: 20))
.animation(.spring(response: 0.3, dampingFraction: 0.8), value: motion.roll)
.onAppear { motion.start() }
.onDisappear { motion.stop() }`,
  },
  "emoji-reactions": {
    apis: ["LongPressGesture.sequenced(before:)", "DragGesture", "scaleEffect"],
    code: c`// Long press, then drag: the sequence opens the bar and tracks the emoji under the finger
let emoji = ["👍", "❤️", "😂", "😮", "😢", "😡"]
let size: CGFloat = 44
@State private var open = false
@State private var hovered: Int? = nil

Text("👍 Like")
    .padding(.horizontal, 14).padding(.vertical, 8)
    .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
    .overlay(alignment: .bottomLeading) {
        HStack(spacing: 0) {
            ForEach(emoji.indices, id: \.self) { i in
                Text(emoji[i]).font(.system(size: 30)).frame(width: size)
                    .scaleEffect(hovered == i ? 1.6 : hovered == nil ? 1 : 0.85, anchor: .bottom)
                    .offset(y: hovered == i ? -14 : 0)
            }
        }
        .padding(.horizontal, 8).padding(.vertical, 4)
        .background(.background, in: Capsule()).shadow(radius: 6)
        .offset(y: -56)
        .scaleEffect(open ? 1 : 0.6, anchor: .bottomLeading)
        .opacity(open ? 1 : 0)
        .fixedSize()
    }
    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: hovered)
    .animation(.spring(response: 0.35, dampingFraction: 0.7), value: open)
    .gesture(
        LongPressGesture(minimumDuration: 0.3)
            .sequenced(before: DragGesture(minimumDistance: 0))
            .onChanged { value in
                guard case .second(true, let drag) = value else { return }
                open = true
                if let p = drag?.location, p.y < -20 {
                    let i = Int((p.x - 8) / size)
                    hovered = emoji.indices.contains(i) ? i : nil
                } else { hovered = nil }
            }
            .onEnded { _ in
                if let i = hovered { onReact(emoji[i]) }
                open = false; hovered = nil
            }
    )
    .onTapGesture { onReact("👍") }`,
  },
  "context-menu": {
    apis: [".contextMenu(menuItems:preview:)", "contentShape(.contextMenuPreview)", "Button(role:)"],
    code: c`// Built in: .contextMenu gives the squeeze, the lift over a blurred background and the menu
Bubble(message: message)
    .contentShape(.contextMenuPreview, RoundedRectangle(cornerRadius: 16)) // the lifted shape
    .contextMenu {
        Button("Reply", systemImage: "arrowshape.turn.up.left") { reply(message) }
        Button("Copy", systemImage: "doc.on.doc") { UIPasteboard.general.string = message.text }
        Divider()
        Button("Delete", systemImage: "trash", role: .destructive) { delete(message) }
    } preview: {
        Bubble(message: message).frame(width: 260) // optional custom preview
    }`,
  },
  "fly-to-cart": {
    apis: ["GeometryReader frame(in: .global)", "keyframeAnimator", "anchorPreference"],
    code: c`// Read both frames globally, then animate a copy's progress t along an arc
@State private var from: CGRect = .zero
@State private var to: CGRect = .zero
@State private var t: CGFloat = 0
@State private var flying = false
@State private var bumps = 0

ZStack(alignment: .topLeading) {
    content // the product image reports its frame: .onGeometryChange(for: CGRect.self) { $0.frame(in: .global) } action: { from = $0 }
            // the cart icon reports 'to' the same way and wears .keyframeAnimator(initialValue: 1.0, trigger: bumps) { $0.scaleEffect($1) } keyframes: { _ in SpringKeyframe(1.3, duration: 0.1); SpringKeyframe(1, duration: 0.3) }
    if flying {
        let x = from.midX + (to.midX - from.midX) * t
        let y = from.midY + (to.midY - from.midY) * t - sin(.pi * t) * 120
        Image(product.image).resizable().frame(width: from.width, height: from.height)
            .scaleEffect(1 - 0.75 * t)
            .position(x: x, y: y)
            .allowsHitTesting(false)
    }
}
.coordinateSpace(.global)

func fly() {
    t = 0
    flying = true
    withAnimation(.easeInOut(duration: 0.7)) { t = 1 } completion: {
        flying = false
        bumps += 1
        addToCart(product)
    }
}
// Animating t only works if the view's math reads it as animatable: wrap the flying image in a
// small struct conforming to Animatable (var animatableData: CGFloat { get { t } set { t = newValue } })`,
  },
  "wave-fill": {
    apis: ["Shape.animatableData", "TimelineView", "clipShape(Circle())"],
    code: c`// A wave Shape: level animates with withAnimation, the phase comes from a TimelineView
struct Wave: Shape {
    var level: CGFloat  // 0...1
    var phase: CGFloat
    var animatableData: CGFloat { get { level } set { level = newValue } }
    func path(in r: CGRect) -> Path {
        Path { p in
            let top = r.height * (1 - level)
            p.move(to: CGPoint(x: 0, y: top))
            for x in stride(from: 0, through: r.width, by: 4) {
                p.addLine(to: CGPoint(x: x, y: top + 6 * sin(x / r.width * 2 * .pi + phase)))
            }
            p.addLine(to: CGPoint(x: r.width, y: r.height))
            p.addLine(to: CGPoint(x: 0, y: r.height))
            p.closeSubpath()
        }
    }
}

TimelineView(.animation) { ctx in
    let phase = ctx.date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: 1.8) / 1.8 * 2 * .pi
    Circle().fill(Color.accentColor.opacity(0.15))
        .overlay(Wave(level: progress, phase: phase).fill(Color.accentColor))
        .clipShape(Circle())
        .overlay(Circle().stroke(Color.accentColor, lineWidth: 3))
        .frame(width: 120, height: 120)
}
.animation(.easeOut(duration: 0.9), value: progress)`,
  },
  "spring-chain": {
    apis: ["DragGesture", "spring(response:)", "staggered animation"],
    code: c`// Every dot targets the finger, each with a slower spring, so they trail behind the leader
@State private var target = CGPoint(x: 150, y: 150)
let count = 6

ZStack {
    ForEach((0..<count).reversed(), id: \.self) { i in
        Circle()
            .fill(Color.accentColor)
            .frame(width: 36, height: 36)
            .scaleEffect(1 - CGFloat(i) * 0.12)
            .opacity(1 - Double(i) * 0.12)
            .position(target)
            .animation(.spring(response: 0.15 + Double(i) * 0.07, dampingFraction: 0.65), value: target)
    }
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
.contentShape(Rectangle())
.gesture(DragGesture(minimumDistance: 0).onChanged { target = $0.location })
// A true chain (each dot chasing the previous one) needs a TimelineView stepping springs by hand`,
  },
  "shape-morph": {
    apis: ["animatableData", "AnimatablePair", "Shape"],
    code: c`// A Shape whose control points blend between circle, square and blob as t goes 0 -> 2
struct Morph: Shape {
    var t: CGFloat
    var animatableData: CGFloat { get { t } set { t = newValue } }
    // 8 points per shape (corner/edge anchors), as unit-square coordinates
    static let circle = (0..<8).map { i -> CGPoint in let a = CGFloat(i) * .pi / 4; return CGPoint(x: 0.5 + 0.5 * cos(a), y: 0.5 + 0.5 * sin(a)) }
    static let square: [CGPoint] = [.init(x: 1, y: 0.5), .init(x: 1, y: 1), .init(x: 0.5, y: 1), .init(x: 0, y: 1),
                                    .init(x: 0, y: 0.5), .init(x: 0, y: 0), .init(x: 0.5, y: 0), .init(x: 1, y: 0)]
    static let blob = circle.enumerated().map { i, p in
        let k: CGFloat = i % 2 == 0 ? 1.05 : 0.8
        return CGPoint(x: 0.5 + (p.x - 0.5) * k, y: 0.5 + (p.y - 0.5) * k)
    }
    func path(in r: CGRect) -> Path {
        let (a, b, f) = t < 1 ? (Self.circle, Self.square, t) : (Self.square, Self.blob, t - 1)
        let pts = zip(a, b).map { CGPoint(x: ($0.x + ($1.x - $0.x) * f) * r.width, y: ($0.y + ($1.y - $0.y) * f) * r.height) }
        var p = Path()
        // smooth closed curve through the points (midpoint quad curves)
        let mid = { (i: Int) in CGPoint(x: (pts[i].x + pts[(i + 1) % 8].x) / 2, y: (pts[i].y + pts[(i + 1) % 8].y) / 2) }
        p.move(to: mid(7))
        for i in 0..<8 { p.addQuadCurve(to: mid(i), control: pts[i]) }
        p.closeSubpath()
        return p
    }
}

@State private var t: CGFloat = 0

Morph(t: t).fill(Color.accentColor).frame(width: 120, height: 120)
    .onAppear { withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) { t = 2 } }`,
  },
  "spin-wheel": {
    apis: ["rotationEffect", "withAnimation(.timingCurve)", "completion:"],
    code: c`// Choose the prize, then animate to whole turns plus the angle that brings it under the pointer
let prizes = ["10%", "Free ship", "5%", "Try again", "20%", "Gift"]
var seg: Double { 360 / Double(prizes.count) }
@State private var angle = 0.0
@State private var spinning = false

func spin() {
    guard !spinning else { return }
    spinning = true
    let prize = Int.random(in: 0..<prizes.count)
    let jitter = Double.random(in: -0.35...0.35) * seg
    let target = angle - angle.truncatingRemainder(dividingBy: 360) + 360 * 6 + (360 - (Double(prize) * seg + seg / 2)) + jitter
    withAnimation(.timingCurve(0.15, 0.75, 0.2, 1, duration: 4.5)) {
        angle = target
    } completion: {
        spinning = false
        onWin(prizes[prize])
    }
}

VStack(spacing: 0) {
    Image(systemName: "arrowtriangle.down.fill").font(.title2).zIndex(1)
    ZStack {
        ForEach(prizes.indices, id: \.self) { i in
            Wedge(start: .degrees(Double(i) * seg - 90), end: .degrees(Double(i + 1) * seg - 90))
                .fill(colors[i % colors.count])
        }
    }
    .frame(width: 260, height: 260)
    .rotationEffect(.degrees(angle))
    Button(spinning ? "Spinning…" : "Spin", action: spin).buttonStyle(.borderedProminent).disabled(spinning)
}
// Wedge: a Shape that moves to center and addArc(start, end). For per-segment ticks, read the
// live angle with a custom Animatable modifier and fire .sensoryFeedback(.selection) on each edge`,
  },
};
