import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return {
    salt,
    hash: Buffer.from(derived).toString("hex"),
  };
}

export async function verifyPassword(password, passwordHash, passwordSalt) {
  const candidate = await hashPassword(password, passwordSalt);
  return timingSafeEqualHex(candidate.hash, passwordHash);
}

export function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf("=");
        if (index === -1) {
          return [pair, ""];
        }
        return [pair.slice(0, index), decodeURIComponent(pair.slice(index + 1))];
      }),
  );
}

export function createSignedSessionValue(sessionId, secret) {
  const signature = crypto.createHmac("sha256", secret).update(sessionId).digest("hex");
  return `${sessionId}.${signature}`;
}

export function verifySignedSessionValue(cookieValue, secret) {
  if (!cookieValue) {
    return null;
  }

  const [sessionId, signature] = cookieValue.split(".");
  if (!sessionId || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", secret).update(sessionId).digest("hex");
  return timingSafeEqualHex(signature, expected) ? sessionId : null;
}

export function buildSessionCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "SameSite=Lax"];
  if (options.maxAge != null) {
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function buildExpiredSessionCookie(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? null,
    preferences: user.preferences,
  };
}

export function validateRegistrationInput({ name, email, password }) {
  if (!name?.trim()) {
    throw new Error("Name is required.");
  }
  if (!email?.trim() || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

function timingSafeEqualHex(left, right) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
