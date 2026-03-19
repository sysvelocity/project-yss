// YSS_VERCEL_DELETE_ATTACHMENT_V1

import { isAuthorized, rejectUnauthorized } from "../lib/accessControl.js";

export const config = {
  runtime: "nodejs"
};

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

async function deleteIfPresent(url, apiKey) {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  return response;
}

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
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

  if (!apiKey) {
    response.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  const vectorStoreId =
    typeof request.body?.vectorStoreId === "string" ? request.body.vectorStoreId.trim() : "";
  const fileId = typeof request.body?.fileId === "string" ? request.body.fileId.trim() : "";

  try {
    if (vectorStoreId) {
      await deleteIfPresent(`https://api.openai.com/v1/vector_stores/${vectorStoreId}`, apiKey);
    }

    if (fileId) {
      await deleteIfPresent(`https://api.openai.com/v1/files/${fileId}`, apiKey);
    }

    response.status(200).json({
      ok: true,
      version: "YSS_VERCEL_DELETE_ATTACHMENT_V1"
    });
  } catch (error) {
    response.status(500).json({
      error: error && error.message ? error.message : "Delete failed"
    });
  }
}
