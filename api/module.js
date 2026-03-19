// YSS_VERCEL_MODULE_API_V1

import { getDefaultModuleSlug, getPublicModuleConfig } from "../lib/modules.js";

export const config = {
  runtime: "nodejs"
};

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const slug = request.query?.module || request.query?.slug || getDefaultModuleSlug();

  response.status(200).json({
    ok: true,
    version: "YSS_VERCEL_MODULE_API_V1",
    module: getPublicModuleConfig(slug)
  });
}
