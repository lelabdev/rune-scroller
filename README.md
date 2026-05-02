# ⚡ Rune Scroller

<div align="center">
	<img src="./logo.png" alt="Rune Scroller Logo" width="200" />
</div>

**Lightweight scroll animations for Svelte 5** — Built with IntersectionObserver API. Drop-in AOS replacement.

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

- **Zero dependencies** — Pure JS + IntersectionObserver
- **~5KB gzipped** — Half the size of AOS
- **30 animations** — Fade, Zoom, Flip, Slide, Bounce
- **AOS compatible** — Drop-in replacement, same `data-aos` attributes
- **TypeScript support** — Full type definitions
- **SSR-ready** — SvelteKit compatible
- **GPU-accelerated** — CSS transforms via `translate3d`
- **Accessible** — Respects `prefers-reduced-motion`

### AOS vs rune-scroller

|                           | rune-scroller                          | AOS                                        |
| ------------------------- | -------------------------------------- | ------------------------------------------ |
| **Bundle size (gzipped)** | **~5.1KB** JS+CSS                      | ~11KB JS+CSS                               |
| **Dependencies**          | **0**                                  | lodash.throttle, lodash.debounce           |
| **Scroll detection**      | **IntersectionObserver** (native, C++) | Scroll event + throttle (JS)               |
| **Per-scroll cost**       | **0** — browser handles it             | Iterates ALL elements every 99ms           |
| **Layout reads**          | **1 per element** (init only)          | `offsetParent` loop per element per scroll |
| **Resize handling**       | **ResizeObserver** (native)            | debounced scroll recalc                    |
| **100 animated elements** | **~0ms per scroll**                    | ~2-5ms per scroll (layout thrashing)       |
| **Animations**            | 30                                     | 28                                         |
| **Framework**             | Any (Svelte action + AOS mode)         | Vanilla JS                                 |

The key difference: **AOS runs JavaScript on every scroll event** for every element. rune-scroller delegates detection to the browser's native IntersectionObserver — zero JS execution until an element actually enters the viewport.

---

## 📦 Installation

```bash
npm install rune-scroller
```

### SvelteKit Setup

**1.** Install the package:

```bash
npm install rune-scroller
```

**2.** Use in any `.svelte` component:

```svelte
<script>
	import rs from 'rune-scroller';
</script>

<div use:rs={{ animation: 'fade-up' }}>
	Animates on scroll
</div>
```

That's it. CSS is auto-imported. No layout changes needed — use it wherever you want.

### AOS Drop-in Setup

**1.** Install:

```bash
npm install rune-scroller
```

**2.** Initialize in your app entry point:

```js
// src/app.html (SvelteKit) or main.js (Vite) or index.js
import AOS from "rune-scroller/aos";
AOS.init();
```

**3.** Add `data-aos` attributes to your HTML:

```html
<div data-aos="fade-up" data-aos-duration="800">Animated</div>
```

### Replacing AOS

```bash
npm uninstall aos
npm install rune-scroller
```

Then change your import:

```diff
- import AOS from 'aos';
- import 'aos/dist/aos.css';
+ import AOS from 'rune-scroller/aos';
```

Everything else stays the same. Same `data-aos` attributes, same `init()` options.

---

## 🚀 Quick Start

### Svelte Action (recommended)

```svelte
<script>
	import rs from 'rune-scroller';
</script>

<!-- Simple -->
<div use:rs={{ animation: 'fade-up' }}>
	<h2>Animated Heading</h2>
</div>

<!-- With options -->
<div use:rs={{ animation: 'fade-up', duration: 800, delay: 200 }}>
	<div class="card">Delayed fade</div>
</div>

<!-- Repeat on every scroll -->
<div use:rs={{ animation: 'bounce-in', repeat: true }}>
	<button>Bounces on every scroll</button>
</div>
```

### AOS Drop-in (framework agnostic)

```js
import AOS from "rune-scroller/aos";
AOS.init();
```

```html
<div data-aos="fade-up" data-aos-duration="800">Animated</div>
<div data-aos="zoom-in" data-aos-delay="200">Delayed zoom</div>
```

Replaces `import AOS from 'aos'` — same API, same attributes. Works with any framework.

---

## 🎨 Available Animations

### Fade (10)

- `fade` — Simple opacity fade
- `fade-up` / `fade-down` / `fade-left` / `fade-right` — Fade + translate
- `fade-up-right` / `fade-up-left` / `fade-down-right` / `fade-down-left` — Diagonal fades

### Zoom (10)

- `zoom-in` / `zoom-out` — Scale in/out
- `zoom-in-up` / `zoom-in-down` / `zoom-in-left` / `zoom-in-right` — Zoom + translate
- `zoom-out-up` / `zoom-out-down` / `zoom-out-left` / `zoom-out-right` — Zoom out + translate

