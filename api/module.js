// YSS_VERCEL_MODULE_API_V1

import { isAuthorized, rejectUnauthorized } from "../lib/accessControl.js";
import { handleCors } from "../lib/cors.js";
import { getDefaultModuleSlug, getPublicModuleConfig } from "../lib/modules.js";

export const config = {
  runtime: "nodejs"
};

export default async function handler(request, response) {
  if (handleCors(request, response, { methods: "GET, OPTIONS" })) {
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(request)) {
    rejectUnauthorized(response, request);
    return;
  }

  const slug = request.query?.module || request.query?.slug || getDefaultModuleSlug();

  response.status(200).json({
    ok: true,
    version: "YSS_VERCEL_MODULE_API_V1",
    default_module: getDefaultModuleSlug(),
    module: getPublicModuleConfig(slug)
  });
}
