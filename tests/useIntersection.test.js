import { describe, it, expect, beforeEach } from "bun:test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, "../src/lib/useIntersection.svelte.js");

/**
 * Structural tests for useIntersection and useIntersectionOnce composables
 *
 * Note: Full functional testing requires Svelte 5 runtime environment.
 * These composables use Svelte runes ($state) and $effect which cannot
 * be tested outside of a Svelte component context.
 */
describe("useIntersection Composable", () => {
  let useIntersection;
  let useIntersectionOnce;

  beforeEach(async () => {
    const module = await import("../src/lib/useIntersection.svelte.js");
    useIntersection = module.useIntersection;
    useIntersectionOnce = module.useIntersectionOnce;
  });

  describe("Module Exports", () => {
    it("exports useIntersection function", () => {
      expect(useIntersection).toBeDefined();
      expect(typeof useIntersection).toBe("function");
    });

    it("exports useIntersectionOnce function", () => {
      expect(useIntersectionOnce).toBeDefined();
      expect(typeof useIntersectionOnce).toBe("function");
    });

    it("both exports are functions", () => {
      expect(typeof useIntersection).toBe("function");
      expect(typeof useIntersectionOnce).toBe("function");
    });
  });

  describe("Source Structure", () => {
    let content;

    beforeEach(() => {
      content = fs.readFileSync(sourcePath, "utf8");
    });

    it("has proper JSDoc comments", () => {
      expect(content).toContain("@param");
      expect(content).toContain("Composable");
    });

    it("uses Svelte 5 runes", () => {
      expect(content).toContain("$state");
      expect(content).toContain("$effect");
    });

    it("uses IntersectionObserver", () => {
      expect(content).toContain("IntersectionObserver");
    });
  });
});
