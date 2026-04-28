import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { telnyxMemoryEmbeddingProviderAdapter } from "./src/memory-embedding-adapter.js";

export default definePluginEntry({
  id: "telnyx-embeddings",
  name: "Telnyx Embeddings",
  description: "Telnyx embedding provider for OpenClaw memory search",
  register(api) {
    api.registerMemoryEmbeddingProvider(telnyxMemoryEmbeddingProviderAdapter);
  },
});
