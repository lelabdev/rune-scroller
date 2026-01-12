# ⚡ Rune Scroller - Full Reference

**📚 Complete API Reference** — Detailed documentation for all features and options.

**Quick start?** See [README.md](https://github.com/lelabdev/rune-scroller/blob/main/README.md) for a simpler introduction.

**Development?** See [CLAUDE.md](https://github.com/lelabdev/rune-scroller/blob/main/CLAUDE.md) for the developer guide.

---

<div align="center">
	<img src="./logo.png" alt="Rune Scroller Logo" width="200" />
</div>

**Lightweight scroll animations for Svelte 5** — Built with Svelte 5 Runes and IntersectionObserver API.

> 🚀 **Open Source** by [ludoloops](https://github.com/ludoloops) at [LeLab.dev](https://lelab.dev)
> 📜 Licensed under **MIT**

<div align="center">
	<a href="https://bundlephobia.com/package/rune-scroller">
		<img src="https://img.shields.io/bundlephobia/minzip/rune-scroller" alt="minzipped size" />
	</a>
	<a href="https://bundlephobia.com/package/rune-scroller">
		<img src="https://img.shields.io/bundlephobia/min/rune-scroller" alt="minified size" />
	</a>
</div>

---

## ✨ Features

- **12.7KB gzipped** (40.3KB uncompressed) - Minimal overhead, optimized for production
- **Zero dependencies** - Pure Svelte 5 + IntersectionObserver
- **14 animations** - Fade, Zoom, Flip, Slide, Bounce variants
- **Full TypeScript support** - Type definitions generated from JSDoc
- **SSR-ready** - SvelteKit compatible
- **GPU-accelerated** - Pure CSS transforms
- **Accessible** - Respects `prefers-reduced-motion`
- **v2.0.0 New** - `onVisible` callback, ResizeObserver support, animation validation, sentinel customization
- **✨ Latest** - `useIntersection` migrated to Svelte 5 `$effect` rune for better lifecycle management
- **🚀 Bundle optimized** - CSS with custom properties, production build minification

---

## 📦 Installation

```bash
npm install rune-scroller
# or
pnpm add rune-scroller
# or
yarn add rune-scroller
```

---

## 🚀 Quick Start

### Step 1: Import CSS (required)

**⚠️ Important:** You must import the CSS file once in your app.

**Option A - In your root layout (recommended for SvelteKit):**

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import 'rune-scroller/animations.css';
	let { children } = $props();
</script>

{@render children()}
```

**Option B - In each component that uses animations:**

```svelte
<script>
	import runeScroller from 'rune-scroller';
	import 'rune-scroller/animations.css';
</script>
```

### Step 2: Use the animations

```svelte
<script>
	import runeScroller from 'rune-scroller';
	// CSS already imported in layout or above
</script>

<!-- Simple animation -->
<div use:runeScroller={{ animation: 'fade-in' }}>
	<h2>Animated Heading</h2>
</div>

<!-- With custom duration -->
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1500 }}>
	<div class="card">Smooth fade and slide</div>
</div>

<!-- Repeat on every scroll -->
<div use:runeScroller={{ animation: 'bounce-in', repeat: true }}>
	<button>Bounces on every scroll</button>
</div>
```

---

## 🎨 Available Animations

### Fade (5)
- `fade-in` - Simple opacity fade
- `fade-in-up` - Fade + move up 300px
- `fade-in-down` - Fade + move down 300px
- `fade-in-left` - Fade + move from right 300px
- `fade-in-right` - Fade + move from left 300px

### Zoom (5)
- `zoom-in` - Scale from 0.3 to 1
- `zoom-out` - Scale from 2 to 1
- `zoom-in-up` - Zoom (0.5→1) + move up 300px
- `zoom-in-left` - Zoom (0.5→1) + move from right 300px
- `zoom-in-right` - Zoom (0.5→1) + move from left 300px

### Others (4)
- `flip` - 3D flip on Y-axis
- `flip-x` - 3D flip on X-axis
- `slide-rotate` - Slide + rotate 10°
- `bounce-in` - Bouncy entrance (spring effect)

---

## ⚙️ Options

```typescript
interface RuneScrollerOptions {
	animation?: AnimationType;  // Animation name (default: 'fade-in')
	duration?: number;          // Duration in ms (default: 800)
	repeat?: boolean;           // Repeat on scroll (default: false)
	debug?: boolean;            // Show sentinel as visible line (default: false)
	offset?: number;            // Sentinel offset in px (default: 0, negative = above)
	onVisible?: (element: HTMLElement) => void;  // Callback when animation triggers (v2.0.0+)
	sentinelColor?: string;     // Sentinel debug color, e.g. '#ff6b6b' (v2.0.0+)
	sentinelId?: string;        // Custom ID for sentinel identification (v2.0.0+)
}
```

### Option Details

- **`animation`** - Type of animation to play. Choose from 14 built-in animations listed above. Invalid animations automatically fallback to 'fade-in' with a console warning.
- **`duration`** - How long the animation lasts in milliseconds (default: 800ms).
- **`repeat`** - If `true`, animation plays every time sentinel enters viewport. If `false`, plays only once.
- **`debug`** - If `true`, displays the sentinel element as a visible line below your element. Useful for seeing exactly when animations trigger. Default color is cyan (#00e0ff), customize with `sentinelColor`.
- **`offset`** - Offset of the sentinel in pixels. Positive values move sentinel down (delays animation), negative values move it up (triggers earlier). Useful for large elements where you want animation to trigger before the entire element is visible.
- **`onVisible`** *(v2.0.0+)* - Callback function triggered when the animation becomes visible. Receives the animated element as parameter. Useful for analytics, lazy loading, or triggering custom effects.
- **`sentinelColor`** *(v2.0.0+)* - Customize the debug sentinel color (e.g., '#ff6b6b' for red). Only visible when `debug: true`. Useful for distinguishing multiple sentinels on the same page.
- **`sentinelId`** *(v2.0.0+)* - Set a custom ID for the sentinel element. If not provided, an auto-ID is generated (`sentinel-1`, `sentinel-2`, etc.). Useful for identifying sentinels in DevTools and tracking which element owns which sentinel.

### Examples

```svelte
<!-- Basic -->
<div use:runeScroller={{ animation: 'zoom-in' }}>
	Content
</div>

<!-- Custom duration -->
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
	Fast animation
</div>

<!-- Repeat mode -->
<div use:runeScroller={{ animation: 'bounce-in', repeat: true }}>
	Repeats every time you scroll
</div>

<!-- Debug mode - shows cyan line marking sentinel position -->
<div use:runeScroller={{ animation: 'fade-in', debug: true }}>
	The cyan line below this shows when animation will trigger
</div>

<!-- Multiple options -->
<div use:runeScroller={{
	animation: 'fade-in-up',
	duration: 1200,
	repeat: true,
	debug: true
}}>
	Full featured example
</div>

<!-- Large element - trigger animation earlier with negative offset -->
<div use:runeScroller={{
	animation: 'fade-in-up',
	offset: -200  // Trigger 200px before element bottom
}}>
	Large content that needs early triggering
</div>

<!-- Delay animation by moving sentinel down -->
<div use:runeScroller={{
	animation: 'zoom-in',
	offset: 300  // Trigger 300px after element bottom
}}>
	Content with delayed animation
</div>

<!-- v2.0.0: onVisible callback for analytics tracking -->
<div use:runeScroller={{
	animation: 'fade-in-up',
	onVisible: (el) => {
		console.log('Animation visible!', el);
		// Track analytics, load images, trigger API calls, etc.
		window.gtag?.('event', 'animation_visible', { element: el.id });
	}
}}>
	Tracked animation
</div>

<!-- v2.0.0: Custom sentinel color for debugging -->
<div use:runeScroller={{
	animation: 'fade-in',
	debug: true,
	sentinelColor: '#ff6b6b'  // Red instead of default cyan
}}>
	Red debug sentinel
</div>

<!-- v2.0.0: Custom sentinel ID for identification -->
<div use:runeScroller={{
	animation: 'zoom-in',
	sentinelId: 'hero-zoom',
	debug: true
}}>
	Identified sentinel (shows "hero-zoom" in debug mode)
</div>

<!-- v2.0.0: Auto-ID (sentinel-1, sentinel-2, etc) -->
<div use:runeScroller={{
	animation: 'fade-in-up',
	debug: true
	// sentinelId omitted → auto generates "sentinel-1", "sentinel-2", etc
}}>
	Auto-identified sentinel
</div>
```

---

## 🎯 How It Works

Rune Scroller uses **sentinel-based triggering**:

1. An invisible 1px sentinel element is created below your element
2. When the sentinel enters the viewport, animation triggers
3. This ensures precise timing regardless of element size
4. Uses native IntersectionObserver for performance
5. Pure CSS animations (GPU-accelerated)
6. *(v2.0.0)* Sentinel automatically repositions on element resize via ResizeObserver

**Why sentinels?**
- Accurate timing across all screen sizes
- No complex offset calculations
- Handles staggered animations naturally
- Sentinel stays fixed while element animates (no observer confusion with transforms)

**Automatic ResizeObserver** *(v2.0.0+)*
- Sentinel repositions automatically when element resizes
- Works with responsive layouts and dynamic content
- No configuration needed—it just works

---

## 🌐 SSR Compatibility

Works seamlessly with SvelteKit. Import CSS in your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import 'rune-scroller/animations.css';
	let { children } = $props();
</script>

{@render children()}
```

Then use animations anywhere in your app:

```svelte
<!-- src/routes/+page.svelte -->
<script>
	import runeScroller from 'rune-scroller';
</script>

<!-- No special handling needed -->
<div use:runeScroller={{ animation: 'fade-in-up' }}>
	Works in SvelteKit SSR!
</div>
```

The library checks for browser environment and gracefully handles server-side rendering.

---

## ♿ Accessibility

Respects `prefers-reduced-motion`:

```css
/* In animations.css */
@media (prefers-reduced-motion: reduce) {
	.scroll-animate {
		animation: none !important;
		opacity: 1 !important;
		transform: none !important;
	}
}
```

Users who prefer reduced motion will see content without animations.

---

## 📚 API Reference
### Public API

Rune Scroller exports a **single action-based API** (no components):

1. **`runeScroller`** (default) - Sentinel-based, simple, powerful

**Why actions instead of components?**
- Actions are lightweight directives
- No DOM wrapper overhead
- Better performance
- More flexible

### Main Export

```typescript
// Default export
import runeScroller from 'rune-scroller';

// Named exports
import {
	useIntersection,            // Composable
	useIntersectionOnce,        // Composable
	calculateRootMargin         // Utility
} from 'rune-scroller';

// Types
import type {
	AnimationType,
	RuneScrollerOptions,
	IntersectionOptions,
	UseIntersectionReturn
} from 'rune-scroller';
```

### TypeScript Types

```typescript
type AnimationType =
	| 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right'
	| 'zoom-in' | 'zoom-out' | 'zoom-in-up' | 'zoom-in-left' | 'zoom-in-right'
	| 'flip' | 'flip-x' | 'slide-rotate' | 'bounce-in';

interface RuneScrollerOptions {
	animation?: AnimationType;
	duration?: number;
	repeat?: boolean;
	debug?: boolean;
	offset?: number;
	onVisible?: (element: HTMLElement) => void;      // v2.0.0+
	sentinelColor?: string;                          // v2.0.0+
	sentinelId?: string;                             // v2.0.0+
}
```

---

## 📖 Examples

### Staggered Animations

```svelte
<script>
	import runeScroller from 'rune-scroller';
	import 'rune-scroller/animations.css';

	const items = [
		{ title: 'Feature 1', description: 'Description 1' },
		{ title: 'Feature 2', description: 'Description 2' },
		{ title: 'Feature 3', description: 'Description 3' }
	];
</script>

<div class="grid">
	{#each items as item}
		<div use:runeScroller={{ animation: 'fade-in-up', duration: 800 }}>
			<h3>{item.title}</h3>
			<p>{item.description}</p>
		</div>
	{/each}
</div>
```

### Hero Section

```svelte
<div use:runeScroller={{ animation: 'fade-in-down', duration: 1000 }}>
	<h1>Welcome</h1>
</div>

<div use:runeScroller={{ animation: 'fade-in-up', duration: 1200 }}>
	<p>Engaging content</p>
</div>

<div use:runeScroller={{ animation: 'zoom-in', duration: 1000 }}>
	<button>Get Started</button>
</div>
```

---

## 🔗 Links

- **npm Package**: [rune-scroller](https://www.npmjs.com/package/rune-scroller)
- **GitHub**: [lelabdev/rune-scroller](https://github.com/lelabdev/rune-scroller)
- **Changelog**: [CHANGELOG.md](https://github.com/lelabdev/rune-scroller/blob/main/lib/CHANGELOG.md)

---

## 📄 License

MIT © [ludoloops](https://github.com/ludoloops)

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR on GitHub.

```bash
# Development
bun install
bun run dev
bun test
bun run build
```

---

Made with ❤️ by [LeLab.dev](https://lelab.dev)
