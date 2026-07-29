import { describe, it, expect, beforeEach } from "bun:test";
/** Public exports for the intersection composables. */
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

});
