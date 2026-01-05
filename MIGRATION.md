# Migration Guide: Rune Scroller v1 → v2

## Overview

Rune Scroller v2.0 is a major release with breaking changes aimed at improving code quality, maintainability, and user experience.

## What's New in v2.0 ✨

### ✅ New Features
- **Configurable animation distance**: Use `--translate-distance` CSS variable to customize animation travel distance
- **Explicit SSR guards**: More defensive server-side rendering support
- **Shared observer utilities**: Reduced code duplication and cleaner internals
- **ANIMATION_TYPES constant**: Programmatic access to all available animations
- **Better type consolidation**: Single source of truth for type definitions

### ✅ Improvements
- 100% English codebase (no French comments)
- Cleaner, more maintainable code
- Better organized utilities
- Enhanced documentation

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
- [ ] Remove any direct imports of `RuneScroller.svelte` or `BaseAnimated.svelte` (if any)
- [ ] Update type imports to use `rune-scroller/types.js` if needed
- [ ] Run tests to verify animations still work
- [ ] Optional: Use new `--translate-distance` CSS variable for custom animation distances

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

### ANIMATION_TYPES Constant

```javascript
// v2: New - Programmatic access to all animations
import { ANIMATION_TYPES } from 'rune-scroller';

console.log(ANIMATION_TYPES);
// ['fade-in', 'fade-in-up', 'fade-in-down', ..., 'bounce-in']

// Useful for validation
function isValidAnimation(name) {
  return ANIMATION_TYPES.includes(name);
}
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
