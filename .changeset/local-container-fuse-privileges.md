---
"wrangler": minor
"miniflare": minor
---

Enable FUSE-capable local container development

Wrangler now passes the Docker privileges needed for FUSE to local Durable Object containers when using local rootless Docker on Linux with `/dev/fuse` available, or a local Docker engine on macOS or through WSL where Linux containers run in a VM. Other Docker configurations disable these privileges with a warning.
