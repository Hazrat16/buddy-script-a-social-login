export function resolvePostImageSrc(href: string | null | undefined): string | undefined {
    if (href == null || href === "")
        return undefined;
    if (/^https?:\/\//i.test(href))
        return href;
    const raw = process.env["NEXT_PUBLIC_UPLOADS_ORIGIN"]?.trim();
    if (!raw)
        return href;
    const base = raw.replace(/\/$/, "");
    return href.startsWith("/") ? `${base}${href}` : `${base}/${href}`;
}
