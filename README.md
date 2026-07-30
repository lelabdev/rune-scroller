# ⚡ Rune Scroller

<div align="center">
	<img src="./logo.png" alt="Rune Scroller Logo" width="200" />
</div>

**Lightweight scroll animations for the DOM. Svelte-first, framework-neutral core.**

Built with native IntersectionObserver — zero JS on scroll and GPU-accelerated. Requires a browser with [IntersectionObserver support](https://caniuse.com/intersectionobserver).

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

## Installation

### Quick Start

### Svelte 5 (recommended)

```bash
npm install rune-scroller
```

```svelte
<script>
	import 'rune-scroller/animations.css';
	import rs from 'rune-scroller/svelte';
</script>

<div use:rs={{ animation: 'fade-up' }}>Animates on scroll</div>
```

The stylesheet import is always explicit — Rune Scroller never injects CSS automatically, which keeps it safe in Node and edge SSR runtimes.

### Vanilla JS (framework-neutral core)

The root entry exposes a plain `animate(element, options)` API that works in any framework or with no framework at all. It is free of Svelte runtime imports.

```js
import "rune-scroller/animations.css";
import { animate } from "rune-scroller";

const element = document.querySelector("#hero");
const animation = animate(element, { animation: "fade-up" });

// Update with a complete new option set (replacement semantics)
animation.update({ animation: "zoom-in", duration: 800 });

// Release observers and restore DOM state
animation.destroy();
```

### Other frameworks

`animate` is plain DOM, so it works in React, Vue, Angular, or any setup that can hand it an `HTMLElement`. Call `animate(node, options)` on mount and `animation.destroy()` on unmount. For a first-class, rune-based experience, Svelte consumers use the dedicated `rune-scroller/svelte` entry.

---

## ✨ Features

- **Svelte-first, framework-neutral core** — Native Svelte 5 action plus a Vanilla `animate` API
- **Zero dependencies** — Pure JS + native IntersectionObserver
- **Bundle size** — Current minified and gzip figures are published by Bundlephobia above
- **29 primary animations + 7 legacy aliases** — Fade, Zoom, Flip, Slide, Bounce
- **Zero JS on scroll** — Browser handles detection natively
- **TypeScript support** — Full type definitions for the core and the Svelte entry
- **SSR-ready** — SvelteKit, Next.js, Nuxt compatible
- **GPU-accelerated** — CSS transforms via `translate3d`
- **Accessible** — Respects `prefers-reduced-motion`
- **No wrapper divs** — Your layouts stay intact

## How It Works

1. The animated element is observed directly with `IntersectionObserver`.
2. When it enters the viewport, the `is-visible` class triggers its CSS transition.
3. Positive `offset` values extend the viewport bottom, triggering animations earlier while scrolling down.
4. `debug: true` adds a visual sentinel indicator only; it does not affect observation.

**No wrapper divs** — the original element is observed directly, so flex and grid layouts stay intact.

---

## 🎨 Available Animations (29 primary + 7 legacy aliases)

### Fade (9)

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

### Legacy aliases (7)

These v2.x names still work and map to a primary animation: `fade-in`, `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`, `flip`, `flip-x`.

### Customizable distance

Directional travel distance is controlled by the `--rs-distance` CSS variable (default: `100px`). Only animations that move along an axis honor it:

**Honors `--rs-distance`:**

- Directional/diagonal fades: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-right`, `fade-up-left`, `fade-down-right`, `fade-down-left`
- Directional zooms: `zoom-in-up` / `zoom-in-down` / `zoom-in-left` / `zoom-in-right`, `zoom-out-up` / `zoom-out-down` / `zoom-out-left` / `zoom-out-right`
- `slide-rotate`
- Legacy directional fades: `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`

**Does not use `--rs-distance`:**

- Opacity-only: `fade`, `fade-in`
- Scale-only: `zoom-in`, `zoom-out`
- Slide family (`slide-up` / `slide-down` / `slide-left` / `slide-right`) — uses `100%` translates
- Flip family (`flip-left` / `flip-right` / `flip-up` / `flip-down`, legacy `flip`, `flip-x`) — fixed angles
- `bounce-in` — scale keyframes

```html
<div style="--rs-distance: 200px" data-animation="fade-up">Farther slide</div>
```

---

## ⚙️ Options

Both the Svelte action and `animate` accept the same options. `update()` receives the **complete** new option set — options you remove are no longer retained.

```typescript
interface AnimateOptions {
  animation?: AnimationType; // default: 'fade-in'
  duration?: number; // ms; default: 400
  delay?: number; // ms; default: 0
  easing?: string; // CSS timing function; default: 'ease'
  repeat?: boolean; // re-run on leave/re-enter; default: false
  debug?: boolean; // visual trigger indicator only; default: false
  offset?: number; // px added to viewport bottom margin; positive = earlier; default: 0
  // separate from calculateRootMargin()'s 0–100 percentage helper
  threshold?: number | number[]; // IntersectionObserver threshold; default: 0
  rootMargin?: string; // if set, overrides the margin derived from offset
  // default when omitted: `0px 0px ${offset}px 0px`
  observerTarget?: HTMLElement; // observe this node instead of the animated element
  sentinelColor?: string; // debug indicator color; default: '#00e0ff'
  sentinelId?: string; // debug indicator id
  debugLabel?: string; // debug indicator label
  onVisible?: (el: HTMLElement) => void; // after `is-visible` is added
  onHidden?: (el: HTMLElement) => void; // repeat mode only; after `is-visible` is removed
}

interface AnimateHandle {
  update(newOptions?: AnimateOptions): void; // complete replacement
  destroy(): void;
}
```

---

## Intersection behavior

Only one active `animate()` handle is supported per element. The first handle owns the element: only its `update` / `destroy` run. A second `animate()` / `rs` call on the same node returns a no-op handle — destroy the owner before creating a new one.

The `animate` action and core use pixel-based observer offsets. `offset: 120` adds `120px` to the viewport bottom margin and triggers earlier. `threshold` defaults to `0`, and `rootMargin` defaults to the margin derived from `offset` (`0px 0px 0px 0px` when no offset is provided).

Invalid `animation` values fall back to `'fade-in'` (with a dev-only console warning). `bounce-in` ignores `easing` / `--easing` and always uses `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (see `animations.css`).

`calculateRootMargin()` is a separate percentage-based helper: its `offset` argument ranges from `0` to `100` and returns a percentage root margin. The Svelte intersection composables use their own defaults (`threshold: 0.5` and `rootMargin: '-10% 0px -10% 0px'`); their options are reactive when passed as a Svelte state object.

## 📚 API Reference

```typescript
// Framework-neutral core (default + named)
import animate, { animate as animateCore } from "rune-scroller";
import { ANIMATION_TYPES, calculateRootMargin } from "rune-scroller";

// Svelte action and rune composables
import rs from "rune-scroller/svelte";
import {
  runeScroller,
  useIntersection,
  useIntersectionOnce,
} from "rune-scroller/svelte";

// Types
import type {
  AnimationType,
  AnimateOptions,
  AnimateHandle,
  IntersectionOptions,
  UseIntersectionReturn,
} from "rune-scroller";
// IntersectionOptions / UseIntersectionReturn are also valid from "rune-scroller/svelte"
```

### Intersection composables

`useIntersection` and `useIntersectionOnce` live on the Svelte entry. Bind a target by assigning the DOM node to `intersection.element` (getter/setter); assign `null` to stop observing. Defaults differ from `animate`: `threshold: 0.5`, `rootMargin: '-10% 0px -10% 0px'`, `root: null`. Options are reactive when passed as a Svelte `$state` object (the effect re-subscribes). Cleanup runs on unmount or when `element` is cleared.

- `useIntersection(options?, onVisible?)` — `onVisible(isVisible: boolean)` fires on every enter/leave transition (not once).
- `useIntersectionOnce(options?)` — no callback parameter; unobserves after the first intersect; `isVisible` stays `true` after the first enter.

```svelte
<script>
  import { useIntersection, useIntersectionOnce } from "rune-scroller/svelte";

  let node = $state(null);
  const intersection = useIntersection({}, (visible) => {
    /* boolean on each enter/leave */
  });
  const once = useIntersectionOnce();

  $effect(() => {
    intersection.element = node;
    once.element = node;
  });
</script>

<div bind:this={node}>
  visible: {intersection.isVisible}
  once: {once.isVisible}
</div>
```

---

## 🧪 Development

```bash
bun run test
bun run check
bun run lint
bun run build
```

Browser tests require Playwright's Chromium runtime once per machine:

```bash
bunx playwright install chromium
bunx playwright test
```

## 📖 Examples

### Staggered Animations (Svelte)

```svelte
<script>
	import rs from 'rune-scroller/svelte';
	const items = ['Item 1', 'Item 2', 'Item 3'];
</script>

{#each items as item, i}
	<div use:rs={{ animation: 'fade-up', duration: 800, delay: i * 100 }}>
		{item}
	</div>
{/each}
```

### Hero Section (Vanilla)

```js
import { animate } from "rune-scroller";

animate(document.querySelector("h1"), {
  animation: "fade-down",
  duration: 1000,
});
animate(document.querySelector("p"), { animation: "fade-up", duration: 1200 });
animate(document.querySelector("button"), {
  animation: "zoom-in",
  duration: 800,
});
```

---

## ♿ Accessibility

Respects `prefers-reduced-motion` — animations are disabled automatically.

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
