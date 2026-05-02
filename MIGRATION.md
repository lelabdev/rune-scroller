# Migration Guide: Rune Scroller v2 → v3

## Overview

Rune Scroller v3.0 is a major release with new features and some breaking changes. The core API remains the same — most users can upgrade without changing anything.

## What's New ✨

### AOS Compatibility

Drop-in replacement for AOS. Same HTML attributes, same API:

```js
// Before (AOS)
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

// After (rune-scroller)
import AOS from 'rune-scroller/aos';
AOS.init();
```

### 30 Animations

14 → 30 animations. New: slide-*, fade diagonals, zoom-out variants, flip-* (AOS naming).

### No Wrapper Div

Elements are no longer wrapped in a `<div>`. The sentinel is appended as a child. This fixes flexbox/grid layout issues.

### Shorthand Import

```svelte
import rs from 'rune-scroller'
<div use:rs={{ animation: 'fade-up' }}>
```

## Breaking Changes 🚨

### 1. Animation Names (Soft Breaking)

New names follow AOS convention:

| v2 (still works) | v3 (recommended) |
|-------------------|-------------------|
| `fade-in` | `fade` |
| `fade-in-up` | `fade-up` |
| `fade-in-down` | `fade-down` |
| `fade-in-left` | `fade-left` |
| `fade-in-right` | `fade-right` |
| `flip` | `flip-left` |
| `flip-x` | `flip-up` |

Old names still work as aliases.

### 2. No Wrapper Div

The wrapper `<div>` is no longer injected. The element itself becomes `position: relative` and the sentinel is appended as a child.

**If you were targeting the wrapper** (unlikely), update your selectors.

### 3. Default Duration

Changed from 2500ms to 400ms. If you relied on the slow default, set `duration: 2500` explicitly.

### 4. Animation Distance

Changed from 300px to 100px. Customizable via `--rs-distance`:

```css
:root { --rs-distance: 300px; }
```

## Migration Checklist

- [ ] `npm install rune-scroller@3.0.0`
- [ ] Existing code works without changes (legacy aliases)
- [ ] Optional: Update animation names to new convention
- [ ] Optional: Use `import rs from 'rune-scroller'` for shorter syntax
- [ ] Optional: Replace AOS with `rune-scroller/aos`

---

Questions? Open an issue on [GitHub](https://github.com/lelabdev/rune-scroller/issues).
