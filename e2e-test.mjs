/**
 * End-to-end smoke test for the Telnyx embedding provider.
 *
 * Usage:
 *   export TELNYX_API_KEY=KEY...
 *   node e2e-test.mjs
 *
 * Sends a single embedding request to the Telnyx AI API and verifies
 * that the response contains a valid vector of the expected dimensionality.
 */

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
if (!TELNYX_API_KEY) {
  console.error("TELNYX_API_KEY not set");
  process.exit(1);
}

const BASE_URL = "https://api.telnyx.com/v2/ai/openai";
const MODEL = "thenlper/gte-large";
const EXPECTED_DIMS = 1024;

async function main() {
  console.log(`Testing Telnyx embeddings: model=${MODEL}, expected dims=${EXPECTED_DIMS}`);

  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: ["OpenClaw is an open-source AI agent framework"],
    }),
  });

  if (!res.ok) {
    console.error(`API error: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  const data = await res.json();
  const embedding = data?.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    console.error("No embedding array in response");
    process.exit(1);
  }

  if (embedding.length !== EXPECTED_DIMS) {
    console.error(`Wrong dimensions: got ${embedding.length}, expected ${EXPECTED_DIMS}`);
    process.exit(1);
  }

  console.log(`✅ Embedding returned: ${embedding.length} dimensions`);
  console.log(`   First 5 values: [${embedding.slice(0, 5).map((v) => v.toFixed(6)).join(", ")}]`);
  console.log(`   Model: ${data.model}`);
  console.log(`   Usage: ${JSON.stringify(data.usage)}`);
}

main();
