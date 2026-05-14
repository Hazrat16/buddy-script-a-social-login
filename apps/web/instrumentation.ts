/**
 * Runs once when the Next server starts. In dev, prints where `/api/*` is proxied so it is obvious
 * that the browser still shows `localhost:3000/api/...` while the server talks to Railway (or local API).
 */
export async function register() {
  if (process.env.NODE_ENV !== "development") return;

  const raw =
    process.env["NEXT_API_BASE_URL"]?.trim() || process.env["API_INTERNAL_URL"]?.trim();
  const base =
    raw?.replace(/\/$/, "") ||
    (process.env.VERCEL ? "(missing NEXT_API_BASE_URL on Vercel)" : "http://127.0.0.1:3001 (no NEXT_API_BASE_URL set)");

  // eslint-disable-next-line no-console -- intentional dev diagnostics
  console.info(`\n[buddy web] /api/* is proxied to: ${base}`);
  // eslint-disable-next-line no-console -- intentional dev diagnostics
  console.info(
    "[buddy web] Tip: a shell-exported NEXT_API_BASE_URL overrides apps/web/.env — unset it if wrong.\n",
  );
}
