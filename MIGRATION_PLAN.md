# 🚀 Migration Plan: TypeScript → JSDoc + pnpm → Bun

**Goal:** Migrate to JSDoc for instant dev workflow + Bun for maximum speed

**Benefits:**
- ⚡ **10x faster HMR** - No TS compilation during dev
- 🚀 **Instant startup** - Native JS, no build step
- 🔥 **Bun speed** - Faster installs, tests, and bundling
- 🐛 **Better debugging** - Source code = executed code
- ✅ **Same type safety** - JSDoc checked by TypeScript

---

## 📋 Migration Phases

### Phase 0: Preparation & Backup ✅
### Phase 1: Bun Installation & Setup 🟡
### Phase 2: TypeScript → JSDoc Migration 🟡
### Phase 3: Build System Update 🟡
### Phase 4: Testing & Validation 🟡
### Phase 5: Documentation Update 🟡

---

## Phase 0: Preparation & Backup

**Status:** ✅ Complete before starting

### 0.1 Create Git Branch

```bash
cd rune-scroller-lib
git checkout -b feat/migrate-jsdoc-bun
git push -u origin feat/migrate-jsdoc-bun
```

### 0.2 Backup Current State

```bash
# Create backup of current working state
git add .
git commit -m "chore: backup before JSDoc + Bun migration"
git tag backup-pre-migration
```

### 0.3 Document Current Performance

```bash
# Measure baseline performance
time pnpm install
time pnpm build
time pnpm test
time pnpm check

# Save results in MIGRATION_METRICS.md
```

**Baseline metrics to capture:**
- `pnpm install` time
- `pnpm build` time
- `pnpm test` time
- `pnpm check` time
- HMR update latency (manual test in browser)

---

## Phase 1: Bun Installation & Setup

**Status:** 🟡 Ready to start

### 1.1 Install Bun

```bash
# Install Bun globally
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version  # Should show v1.x.x
```

### 1.2 Initialize Bun in Project

```bash
cd rune-scroller-lib

# Create bun.lockb from pnpm-lock.yaml
bun install
```

This creates `bun.lockb` while keeping `package.json` intact.

### 1.3 Test Bun Compatibility

```bash
# Test each script works with Bun
bun run dev
# → Should start Vite dev server

bun run build
# → Should build library

bun run test
# → Should run Vitest tests

bun run check
# → Should run svelte-check
```

**Expected issues:**
- ✅ Most scripts work as-is (Bun has pnpm compatibility)
- ⚠️ Some tools might need config updates (document in Phase 1.4)

### 1.4 Update Package Scripts for Bun

**Update `package.json`:**

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "bunx svelte-package && bun run scripts/fix-dist.js",
    "test": "bun test",
    "test:unit": "vitest",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "format": "prettier --write .",
    "lint": "prettier --check . && eslint .",
    "prepublishOnly": "bun run check && bun run build"
  },
  "packageManager": "bun@1.1.38"
}
```

### 1.5 Update CI/CD for Bun

**GitHub Actions (`.github/workflows/ci.yml`):**

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Type check
        run: bun run check

      - name: Run tests
        run: bun run test

      - name: Build
        run: bun run build
```

### 1.6 Test Workspace Integration

**Update workspace `package.json`:**

```json
{
  "scripts": {
    "dev": "cd rune-scroller-site && bun run dev:full",
    "build:lib": "cd rune-scroller-lib && bun run build",
    "test:lib": "cd rune-scroller-lib && bun test"
  },
  "packageManager": "bun@1.1.38"
}
```

**Test workspace commands:**
```bash
cd .. # workspace root
bun run build:lib
bun run test:lib
```

---

## Phase 2: TypeScript → JSDoc Migration

**Status:** 🟡 Ready after Phase 1

### 2.1 Migration Strategy

**Files to migrate (in order):**

1. ✅ `src/lib/dom-utils.svelte.ts` → `.js` (smallest, no deps)
2. ✅ `src/lib/useIntersection.svelte.ts` → `.js` (uses types.ts)
3. ✅ `src/lib/animate.svelte.ts` → `.js` (uses animations.ts)
4. ✅ `src/lib/runeScroller.svelte.ts` → `.js` (main API)

