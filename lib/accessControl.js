// YSS_ACCESS_CONTROL_V2

import jwt from "jsonwebtoken";

export function getModuleTokenSecret() {
  return process.env.MODULE_TOKEN_SECRET || "";
}

export function isModuleTokenEnabled() {
  return Boolean(getModuleTokenSecret());
}

function getHeader(request, name) {
  return request.headers[name] || request.headers[name.toLowerCase()] || request.headers[name.toUpperCase()] || "";
}

function getRequestedModuleSlug(request) {
  const fromQuery = request.query?.module || request.query?.slug || "";
  if (typeof fromQuery === "string" && fromQuery.trim()) {
    return fromQuery.trim();
  }

  const fromBody = request.body?.module || "";
  if (typeof fromBody === "string" && fromBody.trim()) {
    return fromBody.trim();
  }

  const fromHeader = getHeader(request, "x-module-slug");
  if (typeof fromHeader === "string" && fromHeader.trim()) {
    return fromHeader.trim();
  }

  const pathParts = String(request.url || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  if (pathParts[0] === "modules" && pathParts[1]) {
    return pathParts[1];
  }

  return "";
}

function getProvidedModuleToken(request) {
  const authHeader = getHeader(request, "authorization");
  if (String(authHeader).startsWith("Bearer ")) {
    return String(authHeader).slice("Bearer ".length).trim();
  }

  return (
    getHeader(request, "x-module-token") ||
    request.body?.moduleToken ||
    request.query?.token ||
    ""
  );
}

function verifyModuleToken(request) {
  const secret = getModuleTokenSecret();
  const token = getProvidedModuleToken(request);

  if (!secret || !token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, {
      issuer: "yssai-online-course-website",
      audience: "yssai-online-course-modules"
    });

    const requestedModuleSlug = getRequestedModuleSlug(request);
    if (requestedModuleSlug && payload.module_slug !== requestedModuleSlug) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function getAuthorizedContext(request) {
  const tokenPayload = verifyModuleToken(request);
  if (tokenPayload) {
    return {
      method: "module_token",
      token: tokenPayload
    };
  }

  if (!isModuleTokenEnabled()) {
    return {
      method: "none"
    };
  }

  return null;
}

export function isAuthorized(request) {
  return Boolean(getAuthorizedContext(request));
}

export function rejectUnauthorized(response, request) {
  response.status(401).json({
    error: "Launch this module from the course website to continue.",
    code: "invalid_module_token"
  });
}