### Slide (4)

- `slide-up` / `slide-down` / `slide-left` / `slide-right` — Slide from off-screen

### Flip (4)

- `flip-left` / `flip-right` — 3D flip on Y-axis
- `flip-up` / `flip-down` — 3D flip on X-axis

### Special (2)

- `slide-rotate` — Slide + rotate
- `bounce-in` — Bouncy spring entrance

### Customizable distance

All animations use the `--rs-distance` CSS variable (default: `100px`):

```svelte
<div use:rs={{ animation: 'fade-up' }} style="--rs-distance: 200px">
	Farther slide
</div>
```

---

## ⚙️ Options

### Svelte Action

```typescript
interface RuneScrollerOptions {
  animation?: AnimationType; // Animation name (default: 'fade-up')
  duration?: number; // Duration in ms (default: 400)
  delay?: number; // Delay in ms (default: 0)
  easing?: string; // CSS timing function (default: 'ease')
  repeat?: boolean; // Repeat on scroll (default: false)
  debug?: boolean; // Show sentinel as visible line (default: false)
  offset?: number; // Sentinel offset in px (default: 0, negative = earlier)
  onVisible?: (element: HTMLElement) => void; // Callback when visible
  sentinelColor?: string; // Debug sentinel color (e.g. '#ff6b6b')
  sentinelId?: string; // Custom sentinel ID
}
```

### AOS Mode (data attributes)

| Attribute           | Example         | Description                |
| ------------------- | --------------- | -------------------------- |
| `data-aos`          | `"fade-up"`     | Animation name             |
| `data-aos-duration` | `"800"`         | Duration in ms             |
| `data-aos-delay`    | `"200"`         | Delay in ms                |
| `data-aos-easing`   | `"ease-in-out"` | CSS timing function        |
| `data-aos-offset`   | `"120"`         | Trigger offset in px       |
| `data-aos-once`     | `"true"`        | Animate only once          |
| `data-aos-mirror`   | `"true"`        | Animate on scroll away too |

### AOS init options

```js
AOS.init({
  offset: 120,
  duration: 400,
  delay: 0,
  easing: "ease",
  once: false,
  mirror: false,
  startEvent: "DOMContentLoaded",
});
```

---

## 🎯 How It Works

**Sentinel-based triggering:**

1. Invisible 1px sentinel appended as child of the animated element
2. When sentinel enters viewport, animation triggers via IntersectionObserver
3. Pure CSS transitions (GPU-accelerated via `translate3d`)
4. ResizeObserver auto-repositions sentinel

**No wrapper divs** — the element itself becomes the positioning context. Your flex/grid layouts stay intact.

---

## 🌐 SSR Compatibility

Works seamlessly with SvelteKit. Import in any `.svelte` file — SSR guard included.

---

## ♿ Accessibility

Respects `prefers-reduced-motion` — animations are disabled automatically.

---

## 📚 API Reference

```typescript
// Svelte action (default)
import rs from "rune-scroller";

// Named exports
import {
  runeScroller, // Same as default
  useIntersection, // Composable
  useIntersectionOnce, // Composable (once)
  calculateRootMargin, // Utility
  ANIMATION_TYPES, // Array of all animation names
} from "rune-scroller";

// AOS compatibility
import AOS from "rune-scroller/aos";
AOS.init();
AOS.refresh();
AOS.refreshHard();

// Types
import type { AnimationType, RuneScrollerOptions } from "rune-scroller";
```

---

## 📖 Examples

### Staggered Animations

```svelte
<script>
	import rs from 'rune-scroller';
	const items = ['Item 1', 'Item 2', 'Item 3'];
</script>

{#each items as item, i}
	<div use:rs={{ animation: 'fade-up', duration: 800, delay: i * 100 }}>
		{item}
	</div>
{/each}
```

### Hero Section

```svelte
<h1 use:rs={{ animation: 'fade-down', duration: 1000 }}>Welcome</h1>
<p use:rs={{ animation: 'fade-up', duration: 1200 }}>Subtitle</p>
<button use:rs={{ animation: 'zoom-in', duration: 800 }}>Get Started</button>
```

### AOS Drop-in

```html
<script type="module">
  import AOS from "rune-scroller/aos";
  AOS.init({ duration: 800, once: true });
</script>

<div data-aos="fade-up">Animates on scroll</div>
<div data-aos="zoom-in" data-aos-delay="300">Delayed zoom</div>
```

---

## 🔗 Links

- **npm**: [rune-scroller](https://www.npmjs.com/package/rune-scroller)
- **GitHub**: [lelabdev/rune-scroller](https://github.com/lelabdev/rune-scroller)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 License

MIT © [ludoloops](https://github.com/ludoloops)

---

Made with ❤️ by [LeLab.dev](https://lelab.dev)
