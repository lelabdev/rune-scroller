# Changelog

All notable changes to Rune Scroller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-01-13

### Added

- **Automatic CSS import** - CSS animations are now included automatically when importing `rune-scroller`
- Simplified getting started experience with single import statement
- Improved DX (Developer Experience) by reducing boilerplate code

### Changed

- Main entry point (`import runeScroller from 'rune-scroller'`) now automatically imports CSS
- Updated all examples and documentation to reflect simplified API
- No breaking changes

### Example

**New simplified usage:**

```svelte
<script>
  import runeScroller from 'rune-scroller';
</script>

<div use:runeScroller={{ animation: 'fade-in-up' }}>
  Content
</div>
```

### Benefits

- One-line import instead of two
- No need to remember separate CSS import
- Zero performance overhead (CSS is bundled)
- Same bundle size (14KB gzipped, 47KB unpacked)
- Better tree-shaking support (CSS is static)
- Cacheable by browser

### Performance

- No performance impact
- Same 14KB gzipped bundle size
- Same runtime performance (1-2ms initialization)

### Migration

No migration needed - change is fully backward compatible.

---

## [2.1.0] - 2026-01-12

### Performance

- **Bundle size optimization** - Reduced from 14.3KB to 12.7KB gzipped (-1.6KB, -11.2%)
- **Unpacked size reduction** - 40.3KB (-7.1KB, -15.0%)
- **CSS optimization** - Migrated to CSS custom properties reducing file from 3.9KB to 2.5KB (-36%)
- **JavaScript optimization** - Reduced from 18KB to 15.8KB (-12%) through JSDoc optimization
- **Production build** - NODE_ENV guards for console warnings, only included in development builds

### Changed

- CSS animations now use CSS custom properties (`--tx`, `--ty`, `--scale`, `--rx`, `--ry`, `--rotate`) for cleaner, more compact output
- JSDoc comments optimized - kept type information, removed verbose descriptions and examples
- Console warnings wrapped with `process.env.NODE_ENV !== 'production'` checks for production builds

### Optimized Files

- `animations.css`: 3.9KB → 2.5KB (-36%, 179 lines → 69 lines)
- `runeScroller.js`: 5.7KB → 5.0KB (-12%)
- `dom-utils.js`: 4.5KB → 3.4KB (-24%)
- `useIntersection.svelte.js`: 2.7KB → 2.2KB (-18%)
- `observer-utils.js`: 1.6KB → 773B (-52%)
- Type definitions (.d.ts): 9.0KB → 6.0KB (-33%)

### No Breaking Changes

- ✅ All 121 tests passing
- ✅ All 14 animations working identically
- ✅ Type definitions fully maintained
- ✅ SSR compatibility preserved
- ✅ Accessibility (prefers-reduced-motion) working perfectly
- ✅ Zero breaking changes to public API

---

## [2.0.0] - 2026-01-05

### Added

- **`onVisible` callback** - Trigger actions when animations become visible (e.g., analytics tracking, lazy loading)
- **ResizeObserver support** - Sentinel automatically repositions when element resizes, perfect for responsive layouts
- **`sentinelColor` prop** - Customize debug sentinel color (e.g., `sentinelColor: '#ff6b6b'` for red)
- **`sentinelId` prop** - Set custom ID or use auto-generated IDs (`sentinel-1`, `sentinel-2`, etc.) for easy element tracking
- **`data-sentinel-id` attributes** - Added to both animated elements and sentinels for bidirectional identification
- **Animation validation** - Invalid animations automatically fallback to `'fade-in'` with console warning
- **Improved error handling** - Clearer console messages for missing CSS imports and configuration issues
- **Comprehensive test suite** - 278 tests with >80% code coverage, including integration tests for sentinel positioning and complex animations
- **Architecture Decision Records** - Documented sentinel-based approach vs. direct observation

### Fixed

- **Sentinel positioning with zoom-in** - Fixed using `offsetHeight` instead of `getBoundingClientRect().height` (was affected by transform scale)
- **Horizontal scroll with sentinel** - Fixed by using `left:0;width:100%` instead of `left:0;right:0` (prevents overflow)
- **Test coverage inadequate** - Created 58 new tests covering all critical scenarios and edge cases

### Changed

- Sentinel positioning logic now uses `offsetHeight` for accurate dimensions
- Sentinel wrapper CSS now uses `width:100%` with `box-sizing:border-box`
- Enhanced debug mode to show sentinel ID when provided

### Breaking Changes

None - fully backward compatible with v1.0.0 APIs.

---

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
- 14 animation types: fade, zoom, flip, slide, rotate, bounce
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
