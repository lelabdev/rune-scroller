# ⚡ Rune Scroller

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

- **5.7KB gzipped** (JS+CSS) - Minimal overhead
- **Zero dependencies** - Pure Svelte 5 + IntersectionObserver
- **14 animations** - Fade, Zoom, Flip, Slide, Bounce
- **TypeScript support** - Full type definitions
- **SSR-ready** - SvelteKit compatible
- **GPU-accelerated** - Pure CSS transforms
- **Accessible** - Respects `prefers-reduced-motion`

---

## 📦 Installation

```bash
npm install rune-scroller
```

---

## 🚀 Quick Start

```svelte
<script>
	import runeScroller from 'rune-scroller';
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
  animation?: AnimationType // Animation name (default: 'fade-in')
  duration?: number // Duration in ms (default: 800)
  repeat?: boolean // Repeat on scroll (default: false)
  debug?: boolean // Show sentinel as visible line (default: false)
  offset?: number // Sentinel offset in px (default: 0, negative = earlier)
  onVisible?: (element: HTMLElement) => void // Callback when visible
  sentinelColor?: string // Debug sentinel color (e.g. '#ff6b6b')
  sentinelId?: string // Custom sentinel ID
}
```

### Examples

```svelte
<!-- Basic -->
<div use:runeScroller={{ animation: 'zoom-in' }}>Content</div>

<!-- Custom duration -->
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>Fast</div>

<!-- Repeat mode -->
<div use:runeScroller={{ animation: 'bounce-in', repeat: true }}>Repeats</div>

<!-- Debug mode -->
<div use:runeScroller={{ animation: 'fade-in', debug: true }}>Debug</div>

<!-- Trigger earlier with negative offset -->
<div use:runeScroller={{ animation: 'fade-in-up', offset: -200 }}>
	Triggers 200px before element bottom
</div>

<!-- onVisible callback for analytics -->
<div use:runeScroller={{
	animation: 'fade-in-up',
	onVisible: (el) => {
		window.gtag?.('event', 'section_viewed', { id: el.id });
	}
}}>
	Tracked section
</div>
```

---

## 🎯 How It Works

**Sentinel-based triggering:**

1. Invisible 1px sentinel created below your element
2. When sentinel enters viewport, animation triggers
3. Uses native IntersectionObserver for performance
4. Pure CSS animations (GPU-accelerated)
5. ResizeObserver auto-repositions sentinel

**Why sentinels?**

- Accurate timing across all screen sizes
- No complex offset calculations
- Works with animated elements (transforms don't affect observer)

---

## 🌐 SSR Compatibility

Works seamlessly with SvelteKit:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import runeScroller from 'rune-scroller';
	let { children } = $props();
</script>

{@render children()}
```

---

## ♿ Accessibility

Respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .scroll-animate {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

---

## 📚 API Reference

```typescript
// Default export
import runeScroller from "rune-scroller"

// Named exports
import {
  useIntersection, // Composable
  useIntersectionOnce, // Composable
  calculateRootMargin, // Utility
} from "rune-scroller"

// Types
import type { AnimationType, RuneScrollerOptions } from "rune-scroller"
```

---

## 📖 Examples

### Staggered Animations

```svelte
<script>
	import runeScroller from 'rune-scroller';
	const items = ['Item 1', 'Item 2', 'Item 3'];
</script>

{#each items as item, i}
	<div use:runeScroller={{
		animation: 'fade-in-up',
		duration: 800,
		style: `--delay: ${i * 100}ms`
	}}>
		{item}
	</div>
{/each}
```

### Hero Section

```svelte
<h1 use:runeScroller={{ animation: 'fade-in-down', duration: 1000 }}>Welcome</h1>
<p use:runeScroller={{ animation: 'fade-in-up', duration: 1200 }}>Subtitle</p>
<button use:runeScroller={{ animation: 'zoom-in', duration: 800 }}>Get Started</button>
```

---

## 🔗 Links

- **npm**: [rune-scroller](https://www.npmjs.com/package/rune-scroller)
- **GitHub**: [lelabdev/rune-scroller](https://github.com/lelabdev/rune-scroller)
- **Changelog**: [CHANGELOG.md](https://github.com/lelabdev/rune-scroller/blob/main/lib/CHANGELOG.md)

---

## 📄 License

MIT © [ludoloops](https://github.com/ludoloops)

---

Made with ❤️ by [LeLab.dev](https://lelab.dev)