**Files to keep as TypeScript:**
- ✅ `src/lib/types.ts` (pure type definitions)
- ✅ `src/lib/animations.ts` (type + small logic)

**Why keep some TypeScript?**
- Pure type files are perfect as `.ts`
- Imported as `import('./types.js').TypeName` in JSDoc
- Provides single source of truth for types

### 2.2 Migration Template

**TypeScript file structure:**
```typescript
import type { SomeType } from './types';

export function myFunction(param: HTMLElement, options?: SomeType): ReturnType {
  // ...
}
```

**JSDoc equivalent:**
```javascript
/**
 * Function description
 * @param {HTMLElement} param - Parameter description
 * @param {import('./types.js').SomeType} [options] - Optional parameter
 * @returns {ReturnType} Return value description
 */
export function myFunction(param, options) {
  // ... same code
}
```

### 2.3 File-by-File Migration

#### 2.3.1 Migrate `dom-utils.svelte.ts` → `dom-utils.svelte.js`

**Current (`dom-utils.svelte.ts`):**
```typescript
import type { AnimationType } from './animations';

export function setCSSVariables(
	element: HTMLElement,
	duration?: number,
	delay: number = 0
): void {
	if (duration !== undefined) {
		element.style.setProperty('--duration', `${duration}ms`);
	}
	element.style.setProperty('--delay', `${delay}ms`);
}

export function setupAnimationElement(element: HTMLElement, animation: AnimationType): void {
	element.classList.add('scroll-animate');
	element.setAttribute('data-animation', animation);
}

export function createSentinel(
	element: HTMLElement,
	debug: boolean = false,
	offset: number = 0
): HTMLElement {
	const sentinel = document.createElement('div');
	const rect = element.getBoundingClientRect();
	const elementHeight = rect.height;
	const sentinelTop = elementHeight + offset;

	if (debug) {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:3px;background:#00e0ff;margin:0;padding:0;box-sizing:border-box;z-index:999;pointer-events:none`;
		sentinel.setAttribute('data-sentinel-debug', 'true');
	} else {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:1px;visibility:hidden;margin:0;padding:0;box-sizing:border-box;pointer-events:none`;
	}

	return sentinel;
}
```

**New (`dom-utils.svelte.js`):**
```javascript
/**
 * Set CSS custom properties on an element
 * @param {HTMLElement} element - Target DOM element
 * @param {number} [duration] - Animation duration in milliseconds
 * @param {number} [delay=0] - Animation delay in milliseconds
 * @returns {void}
 */
export function setCSSVariables(element, duration, delay = 0) {
	if (duration !== undefined) {
		element.style.setProperty('--duration', `${duration}ms`);
	}
	element.style.setProperty('--delay', `${delay}ms`);
}

/**
 * Setup animation element with required classes and attributes
 * @param {HTMLElement} element - Target DOM element
 * @param {import('./animations.js').AnimationType} animation - Animation type to apply
 * @returns {void}
 */
export function setupAnimationElement(element, animation) {
	element.classList.add('scroll-animate');
	element.setAttribute('data-animation', animation);
}

/**
 * Create sentinel element for observer-based triggering
 * Positioned absolutely relative to element (no layout impact)
 * @param {HTMLElement} element - Reference element (used to position sentinel)
 * @param {boolean} [debug=false] - If true, shows the sentinel as a visible line for debugging
 * @param {number} [offset=0] - Offset in pixels from element bottom (negative = above element)
 * @returns {HTMLElement} The created sentinel element
 */
export function createSentinel(element, debug = false, offset = 0) {
	const sentinel = document.createElement('div');
	const rect = element.getBoundingClientRect();
	const elementHeight = rect.height;
	const sentinelTop = elementHeight + offset;

	if (debug) {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:3px;background:#00e0ff;margin:0;padding:0;box-sizing:border-box;z-index:999;pointer-events:none`;
		sentinel.setAttribute('data-sentinel-debug', 'true');
	} else {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:1px;visibility:hidden;margin:0;padding:0;box-sizing:border-box;pointer-events:none`;
	}

	return sentinel;
}
```

**Steps:**
```bash
# 1. Copy file
cp src/lib/dom-utils.svelte.ts src/lib/dom-utils.svelte.js

# 2. Edit .js file, remove type annotations, add JSDoc

# 3. Update imports in other files
# Change: import { ... } from './dom-utils.svelte'
# To:     import { ... } from './dom-utils.svelte.js'

# 4. Test type checking
bun run check  # Should still pass!

# 5. Delete old .ts file
rm src/lib/dom-utils.svelte.ts
```

#### 2.3.2 Migrate `useIntersection.svelte.ts` → `useIntersection.svelte.js`

**Key changes:**
```javascript
import { onMount } from 'svelte';

/**
 * Factory function to create intersection observer composables
 * @param {import('./types.js').IntersectionOptions} [options={}] - IntersectionObserver configuration
 * @param {(entry: IntersectionObserverEntry, isVisible: boolean) => void} onIntersect - Callback handler
 * @param {boolean} [once=false] - Whether to trigger only once
 * @returns {import('./types.js').UseIntersectionReturn}
 */
function createIntersectionObserver(options = {}, onIntersect, once = false) {
	const { threshold = 0.5, rootMargin = '-10% 0px -10% 0px', root = null } = options;

	let element = $state(null);
	let isVisible = $state(false);
	// ... rest identical
}

/**
 * Track element visibility with IntersectionObserver
 * @param {import('./types.js').IntersectionOptions} [options={}] - IntersectionObserver configuration
 * @param {(isVisible: boolean) => void} [onVisible] - Optional callback when visibility changes
 * @returns {import('./types.js').UseIntersectionReturn}
 */
export function useIntersection(options = {}, onVisible) {
	return createIntersectionObserver(
		options,
		(_entry, isVisible) => {
			onVisible?.(isVisible);
		},
		false
	);
}

/**
 * Track element visibility once (until first trigger)
 * @param {import('./types.js').IntersectionOptions} [options={}] - IntersectionObserver configuration
 * @returns {import('./types.js').UseIntersectionReturn}
 */
export function useIntersectionOnce(options = {}) {
	return createIntersectionObserver(options, () => {}, true);
}
```

#### 2.3.3 Migrate `animate.svelte.ts` → `animate.svelte.js`

**Key changes:**
```javascript
import { calculateRootMargin } from './animations.js';
import { setCSSVariables, setupAnimationElement } from './dom-utils.svelte.js';

/**
 * Svelte action for scroll animations
 * Triggers animation once when element enters viewport
 *
 * @param {HTMLElement} node - The element to animate
 * @param {import('./types.js').AnimateOptions} [options={}] - Animation configuration
 * @returns {{ update: (newOptions: import('./types.js').AnimateOptions) => void, destroy: () => void }}
 *
 * @example
 * ```svelte
 * <div use:animate={{ animation: 'fade-up', duration: 1000 }}>
 *   Content
 * </div>
 * ```
 */
export const animate = (node, options = {}) => {
	let {
		animation = 'fade-in',
		duration = 800,
		delay = 0,
		offset,
		threshold = 0,
		rootMargin
	} = options;

	// ... rest of code identical, just remove type annotations
};
```

#### 2.3.4 Migrate `runeScroller.svelte.ts` → `runeScroller.svelte.js`

**Key changes:**
```javascript
import { setCSSVariables, setupAnimationElement, createSentinel } from './dom-utils.svelte.js';

/**
 * Action pour animer un élément au scroll avec un sentinel invisible juste en dessous
 *
 * @param {HTMLElement} element - L'élément à animer
 * @param {import('./types.js').RuneScrollerOptions} [options] - Options d'animation
 * @returns {{ update: (newOptions?: import('./types.js').RuneScrollerOptions) => void, destroy: () => void }}
 *
 * @example
 * ```svelte
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
 *   Content
 * </div>
 *
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000, repeat: true }}>
 *   Content
 * </div>
 * ```
 */
export function runeScroller(element, options) {
	// Setup animation classes et variables CSS
	if (options?.animation || options?.duration) {
		if (options.animation) {  // ✅ Fixed: no more non-null assertion!
			setupAnimationElement(element, options.animation);
		}
		setCSSVariables(element, options.duration);
	}

	// ... rest identical
}
```

