import { describe, it, expect } from "bun:test";
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

  it("leads with Svelte-first usage through the dedicated ./svelte entry", () => {
    expect(readme).toContain("rune-scroller/svelte");
    expect(readme).toMatch(/import rs from ["']rune-scroller\/svelte["']/);
  });

  it("documents a secondary Vanilla JS example using the framework-neutral core", () => {
    expect(readme).toMatch(/import \{ animate \} from ["']rune-scroller["']/);
  });

  it("removes AOS public claims", () => {
    expect(readme).not.toMatch(/## AOS/);
    expect(readme).not.toMatch(/data-aos-anchor/);
    expect(readme).not.toContain("rune-scroller/aos");
    expect(readme).not.toMatch(/AOS replacement/i);
  });

  it("documents breaking changes in the Unreleased section", () => {
    expect(changelog).toContain("[Unreleased]");
    expect(changelog).toMatch(/### Removed/);
    expect(changelog).toMatch(/AOS/);
  });

  it("uses unambiguous unit and browser test commands", () => {
    expect(packageJson.scripts.test).toBe("bun test tests");
    expect(packageJson.scripts.prepublishonly).toContain("bun run test");
    expect(agents).toContain("bun run test");
    expect(agents).not.toContain("&& bun test &&");
  });

  it("documents the IntersectionObserver browser requirement", () => {
    expect(readme).toContain("IntersectionObserver");
    expect(ANIMATION_TYPES.length - legacyAliases).toBe(29);
  });
});
