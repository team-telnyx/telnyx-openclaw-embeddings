import {
  fetchRemoteEmbeddingVectors,
  resolveRemoteEmbeddingClient,
} from "openclaw/plugin-sdk/memory-core-host-engine-embeddings";
import type {
  EmbeddingInput,
  EmbeddingProvider,
  EmbeddingProviderCreateOptions,
} from "openclaw/plugin-sdk/embedding-providers";
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

function embeddingInputToText(input: EmbeddingInput): string {
  return typeof input === "string" ? input : input.text;
}

export async function createTelnyxEmbeddingProvider(
  options: EmbeddingProviderCreateOptions,
): Promise<{ provider: EmbeddingProvider; client: TelnyxEmbeddingClient }> {
  const client = await resolveTelnyxEmbeddingClient(options);
  const url = `${client.baseUrl.replace(/\/$/, "")}/embeddings`;

  const embedTexts = async (input: string[], signal?: AbortSignal): Promise<number[][]> => {
    if (input.length === 0) {
      return [];
    }
    return await fetchRemoteEmbeddingVectors({
      url,
      headers: client.headers,
      ssrfPolicy: client.ssrfPolicy,
      signal,
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
      embed: async (input, callOptions) => {
        const [vec] = await embedTexts([embeddingInputToText(input)], callOptions?.signal);
        return vec ?? [];
      },
      embedBatch: async (inputs, callOptions) =>
        await embedTexts(inputs.map(embeddingInputToText), callOptions?.signal),
    },
    client,
  };
}

export async function resolveTelnyxEmbeddingClient(
  options: EmbeddingProviderCreateOptions,
): Promise<TelnyxEmbeddingClient> {
  const client = await resolveRemoteEmbeddingClient({
    provider: "telnyx",
    options: {
      config: options.config,
      agentDir: options.agentDir,
      provider: options.provider,
      remote: options.remote,
      model: options.model ?? DEFAULT_TELNYX_EMBEDDING_MODEL,
      inputType: options.inputType,
      queryInputType: options.queryInputType,
      documentInputType: options.documentInputType,
      local: options.local,
    },
    defaultBaseUrl: DEFAULT_TELNYX_BASE_URL,
    normalizeModel: normalizeTelnyxModel,
  });
  return {
    ...client,
    baseUrl: normalizeTelnyxBaseUrl(client.baseUrl),
  };
}