### 2.4 Update `index.ts` Exports

**Keep `index.ts` as TypeScript** (it's just exports, no logic):

```typescript
// Type definitions (centralized)
export type {
	RuneScrollerOptions,
	AnimateOptions,
	IntersectionOptions,
	UseIntersectionReturn
} from './types';
export type { AnimationType } from './animations';

// Main action (default export)
export { runeScroller as default } from './runeScroller.svelte.js';

// Alternative actions
export { animate } from './animate.svelte.js';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte.js';

// Utilities
export { calculateRootMargin } from './animations';
```

**Note:** Imports now have `.js` extension!

### 2.5 Migration Checklist

After each file migration:

```bash
# ✅ Type checking still passes
bun run check

# ✅ Tests still pass
bun test

# ✅ Build works
bun run build

# ✅ VSCode IntelliSense works (hover over functions)

# ✅ No TypeScript errors in editor
```

---

## Phase 3: Build System Update

**Status:** 🟡 After Phase 2

### 3.1 Update `tsconfig.json`

**New config for JSDoc + TypeScript:**

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"strict": true,
		"noEmit": false,
		"emitDeclarationOnly": true,
		"declaration": true,
		"declarationMap": true,
		"outDir": "./dist",
		"moduleResolution": "bundler",
		"module": "ESNext",
		"target": "ESNext",
		"skipLibCheck": true
	},
	"include": ["src/**/*.js", "src/**/*.ts", "src/**/*.svelte"],
	"exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.js"]
}
```

**Key changes:**
- ✅ `allowJs: true` - Allow .js files
- ✅ `checkJs: true` - Type check JSDoc in .js files
- ✅ `emitDeclarationOnly: true` - Only generate .d.ts files
- ✅ `declaration: true` - Generate .d.ts from JSDoc

### 3.2 Update Build Script

**New build process:**

```bash
# Old (package.json):
"build": "svelte-package && node scripts/fix-dist.js"

