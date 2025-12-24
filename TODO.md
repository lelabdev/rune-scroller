# TODO - Rune Scroller Improvements

This document tracks bugs, improvements, and feature ideas for the Rune Scroller library.

**Priority Legend:**
- 🔴 **CRITICAL** - Breaks functionality or causes major issues
- 🟠 **HIGH** - Important for quality and user experience
- 🟡 **MEDIUM** - Nice to have, improves maintainability
- 🟢 **LOW** - Future enhancements, nice improvements

---

## 🔴 CRITICAL Priority

### 1. Exclude Test Files from npm Package
**Status:** Open
**Priority:** 🔴 CRITICAL
**Impact:** Package size +3.5 KB, pollutes published package

**Problem:**
- `animations.test.js`, `scroll-animate.test.js` and their `.d.ts` files are in `dist/`
- Users download unnecessary test code when installing from npm

**Solution:**
Update `svelte.config.js` to exclude test files:
```js
kit: {
  files: {
    lib: 'src/lib',
    exclude: ['**/*.test.ts', '**/*.test.js']
  }
}
```

OR add to `.npmignore`:
```
dist/**/*.test.js
dist/**/*.test.d.ts
```

**Files to modify:**
- `svelte.config.js`
- OR `.npmignore`

**Verification:**
```bash
pnpm build
ls dist/*.test.*  # Should return "No such file"
```

---

## 🟠 HIGH Priority

### 2. Fix Non-Null Assertion in runeScroller.svelte.ts
**Status:** Open
**Priority:** 🟠 HIGH
**Impact:** Potential runtime error if `animation` is undefined

**Problem:**
Line 26 uses `options.animation!` without checking if it's defined:
```typescript
setupAnimationElement(element, options.animation!);
```

**Solution:**
Add conditional check:
```typescript
if (options?.animation || options?.duration) {
  if (options.animation) {
    setupAnimationElement(element, options.animation);
  }
  setCSSVariables(element, options.duration);
}
```

**Files to modify:**
- `src/lib/runeScroller.svelte.ts:26`

---

### 3. Improve fix-dist.js to Auto-Detect .svelte.ts Files
**Status:** Open
**Priority:** 🟠 HIGH
**Impact:** Maintenance burden, breaks when adding new `.svelte.ts` files

**Problem:**
Hardcoded list of files in `fix-dist.js`:
```js
const svelteJsFiles = ['runeScroller', 'animate', 'useIntersection'];
```

**Solution:**
Auto-detect by checking if corresponding `.svelte.js` file exists in `dist/`:
```js
import { readdirSync, existsSync } from 'fs';

content = content.replace(
  /from '\.\/(\w+)\.svelte';/g,
  (match, filename) => {
    const svelteJsPath = join(__dirname, '..', 'dist', `${filename}.svelte.js`);
    if (existsSync(svelteJsPath)) {
      return `from './${filename}.svelte.js';`;
    }
    return match;
  }
);
```

**Files to modify:**
- `scripts/fix-dist.js`

**Benefits:**
- Scales automatically when adding new `.svelte.ts` files
- No manual maintenance required
- More robust and future-proof

---

### 4. Handle Sentinel Repositioning on Element Resize
**Status:** Open
**Priority:** 🟠 HIGH
**Impact:** Animation triggers at wrong position on responsive layouts

**Problem:**
`createSentinel()` calls `getBoundingClientRect()` once at creation.
If element resizes (responsive design, dynamic content), sentinel position becomes stale.

**Current code (dom-utils.svelte.ts:46):**
```typescript
const rect = element.getBoundingClientRect();
const elementHeight = rect.height;
const sentinelTop = elementHeight + offset;
```

**Solution Option A - ResizeObserver:**
```typescript
export function createSentinel(
  element: HTMLElement,
  debug: boolean = false,
  offset: number = 0
): { sentinel: HTMLElement; cleanup: () => void } {
  const sentinel = document.createElement('div');

  const updatePosition = () => {
    const rect = element.getBoundingClientRect();
    const sentinelTop = rect.height + offset;
    sentinel.style.top = `${sentinelTop}px`;
  };

  updatePosition();

  const resizeObserver = new ResizeObserver(updatePosition);
  resizeObserver.observe(element);

  // ... styling code ...

  return {
    sentinel,
    cleanup: () => resizeObserver.disconnect()
  };
}
```

**Solution Option B - Simpler (window resize only):**
```typescript
const updatePosition = () => {
  const rect = element.getBoundingClientRect();
  sentinel.style.top = `${rect.height + offset}px`;
};

updatePosition();
window.addEventListener('resize', updatePosition);

// Return cleanup function
return {
  sentinel,
  cleanup: () => window.removeEventListener('resize', updatePosition)
};
```

**Files to modify:**
- `src/lib/dom-utils.svelte.ts` (createSentinel function)
- `src/lib/runeScroller.svelte.ts` (call cleanup on destroy)

**Note:** Option A is more accurate (tracks element resize), Option B is lighter (only window resize).

---

