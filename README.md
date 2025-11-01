# ⚡ Rune Scroller

**Native Scroll Animations for Svelte 5** — Built with **Svelte 5 Runes** and **IntersectionObserver API**. No external dependencies, pure performance.

> 🚀 **Open Source Project** by **[ludoloops](https://github.com/ludoloops)** at **[LeLab.dev](https://lelab.dev)**
> 📜 Licensed under **MIT** — Contributions welcome!
>
> A modern, lightweight scroll animation library showcasing Svelte 5 capabilities

---

## ✨ Features

- ✅ **~2KB Bundle** : Only **1.9 KB gzipped** (52% lighter than AOS!)
- ✅ **Svelte 5 Runes** : `$state`, `$props()` with snippets
- ✅ **Zero Dependencies** : Pure Svelte 5 + IntersectionObserver
- ✅ **Native Performance** : GPU-accelerated CSS animations
- ✅ **14 Built-in Animations** : Fade (5), Zoom (5), Flip (2), Slide, Bounce variants
- ✅ **TypeScript** : Full type coverage with strict mode
- ✅ **Customizable** : Duration, delay, threshold, offset per element
- ✅ **Play Once or Repeat** : Control animation behavior
- ✅ **SSR-ready** : SvelteKit compatible with no DOM access during hydration
- ✅ **Accessible** : Respects `prefers-reduced-motion` media query

---

## ⚡ Performance: Svelte Projects Bundle Comparison

### When Using in a Svelte Project

| Scenario                  | Bundle Size       | Impact               |
| ------------------------- | ----------------- | -------------------- |
| **Svelte App (baseline)** | ~30-35 KB gzipped | -                    |
| **+ AOS Library**         | ~34-39 KB         | **+4 KB overhead**   |
| **+ Rune Scroller**       | ~31.9-36.9 KB     | **+1.9 KB overhead** |
| **Savings**               | **2.1 KB**        | **52% smaller** ✨   |

### Why Rune Scroller is Lighter

1. **Native Svelte Integration** - Uses `$state()` directly (no separate state lib)
2. **CSS-Based Animations** - Pure CSS transforms + GPU acceleration (no JS animation loop)
3. **Svelte 5 Optimized** - Leverages runes system for minimal overhead
4. **Zero External Dependencies** - Works with Svelte's native IntersectionObserver

### Real-World Impact

For a typical SvelteKit app:

- **With AOS**: Extra 4 KB per user download
- **With Rune Scroller**: Extra 1.9 KB per user download
- **Difference**: Save **2.1 KB per page load** = faster initial paint! 🚀

---

## 📦 Project Structure

```
rune-scroller-lib/
├── src/lib/
│   ├── Rs.svelte                      # Main animation component (one-time or repeat)
│   ├── BaseAnimated.svelte            # Base animation implementation
│   ├── runeScroller.svelte.ts         # Sentinel-based animation action (recommended)
│   ├── useIntersection.svelte.ts      # IntersectionObserver composables
│   ├── animate.svelte.ts              # Animation action for direct DOM control
│   ├── animations.ts                  # Animation configuration & validation
│   ├── animations.css                 # Animation styles (14 animations)
│   ├── animations.test.ts             # Animation configuration tests
│   ├── scroll-animate.test.ts         # Component behavior tests
│   └── index.ts                       # Library entry point
├── dist/                              # Built library (created by pnpm build)
├── package.json                       # npm package configuration
├── svelte.config.js                   # SvelteKit configuration
├── vite.config.ts                     # Vite build configuration
├── tsconfig.json                      # TypeScript configuration
└── eslint.config.js                   # ESLint configuration
```

---

## 🚀 Quick Start

### Installation

```bash
npm install rune-scroller
```

Or with other package managers:

```bash
pnpm add rune-scroller
yarn add rune-scroller
```

### Basic Usage with `Rs` Component

The `Rs` component is the main component for scroll animations. Use the `repeat` prop to control animation behavior:

```svelte
<script>
	import Rs from 'rune-scroller';
	import 'rune-scroller/animations.css';
</script>

<!-- Play animation once when element enters viewport (default) -->
<Rs animation="fade-in">
	<div class="card">
		<h2>Hello World</h2>
		<p>This element fades in once</p>
	</div>
</Rs>

<!-- Repeat animation every time element enters viewport -->
<Rs animation="zoom-in" repeat>
	<div class="card">
		<h2>Repeating Animation</h2>
		<p>This triggers each time you scroll past it</p>
	</div>
</Rs>
```

### In SvelteKit/Local Development

```svelte
<script>
	import Rs from '$lib/Rs.svelte';
	import '$lib/animations.css';
</script>

<Rs animation="fade-in-up" duration={1000} delay={200}>
	<div class="card">
		<h2>Animated Content</h2>
	</div>
</Rs>
```

### API Overview

The `Rs` component is the unified API for all scroll animations:

```svelte
<!-- Animation plays once (default) -->
<Rs animation="fade-in">Content</Rs>

<!-- Animation repeats on every scroll -->
<Rs animation="fade-in" repeat>Content</Rs>

<!-- Customize timing -->
<Rs animation="zoom-in" duration={1200} delay={300}>
	Content
</Rs>

<!-- Use with any HTML attribute -->
<Rs animation="bounce-in" class="my-class" data-test="value">
	Content
</Rs>
```

---

## 🎯 Sentinel-Based Animation Triggering with `runeScroller`

For more precise control over animation timing, use the `runeScroller` action. This approach uses an invisible **sentinel element** positioned below your content to trigger animations at exactly the right moment.

### Why Sentinels?

- **Accurate Timing** - Instead of triggering when the element enters, sentinel triggers slightly earlier
- **Consistent Behavior** - Same timing across all screen sizes and content heights
- **Simple API** - No complex offset calculations needed
- **Performance** - Minimal overhead, pure CSS animations

### How Sentinels Work

1. An invisible 20px sentinel element is automatically placed **below** your animated element
2. When the sentinel enters the viewport, it triggers the animation
3. This ensures content animates in perfectly as it becomes visible

```svelte
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
  <!-- Your content here -->
  <!-- Invisible sentinel is automatically placed below -->
</div>
```

### Basic Usage

```svelte
<script>
	import { runeScroller } from 'rune-scroller';
	import 'rune-scroller/animations.css';
</script>

<!-- Simple fade in with sentinel triggering -->
<div use:runeScroller={{ animation: 'fade-in' }}>
	<h2>Animated Heading</h2>
	<p>Animates when sentinel enters viewport</p>
</div>

<!-- With duration control -->
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1500 }}>
	<div class="card">Smooth animation</div>
</div>
```

### Sentinel-Based Examples

**Staggered animations with sentinels:**

```svelte
<script>
	import { runeScroller } from 'rune-scroller';
</script>

<div class="grid">
	{#each items as item, i}
		<div use:runeScroller={{ animation: 'fade-in-up', duration: 800 }}>
			<h3>{item.title}</h3>
			<p>{item.description}</p>
		</div>
	{/each}
</div>
```

**Hero section with sentinel triggering:**

```svelte
<div use:runeScroller={{ animation: 'fade-in-down', duration: 1000 }}>
	<h1>Welcome to Our Site</h1>
</div>

<div use:runeScroller={{ animation: 'fade-in-up', duration: 1200 }}>
	<p>Engaging content appears as you scroll</p>
</div>

<div use:runeScroller={{ animation: 'zoom-in', duration: 1000 }}>
	<button class="cta">Get Started</button>
</div>
```

### `runeScroller` Options

```typescript
interface RuneScrollerOptions {
	animation?: AnimationType; // Animation type (e.g., 'fade-in-up')
	duration?: number;         // Duration in milliseconds (default: 2000)
	repeat?: boolean;          // Repeat animation on each scroll (default: false)
}
```

### Comparing: `Rs` Component vs `runeScroller` Action

| Feature | `Rs` Component | `runeScroller` Action |
|---------|---|---|
| **Usage** | `<Rs>` wrapper | `use:` directive |
| **Triggering** | IntersectionObserver on element | IntersectionObserver on sentinel |
| **Timing Control** | offset, threshold props | Automatic sentinel placement |
| **Repeat Support** | Yes (via `repeat` prop) | Yes (via `repeat` option) |
| **Best For** | Complex layouts, component isolation | Direct DOM control, simple/mixed elements |

---

## ⚙️ Component Props

### Rs Component

```typescript
interface RsProps {
	animation?: string; // Animation type (default: 'fade-in')
	threshold?: number; // Visibility threshold (default: 0.5)
	offset?: number; // Trigger offset 0-100% (optional, uses default if not set)
	rootMargin?: string; // Observer margin (overrides offset if set)
	duration?: number; // Duration in ms (default: 800)
	delay?: number; // Delay in ms (default: 0)
	repeat?: boolean; // Repeat animation on every scroll (default: false)
	children: Snippet; // Content to animate
	[key: string]: any; // Accepts any HTML attributes (e.g., data-testid, class, etc.)
}
```

#### `offset` Prop (Optional)

Controls when the animation triggers as the element scrolls into view. If not specified, uses default behavior (`-10% 0px -10% 0px`).

- `offset={0}` — Triggers when element touches bottom of screen
- `offset={50}` — Triggers at middle of screen
- `offset={100}` — Triggers when element reaches top of screen
- **Not set** — Uses default behavior (triggers in middle ~80% band)

**Examples:**

```svelte
<!-- Early trigger (bottom of screen) -->
<Rs animation="fade-in-up" offset={0}>
	<div class="card">Animates early</div>
</Rs>

<!-- Late trigger (top of screen) -->
<Rs animation="fade-in-up" offset={100}>
	<div class="card">Animates late</div>
</Rs>

<!-- Custom timing -->
<Rs animation="fade-in-up" offset={75}>
	<div class="card">Animates at 75%</div>
</Rs>

<!-- Repeat animation on every scroll -->
<Rs animation="fade-in-up" offset={50} repeat>
	<div class="card">Animates every time</div>
</Rs>
```

**Full example with all props:**

```svelte
<Rs
	animation="fade-in-up"
	duration={1200}
	delay={300}
	threshold={0.8}
	offset={25}
	repeat={false}
	data-testid="custom-animation"
>
	<div class="card">
		<h2>Custom Timing</h2>
		<p>Duration: 1200ms, Delay: 300ms, Threshold: 80%, Offset: 25%</p>
	</div>
</Rs>
```

#### Repeat Behavior

Use the `repeat` prop to control animation behavior:

- `repeat={false}` (default) - Animation plays **once** when element enters viewport
- `repeat={true}` - Animation **repeats** every time element enters viewport

---

## 🎨 All Animations with Examples

### Fade (5 variants)

#### `fade-in`

Simple opacity fade from transparent to visible.

```svelte
<Rs animation="fade-in">
	<div class="card">
		<h2>Fade In</h2>
		<p>Simple fade entrance</p>
	</div>
</Rs>
```

#### `fade-in-up`

Fades in while moving up 100px.

```svelte
<Rs animation="fade-in-up">
	<div class="card">
		<h2>Fade In Up</h2>
		<p>Rises from below</p>
	</div>
</Rs>
```

#### `fade-in-down`

Fades in while moving down 100px.

```svelte
<Rs animation="fade-in-down">
	<div class="card">
		<h2>Fade In Down</h2>
		<p>Descends from above</p>
	</div>
</Rs>
```

#### `fade-in-left`

Fades in while moving left 100px.

```svelte
<Rs animation="fade-in-left">
	<div class="card">
		<h2>Fade In Left</h2>
		<p>Comes from the right</p>
	</div>
</Rs>
```

#### `fade-in-right`

Fades in while moving right 100px.

```svelte
<Rs animation="fade-in-right">
	<div class="card">
		<h2>Fade In Right</h2>
		<p>Comes from the left</p>
	</div>
</Rs>
```

---

### Zoom (5 variants)

#### `zoom-in`

Scales from 50% to 100% while fading in.

```svelte
<Rs animation="zoom-in">
	<div class="card">
		<h2>Zoom In</h2>
		<p>Grows into view</p>
	</div>
</Rs>
```

#### `zoom-out`

Scales from 150% to 100% while fading in.

```svelte
<Rs animation="zoom-out">
	<div class="card">
		<h2>Zoom Out</h2>
		<p>Shrinks into view</p>
	</div>
</Rs>
```

#### `zoom-in-up`

Scales from 50% while translating up 50px.

```svelte
<Rs animation="zoom-in-up">
	<div class="card">
		<h2>Zoom In Up</h2>
		<p>Grows while moving up</p>
	</div>
</Rs>
```

#### `zoom-in-left`

Scales from 50% while translating left 50px.

```svelte
<Rs animation="zoom-in-left">
	<div class="card">
		<h2>Zoom In Left</h2>
		<p>Grows while moving left</p>
	</div>
</Rs>
```

#### `zoom-in-right`

Scales from 50% while translating right 50px.

```svelte
<Rs animation="zoom-in-right">
	<div class="card">
		<h2>Zoom In Right</h2>
		<p>Grows while moving right</p>
	</div>
</Rs>
```

---

### Flip (2 variants)

#### `flip`

3D rotation on Y axis (left to right).

```svelte
<Rs animation="flip">
	<div class="card">
		<h2>Flip</h2>
		<p>Rotates on Y axis</p>
	</div>
</Rs>
```

#### `flip-x`

3D rotation on X axis (top to bottom).

```svelte
<Rs animation="flip-x">
	<div class="card">
		<h2>Flip X</h2>
		<p>Rotates on X axis</p>
	</div>
</Rs>
```

---

### Slide & Rotate

#### `slide-rotate`

Slides from left while rotating 45 degrees.

```svelte
<Rs animation="slide-rotate">
	<div class="card">
		<h2>Slide Rotate</h2>
		<p>Slides and spins</p>
	</div>
</Rs>
```

---

### Bounce

#### `bounce-in`

Bouncy entrance with scaling keyframe animation.

```svelte
<Rs animation="bounce-in" duration={800}>
	<div class="card">
		<h2>Bounce In</h2>
		<p>Bounces into view</p>
	</div>
</Rs>
```

---

### Compare: Once vs Repeat

**Same animation, different behavior using the `repeat` prop:**

```svelte
<!-- Plays once on scroll down (default) -->
<Rs animation="fade-in-up">
	<div class="card">Animates once</div>
</Rs>

<!-- Repeats each time you scroll by -->
<Rs animation="fade-in-up" repeat>
	<div class="card">Animates on every scroll</div>
</Rs>
```

---

## 💡 Usage Examples

### Staggered Grid

Animate cards with progressive delays:

```svelte
<script>
	import Rs from '$lib/Rs.svelte';
</script>

<div class="grid">
	{#each items as item, i}
		<Rs animation="fade-in-up" delay={i * 100}>
			<div class="card">
				<h3>{item.title}</h3>
				<p>{item.description}</p>
			</div>
		</Rs>
	{/each}
</div>
```

### Mixed Animations

```svelte
<Rs animation="fade-in">
	<section>Content fades in</section>
</Rs>

<Rs animation="slide-rotate">
	<section>Content slides and rotates</section>
</Rs>

<Rs animation="zoom-in" repeat>
	<section>Content zooms in repeatedly</section>
</Rs>
```

### Hero Section

```svelte
<script>
	import Rs from '$lib/Rs.svelte';
</script>

<section class="hero">
	<div class="hero-content">
		<Rs animation="fade-in" delay={0}>
			<h1>Welcome</h1>
		</Rs>

		<Rs animation="fade-in" delay={200}>
			<p>Scroll to reveal more</p>
		</Rs>

		<Rs animation="zoom-in" delay={400}>
			<button>Get Started</button>
		</Rs>
	</div>
</section>
```

---

## 🔧 Composables & Actions

### runeScroller (Recommended)

The `runeScroller` action provides sentinel-based animation triggering for precise timing control:

```typescript
function runeScroller(
	element: HTMLElement,
	options?: {
		animation?: AnimationType;  // Animation type
		duration?: number;          // Duration in ms (default: 2000)
		repeat?: boolean;           // Repeat animation on each scroll (default: false)
	}
): { update?: (newOptions) => void; destroy?: () => void }
```

**Key Features:**
- Automatically creates an invisible 20px sentinel element below your content
- Triggers animation when sentinel enters viewport
- Provides consistent timing across all screen sizes
- Minimal configuration needed
- Supports both one-time and repeating animations

**Basic Example (One-time animation):**

```svelte
<script>
	import { runeScroller } from 'rune-scroller';
</script>

<!-- Animation plays once when sentinel enters viewport -->
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
	Animated content with sentinel-based triggering
</div>
```

**Repeating Animation:**

```svelte
<!-- Animation repeats each time sentinel enters viewport -->
<div use:runeScroller={{ animation: 'bounce-in', duration: 800, repeat: true }}>
	This animates every time you scroll past it
</div>
```

**Complete Examples:**

```svelte
<script>
	import { runeScroller } from 'rune-scroller';
</script>

<!-- Fade in once on scroll -->
<div use:runeScroller={{ animation: 'fade-in', duration: 600 }}>
	<h2>Section Title</h2>
	<p>Fades in when scrolled into view</p>
</div>

<!-- Zoom in with longer duration -->
<div use:runeScroller={{ animation: 'zoom-in-up', duration: 1200 }}>
	<div class="card">
		<h3>Card Title</h3>
		<p>Zooms in from below</p>
	</div>
</div>

<!-- Repeating animation for interactive effect -->
<div use:runeScroller={{ animation: 'bounce-in', duration: 700, repeat: true }}>
	<button class="interactive-button">Bounces on each scroll</button>
</div>

<!-- Complex staggered layout -->
<div class="grid">
	{#each items as item, i}
		<div use:runeScroller={{ animation: 'fade-in-up', duration: 800 }}>
			<h3>{item.title}</h3>
			<p>{item.description}</p>
		</div>
	{/each}
</div>
```

**When to use:**
- ✅ Simple element animations
- ✅ Consistent timing across layouts
- ✅ Minimal overhead applications
- ✅ Both one-time and repeating animations
- ❌ Complex layout with component isolation (use `Rs` component instead)

---

### useIntersectionOnce

For one-time animations:

```typescript
function useIntersectionOnce(options?: {
	threshold?: number;
	rootMargin?: string;
	root?: Element | null;
}): { element: HTMLElement | null; isVisible: boolean }
```

Returns `{ element, isVisible }` — bind `element` to your target, `isVisible` becomes `true` once, then observer unobserves.

### useIntersection

For repeating animations:

```typescript
function useIntersection(
	options?: {
		threshold?: number;
		rootMargin?: string;
		root?: Element | null;
	},
	onVisible?: (isVisible: boolean) => void
): { element: HTMLElement | null; isVisible: boolean }
```

Returns `{ element, isVisible }` — `isVisible` toggles `true`/`false` on each scroll pass.

### animate Action

For direct DOM animation control without component wrapper:

```typescript
function animate(
	node: HTMLElement,
	options?: {
		animation?: AnimationType;    // Default: 'fade-in'
		duration?: number;             // Default: 800
		delay?: number;                // Default: 0
		offset?: number;               // Optional trigger offset
		threshold?: number;            // Default: 0
		rootMargin?: string;           // Optional custom margin
	}
): { update?: (newOptions) => void; destroy?: () => void }
```

**Example:**

```svelte
<script>
	import { animate } from 'rune-scroller';
</script>

<div use:animate={{ animation: 'fade-in-up', duration: 1000, delay: 200 }}>
	Animated content
</div>
```

---

## 🏗️ Architecture

### Core Layer Architecture

**Bottom Layer - Browser APIs & Utilities:**
1. **animations.ts** - Animation type definitions, validation, and utilities
2. **dom-utils.svelte.ts** - Reusable DOM manipulation utilities (CSS variables, animation setup, sentinel creation)
3. **useIntersection.svelte.ts** - IntersectionObserver composables for element visibility detection

**Middle Layer - Base Implementation:**
4. **animate.svelte.ts** - Action for direct DOM node animation control
5. **runeScroller.svelte.ts** - **Recommended** - Sentinel-based action for precise animation timing
6. **BaseAnimated.svelte** - Base component handling intersection observer + animation logic

**Top Layer - Consumer API:**
7. **Rs.svelte** - Main unified component (supports one-time & repeating via `repeat` prop)

**Styles:**
- **animations.css** - All animation keyframes & styles (14 animations, GPU-accelerated)

### Key Principles

- **Separation of Concerns** : Scroll logic separate from components
- **CSS-Based** : Animations use CSS transforms + transitions (hardware-accelerated)
- **Type-Safe** : Full TypeScript support
- **Composable** : Use hooks directly or wrapped components
- **DRY (Don't Repeat Yourself)** : Utility functions eliminate code duplication
- **Optimal DOM Manipulation** : Uses `cssText` for efficient single-statement styling

---

## 🚀 Optimizations

### Recent Improvements (v1.1.0)

**DOM Utility Extraction**
- Extracted repeated DOM manipulation patterns into reusable utilities (`dom-utils.svelte.ts`)
- `setCSSVariables()` - Centralizes CSS custom property management
- `setupAnimationElement()` - Consistent animation class/attribute setup
- `createSentinel()` - Optimized sentinel creation using single `cssText` statement
- **Result**: Reduced code duplication, improved maintainability, cleaner codebase

**Memory Leak Fixes**
- Fixed potential memory leaks in repeat mode by tracking observer connection state
- Observer now properly disconnects in destroy lifecycle
- Prevents accumulation of observers on long-scroll pages
- **Result**: Better performance on content-heavy sites with many animations

**Observer Logic Improvements**
- Fixed `animate.svelte.ts` to properly handle dynamic threshold/rootMargin changes
- Observer now recreates when trigger options change at runtime
- Maintains correct state throughout component lifecycle
- **Result**: More reliable dynamic animation updates

**Bundle Size Optimization**
- Updated `.npmignore` to exclude test files from npm distribution
- Removes `*.test.ts`, `*.test.js` and built test files
- **Result**: ~3.6 KB reduction in package size

### Performance Impact

- **Code Size**: Reduced duplication without sacrificing readability
- **Runtime Performance**: Fewer DOM operations via optimized `cssText` usage
- **Memory Efficiency**: Proper observer cleanup prevents memory leaks
- **Bundle Size**: Test files excluded from distribution

---

## 📊 Performance

- **IntersectionObserver** : Native browser API, no scroll listeners
- **CSS Transforms** : Hardware-accelerated (GPU)
- **Lazy Loading** : Only animate visible elements
- **Memory Efficient** : Automatic cleanup on unmount
- **SSR Compatible** : No DOM access during hydration

---

## 🎯 Development

```bash
# Install dependencies
pnpm install

# Dev server
pnpm dev

# Type checking
pnpm check

# Type checking in watch mode
pnpm check:watch

# Format code
pnpm format

# Lint code
pnpm lint

# Build library for npm
pnpm build

# Run tests
pnpm test

# Preview built library
pnpm preview
```

---

## 📝 Notes

- **Why "Rune"?** Svelte 5 uses **Runes** (`$state`, `$props()`) as core reactivity primitives
- **Zero Dependencies** : Pure Svelte 5 + Native Browser APIs (IntersectionObserver)
- **Extensible** : Add new animations by extending `animations.ts` and `animations.css`
- **Library Only** : This is the library repository. The demo website is in `rune-scroller-site`
- **Published as npm Package** : `rune-scroller` on npm registry

---

## 🔗 Links

- [Svelte 5 Documentation](https://svelte.dev)
- [IntersectionObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [LeLab.dev](https://lelab.dev)
- [GitHub Repository](https://github.com/ludoloops/rune-scroller)

---

## 📄 License & Credits

**MIT License** — Free for personal and commercial use.

Made with ⚡ by **[ludoloops](https://github.com/ludoloops)** at **[LeLab.dev](https://lelab.dev)**

**Open Source Project** — Contributions, issues, and feature requests are welcome!