# New (package.json):
"build": "bunx svelte-package && bun run scripts/fix-dist.js && bun run scripts/generate-types.js"
```

### 3.3 Create `scripts/generate-types.js`

**New script to generate .d.ts from JSDoc:**

```javascript
#!/usr/bin/env bun
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('📝 Generating .d.ts files from JSDoc...');

// Generate .d.ts files using TypeScript compiler
try {
	execSync('tsc', { stdio: 'inherit' });
	console.log('✅ Type definitions generated successfully');
} catch (error) {
	console.error('❌ Failed to generate type definitions');
	process.exit(1);
}

// Verify critical .d.ts files exist
const criticalFiles = [
	'dist/runeScroller.svelte.d.ts',
	'dist/animate.svelte.d.ts',
	'dist/useIntersection.svelte.d.ts',
	'dist/dom-utils.svelte.d.ts'
];

for (const file of criticalFiles) {
	if (!existsSync(file)) {
		console.error(`❌ Missing type definition: ${file}`);
		process.exit(1);
	}
}

console.log('✅ All type definitions verified');
```

Make executable:
```bash
chmod +x scripts/generate-types.js
```

### 3.4 Update `scripts/fix-dist.js`

**Update import fixing to handle .js files:**

```javascript
#!/usr/bin/env bun
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

console.log('🔧 Fixing ES module imports in dist/...');

// Fix all .js files in dist/
const files = readdirSync(distPath).filter(f => extname(f) === '.js');

for (const file of files) {
	const filePath = join(distPath, file);
	let content = readFileSync(filePath, 'utf-8');
	let modified = false;

	// Fix .svelte imports (for .svelte.js files)
	content = content.replace(
		/from '\.\/(\w+)\.svelte';/g,
		(match, filename) => {
			modified = true;
			return `from './${filename}.svelte.js';`;
		}
	);

	// Fix TypeScript imports (add .js extension)
	content = content.replace(
		/from '\.\/(\w+)';/g,
		(match, filename) => {
			// Don't modify if already has extension
			if (filename.includes('.')) return match;
			modified = true;
			return `from './${filename}.js';`;
		}
	);

	if (modified) {
		writeFileSync(filePath, content, 'utf-8');
		console.log(`  ✅ Fixed: ${file}`);
	}
}

