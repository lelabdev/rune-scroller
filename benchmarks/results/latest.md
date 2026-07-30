# Benchmark Results

Generated: 2026-07-30T00:35:35.807Z

| Profile | Elements | Init median (ms) | Scroll median (ms) | Max frame median (ms) | Dropped frames median | Observers | Scroll/resize listeners | Script median (ms) | Layout median (ms) | Style median (ms) | Heap median (bytes) |
| ------- | -------: | ---------------: | -----------------: | --------------------: | --------------------: | --------: | ----------------------: | -----------------: | -----------------: | ----------------: | ------------------: |
| desktop |       50 |            25.00 |             662.20 |                 16.70 |                     1 |         1 |                       0 |               4.88 |               0.59 |             20.20 |             1549428 |
| desktop |      200 |            19.00 |             647.90 |                 16.60 |                     0 |         1 |                       0 |               9.02 |               1.15 |             32.17 |             1825864 |
| desktop |     1000 |            33.30 |             664.80 |                 16.60 |                     0 |         1 |                       0 |              22.21 |               5.67 |            106.27 |             2850040 |
| mobile  |       50 |            18.90 |             640.00 |                 16.60 |                     0 |         1 |                       0 |               3.71 |               0.43 |             21.79 |             1548612 |
| mobile  |      200 |            17.70 |             638.70 |                 16.50 |                     0 |         1 |                       0 |               8.17 |               1.26 |             41.56 |             1826412 |
| mobile  |     1000 |            31.80 |             668.60 |                 16.20 |                     0 |         1 |                       0 |              19.57 |               5.55 |            114.44 |             2843412 |

Results are machine-specific. Run `bun run benchmark` on the target machine before making public performance claims.
