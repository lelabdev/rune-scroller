import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ANIMATION_TYPES } from "../src/lib/animations.js";

const css = readFileSync(
  resolve(import.meta.dirname, "../src/lib/animations.css"),
  "utf-8",
);

// Extract all animation names from CSS selectors (handles both quote styles)
function getAnimationNames(cssText) {
  const matches = cssText.match(/\[data-animation=["']([^"']+)["']\]/g) || [];
  return new Set(matches.map((m) => m.match(/["']([^"']+)["']/)[1]));
}

describe("animations.css", () => {
  it("contains a [data-animation] selector for every ANIMATION_TYPES entry", () => {
    const cssNames = getAnimationNames(css);
    for (const name of ANIMATION_TYPES) {
      expect(cssNames.has(name), `missing selector for "${name}"`).toBe(true);
    }
  });

  it("references .is-visible class", () => {
    expect(css.includes(".is-visible")).toBe(true);
  });

  it("defines --rs-distance CSS variable", () => {
    expect(css.includes("--rs-distance")).toBe(true);
  });

  it("contains prefers-reduced-motion media query", () => {
    expect(css.includes("prefers-reduced-motion")).toBe(true);
  });

  const legacyAliases = [
    "fade-in",
    "fade-in-up",
    "fade-in-down",
    "fade-in-left",
    "fade-in-right",
    "flip",
    "flip-x",
  ];

  it("includes legacy aliases", () => {
    const cssNames = getAnimationNames(css);
    for (const alias of legacyAliases) {
      expect(cssNames.has(alias), `missing legacy alias "${alias}"`).toBe(true);
    }
  });

  it("has at least 30 unique [data-animation=...] selectors", () => {
    const cssNames = getAnimationNames(css);
    expect(
      cssNames.size >= 30,
      `found ${cssNames.size} unique selectors, expected >= 30`,
    ).toBe(true);
  });
});
