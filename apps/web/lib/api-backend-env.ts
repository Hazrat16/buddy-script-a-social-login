/**
 * Single place for “where does Next proxy /api and /uploads?” — avoids mistaking the **Vercel app URL**
 * for the **Express API URL** (Railway, etc.).
 *
 * Prefer `BACKEND_API_URL` (clear name). `NEXT_API_BASE_URL` / `API_INTERNAL_URL` remain supported.
 */
export function readApiBackendBaseFromEnv(): string | undefined {
  const raw =
    process.env["BACKEND_API_URL"]?.trim() ||
    process.env["NEXT_API_BASE_URL"]?.trim() ||
    process.env["API_INTERNAL_URL"]?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}

/** True when the base is this deployment’s own `*.vercel.app` host (infinite proxy / wrong service). */
export function isThisVercelAppHost(base: string): boolean {
  const vercelHost = process.env.VERCEL_URL?.toLowerCase();
  if (!vercelHost || !process.env.VERCEL) return false;
  try {
    const u = new URL(base.startsWith("http://") || base.startsWith("https://") ? base : `https://${base}`);
    return u.hostname.toLowerCase() === vercelHost;
  } catch {
    return false;
  }
}

/**
 * Real Vercel build + serverless runtime set `VERCEL_URL`. A stray `VERCEL=1` in a local shell does not,
 * so we do not treat that as “deployed on Vercel” (fixes broken local `next dev` / `next build`).
 */
export function isVercelProductionDeploy(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.VERCEL) &&
    Boolean(process.env.VERCEL_URL?.trim())
  );
}
