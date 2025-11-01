# CLAUDE.md - Rune Scroller Library

This file provides guidance to Claude Code (claude.ai/code) when working on the **library repository** only.

## Project Overview

**Rune Scroller** is an **open-source** scroll animation library for Svelte 5, created by **[ludoloops](https://github.com/ludoloops)** at **[LeLab.dev](https://lelab.dev)**.

It provides reusable components and composables for adding scroll-triggered animations to web applications with minimal bundle size (~2KB). Licensed under **MIT** for personal and commercial use.

### What This Library Provides

- **Rs Component** - Unified scroll animation component (one-time or repeating via `repeat` prop)
- **useIntersection Composables** - For custom scroll detection
- **26+ Built-in Animations** - Fade, zoom, flip, slide, bounce variants
- **Zero Dependencies** - Pure Svelte 5 + IntersectionObserver API
- **TypeScript Support** - Full type safety with strict mode
- **HTML Attribute Support** - Accept any HTML attributes like `data-*`, `class`, `id`, etc.

### Repository Structure

This is the **library-only repository**. The demo website is in a separate repository (`rune-scroller-site`).

## Technology Stack

- **Framework**: SvelteKit 2 with Svelte 5 (using runes syntax)
- **TypeScript**: Full TypeScript support with strict mode
- **Package Manager**: pnpm
- **Build Tool**: Vite 7 + svelte-package
- **Linting**: ESLint 9 (flat config) with TypeScript and Svelte plugins
- **Formatting**: Prettier with Svelte plugin

Note: This library does NOT use Tailwind CSS (that's only for the website).

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm check

# Type checking in watch mode
pnpm check:watch

# Format code
pnpm format

# Lint code
pnpm lint

# Build for npm
pnpm build

# Run tests
pnpm test
```

## Architecture

### Directory Structure

```
rune-scroller-lib/
├── src/
│   └── lib/                        # Library source code ONLY
│       ├── Rs.svelte               # Main animation component
│       ├── BaseAnimated.svelte     # Base animation implementation
│       ├── useIntersection.svelte.ts # Composable utilities
│       ├── animate.svelte.ts       # Animation action
│       ├── animations.ts           # Animation configuration & validation
│       ├── animations.css          # Core animation styles
│       ├── animations.test.ts      # Animation tests
│       ├── scroll-animate.test.ts  # Component tests
│       └── index.ts                # Library entry point
├── dist/                           # Built library (created by pnpm build)
├── package.json                    # npm package configuration
├── README.md                       # Library documentation
├── CLAUDE.md                       # This file
├── CHANGELOG.md                    # Version history
├── LICENSE                         # MIT License
├── svelte.config.js                # SvelteKit configuration
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # TypeScript configuration
└── eslint.config.js                # ESLint configuration
```

**Note**: This library does NOT include:
- ❌ `assets/` folder
- ❌ `static/` folder
- ❌ `src/routes/` folder
- ❌ Tailwind CSS configuration

These belong to the demo website repository (`rune-scroller-site`).

### Svelte 5 Runes

This library uses Svelte 5's new runes syntax:

- `$props()` - for component props (replaces `export let`)
- `$state()` - for reactive state
- `{@render children()}` - for rendering slot content

### Core Library Components

**Rs Component** (`src/lib/Rs.svelte`):

- Unified scroll animation component using IntersectionObserver API
- Supports both one-time and repeating animations via `repeat` prop
- Props:
  - `animation?: AnimationType` - Animation name (default: 'fade-in')
  - `threshold?: number` - Visibility threshold (default: 0.5)
  - `offset?: number` - Trigger offset 0-100% (optional)
  - `rootMargin?: string` - Observer margin (overrides offset if set)
  - `duration?: number` - Duration in ms (default: 800)
  - `delay?: number` - Delay in ms (default: 0)
  - `repeat?: boolean` - Repeat animation on every scroll (default: false)
  - `children: Snippet` - Content to animate
  - `[key: string]: any` - Any HTML attributes (data-*, class, id, etc.)
- Uses CSS custom properties (`--duration`, `--delay`) for dynamic styling
- Automatic cleanup with observer disconnect on unmount

**BaseAnimated Component** (`src/lib/BaseAnimated.svelte`):

- Internal base component for animation logic
- Handles IntersectionObserver setup and animation triggering
- Supports both one-time and repeating modes via `once` prop

**useIntersection Composables** (`src/lib/useIntersection.svelte.ts`):

- `useIntersectionOnce()` - For one-time animations
- `useIntersection()` - For repeating animations
- Returns reactive `{ element, isVisible }` state
- Automatic cleanup prevents memory leaks

**Animations Config** (`src/lib/animations.ts`):

- Centralized animation definitions
- `isValidAnimation()` function for validation
- Default options for timing and easing
- Supports 26+ animation types

**Animation Styles** (`src/lib/animations.css`):

- All animation keyframes and styles (26+ animations)
- CSS custom properties (`--duration`, `--delay`) for dynamic animation timing
- GPU-accelerated animations with `will-change` hints
- Accessibility support: `prefers-reduced-motion` media query

### Library Entry Point

The library is exported via `src/lib/index.ts` which exports:

- `rs` - The main Rs component (exported as `rs` for usage as `<Rs>` in templates)
- `animate` action - For custom animation control
- `useIntersection` and `useIntersectionOnce` composables
- `calculateRootMargin()` utility function
- `AnimationType` TypeScript type definition

### npm Package Configuration

**Key package.json fields:**

- `name`: `rune-scroller`
- `version`: Semantic versioning (currently 0.0.1)
- `type`: `module` (ES modules)
- `exports`: Configured for both ES and CommonJS
- `main`: Points to built library entry point
- `svelte`: SvelteKit package export field
- `files`: Specifies what gets published to npm (only `dist/`)
- `keywords`: `svelte`, `animations`, `scroll-animations`, etc.

## Code Style

### Formatting

- Uses tabs for indentation
- Single quotes for strings
- No trailing commas
- 100 character line width
- Svelte-specific formatting via prettier-plugin-svelte

### TypeScript

- Strict mode enabled
- Module resolution: bundler
- Allow JS/Check JS enabled for gradual typing

### ESLint

- Flat config format (ESLint 9+)
- TypeScript ESLint recommended rules
- Svelte plugin with recommended rules
- `no-undef` disabled (TypeScript handles this)

## Important Patterns

### IntersectionObserver Usage

All scroll animations use the IntersectionObserver API with consistent configuration:

- Default threshold: 0.5 (50% visibility)
- Default rootMargin: `-10% 0px -10% 0px` (centers trigger zone)
- Always disconnect observers in cleanup functions

### Component Props Pattern

When creating new components with Svelte 5, use destructured props with rest parameters for HTML attributes:

```javascript
let { propName = defaultValue, children, ...rest } = $props();
```

**Rs Component example:**
```typescript
interface Props {
	animation?: AnimationType;
	threshold?: number;
	rootMargin?: string;
	offset?: number;
	duration?: number;
	delay?: number;
	repeat?: boolean;
	children: Snippet;
	[key: string]: any; // Allows any HTML attributes
}

const { animation = 'fade-in', threshold = 0.5, ... , ...rest } = $props();
```

This pattern allows passing arbitrary HTML attributes like `data-testid`, `class`, `id` to the component.

### Animation Implementation

Animations use a two-step approach:

1. Initial state defined via CSS with `opacity: 0` and transforms
2. Visible state triggered by `.is-visible` class with transitions

## Publishing to npm

When ready to publish:

1. **Update version** in package.json following semantic versioning
2. **Build the library** with `pnpm build`
3. **Test locally** with `npm link` in a test project
4. **Authenticate** with `npm login`
5. **Publish** with `npm publish`

The built library will be published to npm as `rune-scroller`:

```bash
npm install rune-scroller
# or
pnpm add rune-scroller
# or
yarn add rune-scroller
```

Users can then import components and utilities:

```javascript
// Main component
import Rs from 'rune-scroller';

// Composables
import { useIntersection, useIntersectionOnce } from 'rune-scroller';

// Styles (required)
import 'rune-scroller/animations.css';

// Usage
<Rs animation="fade-in">Content</Rs>
<Rs animation="zoom-in" repeat>Repeating Content</Rs>
```

**Basic example:**
```svelte
<script>
	import Rs from 'rune-scroller';
	import 'rune-scroller/animations.css';
</script>

<Rs animation="fade-in-up" duration={1000} delay={200}>
	<div>Hello World</div>
</Rs>
```

## Related Repositories

- **rune-scroller-site** - Demo and documentation website
  - Shows all animations in action
  - Interactive examples
  - Deployment to Cloudflare Pages
  - Located in separate GitHub repository

## Path Aliases

- `$lib` - Maps to `src/lib` (configured by SvelteKit)

## Testing

The library includes unit tests for:

- Animation configuration (`src/lib/animations.test.ts`)
- Component behavior (`src/lib/scroll-animate.test.ts`)

Run tests with:
```bash
pnpm test
```

## Contributing

When contributing to this library:

1. Keep changes focused on core library functionality
2. Maintain zero dependencies
3. Follow the code style guidelines
4. Add tests for new features
5. Update documentation if needed
6. Test the library locally before publishing

## 📄 License

MIT - See LICENSE file for details

**Created by [ludoloops](https://github.com/ludoloops) at [LeLab.dev](https://lelab.dev)**
