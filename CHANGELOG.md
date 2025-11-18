# Changelog

All notable changes to Rune Scroller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-18

### Added

- **Auto-wrapping with `display:contents`** - Automatically wraps elements with position:relative container for sentinel, preventing layout breakage in flex/grid
- **`offset` prop** - Control sentinel position in pixels (negative = trigger earlier, positive = delay trigger)
- Improved documentation with sentinel position details and offset examples

### Fixed

- Sentinel no longer breaks flex/grid layouts
- Wrapper automatically unwraps on component destroy

---

## [0.1.2] - 2025-11-02

### Documentation

- Updated README with detailed sentinel architecture explanation
- Clarified sentinel positioning (absolute, stays fixed during animation)
- Documented automatic parent `position: relative` context handling
- Added debug mode documentation for sentinel visualization (cyan line)
- Improved examples showing accurate sentinel-based triggering mechanism
- Added clarity on why sentinels are superior for scroll-triggered animations

---

## [0.1.0] - 2025-11-02

### Added

- `runeScroller` action as recommended API for sentinel-based animation triggering
- `dom-utils.svelte.ts` module with reusable DOM manipulation utilities
- `repeat` option for `runeScroller` action to support repeating animations
- Memory leak prevention for animations in repeat mode
- Updated `.npmignore` to exclude test files from npm distribution

### Improved

- Extracted repeated DOM manipulation patterns into utility functions
- Fixed observer lifecycle management to properly clean up in all cases
- Enhanced `animate.svelte.ts` to handle dynamic threshold/rootMargin changes
- Optimized sentinel creation using single `cssText` statement
- Reduced code duplication throughout the library

### Performance

- Bundle size further optimized (~3.6 KB reduction from test file exclusion)
- Fewer DOM operations via optimized utility functions
- Better memory efficiency on content-heavy pages with many animations

### Documentation

- Updated README with architecture improvements
- Added section documenting optimizations and performance impact
- Clarified "14 animations" (was previously listed as "14+" or "26+")

---

## [0.0.1] - 2024-10-30

### Added

- Initial release of Rune Scroller
- Svelte 5 scroll animation library with native IntersectionObserver
- `ScrollAnimate` component for one-time animations
- `AnimatedElements` component for repeating animations
- `animate` action for direct DOM element animation
- `useIntersection` and `useIntersectionOnce` composables
- 14+ animation types: fade, zoom, flip, slide, rotate, bounce
- Full TypeScript support with `AnimationType` union types
- Customizable animations with duration, delay, threshold, offset
- GPU-accelerated CSS transforms
- Respects `prefers-reduced-motion` media query
- ~1.9 KB gzipped bundle (52% smaller than AOS)
- Zero external dependencies
- SSR-ready for SvelteKit

### Technical Details

- Factory pattern for `useIntersection` to reduce code duplication
- `BaseAnimated` component consolidating animation logic
- `calculateRootMargin` utility for IntersectionObserver configuration
- Optimized CSS with `will-change` only on visible elements
- Complete type safety with strict TypeScript mode

### Performance

- Native browser IntersectionObserver API
- CSS-based animations (no JavaScript animation loop)
- Lazy loading of animations (only animate visible elements)
- Automatic cleanup on component unmount
- No layout thrashing

---

## Future Releases

### Planned for v0.1.0

- Additional animation presets (elastic, swing, etc.)
- Animation composition utilities
- Web Animations API alternative option
- React wrapper (for cross-framework compatibility)

### Planned for v1.0.0

- Stable API
- Comprehensive browser testing
- Performance benchmarks
- Extended documentation
