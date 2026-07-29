import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

describe("package metadata", () => {
  it("preserves the exported animation stylesheet as a side effect", () => {
    expect(packageJson.sideEffects).toEqual(["*.css"]);
  });
});
