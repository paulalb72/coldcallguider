import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAppPassword, getSessionSecret } from "@/lib/env";

const SESSION_COOKIE_NAME = "cold_call_guide_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
};

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(payload: string) {
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

  if (typeof parsed?.exp !== "number") {
    throw new Error("Invalid session payload");
  }

  return parsed as SessionPayload;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function verifySignature(payload: string, signature: string) {
  const expected = Buffer.from(signPayload(payload));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function validatePassword(password: string) {
  const expected = Buffer.from(getAppPassword());
  const received = Buffer.from(password);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function setSession() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = encodePayload({ exp: expiresAt });
  const signature = signPayload(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function hasValidSession() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawValue) {
    return false;
  }

  const [payload, signature] = rawValue.split(".");

  if (!payload || !signature || !verifySignature(payload, signature)) {
    return false;
  }

  try {
    const session = decodePayload(payload);
    return session.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAuth() {
  const authenticated = await hasValidSession();

  if (!authenticated) {
    redirect("/login");
  }
}

export async function redirectIfAuthenticated() {
  const authenticated = await hasValidSession();

  if (authenticated) {
    redirect("/scripts");
  }
}
