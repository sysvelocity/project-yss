// YSS_VERCEL_CHAT_V7

import OpenAI from "openai";
import {
  isAccessControlEnabled,
  isAuthorized,
  rejectUnauthorized
} from "../lib/accessControl.js";
import {
  getDefaultModuleSlug,
  getModuleDefinition,
  getPublicModuleConfig,
  resolveModuleVectorStoreId
} from "../lib/modules.js";

const APP_VERSION = "v1.1.0";

export const config = {
  runtime: "nodejs"
};

const DEFAULT_MODEL = "gpt-5.2";
const MODERATION_MODEL = "omni-moderation-latest";
const SCOPE_MODEL = "gpt-4.1-mini";
const DEFAULT_TEMPERATURE = 0.8;
const DEFAULT_PRESENCE_PENALTY = 0.2;
const FILE_SEARCH_MAX_RESULTS = 4;

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

function getRecentHistorySummary(history = []) {
  return normalizeHistory(history)
    .slice(-6)
    .map((item, index) => `${index + 1}. ${item.role}: ${item.content}`)
    .join("\n");
}

function isContinuationLikeMessage(message = "") {
  const trimmed = String(message || "").trim().toLowerCase();

  if (!trimmed) {
    return false;
  }

  const exactMatches = new Set([
    "continue",
    "go on",
    "keep going",
    "carry on",
    "more",
    "next",
    "finish",
    "resume"
  ]);

  if (exactMatches.has(trimmed)) {
    return true;
  }

  const partialMatches = [
    "continue your response",
    "continue the response",
    "you stalled",
    "you stopped",
    "pick up where you left off",
    "give me the refined",
    "give me the sharpened",
    "show the rest",
    "finish your response",
    "resume from"
  ];

  return partialMatches.some((phrase) => trimmed.includes(phrase));
}

async function checkScope(client, moduleDef, message, history, hasAttachment) {
  const response = await client.responses.create({
    model: SCOPE_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: moduleDef.scopeClassifierPrompt
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              `Attachment present: ${hasAttachment ? "yes" : "no"}\n` +
              `Recent conversation:\n${getRecentHistorySummary(history) || "None"}\n\n` +
              `Latest user request: ${message}`
          }
        ]
      }
    ]
  });

  const decision = String(response.output_text || "").trim().toUpperCase();
  return decision === "ALLOW";
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
      version: "YSS_VERCEL_CHAT_V7",
      default_module: getDefaultModuleSlug(),
      module: getPublicModuleConfig(getDefaultModuleSlug()),
      access_control_enabled: isAccessControlEnabled(),
      moderation_enabled: true,
      file_search_enabled: Boolean(resolveModuleVectorStoreId(getDefaultModuleSlug())),
      attachment_support: true
    });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const requestedModule =
    typeof request.body?.module === "string" ? request.body.module.trim() : getDefaultModuleSlug();
  const moduleDef = getModuleDefinition(requestedModule);
  const vectorStoreId = resolveModuleVectorStoreId(moduleDef.slug);
  const attachmentVectorStoreId =
    typeof request.body?.attachmentVectorStoreId === "string"
      ? request.body.attachmentVectorStoreId.trim()
      : "";

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
    const continuationLike = isContinuationLikeMessage(message);
    const [moderation, inScope] = await Promise.all([
      moderateInput(client, message),
      continuationLike
        ? Promise.resolve(true)
        : checkScope(
            client,
            moduleDef,
            message,
            history,
            Boolean(attachmentVectorStoreId)
          )
    ]);

    if (moderation.flagged) {
      response.status(400).json({
        error: "This message cannot be processed.",
        code: "moderation_blocked"
      });
      return;
    }

    if (!inScope) {
      response.status(400).json({
        error: moduleDef.scopeErrorMessage,
        code: "scope_blocked"
      });
      return;
    }

    const vectorStoreIds = [vectorStoreId, attachmentVectorStoreId].filter(Boolean);

    const stream = await client.responses.stream({
      model,
      instructions: moduleDef.prompt,
      input: buildInput(history, message),
      temperature: DEFAULT_TEMPERATURE,
      presence_penalty: DEFAULT_PRESENCE_PENALTY,
      ...(vectorStoreIds.length
        ? {
            tools: [
              {
                type: "file_search",
                vector_store_ids: vectorStoreIds,
                max_num_results: FILE_SEARCH_MAX_RESULTS
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
