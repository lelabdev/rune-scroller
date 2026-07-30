# v5 Health Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the residual audit findings that affect real `animate()` lifecycle correctness and small DX/type honesty on `main` at 5.0.0 — without publishing, tagging, or touching AOS history.

**Architecture:** Keep the framework-neutral `animate` core as the single lifecycle owner. Fix option-transition bugs in `update()`, make debug attribute restore honest even when debug never ran, stop sticky false negatives in the CSS-load probe, and tighten the public `ANIMATION_TYPES` TypeScript type. Tests first (TDD) in existing Bun unit files; no new public exports.

**Tech Stack:** ESM JavaScript + JSDoc, Bun test, happy-dom mocks in `tests/__mocks__/`, existing `mockIntersectionObserver`.

## Global Constraints

- Branch from current `main` (post #153). Work on `fix/v5-health-fixes` (or equivalent), not directly on `main`.
- **No** `npm publish`, **no** git tag, **no** GitHub Release.
- **AOS is out of scope** — do not reintroduce, migrate, or rewrite historical CHANGELOG AOS sections beyond a one-line Unreleased note if needed.
- Preserve SSR guards, dual-handle no-op ownership, replacement `update()` semantics, observer sharing/refcount, and explicit CSS import (never auto-import CSS).
- Framework-neutral core (`src/lib/index.js`, `src/lib/animate.js`) stays free of Svelte runtime imports.
- Public export map stays `.` / `./svelte` / `./animations.css` only.
- Verification before merge: `bun run lint && bun run check && bun run build && bun run test && bunx playwright test`.
- Conventional commits; do not hand-edit `dist/` (rebuild via `bun run build`).

---

## File map

| File | Role |
|------|------|
| `src/lib/animate.js` | Task 1: latch one-shot when `repeat` turns off while intersecting. Task 2: capture caller `data-sentinel-id` at setup so destroy restore is honest without debug. |
| `src/lib/dom-utils.js` | Task 3: CSS-load probe must not permanently cache a false miss. |
| `src/lib/animations.js` | Task 4: type `ANIMATION_TYPES` as `readonly import('./types.js').AnimationType[]` (or equivalent JSDoc). |
| `tests/animate.test.js` | Failing tests for Tasks 1–2. |
| `tests/dom-utils.test.js` | Failing test for Task 3 (module query-cache pattern already used). |
| `tests/animations.test.js` or `tests/public-contract.test.js` | Optional assert that emitted/runtime list stays length 36; type check via `bun run check` / tsc. |
| `CHANGELOG.md` | Single bullet under `## [Unreleased]` summarizing fixes (no version bump). |

**Out of scope (explicit):** npm publish/tag, logo.png pack size, `IntersectionObserver` feature-detect polyfill, deep-import blocking of `dist/observer-utils.js`, e2e `{#each}` churn fixtures, AOS.

---

### Task 1: Latch one-shot when `repeat` turns off while visible

**Files:**
- Modify: `src/lib/animate.js` (~L429–435, intersection handler already sets `hasTriggered` only on enter with `!repeat`)
- Test: `tests/animate.test.js` (update lifecycle describe)
- Optional cross-check: `tests/animate.integration.test.js` only if unit coverage is insufficient

**Interfaces:**
- Consumes: existing `hasTriggered`, `isIntersecting`, `disconnectObserver`, `currentOptions.repeat`
- Produces: after `update({ …, repeat: false })` while intersecting, element stays one-shot-complete: `hasTriggered === true`, observer disconnected, later option-only updates must **not** reconnect solely because `!hasTriggered`

**Product decision (locked):**
When `repeat` goes from `true` to not-`true` **and** `isIntersecting` is true:
1. `disconnectObserver(managedObserver, state)` (already present)
2. **Also** `hasTriggered = true`
3. **Keep** `is-visible` (user already saw the enter animation; do not yank the class)
4. Do **not** fire `onHidden` (not a leave event)

- [ ] **Step 1: Write the failing test**

Add inside `describe("animate update lifecycle (replacement semantics)")` in `tests/animate.test.js`:

```js
it("latches one-shot completion when repeat turns off while intersecting", () => {
  action = animate(element, { animation: "fade", repeat: true });
  mockIntersectionObserver.trigger(element, true);
  expect(element.classList.contains("is-visible")).toBe(true);
  expect(mockIntersectionObserver.getObserverFor(element)).toBeDefined();

  action.update({ animation: "fade", repeat: false });

  expect(element.classList.contains("is-visible")).toBe(true);
  expect(mockIntersectionObserver.getObserverFor(element)).toBeUndefined();

  // A later update that would reconnect if hasTriggered were still false
  action.update({ animation: "fade", repeat: false, offset: 40 });
  expect(mockIntersectionObserver.getObserverFor(element)).toBeUndefined();
  expect(element.classList.contains("is-visible")).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/animate.test.js -t "latches one-shot completion"`
Expected: FAIL — after `offset: 40` update, observer is recreated (`getObserverFor` defined) because `hasTriggered` stayed false.

- [ ] **Step 3: Minimal implementation**

In `src/lib/animate.js`, in the `update` block that handles repeat off while intersecting, set the latch:

```js
if (
  previousOptions.repeat === true &&
  currentOptions.repeat !== true &&
  isIntersecting
) {
  hasTriggered = true;
  disconnectObserver(managedObserver, state);
}
```

Do not remove `is-visible`. Do not call `onHidden`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/animate.test.js tests/animate.integration.test.js`
Expected: PASS (including existing repeat true↔false cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/animate.js tests/animate.test.js
git commit -m "fix: latch one-shot when repeat turns off while visible"
```

---

### Task 2: Preserve caller `data-sentinel-id` without requiring debug

**Files:**
- Modify: `src/lib/animate.js` (setup path after ownership acquired; `disableDebug` already restores from `originalSentinelAttribute`)
- Test: `tests/animate.test.js` (destroy / ownership describe)

**Interfaces:**
- Consumes: `originalSentinelAttribute` (`{ hasAttribute, value } | undefined`), `disableDebug()`
- Produces: destroy (and debug-off) never strip a caller-owned `data-sentinel-id` that existed before `animate()` when debug never ran

**Product decision (locked):**
Capture `data-sentinel-id` **once at setup** (same shape as `renderSentinel`), not only when debug first paints. `disableDebug` / destroy keep using that snapshot. If the caller had no attribute, destroy still removes any debug-added id.

- [ ] **Step 1: Write the failing test**

```js
it("preserves a caller data-sentinel-id when debug never ran", () => {
  element.setAttribute("data-sentinel-id", "caller-owned");
  action = animate(element, { animation: "fade" }); // debug omitted/false
  expect(element.getAttribute("data-sentinel-id")).toBe("caller-owned");

  action.destroy();
  action = null;

  expect(element.getAttribute("data-sentinel-id")).toBe("caller-owned");
});
```

Place near the existing “preserves caller-owned DOM” destroy test so fixtures match.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/animate.test.js -t "preserves a caller data-sentinel-id"`
Expected: FAIL — attribute is `null` after destroy (`disableDebug` removes it because `originalSentinelAttribute` was never set).

- [ ] **Step 3: Minimal implementation**

Right after ownership + `original` snapshot setup in `animate()` (before or just after `setupAnimationElement`), capture once:

```js
originalSentinelAttribute = {
  hasAttribute: element.hasAttribute("data-sentinel-id"),
  value: element.getAttribute("data-sentinel-id"),
};
```

Keep `renderSentinel`’s `originalSentinelAttribute ??=` as a safe no-op if already set, **or** remove the `??=` block’s first-write role if redundant — prefer leaving `??=` so double-call stays idempotent.

Ensure `destroy()` still calls `disableDebug()` (already does) so restore path is shared.

- [ ] **Step 4: Run tests**

Run: `bun test tests/animate.test.js`
Expected: PASS — including debug on/off sentinel id tests and caller-owned preserve test that uses `debug: true`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/animate.js tests/animate.test.js
git commit -m "fix: restore caller data-sentinel-id without requiring debug"
```

---

### Task 3: Stop sticky false CSS-load cache

**Files:**
- Modify: `src/lib/dom-utils.js` (`checkAndWarnIfCSSNotLoaded`, `cssCheckResult`)
- Test: `tests/dom-utils.test.js` (`describe("checkAndWarnIfCSSNotLoaded")`)

**Interfaces:**
- Consumes: module-level `cssCheckResult`
- Produces: a failed probe does not prevent a later successful probe after the consumer imports CSS; a successful probe may still be cached

**Product decision (locked):**
- Cache **only** `true` (stylesheet confirmed).
- If the probe returns `false`, leave `cssCheckResult` as `null` (or set only on success) so the next `animate()` can re-check.
- Still warn on each failed probe (dev-only path already skips production via `NODE_ENV`). Do not warn in a tight loop beyond once-per-`animate()` call (callers already invoke once per handle).

- [ ] **Step 1: Write the failing test**

Extend `tests/dom-utils.test.js` using the existing dynamic-import cache-bust pattern:

```js
it("rechecks after a failed probe when CSS becomes available", async () => {
  const originalGetComputedStyle = global.getComputedStyle;
  let pass = 0;
  global.getComputedStyle = () => {
    pass += 1;
    return {
      transitionProperty:
        pass === 1 ? "opacity" : "opacity, transform",
    };
  };

  const { checkAndWarnIfCSSNotLoaded } = await import(
    "../src/lib/dom-utils.js?css-recheck"
  );

  expect(checkAndWarnIfCSSNotLoaded()).toBe(false);
  expect(checkAndWarnIfCSSNotLoaded()).toBe(true);

  global.getComputedStyle = originalGetComputedStyle;
});
```

(Adjust property strings to match whatever the implementation checks today: both `opacity` and `transform` required.)

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/dom-utils.test.js -t "rechecks after a failed probe"`
Expected: FAIL — second call still `false` because `cssCheckResult` was cached false.

- [ ] **Step 3: Minimal implementation**

In `checkAndWarnIfCSSNotLoaded`:

```js
// after computing hasStylesheet and optional warn:
if (hasStylesheet) {
  cssCheckResult = true;
}
return hasStylesheet;
```

Remove unconditional `cssCheckResult = hasStylesheet`. Keep early return when `cssCheckResult !== null` (now only ever `true`).

- [ ] **Step 4: Run tests**

Run: `bun test tests/dom-utils.test.js`
Expected: PASS (existing loaded/missing cases still pass with fresh `?query` imports).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dom-utils.js tests/dom-utils.test.js
git commit -m "fix: do not permanently cache failed CSS-load probes"
```

---

### Task 4: Type `ANIMATION_TYPES` as `AnimationType[]`

**Files:**
- Modify: `src/lib/animations.js` (JSDoc on `ANIMATION_TYPES`)
- Verify: `bun run build` then inspect `dist/animations.d.ts`; `bun run check`
- Test: no behavior change — existing length/content tests remain the contract

**Interfaces:**
- Consumes: `AnimationType` from `types.js` (typedef only)
- Produces: emitted `dist/animations.d.ts` uses `readonly AnimationType[]` (or `readonly import("./types.js").AnimationType[]`) instead of `readonly string[]`

- [ ] **Step 1: Confirm current emit**

Run: `bun run build && rg "ANIMATION_TYPES" dist/animations.d.ts`
Expected current: `export const ANIMATION_TYPES: readonly string[];`

- [ ] **Step 2: Tighten JSDoc**

In `src/lib/animations.js`:

```js
/**
 * All available animation types in the library: primary names plus the
 * v2.x legacy aliases that are still preserved.
 * @type {readonly import('./types.js').AnimationType[]}
 */
export const ANIMATION_TYPES = [
  // …unchanged list…
];
```

If `svelte-package` / tsc fails on circular typedef resolution, fallback that still beats `string[]`:

```js
/** @type {readonly (import('./types.js').AnimationType)[]} */
```

Do **not** convert the file to TypeScript.

- [ ] **Step 3: Rebuild and verify d.ts**

Run: `bun run build && rg "ANIMATION_TYPES" dist/animations.d.ts && bun run check`
Expected: d.ts references `AnimationType` (not bare `string[]`); check clean.

- [ ] **Step 4: Run related unit tests**

Run: `bun test tests/animations.test.js tests/readme-claims.test.js tests/svelte-contract.test.js tests/public-contract.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/animations.js dist/animations.d.ts
# only if build artifacts are committed in this repo — they are NOT; do not commit dist/
git add src/lib/animations.js
git commit -m "types: annotate ANIMATION_TYPES as AnimationType[]"
```

---

### Task 5: Unreleased changelog + full verification

**Files:**
- Modify: `CHANGELOG.md` (`## [Unreleased]` only)
- No version bump (`package.json` stays `5.0.0` until a real release cut)

- [ ] **Step 1: Document fixes under Unreleased**

```markdown
## [Unreleased]

### Fixed

- **`repeat: true` → `false` while intersecting** — latches one-shot completion (`hasTriggered`) so later updates do not reopen the observer.
- **Caller `data-sentinel-id`** — preserved on destroy even when `debug` never ran.
- **CSS-load probe** — a failed dev-time stylesheet check is no longer cached forever.
- **`ANIMATION_TYPES` typing** — public type is `AnimationType[]` instead of `string[]`.
```

- [ ] **Step 2: Full verification**

```bash
bun run lint && bun run check && bun run build && bun run test && bunx playwright test
```

Expected: all green (152+ unit tests as suite evolves; 77 playwright unless new e2e added — none required here).

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: note v5 health fixes under Unreleased"
```

- [ ] **Step 4: Open PR (no publish)**

```bash
git push -u origin HEAD
gh pr create --title "fix: v5 health fixes (repeat latch, sentinel id, CSS probe, types)" --body "$(cat <<'EOF'
## Summary
- Latch one-shot when `repeat` turns off while visible
- Preserve caller `data-sentinel-id` without requiring debug
- Stop sticky false CSS-load cache
- Type `ANIMATION_TYPES` as `AnimationType[]`

No publish/tag. AOS out of scope.

## Test plan
- [x] bun test animate + dom-utils + animations-related
- [x] full lint/check/build/test/playwright
EOF
)"
```

---

## Spec coverage (self-check)

| Audit finding | Task |
|---------------|------|
| P2 repeat off while intersecting | Task 1 |
| P3 caller sentinel-id without debug | Task 2 |
| P3 CSS check sticky false | Task 3 |
| P3 ANIMATION_TYPES `string[]` | Task 4 |
| Changelog honesty | Task 5 |
| Publish/tag | **Excluded** (user choice) |
| AOS | **Excluded** |
| logo.png size / IO feature-detect / deep dist imports | **Excluded** (YAGNI for this plan) |

## Placeholder scan

No TBD/TODO steps. Exact tests, code, and commands included.

## Type/name consistency

- `hasTriggered`, `isIntersecting`, `originalSentinelAttribute`, `cssCheckResult`, `ANIMATION_TYPES`, `AnimationType` match current source names.
