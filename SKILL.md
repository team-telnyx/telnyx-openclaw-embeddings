---
name: telnyx-openclaw-embeddings
description: Add Telnyx as an OpenClaw memory embedding provider with TELNYX_API_KEY auth and OpenAI-compatible embeddings support.
homepage: https://github.com/team-telnyx/telnyx-openclaw-embeddings
metadata:
  {
    "openclaw": {
      "emoji": "🧠",
      "requires": { "env": ["TELNYX_API_KEY"] },
      "install": [
        {
          "id": "github",
          "kind": "github",
          "package": "team-telnyx/telnyx-openclaw-embeddings",
          "label": "Install the Telnyx embeddings OpenClaw plugin"
        }
      ]
    }
  }
---

# Telnyx OpenClaw Embeddings

Use Telnyx as your OpenClaw memory embedding provider.

## What it provides

- Telnyx memory embedding provider registration for OpenClaw
- Auto-selection when `TELNYX_API_KEY` is configured
- OpenAI-compatible embeddings transport via Telnyx AI
- Support for `thenlper/gte-large`, `intfloat/multilingual-e5-large`, and `Qwen/Qwen3-Embedding-8B`

## Install

```bash
openclaw plugins install team-telnyx/telnyx-openclaw-embeddings
```

## Setup

Set your Telnyx API key:

```bash
export TELNYX_API_KEY="KEY..."
```

## Verify

Run the included E2E test:

```bash
node e2e-test.mjs
```

Or configure OpenClaw to use provider `telnyx` for memory search.

## Notes

- Repo: `team-telnyx/telnyx-openclaw-embeddings`
- Default model: `thenlper/gte-large`
- OpenClaw-compatible memory provider id: `telnyx`
