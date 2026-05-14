export function readApiBackendBaseFromEnv(): string | undefined {
    const raw = process.env["BACKEND_API_URL"]?.trim() ||
        process.env["NEXT_API_BASE_URL"]?.trim() ||
        process.env["API_INTERNAL_URL"]?.trim();
    if (!raw)
        return undefined;
    return raw.replace(/\/$/, "");
}
export function isThisVercelAppHost(base: string): boolean {
    const vercelHost = process.env.VERCEL_URL?.toLowerCase();
    if (!vercelHost || !process.env.VERCEL)
        return false;
    try {
        const u = new URL(base.startsWith("http://") || base.startsWith("https://") ? base : `https://${base}`);
        return u.hostname.toLowerCase() === vercelHost;
    }
    catch {
        return false;
    }
}
export function isVercelProductionDeploy(): boolean {
    return (process.env.NODE_ENV === "production" &&
        Boolean(process.env.VERCEL) &&
        Boolean(process.env.VERCEL_URL?.trim()));
}
