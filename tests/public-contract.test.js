import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const indexSource = readFileSync(
  resolve(import.meta.dirname, "../src/lib/index.js"),
  "utf8",
);
const svelteSource = readFileSync(
  resolve(import.meta.dirname, "../src/lib/svelte.js"),
  "utf8",
);
const packageJson = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../package.json"), "utf8"),
);
const readme = readFileSync(
  resolve(import.meta.dirname, "../README.md"),
  "utf8",
);

describe("framework-neutral core contract", () => {
  it("exposes animate as the default export of the root entry", () => {
    expect(indexSource).toContain("export default animate");
    expect(indexSource).toMatch(/export \{ animate \}/);
  });

  it("re-exports the animation utilities and types from the root entry", () => {
    expect(indexSource).toContain("./animations.js");
    expect(indexSource).toContain("./types.js");
  });

  it("keeps the root entry free of Svelte runtime imports", () => {
    expect(indexSource).not.toMatch(
      /from\s+['"][^'"]*useIntersection\.svelte\.js/,
    );
    expect(indexSource).not.toMatch(/from\s+['"]svelte/);
    expect(indexSource).not.toMatch(/\$state|\$effect/);
  });

  it("keeps the root entry free of AOS references", () => {
    expect(indexSource).not.toMatch(/aos/i);
  });

  it("does not ship an AOS module", () => {
    expect(existsSync(resolve(import.meta.dirname, "../src/lib/aos.js"))).toBe(
      false,
    );
  });
});

describe("Svelte entry contract", () => {
  it("exposes the Svelte action and rune composables from ./svelte", () => {
    expect(svelteSource).toContain("./useIntersection.svelte.js");
    expect(svelteSource).toMatch(/animate as runeScroller/);
    expect(svelteSource).toMatch(/animate as rs/);
  });
});

describe("package exports and peer dependencies", () => {
  it("declares a dedicated ./svelte subpath", () => {
    expect(packageJson.exports["./svelte"]).toBeDefined();
    expect(packageJson.exports["./svelte"]).toHaveProperty("svelte");
  });

  it("drops the ./aos subpath", () => {
    expect(packageJson.exports["./aos"]).toBeUndefined();
  });

  it("keeps the root and stylesheet exports", () => {
    expect(packageJson.exports["."]).toBeDefined();
    expect(packageJson.exports["./animations.css"]).toBeDefined();
  });

  it("marks Svelte as an optional peer dependency", () => {
    expect(packageJson.peerDependencies?.svelte).toBeDefined();
    expect(packageJson.peerDependenciesMeta?.svelte?.optional).toBe(true);
  });

  it("documents the explicit stylesheet import for quick-start examples", () => {
    expect(readme).toContain('import "rune-scroller/animations.css";');
  });
});
