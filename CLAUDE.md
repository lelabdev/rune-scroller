# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Rune Scroller** is a lightweight scroll animation library for Svelte 5:
- **~2KB gzipped** - minimal overhead
- **Zero dependencies** - pure Svelte 5 + IntersectionObserver
- **14 animations** - Fade, Zoom, Flip, Slide, Bounce variants
- **TypeScript** - full type coverage
- **SSR-ready** - SvelteKit compatible

Published to npm as [`rune-scroller`](https://www.npmjs.com/package/rune-scroller).

## Quick Commands

```bash
# Install (always use pnpm)
pnpm install

# Development
pnpm dev                    # Start Vite dev server
pnpm check                  # TypeScript type checking
pnpm format                 # Format with Prettier
pnpm lint                   # Lint with ESLint

# Build & Test
pnpm build                  # Build library (svelte-package + fix-dist)
pnpm test                   # Run tests (Vitest)

# Publishing
npm publish                 # Publish to npm (runs prepublishOnly)
```

## Architecture

**Main API** - `src/lib/runeScroller.svelte.ts`
- Sentinel-based scroll action (default export)
- Options: `animation`, `duration`, `repeat`, `debug`

**Alternative API** - `src/lib/animate.svelte.ts`
- Direct element observation (advanced use)
- Options: `delay`, `offset`, `threshold`, `rootMargin`

**Core Utilities**
- `src/lib/animations.ts` - Animation types & configuration
- `src/lib/animations.css` - 14 CSS keyframe animations
- `src/lib/useIntersection.svelte.ts` - IntersectionObserver composables
- `src/lib/dom-utils.svelte.ts` - DOM manipulation utilities
- `src/lib/types.ts` - TypeScript type definitions

**Public API** - `src/lib/index.ts`
```typescript
// Main export
export { runeScroller as default } from './runeScroller.svelte';

// Alternative exports
export { animate } from './animate.svelte';
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte';
export { calculateRootMargin } from './animations';

// Types
export type { RuneScrollerOptions, AnimateOptions, AnimationType, ... };
```

## Build Process

**Pipeline** (`pnpm build`):
1. **`svelte-package`** - Compiles TypeScript/Svelte to `dist/`
2. **`scripts/fix-dist.js`** - Fixes ES module imports
   - Adds `.svelte.js` extension to `.svelte` imports
   - Adds `.js` extension to TypeScript module imports
   - Ensures ES module compliance

**Output**: `dist/` with `.js`, `.svelte.js`, `.d.ts`, and `animations.css`

## Code Style

**Formatting**
- **Tabs** for indentation
- **Single quotes** for strings
- **No trailing commas**
- **100 character line width**

**TypeScript**
- Strict mode enabled
- Bundle module resolution

**Svelte 5**
- Runes syntax only (`$state`, `$props()`, `$effect()`)
- No legacy Svelte 4 patterns

## Development Workflow

### Adding a New Animation

1. Add animation name to `AnimationType` in `src/lib/animations.ts`
2. Add `@keyframes` in `src/lib/animations.css`
3. Build and test: `pnpm build && pnpm test`

### Testing Locally

Use `file:` dependency in test project:
```json
{
  "dependencies": {
    "rune-scroller": "file:../rune-scroller"
  }
}
```

### Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `pnpm check && pnpm build && pnpm test`
4. Run `npm publish`
5. Tag: `git tag v0.x.x && git push --tags`

## Common Issues

**Module not found errors**
- Run `pnpm build` to regenerate `dist/` with fixed imports
- Check `scripts/fix-dist.js` is adding `.js` extensions

**Type errors**
- Run `pnpm check` to verify TypeScript
- Ensure all exports in `src/lib/index.ts` are correct

**Tests failing**
- Run `pnpm test` for details
- Check Vitest configuration in `vite.config.ts`
