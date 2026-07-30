# Benchmarks

Run the deterministic measurement with:

```bash
bun run benchmark
```

The runner measures Rune Scroller's framework-neutral core at 50, 200, and 1,000 elements in desktop and mobile Chromium contexts. It records three samples by default; set `BENCHMARK_SAMPLES` to change the count.

It writes raw samples to `benchmarks/results/latest.json` and medians plus variance-ready inputs to `benchmarks/results/latest.md`.

Metrics include initialization time, automated scroll time, frame pacing, long tasks, browser `ScriptDuration`, layout and style recalculation duration, JavaScript heap, observer count, and scroll/resize listener count. CDP script/layout/style durations cover init+scroll of Rune Scroller only, not fixture HTML/CSS injection. Each density scrolls from top to max scrollY in half-viewport steps.

Results are machine-specific and must not be used as public performance claims without recording the exact machine, Chromium binary, sample count, and generated result file. When the Playwright-managed browser is unavailable, provide an explicit Chromium path:

```bash
BENCHMARK_CHROMIUM=/path/to/chrome bun run benchmark
```
