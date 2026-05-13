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

/**
 * Known max input token limits per model.
 * `null` means no known short limit (long-context model).
 */
export const TELNYX_MODEL_MAX_TOKENS: Record<string, number | null> = {
  "thenlper/gte-large": 512,
  "intfloat/multilingual-e5-large": 512,
  "Qwen/Qwen3-Embedding-8B": null, // long-context; >=1k confirmed
};

/**
 * Rough token estimate: ~4 chars per token (conservative).
 * Used for pre-flight length checks to avoid round-tripping a 400.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function normalizeTelnyxModel(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) {
    return DEFAULT_TELNYX_EMBEDDING_MODEL;
  }
  return trimmed;
}

export async function createTelnyxEmbeddingProvider(
  options: MemoryEmbeddingProviderCreateOptions,
): Promise<{ provider: MemoryEmbeddingProvider; client: TelnyxEmbeddingClient }> {
  const client = await resolveTelnyxEmbeddingClient(options);
  const url = `${client.baseUrl.replace(/\/$/, "")}/embeddings`;

  const maxTokens = TELNYX_MODEL_MAX_TOKENS[client.model] ?? null;

  const embed = async (input: string[]): Promise<number[][]> => {
    // Filter out empty/whitespace-only strings to avoid indexing garbage vectors
    const filtered = input.filter((s) => s.trim().length > 0);
    if (filtered.length === 0) {
      return [];
    }

    // Pre-flight token length check for models with known limits
    if (maxTokens !== null) {
      for (const text of filtered) {
        const est = estimateTokens(text);
        if (est > maxTokens) {
          throw new Error(
            `telnyx embeddings failed: input too long for ${client.model} ` +
            `(estimated ${est} tokens, model max is ${maxTokens}). ` +
            `Truncate input or use a long-context model like Qwen/Qwen3-Embedding-8B.`,
          );
        }
      }
    }

    return await fetchRemoteEmbeddingVectors({
      url,
      headers: client.headers,
      ssrfPolicy: client.ssrfPolicy,
      body: {
        model: client.model,
        input: filtered,
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
  return client;
}
