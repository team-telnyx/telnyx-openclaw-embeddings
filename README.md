# telnyx-openclaw-embeddings

Telnyx embedding provider for [OpenClaw](https://github.com/openclaw/openclaw) memory search.

Registers Telnyx as a first-class memory embedding provider using the OpenAI-compatible [Telnyx AI API](https://developers.telnyx.com/docs/ai/embeddings).

## Features

- **Provider ID:** `telnyx`
- **Default model:** `thenlper/gte-large` (1024 dimensions)
- **Supported models:** `thenlper/gte-large`, `intfloat/multilingual-e5-large`, `Qwen/Qwen3-Embedding-8B`
- **Auto-select priority:** 25
- **Auth:** `TELNYX_API_KEY` env var or provider config

## Install

```bash
openclaw plugins install team-telnyx/telnyx-openclaw-embeddings
```

## Configuration

### Minimal (env var)

```bash
export TELNYX_API_KEY=KEY...
```

The provider will be auto-selected when no higher-priority provider is available.

### Explicit provider selection

In `openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "provider": "telnyx"
      }
    }
  }
}
```

### Custom model

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "provider": "telnyx",
        "model": "intfloat/multilingual-e5-large"
      }
    }
  }
}
```

## E2E Test

```bash
export TELNYX_API_KEY=KEY...
node e2e-test.mjs
```

## Unit Tests

```bash
npm install
npm test
```

## Architecture

Uses the same `resolveRemoteEmbeddingClient` + `fetchRemoteEmbeddingVectors` infrastructure as the built-in OpenAI provider, since Telnyx exposes an OpenAI-compatible embeddings endpoint at `https://api.telnyx.com/v2/ai/openai`.

## Models

| Model | Dimensions |
|-------|-----------|
| `thenlper/gte-large` (default) | 1024 |
| `intfloat/multilingual-e5-large` | 1024 |
| `Qwen/Qwen3-Embedding-8B` | 4096 |
