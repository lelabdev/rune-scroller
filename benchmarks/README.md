# Benchmarks

Run the deterministic comparison with:

```bash
bun run benchmark
```

The runner compares Rune Scroller with `aos@2.3.4` at 50, 200, and 1,000 elements in desktop and mobile Chromium contexts. It records three samples by default; set `BENCHMARK_SAMPLES` to change the count.

It writes raw samples to `benchmarks/results/latest.json` and medians plus variance-ready inputs to `benchmarks/results/latest.md`.

Metrics include initialization time, automated scroll time, frame pacing, long tasks, browser `ScriptDuration`, layout and style recalculation duration, JavaScript heap, observer count, and scroll/resize listener count.

Results are machine-specific and must not be used as public comparative claims without recording the exact machine, Chromium binary, sample count, and generated result file. When the Playwright-managed browser is unavailable, provide an explicit Chromium path:

```bash
BENCHMARK_CHROMIUM=/path/to/chrome bun run benchmark
```
