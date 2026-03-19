// YSS_VERCEL_CHAT_V5

import OpenAI from "openai";
import { systemPrompt } from "../lib/systemPrompt.js";

const APP_VERSION = "v1.0.0";

export const config = {
  runtime: "nodejs"
};

const DEFAULT_MODEL = "gpt-5.2";
const MODERATION_MODEL = "omni-moderation-latest";
const DEFAULT_TEMPERATURE = 0.8;
const DEFAULT_PRESENCE_PENALTY = 0.2;

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

function normalizeHistory(history = []) {
  return history
    .filter((item) => item && typeof item.role === "string" && typeof item.content === "string")
    .slice(-12)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content.trim()
    }))
    .filter((item) => item.content);
}

function buildInput(history, message) {
  const conversation = normalizeHistory(history);

  const items = conversation.map((item) => ({
    role: item.role,
    content: [
      {
        type: item.role === "assistant" ? "output_text" : "input_text",
        text: item.content
      }
    ]
  }));

  items.push({
    role: "user",
    content: [
      {
        type: "input_text",
        text: String(message || "").trim()
      }
    ]
  });

  return items;
}

async function moderateInput(client, message) {
  const moderation = await client.moderations.create({
    model: MODERATION_MODEL,
    input: message
  });

  const result = Array.isArray(moderation.results) ? moderation.results[0] : null;

  if (result?.flagged) {
    return {
      flagged: true,
      categories: result.categories || {}
    };
  }

  return {
    flagged: false,
    categories: {}
  };
}

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method === "GET") {
    response.status(200).json({
      ok: true,
      app_version: APP_VERSION,
      version: "YSS_VERCEL_CHAT_V5",
      moderation_enabled: true,
      file_search_enabled: Boolean(process.env.OPENAI_VECTOR_STORE_ID)
    });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

  if (!apiKey) {
    response.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  const message = typeof request.body?.message === "string" ? request.body.message : "";
  const history = Array.isArray(request.body?.history) ? request.body.history : [];

  if (!message.trim()) {
    response.status(400).json({ error: "A message is required" });
    return;
  }

  const client = new OpenAI({ apiKey });

  try {
    const moderation = await moderateInput(client, message);

    if (moderation.flagged) {
      response.status(400).json({
        error: "This message cannot be processed.",
        code: "moderation_blocked"
      });
      return;
    }

    const stream = await client.responses.stream({
      model,
      instructions: systemPrompt,
      input: buildInput(history, message),
      temperature: DEFAULT_TEMPERATURE,
      presence_penalty: DEFAULT_PRESENCE_PENALTY,
      ...(vectorStoreId
        ? {
            tools: [
              {
                type: "file_search",
                vector_store_ids: [vectorStoreId],
                max_num_results: 6
              }
            ]
          }
        : {})
    });

    response.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) {
        response.write(`data: ${JSON.stringify({ type: "delta", delta: event.delta })}\n\n`);
      }

      if (event.type === "response.completed") {
        response.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      }

      if (event.type === "response.error") {
        response.write(
          `data: ${JSON.stringify({
            type: "error",
            message: event.error?.message || "Streaming error"
          })}\n\n`
        );
      }
    }

    response.end();
  } catch (error) {
    response.status(500).json({
      error: error && error.message ? error.message : "Request failed"
    });
  }
}
