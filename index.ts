import {
  definePluginEntry,
  type OpenClawPluginDefinition,
} from "openclaw/plugin-sdk/plugin-entry";
import {
  createTelnyxEmbeddingProvider,
  DEFAULT_TELNYX_EMBEDDING_MODEL,
} from "./src/embedding-provider.js";

const plugin: OpenClawPluginDefinition = definePluginEntry({
  id: "telnyx-embeddings",
  name: "Telnyx Embeddings",
  description: "Telnyx embedding provider for OpenClaw memory search",
  register(api) {
    api.registerEmbeddingProvider({
      id: "telnyx",
      defaultModel: DEFAULT_TELNYX_EMBEDDING_MODEL,
      transport: "remote",
      authProviderId: "telnyx",
      create: async (options) => {
        const { provider, client } = await createTelnyxEmbeddingProvider(options);
        return {
          provider,
          runtime: {
            id: "telnyx",
            cacheKeyData: {
              provider: "telnyx",
              baseUrl: client.baseUrl,
              model: client.model,
            },
          },
        };
      },
    });
  },
});

export default plugin;
