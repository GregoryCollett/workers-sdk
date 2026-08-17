---
"wrangler": patch
"@cloudflare/vitest-plugin": patch
---

Honor `access.dev` when running Workers with `@cloudflare/vitest-plugin`, so `ctx.access.getIdentity()` returns the configured identity just as it does with `wrangler dev`.