## 🟡 MEDIUM Priority

### 5. Fix Documentation Inconsistencies
**Status:** Open
**Priority:** 🟡 MEDIUM
**Impact:** User confusion, misleading information

**Problems:**

**a) Translation distance mismatch**
- README.md says "move up 100px"
- CSS actually uses `translateY(300px)`

**Fix:**
Update README.md line 94-97:
```markdown
- `fade-in-up` - Fade + move up 300px
- `fade-in-down` - Fade + move down 300px
- `fade-in-left` - Fade + move from right 300px
- `fade-in-right` - Fade + move from left 300px
```

**b) Animation count confusion**
- CHANGELOG mentions "14+", "26+" animations
- Actually exactly 14 animations

**Fix:**
Update CHANGELOG.md line 64 and 78 to say "14 animations" (not "14+" or "26+")

**Files to modify:**
- `README.md:94-97`
- `CHANGELOG.md:64, 78`

---

### 6. Document RuneScroller Component in Public API
**Status:** Open
**Priority:** 🟡 MEDIUM
**Impact:** Users don't know component exists

**Problem:**
`RuneScroller.svelte` component exists but:
- Not exported in `index.ts`
- Not documented in README
- Not clear if it's public or internal API

**Decision needed:**
1. **Export it** and document as third API option
2. **Keep it internal** and add comment in file explaining it's for testing only

**If exporting:**
Add to `src/lib/index.ts`:
```typescript
export { default as RuneScroller } from './RuneScroller.svelte';
```

Add to README.md:
```markdown
## Component API (alternative)

For developers who prefer component syntax:

\`\`\`svelte
<script>
  import { RuneScroller } from 'rune-scroller';
</script>

<RuneScroller animation="fade-in-up" duration={1000} repeat>
  <div>Content</div>
</RuneScroller>
\`\`\`
```

**Files to modify:**
- `src/lib/index.ts`
- `README.md`
- `src/lib/RuneScroller.svelte` (add JSDoc comment)

---

### 7. Add SSR Safety Guards
**Status:** Open
**Priority:** 🟡 MEDIUM
**Impact:** Better error messages, clearer limitations

**Problem:**
No explicit checks for server-side rendering.
While Svelte actions don't run server-side, it's not documented.

**Solution:**
Add guards and helpful error messages:

```typescript
// In runeScroller.svelte.ts
export function runeScroller(element: HTMLElement, options?: RuneScrollerOptions) {
  // SSR guard (actions don't run server-side, but be explicit)
  if (typeof window === 'undefined') {
    console.warn('[rune-scroller] Actions only run in browser, skipping SSR');
    return { update() {}, destroy() {} };
  }

  // ... rest of code
}
```

**Files to modify:**
- `src/lib/runeScroller.svelte.ts`
- `src/lib/animate.svelte.ts`

**Documentation:**
Add to CLAUDE.md and README.md:
```markdown
## SSR Compatibility

Svelte actions (like `runeScroller` and `animate`) only execute in the browser, never server-side.
This makes them automatically SSR-safe - no extra configuration needed.
```

---

## 🟢 LOW Priority

### 8. Add More Animation Presets
**Status:** Backlog
**Priority:** 🟢 LOW
**Impact:** More animation variety for users

**Ideas:**
- `elastic-in` - Elastic easing bounce
- `swing-in` - Pendulum swing effect
- `blur-in` - Blur filter animation (CSS filter)
- `fade-in-up-short` - Smaller 100px translation
- `fade-in-up-long` - Larger 500px translation

**Files to modify:**
- `src/lib/animations.ts` (add to AnimationType)
- `src/lib/animations.css` (add keyframes)
- README.md (update animation list)
- Tests (verify new animations)

---

### 9. Performance Benchmarking
**Status:** Backlog
**Priority:** 🟢 LOW
**Impact:** Marketing material, optimization insights

**Goal:**
Create benchmarks comparing Rune Scroller to:
- AOS (Animate On Scroll)
- GSAP ScrollTrigger
- Framer Motion
- Pure CSS scroll-timeline

**Metrics:**
- Bundle size (already ~2KB, but verify)
- FPS during animation
- Memory usage
- Time to first animation

**Deliverable:**
- `benchmarks/` directory with test files
- Results in README.md or separate BENCHMARKS.md

---

### 10. React/Vue Wrapper (Cross-Framework)
**Status:** Backlog
**Priority:** 🟢 LOW
**Impact:** Broader adoption outside Svelte ecosystem

**Goal:**
Create thin wrappers for React and Vue using Web Components or direct DOM manipulation.

**Approach:**
- Export vanilla JS version (no Svelte)
- Create React hook `useRuneScroller(ref, options)`
- Create Vue composable `useRuneScroller(ref, options)`

**Note:** This is significant work and changes library scope. Consider separate packages:
- `rune-scroller` (Svelte, current)
- `rune-scroller-react` (React wrapper)
- `rune-scroller-vue` (Vue wrapper)

---

## 📝 Code Quality Improvements

