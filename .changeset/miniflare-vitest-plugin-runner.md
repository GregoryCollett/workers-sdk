---
"miniflare": patch
---

Update the assets fallback-worker detection to match the renamed test runner worker prefix (`vitest-plugin-runner-`)

The `@cloudflare/vitest-pool-workers` package has been renamed to `@cloudflare/vitest-plugin`, which changes the runner worker name prefix from `vitest-pool-workers-runner-` to `vitest-plugin-runner-`. Miniflare's special-casing of the test runner worker when selecting the assets fallback worker is updated to match, so the behaviour ships alongside the renamed package.
