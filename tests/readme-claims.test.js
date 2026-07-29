import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ANIMATION_TYPES } from "../src/lib/animations.js";

const readme = readFileSync(
  resolve(import.meta.dirname, "../README.md"),
  "utf8",
);
const legacyAliases = 7;

describe("README public claims", () => {
  it("documents the primary animation count separately from legacy aliases", () => {
    expect(ANIMATION_TYPES).toHaveLength(36);
    expect(readme).toContain("29 primary animations + 7 legacy aliases");
  });

  it("defines the supported AOS compatibility surface", () => {
    expect(readme).toContain("## AOS Compatibility");
    expect(readme).toContain("`data-aos-anchor`");
    expect(readme).toContain("Call `AOS.refreshHard()`");
  });

  it("documents the IntersectionObserver browser requirement", () => {
    expect(readme).toContain("Requires a browser with");
    expect(readme).toContain("IntersectionObserver support");
    expect(ANIMATION_TYPES.length - legacyAliases).toBe(29);
  });
});