### 11. Increase Test Coverage
**Status:** Open
**Priority:** 🟡 MEDIUM

**Current coverage:**
- Basic API tests exist
- No DOM manipulation tests
- No IntersectionObserver mocking

**Add tests for:**
- Sentinel creation and positioning
- Observer lifecycle (connect/disconnect)
- Animation class application
- Repeat mode behavior
- CSS variable setting
- Update/destroy methods

**Files to add:**
- `src/lib/runeScroller.test.ts`
- `src/lib/dom-utils.test.ts`
- `src/lib/useIntersection.test.ts`

---

### 12. Add JSDoc Comments
**Status:** Open
**Priority:** 🟡 MEDIUM

**Goal:**
Better IntelliSense and documentation in IDEs.

**Files needing JSDoc:**
- `src/lib/runeScroller.svelte.ts` ✅ (already has some)
- `src/lib/animate.svelte.ts` ✅ (already has some)
- `src/lib/dom-utils.svelte.ts` ✅ (already has some)
- `src/lib/useIntersection.svelte.ts` ✅ (already has some)
- `src/lib/types.ts` (needs more detail)

**Example:**
```typescript
/**
 * Options for the runeScroller action
 *
 * @property {AnimationType} animation - Animation type to apply
 * @property {number} duration - Animation duration in milliseconds (default: 800)
 * @property {boolean} repeat - Repeat animation on every scroll (default: false)
 * @property {boolean} debug - Show sentinel as visible cyan line (default: false)
 * @property {number} offset - Sentinel offset in pixels, negative = earlier trigger (default: 0)
 */
export interface RuneScrollerOptions {
  animation?: AnimationType;
  duration?: number;
  repeat?: boolean;
  debug?: boolean;
  offset?: number;
}
```

---

## 🔧 Technical Debt

### 13. Consider TypeScript + JSDoc Hybrid (Like SvelteKit)
**Status:** Discussion
**Priority:** 🟢 LOW

**Context:**
SvelteKit team uses JSDoc comments with type annotations instead of TypeScript files.

**Pros of JSDoc approach:**
- Faster builds (no TS compilation)
- Better compatibility with different tools
- Same type safety in VS Code
- Simpler tooling chain

**Cons:**
- More verbose syntax
- Harder to write complex types
- Less IDE support outside VS Code

**Example comparison:**

**Current (TypeScript):**
```typescript
export interface RuneScrollerOptions {
  animation?: AnimationType;
  duration?: number;
}

export function runeScroller(element: HTMLElement, options?: RuneScrollerOptions) {
  // ...
}
```

**JSDoc alternative:**
```javascript
/**
 * @typedef {Object} RuneScrollerOptions
 * @property {AnimationType} [animation]
 * @property {number} [duration]
 */

/**
 * @param {HTMLElement} element
 * @param {RuneScrollerOptions} [options]
 * @returns {{ update: Function, destroy: Function }}
 */
export function runeScroller(element, options) {
  // ...
}
```

**Decision:** Keep TypeScript for now. It's more natural for library development and most users expect `.ts` files. JSDoc is better for app code (like SvelteKit uses).

---

### 14. Migrate to Bun?
**Status:** Discussion
**Priority:** 🟢 LOW

**Context:**
Bun is a faster JavaScript runtime and package manager.

**Potential benefits:**
- Faster `pnpm install` → `bun install`
- Faster test runs → `bun test`
- Built-in bundler
- Native TypeScript support

**Concerns:**
- Ecosystem maturity (Bun is still young)
- CI/CD compatibility
- Community adoption
- Breaking changes for contributors

**Recommendation:**
Wait for Bun to mature more. pnpm works great, and switching has minimal benefit for a library (main benefit is for full-stack apps). Consider in 2026 when Bun v2+ is stable.

**If migrating:**
1. Test all scripts work with Bun
2. Update package.json engines
3. Update CI/CD workflows
4. Document in README
5. Keep backward compatibility (users can still use npm/pnpm)

---

## 📋 Completed Items

None yet - new TODO.md file.

---

## 🎯 Suggested Roadmap

**v1.0.1 (Next Patch)**
- 🔴 #1: Exclude test files from npm package
- 🟠 #2: Fix non-null assertion
- 🟡 #5: Fix documentation inconsistencies

**v1.1.0 (Next Minor)**
- 🟠 #3: Improve fix-dist.js
- 🟠 #4: Sentinel repositioning on resize
- 🟡 #6: Document or remove RuneScroller component
- 🟡 #7: Add SSR safety guards
- 🟡 #11: Increase test coverage

**v2.0.0 (Future Major)**
- 🟢 #8: Add more animation presets
- 🟢 #9: Performance benchmarking
- 🟢 #10: React/Vue wrappers

**Ongoing:**
- 🟡 #12: Add JSDoc comments (improve as we go)
- 🟢 #13: TypeScript vs JSDoc (monitor SvelteKit approach)
- 🟢 #14: Bun migration (revisit in 2026)

---

**Last updated:** 2025-12-24
