import { describe, expect, it } from "vitest";
import {
  normalizeTelnyxModel,
  DEFAULT_TELNYX_EMBEDDING_MODEL,
  TELNYX_MODEL_DIMENSIONS,
  TELNYX_MODEL_MAX_TOKENS,
} from "./embedding-provider.js";

describe("normalizeTelnyxModel", () => {
  it("returns default model for empty string", () => {
    expect(normalizeTelnyxModel("")).toBe(DEFAULT_TELNYX_EMBEDDING_MODEL);
  });

  it("returns default model for whitespace", () => {
    expect(normalizeTelnyxModel("   ")).toBe(DEFAULT_TELNYX_EMBEDDING_MODEL);
  });

  it("passes through fully-qualified models unchanged", () => {
    expect(normalizeTelnyxModel("thenlper/gte-large")).toBe("thenlper/gte-large");
  });

  it("passes through multilingual model unchanged", () => {
    expect(normalizeTelnyxModel("intfloat/multilingual-e5-large")).toBe(
      "intfloat/multilingual-e5-large",
    );
  });

  it("passes through Qwen model unchanged", () => {
    expect(normalizeTelnyxModel("Qwen/Qwen3-Embedding-8B")).toBe("Qwen/Qwen3-Embedding-8B");
  });

  it("trims whitespace", () => {
    expect(normalizeTelnyxModel("  thenlper/gte-large  ")).toBe("thenlper/gte-large");
  });

  it("default model is thenlper/gte-large", () => {
    expect(DEFAULT_TELNYX_EMBEDDING_MODEL).toBe("thenlper/gte-large");
  });
});

describe("TELNYX_MODEL_DIMENSIONS", () => {
  it("thenlper/gte-large has 1024 dimensions", () => {
    expect(TELNYX_MODEL_DIMENSIONS["thenlper/gte-large"]).toBe(1024);
  });

  it("intfloat/multilingual-e5-large has 1024 dimensions", () => {
    expect(TELNYX_MODEL_DIMENSIONS["intfloat/multilingual-e5-large"]).toBe(1024);
  });

  it("Qwen/Qwen3-Embedding-8B has 4096 dimensions", () => {
    expect(TELNYX_MODEL_DIMENSIONS["Qwen/Qwen3-Embedding-8B"]).toBe(4096);
  });

  it("unknown model returns undefined (no wrong default)", () => {
    expect(TELNYX_MODEL_DIMENSIONS["some-org/unknown-model"]).toBeUndefined();
  });
});

describe("TELNYX_MODEL_MAX_TOKENS", () => {
  it("thenlper/gte-large has 512 max tokens", () => {
    expect(TELNYX_MODEL_MAX_TOKENS["thenlper/gte-large"]).toBe(512);
  });

  it("intfloat/multilingual-e5-large has 512 max tokens", () => {
    expect(TELNYX_MODEL_MAX_TOKENS["intfloat/multilingual-e5-large"]).toBe(512);
  });

  it("Qwen/Qwen3-Embedding-8B has null (long-context)", () => {
    expect(TELNYX_MODEL_MAX_TOKENS["Qwen/Qwen3-Embedding-8B"]).toBeNull();
  });

  it("unknown model returns undefined", () => {
    expect(TELNYX_MODEL_MAX_TOKENS["some-org/unknown-model"]).toBeUndefined();
  });
});
