import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { compile } from "svelte/compiler";

const root = resolve(import.meta.dirname, "../..");
const distAnimate = join(root, "dist/animate.js");
const outDir = join(root, "e2e/pages/generated");
const compiledDir = join(outDir, "compiled");

if (!existsSync(distAnimate)) {
  console.error("dist/animate.js missing — run `bun run build` first");
  process.exit(1);
}

mkdirSync(compiledDir, { recursive: true });

// Relative import from e2e/pages/generated/compiled/ → dist/animate.js
// (plain animate is the Svelte action; avoids rune modules in svelte.js)
const harnessSource = `
<script>
  import { animate as rs } from "../../../../dist/animate.js";

  let opts = $state({ animation: "fade-up", duration: 400 });

  export function setOptions(next) {
    opts = { ...next };
  }
</script>

<div id="hosted" use:rs={opts}>Hello</div>
`;

const compiledHarness = compile(harnessSource, {
  filename: "ActionComponentHarness.svelte",
  generate: "client",
});
const harnessOut = join(compiledDir, "ActionComponentHarness.js");
// compile() may rewrite relative imports; force path to published animate core.
const harnessCode = compiledHarness.js.code.replace(
  /from\s+["'][^"']*animate[^"']*["']/,
  'from "../../../../dist/animate.js"',
);
writeFileSync(harnessOut, harnessCode);

const entryPath = join(compiledDir, "action-component-entry.js");
writeFileSync(
  entryPath,
  `import { mount, unmount, flushSync } from "svelte";
import Harness from "./ActionComponentHarness.js";

window.__mountRsHarness = (rootEl) => {
  const instance = mount(Harness, { target: rootEl });
  flushSync();
  return {
    setOptions: (next) => {
      instance.setOptions(next);
      flushSync();
    },
    instance,
  };
};

window.__unmountRsHarness = (api) => {
  unmount(api.instance ?? api);
  flushSync();
};
`,
);

const bundlePath = join(outDir, "action-component.bundle.js");
const build = Bun.spawnSync(
  [
    "bun",
    "build",
    entryPath,
    "--outfile",
    bundlePath,
    "--format",
    "esm",
    "--target",
    "browser",
  ],
  {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      PATH: `/home/loops/.bun/bin:/usr/bin:/bin:${process.env.PATH ?? ""}`,
    },
  },
);

if (build.exitCode !== 0) {
  console.error("bun build failed for action-component harness");
  process.exit(build.exitCode ?? 1);
}

console.log("Wrote", bundlePath);
