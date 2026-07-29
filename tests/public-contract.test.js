import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const index = readFileSync(
  resolve(import.meta.dirname, "../src/lib/index.js"),
  "utf8",
);
const readme = readFileSync(
  resolve(import.meta.dirname, "../README.md"),
  "utf8",
);

describe("public package contract", () => {
  it("declares the documented public types from the main entry point", () => {
    expect(index).toContain('export * from "./types.js";');
  });

  it("imports the explicit stylesheet in AOS quick-start examples", () => {
    expect(readme).toContain('import "rune-scroller/animations.css";');
  });
});