console.log('✅ All imports fixed');
```

### 3.5 Update `package.json` Build Script

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "bunx svelte-package && bun run scripts/fix-dist.js && bun run scripts/generate-types.js",
		"prepublishOnly": "bun run check && bun run build && bun test"
	}
}
```

---

## Phase 4: Testing & Validation

**Status:** 🟡 After Phase 3

### 4.1 Unit Tests

```bash
# Run all tests
bun test

# Expected: All 9 tests pass ✅
```

### 4.2 Type Checking

```bash
# Check types (should work with JSDoc)
bun run check

# Expected: 0 errors, 0 warnings ✅
```

### 4.3 Build Verification

```bash
# Build library
bun run build

# Check dist/ contains:
ls dist/
# Expected files:
# - *.js (compiled code)
# - *.d.ts (type definitions from JSDoc)
# - *.svelte.js (Svelte component logic)
# - animations.css
```

### 4.4 Local Integration Test

**Test in site:**

```bash
cd ../rune-scroller-site

# Sync updated library
bun run sync:lib

# Start dev server
bun run dev

# Open browser: http://localhost:5173
# Test all animations work correctly
```

### 4.5 npm Package Test

**Test as if published to npm:**

```bash
cd rune-scroller-lib
bun run build

# Pack the package
npm pack
# Creates: rune-scroller-1.0.0.tgz

# Install in test project
cd /tmp
mkdir test-rune-scroller
cd test-rune-scroller
npm init -y
npm install ~/path/to/rune-scroller-lib/rune-scroller-1.0.0.tgz

# Test imports work
node -e "const rs = require('rune-scroller'); console.log(rs)"
```

### 4.6 Performance Benchmarks

**Compare before/after metrics:**

```bash
# Install time
time bun install  # vs old pnpm install

# Build time
time bun run build  # vs old pnpm build

# Test time
time bun test  # vs old pnpm test

# Dev startup
time bun run dev  # (measure time to "ready")

# HMR speed
# Manual test: modify file, measure time to browser update
```

**Document results in `MIGRATION_METRICS.md`**

---

## Phase 5: Documentation Update

**Status:** 🟡 After Phase 4

### 5.1 Update CLAUDE.md

**Add JSDoc + Bun sections:**

```markdown
## Technology Stack

- **Framework**: Svelte 5 with SvelteKit 2
- **Language**: JavaScript with JSDoc (type-safe)
- **Runtime**: Bun (dev & build)
- **Package Manager**: Bun
- **Build Tool**: Vite 7 + svelte-package
- **Type Checking**: TypeScript compiler (JSDoc mode)

## Development Philosophy

### Why JSDoc instead of TypeScript?

- ⚡ **Instant dev workflow** - No compilation step, native JS
- 🔥 **10x faster HMR** - Direct file updates, no transpilation
- 🐛 **Native debugging** - Source code = executed code
- ✅ **Same type safety** - TypeScript checks JSDoc comments
- 📝 **Better docs** - JSDoc comments serve as inline documentation

Following SvelteKit team's approach: https://github.com/sveltejs/kit

### Why Bun instead of pnpm/npm?

- 🚀 **3-10x faster installs** - Native speed
- ⚡ **Faster test runs** - Built-in test runner
- 🔧 **Native TypeScript** - No need for ts-node
- 📦 **Better monorepo support** - Workspaces built-in
- 🌐 **Node.js compatible** - Drop-in replacement

## Code Style

### JSDoc Type Annotations

All functions have JSDoc type comments:

\`\`\`javascript
/**
 * Function description
 * @param {HTMLElement} element - Element description
 * @param {import('./types.js').OptionsType} [options] - Optional param
 * @returns {ReturnType} Return value description
 */
export function myFunction(element, options) {
  // ...
}
\`\`\`

### Type Imports

Import types from .ts files in JSDoc:

\`\`\`javascript
/**
 * @param {import('./types.js').RuneScrollerOptions} options
 */
\`\`\`
```

### 5.2 Update README.md

**Add installation note:**

