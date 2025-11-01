# Changelog

All notable changes to Rune Scroller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
