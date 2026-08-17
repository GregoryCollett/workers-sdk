---
"@cloudflare/autoconfig": minor
---

Default autoconfig to `cloudflare.config.ts`

Autoconfig now detects and configures projects for `cf` by default. It installs `cf` and Wrangler, generates `cloudflare.config.ts`, adds the tooling-only `wrangler.config.ts` when an assets directory is needed, returns detected development commands, and adds `cf dev` and `cf deploy` scripts.

Wrangler retains its existing detection, configuration files, and scripts by passing `target: "wrangler"`.

The framework configuration API now returns Worker configuration and build configuration separately. `enableWranglerInstallation` has also been renamed to `enableCliInstallation` because `cf` setup installs both CLIs.
