import "server-only";

function requireEnv(name: "APP_PASSWORD" | "SESSION_SECRET" | "DATABASE_URL") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Fehlende Environment Variable: ${name}`);
  }

  return value;
}

export function getAppPassword() {
  return requireEnv("APP_PASSWORD");
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || getAppPassword();
}

export function getDatabaseUrl() {
  return requireEnv("DATABASE_URL");
}
