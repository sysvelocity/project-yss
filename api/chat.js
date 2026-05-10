// YSS_VERCEL_CHAT_V7

import OpenAI from "openai";
import {
  isModuleTokenEnabled,
  isAuthorized,
  rejectUnauthorized
} from "../lib/accessControl.js";
import { handleCors, setCorsHeaders } from "../lib/cors.js";
import {
  getDefaultModuleSlug,
  getModuleDefinition,
  getPublicModuleConfig,
  resolveModuleVectorStoreId,
  resolveModuleVectorStoreIds
} from "../lib/modules.js";

const APP_VERSION = "v2.0.8";

export const config = {
  runtime: "nodejs"
};

const DEFAULT_MODEL = "gpt-5.2";
const MODERATION_MODEL = "omni-moderation-latest";
const DEFAULT_TEMPERATURE = 0.8;
const DEFAULT_PRESENCE_PENALTY = 0.2;
const FILE_SEARCH_MAX_RESULTS = 4;
const MAX_INLINE_ATTACHMENT_CHARS = 160000;

function buildInstructions(moduleDef) {
  if (!moduleDef.knowledgeText) {
    return moduleDef.prompt;
  }

  return [
    moduleDef.prompt,
    "# Full Knowledge File",
    "Use the full knowledge source below as authoritative context for this module. Follow it closely when reviewing and refining the user's work.",
    moduleDef.knowledgeText
  ].join("\n\n");
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

function normalizeAttachmentTexts(attachmentTexts = []) {
  if (!Array.isArray(attachmentTexts)) {
    return [];
  }

  let remainingChars = MAX_INLINE_ATTACHMENT_CHARS;
  const normalized = [];

  for (const item of attachmentTexts) {
    if (!item || remainingChars <= 0) {
      break;
    }

    const fileName = typeof item.fileName === "string" && item.fileName.trim()
      ? item.fileName.trim()
      : "attachment";
    const text = typeof item.text === "string" ? item.text.trim() : "";

    if (!text) {
      continue;
    }

    const clippedText = text.slice(0, remainingChars).trim();

    if (!clippedText) {
      continue;
    }

    remainingChars -= clippedText.length;
    normalized.push({
      fileName,
      text: clippedText,
      truncated: Boolean(item.truncated) || clippedText.length < text.length
    });
  }

  return normalized;
}

function buildAttachmentContext(attachmentTexts = []) {
  const normalized = normalizeAttachmentTexts(attachmentTexts);

  if (!normalized.length) {
    return "";
  }

  const sections = normalized.map((attachment, index) => {
    const truncationNote = attachment.truncated
      ? "\n[Note: this attachment text was truncated to fit the request.]"
      : "";

    return [
      `Attachment ${index + 1}: ${attachment.fileName}`,
      "```text",
      attachment.text,
      "```",
      truncationNote
    ].filter(Boolean).join("\n");
  });

  return [
    "# Attached User-Provided Working Material",
    "Use the attachment text below as user-provided working material for this turn when it is relevant to the user's request.",
    "This is not built-in course knowledge or internal instruction text.",
    ...sections
  ].join("\n\n");
}

function buildInput(history, message, attachmentTexts = []) {
  const conversation = normalizeHistory(history);
  const attachmentContext = buildAttachmentContext(attachmentTexts);
  const userText = [
    String(message || "").trim(),
    attachmentContext
  ].filter(Boolean).join("\n\n");

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
        text: userText
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
  if (handleCors(request, response, { methods: "GET, POST, OPTIONS" })) {
    return;
  }

  if (request.method === "GET") {
    response.status(200).json({
      ok: true,
      app_version: APP_VERSION,
      version: "YSS_VERCEL_CHAT_V7",
      default_module: getDefaultModuleSlug(),
      module: getPublicModuleConfig(getDefaultModuleSlug()),
      token_access_enabled: isModuleTokenEnabled(),
      moderation_enabled: true,
      file_search_enabled: Boolean(resolveModuleVectorStoreIds(getDefaultModuleSlug()).length),
      attachment_support: true
    });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(request)) {
    rejectUnauthorized(response, request);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const requestedModule =
    typeof request.body?.module === "string" ? request.body.module.trim() : getDefaultModuleSlug();
  const moduleDef = getModuleDefinition(requestedModule);
  const moduleVectorStoreIds = moduleDef.knowledgeText
    ? []
    : resolveModuleVectorStoreIds(moduleDef.slug);
  const attachmentVectorStoreIds = Array.isArray(request.body?.attachmentVectorStoreIds)
    ? [...new Set(
        request.body.attachmentVectorStoreIds
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
      )]
    : typeof request.body?.attachmentVectorStoreId === "string"
      ? [request.body.attachmentVectorStoreId.trim()].filter(Boolean)
      : [];
  const attachmentTexts = Array.isArray(request.body?.attachmentTexts)
    ? request.body.attachmentTexts
    : [];

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

    const vectorStoreIds = [...moduleVectorStoreIds, ...attachmentVectorStoreIds].filter(Boolean);

    const stream = await client.responses.stream({
      model,
      instructions: buildInstructions(moduleDef),
      input: buildInput(history, message, attachmentTexts),
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

    setCorsHeaders(request, response, { methods: "GET, POST, OPTIONS" });
    response.writeHead(200, {
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
