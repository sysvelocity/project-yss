// YSS_ACCESS_CONTROL_V1

export function getAccessCode() {
  return process.env.APP_ACCESS_CODE || "";
}

export function isAccessControlEnabled() {
  return Boolean(getAccessCode());
}

export function isAuthorized(request) {
  const configuredCode = getAccessCode();

  if (!configuredCode) {
    return true;
  }

  const providedCode =
    request.headers["x-app-access-code"] ||
    request.headers["X-App-Access-Code"] ||
    request.body?.accessCode ||
    "";

  return String(providedCode).trim() === configuredCode;
}

export function rejectUnauthorized(response) {
  response.status(401).json({
    error: "Unauthorized",
    code: "invalid_access_code"
  });
}
