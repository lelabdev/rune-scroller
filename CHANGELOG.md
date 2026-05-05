# Changelog

All notable changes to Rune Scroller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-05-05

### Breaking Changes

- **Offset sign inverted** — Positive offset now triggers earlier (expands viewport top via `rootMargin`), matching AOS convention. Previously positive offset delayed the trigger.
- **Sentinel removed from observation** — IntersectionObserver now watches the element directly instead of an internal sentinel. This fixes animations being invisible inside `overflow:hidden` containers (e.g. rounded cards with transforms like `fade-up`, `zoom-in-up`).
- **Sentinel only in debug mode** — The invisible sentinel element is no longer created by default. It only appears when `debug: true` is set, serving as a visual indicator.

### Added

- **`delay` option** — `delay: 500` sets `--delay: 500ms` on the element
- **`easing` option** — `easing: 'ease-in-out'` sets `--easing` on the element
- **`threshold` option** — Control IntersectionObserver threshold (default: 0)
- **`rootMargin` support** — Offset is now applied as `rootMargin` on the observer for reliable triggering
- **`anchorPlacement` in AOS layer** — `top-bottom`, `center-center`, `bottom-top` sentinel positioning
- **`mirror` option in AOS layer** — Reverse animation when element exits viewport
- **`disable()` function in AOS layer** — Remove AOS attributes and stop observers
- **`destroy()` function in AOS layer** — Full cleanup for SPA navigation
- **TypeScript types for `/aos` export** — `aos.d.ts` with proper typing
- **55 Playwright E2E tests** — 47 API tests + 8 integration tests on the real landing page
  - Action API: opacity, classes, duration, delay, easing, offset, repeat, onVisible, debug, destroy, 13 animation types, prefers-reduced-motion
  - AOS compat: init, data attributes, once, mirror, global options, disable, destroy, refreshHard, legacy names, multiple elements
  - Landing integration: hydration, hero visibility, scroll triggering, animation validation, no console errors

### Fixed

- **FOUC on init** — Elements no longer animate from `opacity:1` to `opacity:0` when `data-animation` is added dynamically. Transitions are disabled during setup and re-enabled via `requestAnimationFrame`.
- **`--delay` not overwritten** — `setCSSVariables` no longer overwrites an inherited `--delay` with `0ms` when delay is undefined
- **`getInlineOption` treating `"0"` as falsy** — `data-aos-offset="0"` is now properly respected
- **`will-change` management** — Applied on initial state, released after animation completes
- **Easing indentation bug** — Easing was nested inside duration/delay conditional block

## [3.0.0] - 2026-05-02

### Added

- **AOS compatibility layer** — Drop-in replacement for AOS via `import AOS from 'rune-scroller/aos'`
  - Same `data-aos` attributes: `data-aos`, `data-aos-duration`, `data-aos-delay`, `data-aos-easing`, `data-aos-offset`, `data-aos-once`, `data-aos-mirror`
  - `init()`, `refresh()`, `refreshHard()` API
  - MutationObserver for dynamic content
- **30 animations** (up from 14)
  - New fade: `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-right`, `fade-up-left`, `fade-down-right`, `fade-down-left`
  - New zoom: `zoom-in-down`, `zoom-out`, `zoom-out-up`, `zoom-out-down`, `zoom-out-left`, `zoom-out-right`
  - New slide: `slide-up`, `slide-down`, `slide-left`, `slide-right`
  - New flip: `flip-left`, `flip-right`, `flip-up`, `flip-down`
  - Legacy aliases preserved: `fade-in` → `fade`, `fade-in-up` → `fade-up`, etc.
- **CSS custom properties**: `--rs-distance` (animation distance), `--easing` (timing function)
- **No wrapper div** — Sentinel is now a child of the animated element, preserving flex/grid layouts
- **`rs` shorthand** — `import rs from 'rune-scroller'` + `use:rs`

### Changed

- Removed `process.env.NODE_ENV` — was crashing in browser contexts without bundler
- Sentinel appended as child of element instead of wrapping in `<div>`
- Animation distance changed from 300px to 100px (configurable via `--rs-distance`)
- Default duration changed from 2500ms to 400ms

### Removed

- **Breaking**: Wrapper `<div>` no longer injected around animated elements
- **Breaking**: Animation names `fade-in-*` are now `fade-*` (legacy aliases still work)

## [2.2.0] - 2026-01-13

### Added

- **Automatic CSS import** - CSS animations are now included automatically when importing `rune-scroller`
- Simplified getting started experience with single import statement
- Improved DX (Developer Experience) by reducing boilerplate code

## [2.1.0] - 2026-01-12

### Performance

- **Bundle size optimization** - Reduced from 14.3KB to 12.7KB gzipped (-1.6KB, -11.2%)

## [2.0.0] - 2026-01-05

### Added

- **`onVisible` callback** - Trigger actions when animations become visible
- **ResizeObserver support** - Sentinel automatically repositions when element resizes

## [1.0.0] - 2025-11-18

### Added

- **Auto-wrapping with `display:contents`** - Prevents layout breakage in flex/grid
- **`offset` prop** - Control sentinel position

## [0.1.0] - 2025-11-02

### Added

- `runeScroller` action, `repeat` option, memory leak prevention

## [0.0.1] - 2024-10-30

### Added

- Initial release — 14 animations, IntersectionObserver, Svelte 5, TypeScript, ~1.9KB gzipped
