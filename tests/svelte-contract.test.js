import { describe, expect, it } from "bun:test";
import * as svelteEntry from "../src/lib/svelte.js";
import svelteDefault from "../src/lib/svelte.js";

describe("Svelte entry contract", () => {
  it("exposes the Svelte action as the default export", () => {
    expect(typeof svelteDefault).toBe("function");
  });

  it("aliases the action as runeScroller and rs", () => {
    expect(typeof svelteEntry.runeScroller).toBe("function");
    expect(typeof svelteEntry.rs).toBe("function");
    expect(svelteEntry.runeScroller).toBe(svelteDefault);
    expect(svelteEntry.rs).toBe(svelteDefault);
  });

  it("re-exports the framework-neutral animate function", () => {
    expect(typeof svelteEntry.animate).toBe("function");
    expect(svelteEntry.animate).toBe(svelteDefault);
  });

  it("exposes the rune-based intersection composables", () => {
    expect(typeof svelteEntry.useIntersection).toBe("function");
    expect(typeof svelteEntry.useIntersectionOnce).toBe("function");
  });

  it("re-exports the animation utilities", () => {
    expect(Array.isArray(svelteEntry.ANIMATION_TYPES)).toBe(true);
    expect(typeof svelteEntry.calculateRootMargin).toBe("function");
  });
});
