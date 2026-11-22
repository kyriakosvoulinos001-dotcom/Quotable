// Quotable AI teacher proxy. Keeps your Anthropic API key on the server.
// Env vars (Netlify > Site configuration > Environment variables):
//   ANTHROPIC_API_KEY  (required)
//   MODEL              (optional, default claude-haiku-5-5 for speed; try claude-sonnet-5-5 if you upgrade your Netlify plan)
//   ALLOWED_ORIGIN     (optional, e.g. https://your-site.netlify.app; blocks other sites using your key)
export const config = {
  path: "/api/ai",
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ["ip", "domain"] }
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.get("origin") !== allowed) return json({ error: "origin" }, 403);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "not configured" }, 500);

  let prompt;
  try { ({ prompt } = await req.json()); } catch { return json({ error: "bad json" }, 400); }
  if (typeof prompt !== "string" || prompt.length < 20 || prompt.length > 30000) return json({ error: "bad prompt" }, 400);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-haiku-5-5",
        max_tokens: 1400,
        system: "You are a careful NSW HSC English teacher. Follow the user's formatting instructions exactly and reply with only the JSON object requested.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (r.status === 429) return json({ error: "busy" }, 429);
    if (!r.ok) return json({ error: "upstream" }, 502);
    const data = await r.json();
    const text = (data.content || []).map((c) => c.text || "").join("");
    return json({ text });
  } catch {
    return json({ error: "upstream" }, 502);
  }
};
