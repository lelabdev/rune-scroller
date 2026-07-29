# Benchmark Results

Generated: 2026-07-29T20:12:11.846Z

| Profile | Library | Elements | Init median (ms) | Scroll median (ms) | Max frame median (ms) | Dropped frames median | Observers | Scroll/resize listeners | Script median (ms) | Layout median (ms) | Style median (ms) | Heap median (bytes) |
| ------- | ------- | -------: | ---------------: | -----------------: | --------------------: | --------------------: | --------: | ----------------------: | -----------------: | -----------------: | ----------------: | ------------------: |
| desktop | rune    |       50 |            18.90 |             640.40 |                 17.10 |                     5 |         1 |                       0 |               4.20 |               0.47 |             22.88 |             1702808 |
| desktop | rune    |      200 |            18.60 |             640.10 |                 17.10 |                     2 |         1 |                       0 |               9.03 |               1.41 |             40.98 |             1978940 |
| desktop | rune    |     1000 |            34.50 |             674.30 |                 18.00 |                     1 |         1 |                       0 |              26.82 |               5.44 |            109.71 |             3006392 |
| desktop | aos     |       50 |            10.00 |             653.10 |                 17.30 |                     2 |         0 |                       2 |               2.64 |               0.30 |             23.64 |             1589448 |
| desktop | aos     |      200 |            17.20 |             641.90 |                 16.80 |                     1 |         0 |                       2 |               4.45 |               0.75 |             61.95 |             1645276 |
| desktop | aos     |     1000 |            68.90 |             860.70 |                 48.10 |                    11 |         0 |                       2 |               9.30 |               3.74 |            167.91 |             1967576 |
| mobile  | rune    |       50 |            16.90 |             645.40 |                 16.80 |                     1 |         1 |                       0 |               4.00 |               0.49 |             25.60 |             1701868 |
| mobile  | rune    |      200 |            18.20 |             642.70 |                 17.20 |                     2 |         1 |                       0 |               8.27 |               1.34 |             44.57 |             1979720 |
| mobile  | rune    |     1000 |            34.00 |             670.70 |                 17.00 |                     1 |         1 |                       0 |              20.46 |               5.76 |            117.16 |             3009112 |
| mobile  | aos     |       50 |            10.00 |             651.10 |                 17.10 |                     2 |         0 |                       2 |               2.62 |               0.32 |             22.15 |             1589904 |
| mobile  | aos     |      200 |            17.20 |             645.70 |                 17.20 |                     1 |         0 |                       2 |               4.17 |               0.76 |             60.86 |             1646820 |
| mobile  | aos     |     1000 |            65.30 |             898.10 |                 51.60 |                    14 |         0 |                       2 |               9.87 |               3.56 |            166.92 |             1965608 |

Results are machine-specific. Run `bun run benchmark` on the target machine before making public performance claims.
