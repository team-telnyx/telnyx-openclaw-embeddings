import {
  fetchRemoteEmbeddingVectors,
  resolveRemoteEmbeddingClient,
  type MemoryEmbeddingProvider,
  type MemoryEmbeddingProviderCreateOptions,
} from "openclaw/plugin-sdk/memory-core-host-engine-embeddings";
import type { SsrFPolicy } from "openclaw/plugin-sdk/ssrf-runtime";

export type TelnyxEmbeddingClient = {
  baseUrl: string;
  headers: Record<string, string>;
  ssrfPolicy?: SsrFPolicy;
  model: string;
};

const DEFAULT_TELNYX_BASE_URL = "https://api.telnyx.com/v2/ai/openai";
export const DEFAULT_TELNYX_EMBEDDING_MODEL = "thenlper/gte-large";

export const TELNYX_MODEL_DIMENSIONS: Record<string, number> = {
  "thenlper/gte-large": 1024,
  "intfloat/multilingual-e5-large": 1024,
  "Qwen/Qwen3-Embedding-8B": 4096,
};

export const TELNYX_MODEL_MAX_INPUT_TOKENS: Record<string, number> = {
  "thenlper/gte-large": 512,
};

export function normalizeTelnyxModel(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) {
    return DEFAULT_TELNYX_EMBEDDING_MODEL;
  }
  return trimmed;
}

export function normalizeTelnyxBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return DEFAULT_TELNYX_BASE_URL;
  }

  try {
    const url = new URL(trimmed);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (normalizedPath === "/v2/ai") {
      url.pathname = "/v2/ai/openai";
      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    // Keep custom non-URL values untouched except for trimming.
  }

  return trimmed;
}

export async function createTelnyxEmbeddingProvider(
  options: MemoryEmbeddingProviderCreateOptions,
): Promise<{ provider: MemoryEmbeddingProvider; client: TelnyxEmbeddingClient }> {
  const client = await resolveTelnyxEmbeddingClient(options);
  const url = `${client.baseUrl.replace(/\/$/, "")}/embeddings`;

  const embed = async (input: string[]): Promise<number[][]> => {
    if (input.length === 0) {
      return [];
    }
    return await fetchRemoteEmbeddingVectors({
      url,
      headers: client.headers,
      ssrfPolicy: client.ssrfPolicy,
      body: {
        model: client.model,
        input,
      },
      errorPrefix: "telnyx embeddings failed",
    });
  };

  return {
    provider: {
      id: "telnyx",
      model: client.model,
      ...(typeof TELNYX_MODEL_DIMENSIONS[client.model] === "number"
        ? { dimensions: TELNYX_MODEL_DIMENSIONS[client.model] }
        : {}),
      ...(typeof TELNYX_MODEL_MAX_INPUT_TOKENS[client.model] === "number"
        ? { maxInputTokens: TELNYX_MODEL_MAX_INPUT_TOKENS[client.model] }
        : {}),
      embedQuery: async (text) => {
        const [vec] = await embed([text]);
        return vec ?? [];
      },
      embedBatch: async (texts) => await embed(texts),
    },
    client,
  };
}

export async function resolveTelnyxEmbeddingClient(
  options: MemoryEmbeddingProviderCreateOptions,
): Promise<TelnyxEmbeddingClient> {
  const client = await resolveRemoteEmbeddingClient({
    provider: "telnyx",
    options,
    defaultBaseUrl: DEFAULT_TELNYX_BASE_URL,
    normalizeModel: normalizeTelnyxModel,
  });
  return {
    ...client,
    baseUrl: normalizeTelnyxBaseUrl(client.baseUrl),
  };
}
