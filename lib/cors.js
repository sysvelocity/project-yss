function getRequestOrigin(request) {
  return String(request.headers.origin || request.headers.Origin || "").trim();
}

function getSelfOrigin(request) {
  const host = String(request.headers.host || request.headers.Host || "").trim();
  if (!host) {
    return "";
  }

  const forwardedProto =
    String(request.headers["x-forwarded-proto"] || request.headers["X-Forwarded-Proto"] || "").trim() ||
    "https";

  return `${forwardedProto}://${host}`;
}

function parseAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isOriginAllowed(request, origin) {
  if (!origin) {
    return true;
  }

  const allowedOrigins = new Set(parseAllowedOrigins());
  const selfOrigin = getSelfOrigin(request);

  if (selfOrigin) {
    allowedOrigins.add(selfOrigin);
  }

  return allowedOrigins.has(origin);
}

export function setCorsHeaders(request, response, { methods = "GET, POST, OPTIONS" } = {}) {
  const origin = getRequestOrigin(request);
  const selfOrigin = getSelfOrigin(request);

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", methods);
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization, X-Module-Token, X-Module-Slug"
  );

  if (!origin && selfOrigin) {
    response.setHeader("Access-Control-Allow-Origin", selfOrigin);
    return true;
  }

  if (isOriginAllowed(request, origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin || selfOrigin || "");
    return true;
  }

  return false;
}

export function handleCors(request, response, options = {}) {
  const allowed = setCorsHeaders(request, response, options);

  if (request.method === "OPTIONS") {
    if (!allowed) {
      response.status(403).end();
      return true;
    }

    response.status(204).end();
    return true;
  }

  if (!allowed) {
    response.status(403).json({ error: "Origin not allowed" });
    return true;
  }

  return false;
}
