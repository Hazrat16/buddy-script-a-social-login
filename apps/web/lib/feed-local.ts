const SAVED = "buddy:saved-post-ids";
const HIDDEN = "buddy:hidden-post-ids";
const NOTIFY = "buddy:post-notify-on";
const SHARES = "buddy:post-share-counts";
const MY_REACTION = "buddy:my-post-reaction";
function readJson<T>(key: string, fallback: T): T {
    if (typeof window === "undefined")
        return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw) as T;
    }
    catch {
        return fallback;
    }
}
function writeJson(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch {
    }
}
export function getSavedPostIds(): Set<string> {
    const arr = readJson<string[]>(SAVED, []);
    return new Set(Array.isArray(arr) ? arr : []);
}
export function setPostSaved(postId: string, saved: boolean) {
    const s = getSavedPostIds();
    if (saved)
        s.add(postId);
    else
        s.delete(postId);
    writeJson(SAVED, [...s]);
}
export function isPostSaved(postId: string) {
    return getSavedPostIds().has(postId);
}
export function getHiddenPostIds(): Set<string> {
    const arr = readJson<string[]>(HIDDEN, []);
    return new Set(Array.isArray(arr) ? arr : []);
}
export function setPostHidden(postId: string, hidden: boolean) {
    const s = getHiddenPostIds();
    if (hidden)
        s.add(postId);
    else
        s.delete(postId);
    writeJson(HIDDEN, [...s]);
}
export function getNotifyPostIds(): Set<string> {
    const arr = readJson<string[]>(NOTIFY, []);
    return new Set(Array.isArray(arr) ? arr : []);
}
export function setPostNotify(postId: string, on: boolean) {
    const s = getNotifyPostIds();
    if (on)
        s.add(postId);
    else
        s.delete(postId);
    writeJson(NOTIFY, [...s]);
}
export function getShareCounts(): Record<string, number> {
    const o = readJson<Record<string, number>>(SHARES, {});
    return o && typeof o === "object" ? o : {};
}
export function incrementShareCount(postId: string): number {
    const cur = getShareCounts();
    const next = (cur[postId] ?? 0) + 1;
    writeJson(SHARES, { ...cur, [postId]: next });
    return next;
}
export type UiReaction = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";
const REACTION_META: Record<UiReaction, {
    label: string;
    emoji: string;
}> = {
    LIKE: { label: "Like", emoji: "👍" },
    LOVE: { label: "Love", emoji: "❤️" },
    HAHA: { label: "Haha", emoji: "😆" },
    WOW: { label: "Wow", emoji: "😮" },
    SAD: { label: "Sad", emoji: "😢" },
    ANGRY: { label: "Angry", emoji: "😠" },
};
export function reactionMeta(r: UiReaction) {
    return REACTION_META[r];
}
export function getMyPostReactions(): Record<string, UiReaction> {
    const o = readJson<Record<string, UiReaction>>(MY_REACTION, {});
    return o && typeof o === "object" ? o : {};
}
export function setMyPostReaction(postId: string, r: UiReaction | null) {
    const cur = { ...getMyPostReactions() };
    if (r === null)
        delete cur[postId];
    else
        cur[postId] = r;
    writeJson(MY_REACTION, cur);
}
export function getMyReactionForPost(postId: string): UiReaction | null {
    return getMyPostReactions()[postId] ?? null;
}