```markdown
## Installation

\`\`\`bash
# npm
npm install rune-scroller

# pnpm
pnpm add rune-scroller

# yarn
yarn add rune-scroller

# bun
bun add rune-scroller
\`\`\`

## Development

This library uses **Bun** and **JSDoc** for instant development workflow.

\`\`\`bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start dev server (instant, no build!)
bun run dev

# Run tests
bun test
\`\`\`
```

### 5.3 Update Workspace Documentation

**Update `workspace/CLAUDE.md`:**

```markdown
## Technology Stack - Overview

### Both Repositories
- **Framework**: Svelte 5 with SvelteKit 2
- **Language**: JavaScript with JSDoc (library), TypeScript (site)
- **Package Manager**: Bun
- **Build Tool**: Vite 7
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier

### Library Only
- Zero dependencies
- No Tailwind CSS
- JSDoc for type safety
- Bun for dev & build

### Site Only
- Tailwind CSS 4
- Cloudflare Pages deployment
- Playwright E2E testing
- TypeScript for app code
```

### 5.4 Create Migration Guide

**New file: `MIGRATION_GUIDE.md`:**

Document:
- Why we migrated
- What changed for contributors
- How to work with JSDoc
- Bun-specific commands
- Troubleshooting tips

---

## 🎯 Rollout Strategy

### Option A: Big Bang (Recommended)

Migrate everything in one PR:

```bash
# Day 1-2: Phases 0-1 (Bun setup)
# Day 3-4: Phase 2 (JSDoc migration)
# Day 5: Phase 3 (Build system)
# Day 6: Phase 4 (Testing)
# Day 7: Phase 5 (Documentation)
# Day 8: Code review & merge
```

**Pros:**
- Clean migration
- One-time learning curve
- Easier to review

**Cons:**
- Larger PR
- Risk if something breaks

### Option B: Incremental (Safer)

Migrate in stages:

```bash
# PR #1: Bun setup (Phase 1)
# PR #2: Migrate dom-utils.svelte.ts (test the waters)
# PR #3: Migrate remaining files (Phase 2)
# PR #4: Build system + docs (Phases 3-5)
```

**Pros:**
- Lower risk
- Easier reviews
- Can pause if issues

**Cons:**
- Mixed codebase during migration
- Multiple PRs to coordinate

---

## ✅ Success Criteria

Migration is successful when:

- ✅ All tests pass with Bun
- ✅ Type checking works with JSDoc
- ✅ Build generates correct .d.ts files
- ✅ Site integration works (dev:full)
- ✅ npm package installs correctly
- ✅ Performance improvements documented
- ✅ CI/CD updated and passing
- ✅ Documentation complete

---

## 🚨 Rollback Plan

If migration fails:

```bash
# Restore from backup
git checkout backup-pre-migration

# Or revert branch
git revert HEAD~N  # N = number of commits

# Reinstall pnpm dependencies
pnpm install
```

---

## 📊 Expected Performance Improvements

**Conservative estimates:**

| Metric | Before (pnpm + TS) | After (Bun + JSDoc) | Improvement |
|--------|-------------------|---------------------|-------------|
| Install | ~8-10s | ~2-3s | **70-75% faster** |
| Dev startup | ~2-3s | ~0.5s | **80% faster** |
| HMR update | 50-100ms | <10ms | **10x faster** |
| Test run | ~539ms | ~200ms | **60% faster** |
| Build | ~2-3s | ~1-2s | **30-50% faster** |
| Type check | ~2.5s | ~2.5s | Similar (necessary) |

**Real-world impact:**

During development:
- Change code → See result: **~50ms** (vs 500ms before)
- No compilation delay
- Native debugging in browser

---

## 📝 Next Steps

**Ready to start?**

1. **Review this plan** - Any questions or concerns?
2. **Choose rollout strategy** - Big bang or incremental?
3. **Set timeline** - When to start migration?
4. **Create branch** - `feat/migrate-jsdoc-bun`
5. **Begin Phase 0** - Backup and metrics

**Questions to answer:**

- ❓ Do you want to migrate in one PR or multiple?
- ❓ Any specific concerns about Bun compatibility?
- ❓ Want to test one file first before full migration?

---

**Last updated:** 2024-12-24
**Created by:** Claude Code Assistant
**Status:** Ready for execution
