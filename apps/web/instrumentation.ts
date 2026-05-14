/**
 * Runs once when the Next server starts. In dev, prints where `/api/*` is proxied so it is obvious
 * that the browser still shows `localhost:3000/api/...` while the server talks to Railway (or local API).
 */
export async function register() {
  if (process.env.NODE_ENV !== "development") return;

  const { readApiBackendBaseFromEnv } = await import("./lib/api-backend-env");
  const fromEnv = readApiBackendBaseFromEnv();
  const base =
    fromEnv ||
    (process.env.VERCEL ? "(missing BACKEND_API_URL / NEXT_API_BASE_URL on Vercel)" : "http://127.0.0.1:3001 (no backend URL in .env)");

  // eslint-disable-next-line no-console -- intentional dev diagnostics
  console.info(`\n[buddy web] /api/* is proxied to: ${base}`);
  // eslint-disable-next-line no-console -- intentional dev diagnostics
  console.info(
    "[buddy web] Tip: shell-exported BACKEND_API_URL / NEXT_API_BASE_URL overrides apps/web/.env — unset if wrong.\n",
  );
}
