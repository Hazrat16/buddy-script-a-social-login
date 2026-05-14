function readApiPublicOrigin(): string | undefined {
    const raw = process.env["API_PUBLIC_URL"]?.trim() || process.env["PUBLIC_API_URL"]?.trim();
    if (!raw)
        return undefined;
    return raw.replace(/\/$/, "");
}

export function publicImageUrlForJson(stored: string | null): string | null {
    if (stored == null || stored === "")
        return null;
    if (/^https?:\/\//i.test(stored))
        return stored;
    const origin = readApiPublicOrigin();
    if (!origin || !stored.startsWith("/uploads/"))
        return stored;
    return `${origin}${stored}`;
}
