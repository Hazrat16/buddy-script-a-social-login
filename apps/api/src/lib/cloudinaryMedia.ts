import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryEnabled(): boolean {
    return Boolean(
        process.env["CLOUDINARY_URL"]?.trim() ||
            (process.env["CLOUDINARY_CLOUD_NAME"]?.trim() &&
                process.env["CLOUDINARY_API_KEY"]?.trim() &&
                process.env["CLOUDINARY_API_SECRET"]?.trim()),
    );
}

function configure(): void {
    if (process.env["CLOUDINARY_URL"]?.trim()) {
        cloudinary.config();
        return;
    }
    cloudinary.config({
        cloud_name: process.env["CLOUDINARY_CLOUD_NAME"]!,
        api_key: process.env["CLOUDINARY_API_KEY"]!,
        api_secret: process.env["CLOUDINARY_API_SECRET"]!,
    });
}

export async function uploadPostImageFromBuffer(buf: Buffer, mimetype: string): Promise<string> {
    configure();
    const folder = process.env["CLOUDINARY_FOLDER"]?.trim() || "buddy_posts";
    const dataUri = `data:${mimetype};base64,${buf.toString("base64")}`;
    const res = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: "image",
        overwrite: false,
    });
    const url = res.secure_url;
    if (typeof url !== "string" || !url.startsWith("https://"))
        throw new Error("Cloudinary upload did not return a secure URL");
    return url;
}

function cloudinaryPublicIdFromUrl(url: string): string | null {
    if (!url.includes("res.cloudinary.com") || !url.includes("/upload/"))
        return null;
    try {
        const pathname = new URL(url).pathname;
        const marker = "/upload/";
        const i = pathname.indexOf(marker);
        if (i === -1)
            return null;
        let rest = pathname.slice(i + marker.length).replace(/^v\d+\//, "");
        const q = rest.indexOf("?");
        if (q !== -1)
            rest = rest.slice(0, q);
        const lastDot = rest.lastIndexOf(".");
        if (lastDot > 0)
            rest = rest.slice(0, lastDot);
        return rest || null;
    }
    catch {
        return null;
    }
}

export async function deleteStoredPostImage(imageUrl: string | null): Promise<void> {
    if (!imageUrl)
        return;
    if (imageUrl.includes("res.cloudinary.com") && isCloudinaryEnabled()) {
        const publicId = cloudinaryPublicIdFromUrl(imageUrl);
        if (!publicId)
            return;
        configure();
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
        catch {
        }
        return;
    }
    if (imageUrl.startsWith("/uploads/")) {
        const base = path.basename(imageUrl);
        if (!base || base.includes("..") || base.includes("/"))
            return;
        const fp = path.join(process.cwd(), "uploads", base);
        try {
            await fs.unlink(fp);
        }
        catch {
        }
    }
}
