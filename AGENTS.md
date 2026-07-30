# Rune Scroller

`rune-scroller` is a zero-dependency, SSR-safe scroll-animation library for Svelte 5. It exposes a framework-neutral DOM core with a native Svelte action; published artifacts are generated in `dist/`.

## Commands

```bash
bun install                 # Install dependencies
bun run dev                 # Start the Vite development server
bun run check               # Sync SvelteKit and run svelte-check
bun run test                # Run unit and integration tests with Bun
bunx playwright test        # Run browser E2E tests (starts e2e/serve.js on :3210)
bun run lint                # Check Prettier formatting and ESLint
bun run format              # Apply Prettier formatting
bun run build               # Build publishable package files into dist/
```

**Verification sequence:** `bun run check && bun run test && bun run lint && bun run build`

## Architecture

```text
src/lib/
├── index.js                    # Framework-neutral public entry (animate + utils + types)
├── animate.js                  # Framework-neutral DOM core: animate() lifecycle and observer wiring
├── svelte.js                   # Dedicated Svelte entry: action + rune composables
├── animations.js               # Animation names and root-margin utilities
├── animations.css              # Animation styles; imported explicitly by consumers
├── dom-utils.js                # DOM, CSS-variable, and debug-sentinel helpers
├── observer-utils.js           # Shared IntersectionObserver lifecycle helpers
├── types.js                    # JSDoc public type definitions
└── useIntersection.svelte.js   # Svelte 5 rune-based intersection helpers
tests/                          # Bun unit and integration tests plus mocks/helpers
e2e/                            # Playwright fixtures, server, and browser tests
dist/                           # Generated package output; rebuild after public API changes
```

The package exports are defined in `package.json`. Keep `.` (framework-neutral
`animate` core), `./svelte` (Svelte action + composables), and
`./animations.css` compatible unless making an intentional major-version
change.

## Critical Rules

- Preserve SSR guards: browser globals (`window`, `document`, observers) must never be accessed during server-side evaluation.
- Preserve cleanup: every created `IntersectionObserver`, `ResizeObserver`, listener, or sentinel needs a matching destroy/disconnect path.
- Keep the framework-neutral core (`src/lib/index.js`, `src/lib/animate.js`) free of Svelte runtime imports. Rune-based code lives in `src/lib/svelte.js` and `src/lib/useIntersection.svelte.js`.
- `animate` and the Svelte action share the same lifecycle. `update(newOptions)` uses replacement semantics: the argument is the complete new option set, so removed options are never retained.
- Consumers import CSS explicitly. Do not add an automatic CSS import to `src/lib/index.js` or `src/lib/svelte.js`; it breaks Node and edge SSR runtimes.
- Add tests for observable behavior changes, including lifecycle cleanup and browser behavior when relevant.

## Code Style

- Use ESM JavaScript with JSDoc types for public APIs; do not introduce TypeScript source files without a project-wide decision.
- Follow Prettier and ESLint. Keep browser DOM operations defensive for SSR and test DOM environments.
- Keep public API changes in sync with `src/lib/index.js`, `src/lib/svelte.js`, `package.json` exports, JSDoc types, tests, and `README.md`.

```js
// ✅ Guard browser-only behavior
if (typeof window === "undefined") return;

// ❌ Evaluate browser globals during module initialization
const observer = new IntersectionObserver(callback);
```

```js
// ✅ Disconnect resources in the action lifecycle
destroy() {
  disconnectObserver(intersectionObserver, state);
  resizeObserver?.disconnect();
}

// ❌ Leave observer resources alive after a component unmounts
```

## Testing

- Put behavior-level unit and integration tests in `tests/` using Bun's test runner.
- Use `tests/__mocks__/` for browser APIs unavailable in the test environment.
- Put browser flows in `e2e/`; Playwright serves fixtures through `e2e/serve.js` on port 3210.
- Cover both the framework-neutral core (`dist/index.js` → `animate`) and the Svelte entry (`dist/svelte.js` → action) with contract and browser tests.
- Run `bunx playwright test` for changes involving actual observer, DOM, CSS, or Svelte-action behavior.

## Git Workflow

- Work on a branch, not `main`.
- Use conventional commits, e.g. `fix: clean up mutation observer on destroy`.
- Do not commit generated output, secrets, `node_modules/`, `.svelte-kit/`, or test results.
- Run the verification sequence before committing changes to library behavior or public APIs.

## Boundaries

- ✅ Always maintain SSR safety, accessible reduced-motion behavior, and observer cleanup.
- ✅ Always treat `README.md` and package exports as part of the public contract.
- ⚠️ Ask first before adding runtime dependencies, changing export paths, or modifying the public API surface.
- 🚫 Never import the package stylesheet automatically from JavaScript.
- 🚫 Never make browser globals mandatory at module load time.
- 🚫 Never edit generated `dist/` files by hand; regenerate them with `bun run build`.
