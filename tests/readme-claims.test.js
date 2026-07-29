import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ANIMATION_TYPES } from "../src/lib/animations.js";

const packageJson = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../package.json"), "utf8"),
);
const agents = readFileSync(
  resolve(import.meta.dirname, "../AGENTS.md"),
  "utf8",
);
const changelog = readFileSync(
  resolve(import.meta.dirname, "../CHANGELOG.md"),
  "utf8",
);
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

  it("uses the verified animation and E2E test counts", () => {
    expect(readme).toContain("29 primary animations + 7 legacy aliases");
    expect(readme).not.toContain("Available Animations (30)");
    expect(changelog).toContain("57 Playwright E2E tests");
  });

  it("uses unambiguous unit and browser test commands", () => {
    expect(packageJson.scripts.test).toBe("bun test tests");
    expect(packageJson.scripts.prepublishonly).toContain("bun run test");
    expect(agents).toContain("bun run test");
    expect(agents).not.toContain("&& bun test &&");
  });

  it("keeps the React quick start as one code block", () => {
    expect(readme).not.toContain("````jsx");
    expect(
      readme.match(/### React \(not tested — should work\)/g),
    ).toHaveLength(1);
  });

  it("links to the reproducible benchmark results", () => {
    expect(readme).toContain("## Measured Performance");
    expect(readme).toContain("benchmarks/results/latest.md");
    expect(readme).toContain("more JavaScript heap");
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
