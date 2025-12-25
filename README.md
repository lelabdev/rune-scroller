# ⚡ Rune Scroller

<div align="center">
	<img src="./logo.png" alt="Rune Scroller Logo" width="200" />
</div>

**Lightweight scroll animations for Svelte 5** — Built with Svelte 5 Runes and IntersectionObserver API.

> 🚀 **Open Source** by [ludoloops](https://github.com/ludoloops) at [LeLab.dev](https://lelab.dev)
> 📜 Licensed under **MIT**

---

## ✨ Features

- **~3.4KB gzipped** (11.5KB uncompressed) - Minimal overhead
- **Zero dependencies** - Pure Svelte 5 + IntersectionObserver
- **14 animations** - Fade, Zoom, Flip, Slide, Bounce variants
- **Full TypeScript support** - Type definitions generated from JSDoc
- **SSR-ready** - SvelteKit compatible
- **GPU-accelerated** - Pure CSS transforms
- **Accessible** - Respects `prefers-reduced-motion`

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
</script>

<slot />
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
- `fade-in-up` - Fade + move up 100px
- `fade-in-down` - Fade + move down 100px
- `fade-in-left` - Fade + move from right
- `fade-in-right` - Fade + move from left

### Zoom (5)
- `zoom-in` - Scale from 0.6 to 1
- `zoom-out` - Scale from 1.2 to 1
- `zoom-in-up` - Zoom + move up
- `zoom-in-left` - Zoom + move from right
- `zoom-in-right` - Zoom + move from left

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
	duration?: number;          // Duration in ms (default: 2000)
	repeat?: boolean;           // Repeat on scroll (default: false)
	debug?: boolean;            // Show sentinel as visible line (default: false)
	offset?: number;            // Sentinel offset in px (default: 0, negative = above)
}
```

### Option Details

- **`animation`** - Type of animation to play. Choose from 14 built-in animations listed above.
- **`duration`** - How long the animation lasts in milliseconds (default: 2000ms).
- **`repeat`** - If `true`, animation plays every time sentinel enters viewport. If `false`, plays only once.
- **`debug`** - If `true`, displays the sentinel element as a visible cyan line below your element. Useful for seeing exactly when animations trigger.
- **`offset`** - Offset of the sentinel in pixels. Positive values move sentinel down (delays animation), negative values move it up (triggers earlier). Useful for large elements where you want animation to trigger before the entire element is visible.

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
```

---

## 🔧 Advanced Usage

### Using the `animate` Action (Direct Control)

For advanced use cases, use `animate` for fine-grained IntersectionObserver control:

```svelte
<script>
	import { animate } from 'rune-scroller';
	import 'rune-scroller/animations.css';
</script>

<div use:animate={{
	animation: 'fade-in-up',
	duration: 1000,
	delay: 200,
	threshold: 0.5,
	offset: 20,
	once: true
}}>
	Advanced control
</div>
```

**Options:**
- `threshold` - Intersection ratio to trigger (0-1)
- `offset` - Viewport offset percentage (0-100)
- `rootMargin` - Custom IntersectionObserver margin
- `delay` - Animation delay in ms
- `once` - Trigger only once

### Using Composables

```svelte
<script>
	import { useIntersectionOnce } from 'rune-scroller';
	import 'rune-scroller/animations.css';

	const intersection = useIntersectionOnce({ threshold: 0.5 });
</script>

<div
	bind:this={intersection.element}
	class="scroll-animate"
	class:is-visible={intersection.isVisible}
	data-animation="fade-in-up"
>
	Manual control over intersection state
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

**Why sentinels?**
- Accurate timing across all screen sizes
- No complex offset calculations
- Handles staggered animations naturally

---

## 🌐 SSR Compatibility

Works seamlessly with SvelteKit. Import CSS in your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import 'rune-scroller/animations.css';
</script>

<slot />
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

### Main Export

```typescript
// Default export (recommended)
import runeScroller from 'rune-scroller';

// Named exports
import {
	animate,                    // Alternative action
	useIntersection,            // Composable
	useIntersectionOnce,        // Composable
	calculateRootMargin         // Utility
} from 'rune-scroller';

// Types
import type {
	AnimationType,
	RuneScrollerOptions,
	AnimateOptions,
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
}

interface AnimateOptions {
	animation?: AnimationType;
	duration?: number;
	delay?: number;
	threshold?: number;
	rootMargin?: string;
	offset?: number;
	once?: boolean;
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
- **Documentation**: [CLAUDE.md](./CLAUDE.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 License

MIT © [ludoloops](https://github.com/ludoloops)

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR on GitHub.

```bash
# Development
pnpm install
pnpm dev
pnpm test
pnpm build
```

---

Made with ❤️ by [LeLab.dev](https://lelab.dev)
