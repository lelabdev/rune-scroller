import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

describe("package metadata", () => {
  it("preserves the exported animation stylesheet as a side effect", () => {
    expect(packageJson.sideEffects).toEqual(["*.css"]);
  });

  it("declares the framework-neutral core, Svelte entry, and stylesheet exports", () => {
    expect(packageJson.exports["."].default).toBe("./dist/index.js");
    expect(packageJson.exports["./svelte"].svelte).toBe("./dist/svelte.js");
    expect(packageJson.exports["./svelte"].types).toBe("./dist/svelte.d.ts");
    expect(packageJson.exports["./animations.css"]).toBe(
      "./dist/animations.css",
    );
  });

  it("does not advertise an AOS export or description", () => {
    expect(packageJson.exports["./aos"]).toBeUndefined();
    expect(String(packageJson.description)).not.toMatch(/aos/i);
  });

  it("keeps Svelte as an optional peer dependency", () => {
    expect(packageJson.peerDependencies?.svelte).toMatch(/^\^5/);
    expect(packageJson.peerDependenciesMeta?.svelte?.optional).toBe(true);
  });

  it("keeps zero runtime dependencies", () => {
    expect(packageJson.dependencies ?? {}).toEqual({});
  });
});
