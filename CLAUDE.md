# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rune Scroller** is a lightweight, high-performance scroll animation library for Svelte 5. It delivers scroll-triggered animations with:
- **~2KB gzipped bundle** - minimal overhead
- **Zero dependencies** - pure Svelte 5 + IntersectionObserver API
- **14 built-in animations** - Fade, Zoom, Flip, Slide, Bounce variants
- **TypeScript** - full type coverage with strict mode
- **SSR-ready** - SvelteKit compatible with no DOM access during hydration

Published to npm as [`rune-scroller`](https://www.npmjs.com/package/rune-scroller).

## Quick Commands

```bash
# Install dependencies (always use pnpm)
pnpm install

# Development
pnpm dev                    # Start Vite dev server
pnpm check                  # TypeScript type checking
pnpm check:watch            # Watch mode for type checking

# Code quality
pnpm format                 # Format with Prettier
pnpm lint                   # Lint with ESLint + Prettier check

# Testing & Building
pnpm test                   # Run tests (Vitest) with --run
pnpm build                  # Build library for npm (svelte-package + fix-dist)
pnpm preview                # Preview built library

# Publishing (when ready)
npm publish                 # Publish to npm (runs prepublishonly)
```

## Architecture

The library is organized in **layered architecture** with clear separation of concerns:

### Bottom Layer - Core Utilities

**`src/lib/animations.ts`** - Animation configuration & validation
- Defines `AnimationType` with all 14 animation names (fade-*, zoom-*, flip, flip-x, slide-rotate, bounce-in)
- Exports animation metadata and validation functions
- Zero runtime overhead - pure type & constant definitions

**`src/lib/useIntersection.svelte.ts`** - IntersectionObserver composables
- `useIntersectionOnce()` - Triggers callback once when element enters viewport, then unobserves
- `useIntersection()` - Triggers on every intersection change (enter/exit)
- Returns reactive `{ element, isVisible }` state
- Uses Svelte 5 runes for state management

**`src/lib/dom-utils.svelte.ts`** - Reusable DOM utilities
- `setCSSVariables()` - Sets `--duration` and `--delay` CSS custom properties
- `setupAnimationElement()` - Adds `scroll-animate` class and `data-animation` attribute
- `createSentinel()` - Creates invisible (or visible in debug mode) sentinel element for animation triggering

### Top Layer - Consumer APIs

**`src/lib/runeScroller.svelte.ts`** - **Recommended main action**
- Uses **sentinel-based triggering** - places invisible sentinel below element
- Triggers animation when sentinel enters viewport (not the element itself)
- Advantages: Precise timing, consistent across layouts, handles staggering naturally
- Supports both one-time (default) and repeating animations
- Key options: `animation`, `duration`, `repeat`, `debug`

**`src/lib/animate.svelte.ts`** - Alternative action for direct DOM control
- Triggers on element itself (not sentinel)
- Supports advanced options: `delay`, `offset`, `threshold`, `rootMargin`
- Use when you need fine-grained IntersectionObserver control
- More complex API, recommended for advanced use cases

**`src/lib/useIntersectionReturn`** - Reactive composable alternative (exported in index.ts)
- For use cases where you need direct control over state vs. automatic class application

### Styles

**`src/lib/animations.css`** - All animation keyframes
- 14 GPU-accelerated CSS animations
- Uses `--duration` and `--delay` CSS variables for customization
- No JavaScript animation loop - pure CSS transforms
- Applied when `is-visible` class is added via JavaScript

### Types

**`src/lib/types.ts`** - Centralized type definitions
- `RuneScrollerOptions` - runeScroller action options
- `AnimateOptions` - animate action options
- `IntersectionOptions` - IntersectionObserver configuration
- `UseIntersectionReturn` - Composable return type

**`src/lib/index.ts`** - Entry point and public API
- Exports recommended action as default: `runeScroller`
- Exports alternative APIs and composables
- Exports type definitions for consumers

## Development Workflow

### Adding a New Animation

1. **Define animation type** in `src/lib/animations.ts`
   - Add animation name to `AnimationType` union
   - Update metadata/validation functions if needed

2. **Add CSS keyframes** in `src/lib/animations.css`
   - Define `@keyframes` for the animation
   - Use CSS variables: `var(--duration)` and `var(--delay)`
   - Ensure GPU acceleration with `transform` and `opacity`

3. **Test locally**
   - `pnpm build` to build the library
   - Use in the demo site: `cd ../rune-scroller-site && pnpm dev:full`
   - Verify animation in browser

4. **Run tests**
   - `pnpm test` to ensure type coverage and existing tests pass

### Code Style & Standards

**Indentation & Formatting**
- **Tabs** for indentation (not spaces)
- **Single quotes** for strings
- **No trailing commas**
- **100 character line width**
- Configured via Prettier (no `.prettierrc` - uses package.json config via plugin defaults)

**TypeScript**
- **Strict mode enabled** in `tsconfig.json`
- **Bundle module resolution** for optimal tree-shaking
- ESLint rules with TypeScript ESLint recommended config
- `no-undef` disabled (TypeScript handles it)

**Components & Actions**
- Svelte 5 runes syntax only (`$state`, `$props()`, `$effect()`)
- Props using `$props()` with destructuring
- No legacy Svelte 4 patterns

**File Naming**
- `.svelte.ts` for action files (compiled to `.svelte.js` in dist)
- `.test.ts` for test files
- Regular `.ts` for utilities and types

### Testing

Tests are in Vitest with server-side Node.js environment:

```bash
pnpm test                           # Run all tests with --run
pnpm test:unit -- --watch          # Watch mode
```

Test files: `src/lib/**/*.test.ts`
- `animations.test.ts` - Animation type validation and configuration
- `scroll-animate.test.ts` - Component behavior tests

## Build Process

**Build Pipeline** (`pnpm build`):
1. **`svelte-package`** - SvelteKit's library packaging tool
   - Compiles Svelte components and TypeScript
   - Outputs to `dist/`
   - Generates type definitions (`.d.ts`)

2. **`node scripts/fix-dist.js`** - Custom post-build script
   - Rewrites `.svelte.ts` imports to `.svelte.js` (required for ES modules)
   - Ensures dist/index.js exports correctly

3. **Output files**:
   - `dist/index.js` - Main library export
   - `dist/index.d.ts` - TypeScript definitions
   - `dist/animations.css` - Animation styles
   - Other compiled modules

## Publishing & Distribution

**npm Configuration** (in `package.json`):
- **Exports map** for modern module resolution:
  - `.` → `dist/index.js` (with TypeScript types)
  - `./animations.css` → `dist/animations.css` (styles import)
- **Files array** - only `dist/` included in published package
- **sideEffects: false** - enables tree-shaking

**Pre-publish Hook**:
```json
"prepublishonly": "pnpm run check && pnpm run build"
```
Runs type checking and build before npm publish.

**npm Ignore** (`.npmignore`):
- Excludes test files from distribution
- Reduces package size (~3.6 KB savings)

## Intersection Observer Implementation

The library uses native IntersectionObserver API for scroll detection:

**Key concepts**:
- `threshold` (default 0) - fraction of element visible to trigger intersection
- `rootMargin` (default "0px") - expansion area around viewport
- `root` (default null) - uses viewport

**For `runeScroller` sentinel mode**:
- Sentinel is 1px tall, positioned absolutely below element
- Sentinel enters viewport → animation applies to main element
- Supports `repeat: true` for repeating animations on each scroll

**For `animate` action**:
- Triggers on element itself with configurable observer options
- Supports `offset` parameter for custom trigger positioning

## Bundle Size Strategy

**Zero Dependencies Philosophy**:
- No npm dependencies in production
- Pure Svelte 5 + Browser APIs (IntersectionObserver)
- Enables minimal bundled output (~2KB gzipped)

**CSS Animations (not JS)**:
- All animations defined in `animations.css`
- Triggered by class addition, not JavaScript animation loop
- GPU-accelerated via CSS transforms
- Dramatically smaller than JS animation libraries

**Tree-Shaking Friendly**:
- `sideEffects: false` in package.json
- Pure functions and type exports
- Unused animations don't increase bundle size

## Common Development Scenarios

### Fixing a Bug in Animation Timing
1. Check animation implementation in `src/lib/runeScroller.svelte.ts` or `src/lib/animate.svelte.ts`
2. Verify CSS keyframes in `src/lib/animations.css`
3. Test with `pnpm build` then `pnpm preview`
4. Check demo site for visual verification: `cd ../rune-scroller-site && pnpm dev:full`

### Improving Type Safety
1. Update type definitions in `src/lib/types.ts`
2. Run `pnpm check` to verify no type errors
3. Update tests in `src/lib/*.test.ts` if needed
4. Ensure type definitions export correctly: `pnpm build && head dist/index.d.ts`

### Working with Repeat Animations
- Use `repeat: true` option with `runeScroller` action
- Logic in `runeScroller.svelte.ts` removes `is-visible` class when sentinel exits viewport
- Allows animation to play again on next intersection

### Memory Management
- Both action destroy lifecycle hooks properly disconnect observers
- Watch for observer connection state tracking (`observerConnected` flag)
- Tests verify proper cleanup to prevent memory leaks

## Related Resources

**Project Files**:
- `README.md` - User documentation and feature overview
- `CHANGELOG.md` - Version history and release notes
- `package.json` - npm configuration and build scripts

**Demo Site**: Located in sibling directory `../rune-scroller-site/`
- Uses library via npm package or local sync
- Interactive playground for all animations

**External Links**:
- [Svelte 5 Documentation](https://svelte.dev)
- [SvelteKit Documentation](https://kit.svelte.dev)
- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [GitHub Repository](https://github.com/lelabdev/rune-scroller)
