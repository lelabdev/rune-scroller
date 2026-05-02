import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ANIMATION_TYPES } from '../src/lib/animations.js';

const css = readFileSync(resolve(import.meta.dirname, '../src/lib/animations.css'), 'utf-8');

describe('animations.css', () => {
  it('contains a [data-animation] selector for every ANIMATION_TYPES entry', () => {
    for (const name of ANIMATION_TYPES) {
      const selector = `[data-animation='${name}']`;
      expect(css.includes(selector), `missing selector ${selector}`).toBe(true);
    }
  });

  it('references .is-visible class', () => {
    expect(css.includes('.is-visible')).toBe(true);
  });

  it('defines --rs-distance CSS variable', () => {
    expect(css.includes('--rs-distance')).toBe(true);
  });

  it('contains prefers-reduced-motion media query', () => {
    expect(css.includes('prefers-reduced-motion')).toBe(true);
  });

  const legacyAliases = ['fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right', 'flip', 'flip-x'];

  it('includes legacy aliases', () => {
    for (const alias of legacyAliases) {
      expect(css.includes(`[data-animation='${alias}']`), `missing legacy alias ${alias}`).toBe(true);
    }
  });

  it('has at least 30 unique [data-animation=...] selectors', () => {
    const matches = css.match(/\[data-animation='[^']+'\]/g);
    // Deduplicate
    const unique = new Set(matches);
    expect(unique.size >= 30, `found ${unique.size} unique selectors, expected >= 30`).toBe(true);
  });
});
