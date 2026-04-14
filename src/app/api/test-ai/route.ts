import Anthropic from "@anthropic-ai/sdk";

// Simple one-shot test — visit /api/test-ai in the browser to check Claude
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, error: "ANTHROPIC_API_KEY not set" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 50,
      messages: [{ role: "user", content: "Reply with the single word: working" }],
    });

    const text = response.content.find((b) => b.type === "text");
    return Response.json({ ok: true, reply: text?.type === "text" ? text.text : null, model: response.model });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
