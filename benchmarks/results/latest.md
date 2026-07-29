# Benchmark Results

Generated: 2026-07-29T15:26:32.932Z

| Profile | Library | Elements | Init median (ms) | Scroll median (ms) | Max frame median (ms) | Dropped frames median | Observers | Scroll/resize listeners | Script median (ms) | Layout median (ms) | Style median (ms) | Heap median (bytes) |
| ------- | ------- | -------: | ---------------: | -----------------: | --------------------: | --------------------: | --------: | ----------------------: | -----------------: | -----------------: | ----------------: | ------------------: |
| desktop | rune    |       50 |            15.10 |             651.40 |                 16.80 |                     1 |         1 |                       0 |               3.80 |               0.47 |             19.75 |             1699644 |
| desktop | rune    |      200 |            19.10 |             642.70 |                 16.80 |                     1 |         1 |                       0 |               8.69 |               1.29 |             36.11 |             1981492 |
| desktop | rune    |     1000 |            36.80 |             664.20 |                 16.10 |                     0 |         1 |                       0 |              20.69 |               6.60 |            117.30 |             3054236 |
| desktop | aos     |       50 |            10.30 |             655.60 |                 17.60 |                     2 |         0 |                       2 |               2.69 |               0.27 |             23.37 |             1584624 |
| desktop | aos     |      200 |            22.50 |             643.20 |                 17.00 |                     1 |         0 |                       2 |               4.64 |               1.00 |             60.15 |             1644440 |
| desktop | aos     |     1000 |            77.80 |             886.40 |                 48.90 |                    14 |         0 |                       2 |              12.50 |               4.97 |            162.30 |             1979852 |
| mobile  | rune    |       50 |            16.10 |             644.20 |                 17.10 |                     1 |         1 |                       0 |               3.71 |               0.41 |             24.37 |             1698916 |
| mobile  | rune    |      200 |            17.70 |             641.20 |                 16.50 |                     0 |         1 |                       0 |               7.42 |               1.37 |             43.63 |             1984028 |
| mobile  | rune    |     1000 |            31.90 |             662.00 |                 16.90 |                     1 |         1 |                       0 |              19.32 |               5.75 |            113.11 |             3044236 |
| mobile  | aos     |       50 |             9.90 |             645.50 |                 16.80 |                     3 |         0 |                       2 |               2.75 |               0.27 |             21.25 |             1585072 |
| mobile  | aos     |      200 |            18.00 |             643.60 |                 17.50 |                     1 |         0 |                       2 |               4.55 |               0.78 |             61.19 |             1644544 |
| mobile  | aos     |     1000 |            72.90 |             868.80 |                 39.90 |                    13 |         0 |                       2 |               8.96 |               4.89 |            187.36 |             1975988 |

Results are machine-specific. Run `bun run benchmark` on the target machine before making public performance claims.
