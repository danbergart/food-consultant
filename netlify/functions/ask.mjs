import { SYSTEM_PROMPT } from "./prompt.mjs";

const MODEL = "claude-sonnet-4-5";

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const password = process.env.APP_PASSWORD;
  if (!password || req.headers.get("x-app-password") !== password) {
    return json(401, { error: "Wrong password" });
  }

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Bad JSON" }); }
  if (!Array.isArray(body?.messages) || body.messages.length === 0 || body.messages.length > 40) {
    return json(400, { error: "Bad messages" });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: SYSTEM_PROMPT, messages: body.messages }),
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/ask" };
