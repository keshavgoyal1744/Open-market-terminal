import { readFile } from "node:fs/promises";
import path from "node:path";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

const SECURITY_HEADERS = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};

export async function fetchJson(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
  const payload = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${payload.slice(0, 240)}`);
  }

  return payload ? JSON.parse(payload) : null;
}

export async function fetchText(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
  const payload = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${payload.slice(0, 240)}`);
  }

  return payload;
}

export function fetchWithTimeout(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? 15000;
  const signal = options.signal ?? AbortSignal.timeout(timeoutMs);
  return fetch(url, {
    ...options,
    signal,
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": options.userAgent ?? "OpenMarketTerminal/0.1 (+self-hosted)",
      ...options.headers,
    },
  });
}

export function sendJson(response, statusCode, data, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
    ...headers,
  });
  response.end(JSON.stringify(data));
}

export function sendError(response, statusCode, message, details) {
  sendJson(response, statusCode, {
    error: message,
    details,
  });
}

export async function sendStaticFile(response, rootDir, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(path.join(rootDir, safePath));
  const rootPrefix = `${rootDir}${path.sep}`;
  if (normalized !== rootDir && !normalized.startsWith(rootPrefix)) {
    throw Object.assign(new Error("Invalid path."), { code: "ENOENT" });
  }
  const filePath = normalized;
  const extension = path.extname(filePath);
  const contentType = MIME_TYPES[extension] ?? "application/octet-stream";
  const file = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": extension === ".css" || extension === ".js" ? "public, max-age=60" : "no-store",
    ...SECURITY_HEADERS,
  });
  response.end(file);
}

export async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function baseHeaders(extra = {}) {
  return {
    ...SECURITY_HEADERS,
    ...extra,
  };
}
