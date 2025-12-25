# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Rune Scroller** is a lightweight scroll animation library for Svelte 5:
- **~3.4KB gzipped** (11.5KB uncompressed) - minimal overhead
- **Zero dependencies** - pure Svelte 5 + IntersectionObserver
- **14 animations** - Fade, Zoom, Flip, Slide, Bounce variants
- **JSDoc with TypeScript support** - full type coverage via JSDoc annotations
- **SSR-ready** - SvelteKit compatible

Published to npm as [`rune-scroller`](https://www.npmjs.com/package/rune-scroller).

## Quick Commands

```bash
# Install (always use Bun)
bun install

# Development
bun run dev                 # Start Vite dev server
bun run check               # Type checking with jsconfig.json
bun run format              # Format with Prettier
bun run lint                # Lint with ESLint

# Build & Test
bun run build               # Build library (just svelte-package - automatic!)
bun test                    # Run tests (Bun test runner, 46x faster)

# Publishing
npm publish                 # Publish to npm (runs prepublishOnly)
```

## Architecture Overview

### Three Usage APIs

The library provides 3 different ways to use scroll animations, each suited for different use cases:

#### 1. `runeScroller` Action (Recommended - Sentinel-based)
**File:** `src/lib/runeScroller.svelte.js`

**Best for:** Simple, reliable scroll animations with minimal configuration.

**How it works:**
- Creates an invisible sentinel element positioned below the target element
- Uses IntersectionObserver to watch the sentinel, not the element itself
- When sentinel enters viewport, animation triggers on the element
- Automatically wraps element with `display:contents` wrapper to avoid layout issues

**Options:**
- `animation`: AnimationType - Which animation to use
- `duration`: number - Animation duration in ms (default: 800)
- `repeat`: boolean - Repeat animation on every scroll (default: false)
- `debug`: boolean - Show sentinel as visible cyan line (default: false)
- `offset`: number - Sentinel offset in pixels, negative = trigger earlier (default: 0)

**Usage:**
```svelte
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1000, repeat: true }}>
  Content
</div>
```

**Why sentinel-based?**
- More accurate triggering (sentinel stays fixed while element animates)
- Prevents observer confusion when element transforms
- Better for complex animations with large movements

#### 2. `animate` Action (Direct observation)
**File:** `src/lib/animate.svelte.js`

**Best for:** Advanced use cases needing fine-grained control over IntersectionObserver.

**How it works:**
- Observes the element directly (no sentinel)
- One-time animation trigger when element enters viewport
- More control over threshold, rootMargin, offset

**Options:**
- `animation`: AnimationType - Which animation to use
- `duration`: number - Animation duration in ms (default: 800)
- `delay`: number - Animation delay in ms (default: 0)
- `offset`: number - Viewport offset percentage 0-100 (default: undefined)
- `threshold`: number - IntersectionObserver threshold (default: 0)
- `rootMargin`: string - Custom rootMargin (overrides offset)

**Usage:**
```svelte
<div use:animate={{ animation: 'zoom-in', threshold: 0.5, offset: 20 }}>
  Content
</div>
```

**When to use this over runeScroller:**
- Need precise threshold control
- Want to observe element directly instead of sentinel
- Need custom rootMargin configurations
- Building custom animation logic

#### 3. `RuneScroller` Component (JSX-style wrapper)
**File:** `src/lib/RuneScroller.svelte`

**Best for:** Developers who prefer component syntax over actions.

**How it works:**
- Wrapper component around `BaseAnimated.svelte`
- Uses `useIntersection` composables internally
- Observes the wrapper div directly

**Props:**
- `animation`: AnimationType - Which animation to use (default: 'fade-in')
- `duration`: number - Animation duration in ms (default: 800)
- `delay`: number - Animation delay in ms (default: 0)
- `threshold`: number - IntersectionObserver threshold (default: 0.5)
- `rootMargin`: string - Custom rootMargin
- `offset`: number - Viewport offset percentage 0-100
- `repeat`: boolean - Repeat animation (default: false)
- `children`: Snippet - Content to animate

**Usage:**
```svelte
<RuneScroller animation="fade-in-up" duration={1000} repeat>
  <div>Content</div>
</RuneScroller>
```

**Note:** This adds a wrapper `<div>` to the DOM, unlike actions which work on existing elements.

### Core Utilities

**`src/lib/animations.ts`**
- Animation type definitions (14 types)
- `calculateRootMargin()` utility for IntersectionObserver

**`src/lib/animations.css`**
- 14 CSS animations with transforms
- All animations use 300px translation distance
- Base `.scroll-animate` class with opacity: 0
- `.is-visible` class triggers animations
- Respects `prefers-reduced-motion`

**`src/lib/useIntersection.svelte.js`**
- `useIntersection()` - Continuous visibility tracking
- `useIntersectionOnce()` - One-time trigger
- Factory pattern to reduce code duplication
- Uses JSDoc for type annotations

**`src/lib/dom-utils.svelte.js`**
- `setCSSVariables()` - Set --duration and --delay
- `setupAnimationElement()` - Add .scroll-animate class and data-animation
- `createSentinel()` - Create sentinel element for runeScroller action
- Uses JSDoc for type annotations

**`src/lib/types.ts`**
- Centralized TypeScript type definitions
- `RuneScrollerOptions`, `AnimateOptions`, `IntersectionOptions`, `UseIntersectionReturn`
- Used by JSDoc annotations via `@type {import('./types.js').TypeName}`

**`src/lib/BaseAnimated.svelte`**
- Internal component used by `RuneScroller.svelte`
- Handles intersection logic and animation application
- Not exported in public API

### Public API Exports

**File:** `src/lib/index.ts`

```typescript
// Main export (recommended)
export { runeScroller as default } from './runeScroller.svelte.js';

// Alternative action
export { animate } from './animate.svelte.js';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte.js';

// Utilities
export { calculateRootMargin } from './animations';

// Types
export type {
  RuneScrollerOptions,
  AnimateOptions,
  AnimationType,
  IntersectionOptions,
  UseIntersectionReturn
};
```

**Note:** `RuneScroller` component and `BaseAnimated` are NOT exported. Users should use the `runeScroller` action instead.

## Build Process

**Pipeline** (`bun run build`):
1. **`svelte-package`** - Compiles JavaScript/Svelte to `dist/` and generates `.d.ts` from JSDoc
   - Automatically generates TypeScript definitions from JSDoc annotations
   - No custom scripts needed - everything is handled by svelte-package!

**Output:** `dist/` with `.js`, `.svelte.js`, `.d.ts`, `.d.ts.map`, and `animations.css`

**Key Points:**
- Uses `jsconfig.json` (SvelteKit convention for JavaScript projects)
- Type definitions automatically generated from JSDoc comments
- No custom build scripts required (removed fix-dist.js and generate-types.js)
- Follows SvelteKit best practices exactly

**Known Issue:** Test files (`*.test.js`, `*.test.d.ts`) are currently included in `dist/`. See TODO.md for fix.

## 14 Available Animations

All animations use **300px** translation distance:

**Fade (5):**
- `fade-in` - Simple opacity fade
- `fade-in-up` - Fade + translateY(300px)
- `fade-in-down` - Fade + translateY(-300px)
- `fade-in-left` - Fade + translateX(-300px)
- `fade-in-right` - Fade + translateX(300px)

**Zoom (5):**
- `zoom-in` - scale(0.3) to scale(1)
- `zoom-out` - scale(2) to scale(1)
- `zoom-in-up` - scale(0.5) + translateY(300px)
- `zoom-in-left` - scale(0.5) + translateX(-300px)
- `zoom-in-right` - scale(0.5) + translateX(300px)

**Special (4):**
- `flip` - rotateY(90deg) perspective flip
- `flip-x` - rotateX(90deg) perspective flip
- `slide-rotate` - translateX(-300px) + rotate(-45deg)
- `bounce-in` - scale(0) with bounce keyframes

## Code Style

**Formatting**
- **Tabs** for indentation
- **Single quotes** for strings
- **No trailing commas**
- **100 character line width**

**JSDoc & Types**
- Strict mode enabled in jsconfig.json
- Bundle module resolution
- Full type coverage via JSDoc annotations (no `any`)
- Use conditional checks instead of non-null assertions (`!`)
- Type definitions in `src/lib/types.ts`
- JSDoc references types via `@type {import('./types.js').TypeName}`

**Svelte 5**
- Runes syntax only (`$state`, `$props()`, `$effect()`)
- No legacy Svelte 4 patterns
- Actions for DOM manipulation
- Snippets for content slots

**CSS**
- All animations in `animations.css`
- Use CSS custom properties (--duration, --delay)
- GPU acceleration with `transform` and `opacity` only
- Respect `prefers-reduced-motion`

## Development Workflow

### Adding a New Animation

1. Add animation name to `AnimationType` in `src/lib/animations.ts`
2. Add CSS transforms in `src/lib/animations.css`:
   - Initial state: `[data-animation='name'] { transform: ... }`
   - Final state: `[data-animation='name'].is-visible { transform: ... }`
3. Update animation count in README.md if needed
4. Build and test: `bun run build && bun test`

### Testing Locally

**Option 1:** Use `bun run dev:full` from site directory
- Automatically syncs lib changes to site
- Test in browser at http://localhost:5173

**Option 2:** Use `file:` dependency in test project
```json
{
  "dependencies": {
    "rune-scroller": "file:../rune-scroller-lib"
  }
}
```

### Debugging Sentinel Position

Use `debug: true` option to visualize sentinel:
```svelte
<div use:runeScroller={{ animation: 'fade-in', debug: true }}>
  Content
</div>
```

This shows sentinel as a **cyan line (#00e0ff)** at its exact position.

### Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Run pre-publish checks:
   ```bash
   bun run check && bun run build && bun test
   ```
4. Publish to npm:
   ```bash
   npm publish
   ```
5. Create git tag:
   ```bash
   git tag v1.x.x && git push --tags
   ```

## Common Issues

**Module not found errors**
- Run `bun run build` to regenerate `dist/`
- Verify `dist/index.js` imports have correct extensions
- svelte-package automatically handles `.svelte.js` extensions

**Type errors**
- Run `bun run check` to verify types with jsconfig.json
- Ensure all exports in `src/lib/index.ts` are correct
- Check for non-null assertions (`!`) that should be conditional checks
- Verify JSDoc annotations are correct

**Tests failing**
- Run `bun test` for details
- Check Bun test configuration
- Verify all 14 animation types are defined

**Animation not triggering**
- Ensure CSS is imported: `import 'rune-scroller/animations.css'`
- Check element has `.scroll-animate` class
- Verify `data-animation` attribute is set
- Use `debug: true` to visualize sentinel position

**Sentinel in wrong position**
- Element might be resizing after initial render
- Check if parent has proper positioning context
- Verify `offset` option is set correctly

## Known Limitations

1. **Sentinel doesn't reposition on resize** - Created once at mount with fixed position
2. **No SSR guards** - Actions don't run server-side, but no explicit checks
3. **Test files in dist/** - Currently included in npm package (see TODO.md)
4. **Hardcoded fix-dist.js** - Uses static list of `.svelte.ts` files

See `TODO.md` for planned improvements.
