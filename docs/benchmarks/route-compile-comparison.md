# Route Compile Benchmark Comparison

- Baseline captured: 2026-04-01T19:27:28.928Z
- After captured: 2026-04-01T19:35:59.141Z
- Routes: `/dashboard`, `/home`, `/templates`, `/customize`, `/preview`
- Benchmark command: `npm run benchmark:routes` (with `BENCHMARK_ROUTE_COMPILE=1` for protected routes)

| Route | Before Compile | After Compile | Delta | Change |
| --- | ---: | ---: | ---: | ---: |
| /dashboard | 2200ms | 1904ms | -296ms | -13.5% |
| /home | 2100ms | 2100ms | 0ms | 0.0% |
| /templates | 2100ms | 2200ms | +100ms | +4.8% |
| /customize | 2200ms | 2200ms | 0ms | 0.0% |
| /preview | 2500ms | 2800ms | +300ms | +12.0% |
| **Average** | **2220ms** | **2241ms** | **+21ms** | **+0.9%** |

## Notes

- Negative delta/change is faster (improvement). Positive is slower.
- These are cold, isolated route compiles (fresh dev server per route).
