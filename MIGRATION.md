# Migration Guide: Rune Scroller v1 → v2

## Overview

Rune Scroller v2.0 is a major release with breaking changes aimed at improving code quality, maintainability, and user experience.

## What's New in v2.0 ✨

### ✅ New Features
- **`onVisible` callback** - Trigger actions when animations become visible (analytics, lazy loading, etc.)
- **ResizeObserver support** - Sentinel automatically repositions when element resizes
- **`sentinelColor` prop** - Customize debug sentinel color (e.g., `sentinelColor: '#ff6b6b'`)
- **`sentinelId` prop** - Set custom ID or auto-generate IDs for element tracking
- **`data-sentinel-id` attributes** - Added to both elements and sentinels for identification
- **Animation validation** - Invalid animations automatically fallback to `'fade-in'` with warning
- **Improved error handling** - Clearer console messages for configuration issues
- **Comprehensive tests** - 278 tests with >80% code coverage including integration tests
- **Better documentation** - Updated README with v2.0.0 examples and API reference

### ✅ Improvements
- Sentinel positioning fixed for zoom-in animations (now uses `offsetHeight`)
- Horizontal scroll issue fixed (uses `width:100%` instead of `left:0;right:0`)
- Architecture better documented with sentinel vs. direct observation comparison
- More reliable animation triggering across all edge cases

## Breaking Changes 🚨

### 1. Removed Components (Not Exported Anyway)
**Affected if:** You were directly importing internal components
```javascript
// ❌ v1 - Did not work (components not in public API)
import RuneScroller from 'rune-scroller/RuneScroller.svelte';
import BaseAnimated from 'rune-scroller/BaseAnimated.svelte';

// ✅ v2 - Use actions instead (always the recommendation)
import { runeScroller, animate } from 'rune-scroller';
```

**Why the change?** These components added no user value and were never exported in the public API. The library is action-first for better performance and flexibility.

### 2. Type Definition Location Changed
**Affected if:** You were importing `AnimationType` from `animations.js`
```javascript
// ❌ v1
import type { AnimationType } from 'rune-scroller/animations.js';

// ✅ v2
import type { AnimationType } from 'rune-scroller/types.js';
```

**Why the change?** Single source of truth for types. All types now live in `types.js`.

## Migration Checklist

- [ ] Update to v2.0.0: `npm install rune-scroller@2.0.0`
- [ ] No breaking API changes - existing code continues to work
- [ ] Optional: Add `onVisible` callback for analytics/tracking
- [ ] Optional: Use `sentinelColor` and `sentinelId` for better debugging
- [ ] Test in your application to verify animations still trigger correctly
- [ ] Update any custom CSS if you were using `--translate-distance` (still works)

## Feature Migration Examples

### Configurable Animation Distance

```svelte
<!-- v1: Hard-coded 300px animation distance -->
<div use:runeScroller={{ animation: 'fade-in-up' }}>
  Content animates 300px
</div>

<!-- v2: Customize with CSS variable -->
<div
  use:runeScroller={{ animation: 'fade-in-up' }}
  style="--translate-distance: 500px"
>
  Content animates 500px
</div>

<!-- v2: Global default override -->
<style>
  :root {
    --translate-distance: 200px;
  }
</style>
```

### onVisible Callback

```svelte
<!-- v1: No callback support -->
<div use:runeScroller={{ animation: 'fade-in' }}>
  Content
</div>

<!-- v2: New callback for analytics, lazy loading, etc. -->
<div use:runeScroller={{
  animation: 'fade-in',
  onVisible: (el) => {
    console.log('Animation triggered!', el);
    window.gtag?.('event', 'animation_visible', { element: el.id });
  }
}}>
  Tracked animation
</div>
```

### Sentinel Customization

```svelte
<!-- v2: Custom sentinel color for debugging -->
<div use:runeScroller={{
  animation: 'fade-in',
  debug: true,
  sentinelColor: '#ff6b6b'  // Red sentinel
}}>
  Content
</div>

<!-- v2: Custom sentinel ID for identification -->
<div use:runeScroller={{
  animation: 'fade-in',
  sentinelId: 'hero-fade',
  debug: true
}}>
  Identified sentinel
</div>

<!-- v2: Auto-generated sentinel IDs -->
<div use:runeScroller={{
  animation: 'fade-in',
  debug: true
  // sentinelId omitted → auto generates "sentinel-1", "sentinel-2", etc
}}>
  Auto-identified
</div>
```

### Responsive Layouts with ResizeObserver

```svelte
<!-- v2: Sentinel automatically repositions on resize (no setup needed) -->
<div style="width: {windowWidth}px" use:runeScroller={{ animation: 'fade-in' }}>
  Content automatically re-triggers when resized
</div>
```

### Animation Validation

```javascript
// v2: Invalid animations automatically fallback with warning
<div use:runeScroller={{ animation: 'invalid-animation' }}>
  <!-- Automatically uses 'fade-in' instead, console warning shown -->
</div>
```

## API Stability

### No Changes to Main APIs
```javascript
// These work exactly the same in v1 and v2 ✅
import runeScroller from 'rune-scroller';
import { animate, useIntersection, useIntersectionOnce, calculateRootMargin } from 'rune-scroller';

// Options remain unchanged ✅
<div use:runeScroller={{ animation: 'fade-in', duration: 1000, repeat: true }} />
<div use:animate={{ animation: 'zoom-in', threshold: 0.5 }} />
```

### Internal Changes (Don't Affect Users)
- Shared observer utilities (`observer-utils.js`)
- Type consolidation (`types.js`)
- Explicit SSR guards
- French comments translated to English

## Testing Your Migration

### Visual Testing
1. Run your application: `pnpm dev`
2. Scroll page and verify animations still trigger
3. Check console for any import errors

### Type Checking
```bash
# If using TypeScript or JSDoc with type checking
pnpm check
```

## Getting Help

If you encounter issues during migration:
1. Check the [README.md](./README.md) for usage examples
2. Review the [CLAUDE.md](./CLAUDE.md) for architecture details
3. Open an issue on [GitHub](https://github.com/lelabdev/rune-scroller/issues)

## Version History

- **v2.0.0** - Major refactoring, breaking changes
  - Deleted unused components
  - Consolidated type definitions
  - Added configurable animation distance
  - Improved code quality and maintainability

- **v1.0.0** - Initial release
  - Core animation functionality
  - 14 built-in animations
  - Zero dependencies

---

**Questions?** See the [GitHub repository](https://github.com/lelabdev/rune-scroller) for more information.
