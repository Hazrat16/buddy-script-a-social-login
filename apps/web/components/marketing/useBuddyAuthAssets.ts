"use client";
import { useEffect } from "react";
const PREFIX = "buddy-auth-asset";
function ensureLink(id: string, href: string, rel: string, crossOrigin?: "" | "anonymous") {
    if (document.getElementById(id))
        return;
    const el = document.createElement("link");
    el.id = id;
    el.rel = rel;
    el.href = href;
    if (crossOrigin !== undefined)
        el.crossOrigin = crossOrigin;
    document.head.appendChild(el);
}
export function useBuddyAuthAssets(enabled: boolean) {
    useEffect(() => {
        if (!enabled)
            return;
        ensureLink(`${PREFIX}-font-pre1`, "https://fonts.googleapis.com", "preconnect");
        ensureLink(`${PREFIX}-font-pre2`, "https://fonts.gstatic.com", "preconnect", "anonymous");
        ensureLink(`${PREFIX}-font`, "https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700;800&display=swap", "stylesheet");
        ensureLink(`${PREFIX}-bootstrap`, "/assets/css/bootstrap.min.css", "stylesheet");
        ensureLink(`${PREFIX}-common`, "/assets/css/common.css", "stylesheet");
        ensureLink(`${PREFIX}-main`, "/assets/css/main.css", "stylesheet");
        ensureLink(`${PREFIX}-responsive`, "/assets/css/responsive.css", "stylesheet");
        const scriptId = `${PREFIX}-bootstrap-js`;
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "/assets/js/bootstrap.bundle.min.js";
            script.async = true;
            document.body.appendChild(script);
        }
        return () => {
            for (const id of [
                `${PREFIX}-font-pre1`,
                `${PREFIX}-font-pre2`,
                `${PREFIX}-font`,
                `${PREFIX}-bootstrap`,
                `${PREFIX}-common`,
                `${PREFIX}-main`,
                `${PREFIX}-responsive`,
            ]) {
                document.getElementById(id)?.remove();
            }
            document.getElementById(scriptId)?.remove();
        };
    }, [enabled]);
}
