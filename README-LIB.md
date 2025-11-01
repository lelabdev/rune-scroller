# Rune Scroller - Library Repository

This is the **library-only repository** for Rune Scroller. It contains the core scroll animation component for Svelte 5.

## 📦 What's Included

- **Rs component** - Main scroll animation component
- **useIntersection composables** - For custom scroll detection
- **26+ animations** - Fade, zoom, flip, slide, bounce variants
- **Zero dependencies** - Pure Svelte 5 + IntersectionObserver API
- **~2KB gzipped** - Optimized bundle size

## 🚀 Development

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type checking
pnpm check

# Format and lint
pnpm format
pnpm lint

# Build for npm
pnpm build

# Run tests
pnpm test
```

## 📚 Documentation

For full documentation, usage examples, and API reference, see the main [README.md](./README.md).

For information on contributing and development guidelines, see [CLAUDE.md](./CLAUDE.md).

## 📦 Publishing to npm

1. Update version in `package.json`
2. Run `pnpm build`
3. Run `npm publish`

The built library will be available as `rune-scroller` on npm.

## 🔗 Related Repositories

- **rune-scroller-site** - Demo and documentation website
  - Shows all animations in action
  - Interactive examples
  - Deployment to Cloudflare Pages

## 📄 License

MIT - See LICENSE file for details

**Created by [ludoloops](https://github.com/ludoloops) at [LeLab.dev](https://lelab.dev)**
