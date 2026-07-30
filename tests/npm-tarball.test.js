import { afterAll, describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tempRoot = mkdtempSync(join(tmpdir(), "rune-scroller-tarball-"));
const bunBin = Bun.which("bun") ?? "bun";
const npmBin = Bun.which("npm") ?? "npm";
const tarBin = Bun.which("tar") ?? "tar";
const mkdirBin = Bun.which("mkdir") ?? "mkdir";

function run(cmd, args, cwd = root) {
  const result = Bun.spawnSync([cmd, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  if (result.exitCode !== 0) {
    throw new Error(
      `${cmd} ${args.join(" ")} failed (${result.exitCode})\n${stdout}\n${stderr}`,
    );
  }
  return { stdout, stderr };
}

function ensureBuild() {
  if (!existsSync(join(root, "dist/index.js"))) {
    run(bunBin, ["run", "build"]);
  }
}

describe("npm tarball install contract", () => {
  /** @type {string | undefined} */
  let tgzPath;

  afterAll(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it(
    "packs registry-faithful tarball with required package files",
    () => {
      ensureBuild();
      // --ignore-scripts avoids prepare (svelte-kit sync) during pack-only checks.
      const { stdout } = run(npmBin, [
        "pack",
        "--ignore-scripts",
        "--pack-destination",
        tempRoot,
      ]);
      const tgzName = stdout
        .trim()
        .split(/\s+/)
        .find((line) => line.endsWith(".tgz"));
      expect(tgzName).toBeDefined();
      tgzPath = join(tempRoot, /** @type {string} */ (tgzName));
      expect(existsSync(tgzPath)).toBe(true);

      const listing = run(tarBin, ["-tzf", tgzPath]).stdout.split("\n");
      const required = [
        "package/package.json",
        "package/dist/index.js",
        "package/dist/svelte.js",
        "package/dist/animations.css",
        "package/dist/index.d.ts",
        "package/dist/svelte.d.ts",
        "package/README.md",
        "package/LICENSE",
        "package/logo.png",
        "package/CHANGELOG.md",
      ];
      for (const entry of required) {
        expect(listing).toContain(entry);
      }
    },
    { timeout: 120_000 },
  );

  it(
    "supports a core-only consumer without svelte",
    () => {
      expect(tgzPath).toBeDefined();
      const consumer = join(tempRoot, "core-consumer");
      run(mkdirBin, ["-p", consumer]);
      writeFileSync(
        join(consumer, "package.json"),
        JSON.stringify({
          name: "core-consumer",
          type: "module",
          private: true,
        }),
      );
      run(bunBin, ["add", /** @type {string} */ (tgzPath)], consumer);

      const importResult = Bun.spawnSync(
        [
          bunBin,
          "-e",
          `const mod = await import("rune-scroller");
console.log(JSON.stringify({
  animate: typeof mod.animate,
  types: Array.isArray(mod.ANIMATION_TYPES),
}));`,
        ],
        {
          cwd: consumer,
          stdout: "pipe",
          stderr: "pipe",
          env: process.env,
        },
      );
      expect(importResult.exitCode).toBe(0);
      const imported = JSON.parse(importResult.stdout.toString());
      expect(imported.animate).toBe("function");
      expect(imported.types).toBe(true);

      const cssResult = Bun.spawnSync(
        [
          bunBin,
          "-e",
          `console.log(import.meta.resolve("rune-scroller/animations.css"))`,
        ],
        {
          cwd: consumer,
          stdout: "pipe",
          stderr: "pipe",
          env: process.env,
        },
      );
      expect(cssResult.exitCode).toBe(0);
      const cssUrl = cssResult.stdout.toString().trim();
      expect(cssUrl.endsWith("dist/animations.css")).toBe(true);
      const cssPath = cssUrl.startsWith("file:")
        ? new URL(cssUrl).pathname
        : cssUrl;
      expect(existsSync(cssPath)).toBe(true);

      const installedPkg = JSON.parse(
        readFileSync(
          join(consumer, "node_modules/rune-scroller/package.json"),
          "utf8",
        ),
      );
      expect(installedPkg.dependencies ?? {}).toEqual({});
    },
    { timeout: 120_000 },
  );

  it(
    "supports a svelte consumer package layout",
    () => {
      expect(tgzPath).toBeDefined();
      const consumer = join(tempRoot, "svelte-consumer");
      run(mkdirBin, ["-p", consumer]);
      writeFileSync(
        join(consumer, "package.json"),
        JSON.stringify({
          name: "svelte-consumer",
          type: "module",
          private: true,
          dependencies: {
            "rune-scroller": `file:${tgzPath}`,
            svelte: "^5.0.0",
          },
        }),
      );
      run(bunBin, ["install"], consumer);

      const pkgRoot = join(consumer, "node_modules/rune-scroller");
      expect(existsSync(join(pkgRoot, "dist/svelte.js"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist/svelte.d.ts"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist/useIntersection.svelte.js"))).toBe(
        true,
      );

      const svelteSource = readFileSync(
        join(pkgRoot, "dist/svelte.js"),
        "utf8",
      );
      expect(svelteSource).toContain("useIntersection");
      expect(svelteSource).toContain("useIntersectionOnce");

      const installedPkg = JSON.parse(
        readFileSync(join(pkgRoot, "package.json"), "utf8"),
      );
      expect(installedPkg.dependencies ?? {}).toEqual({});
    },
    { timeout: 120_000 },
  );
});
