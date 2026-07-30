# Benchmark Results

Generated: 2026-07-30T21:16:08.152Z

| Profile | Elements | Init median (ms) | Scroll median (ms) | Max frame median (ms) | Dropped frames median | Observers | Scroll/resize listeners | Script median (ms) | Layout median (ms) | Style median (ms) | Heap median (bytes) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop | 50 | 15.30 | 253.00 | 16.50 | 0 | 1 | 0 | 2.59 | 0.25 | 11.01 | 1601152 |
| desktop | 200 | 16.90 | 1152.80 | 16.50 | 0 | 1 | 0 | 14.73 | 0.74 | 67.50 | 1978104 |
| desktop | 1000 | 33.80 | 5924.80 | 25.30 | 1 | 1 | 0 | 91.48 | 4.75 | 436.05 | 3540652 |
| mobile | 50 | 18.10 | 95.40 | 16.30 | 0 | 1 | 0 | 2.45 | 0.36 | 7.36 | 1593176 |
| mobile | 200 | 19.40 | 468.40 | 16.40 | 0 | 1 | 0 | 8.76 | 1.03 | 36.27 | 1943496 |
| mobile | 1000 | 33.90 | 2523.50 | 15.80 | 0 | 1 | 0 | 51.12 | 5.71 | 281.80 | 3284192 |

Results are machine-specific. Run `bun run benchmark` on the target machine before making public performance claims.
