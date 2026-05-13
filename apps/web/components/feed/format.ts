export function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString();
}

export function summarizeLikers(
  likers: { firstName: string; lastName: string }[],
  total: number,
): string {
  if (total === 0) return "";
  const names = likers.map((u) => `${u.firstName} ${u.lastName}`.trim());
  if (names.length === 0) return `${total} like${total === 1 ? "" : "s"}`;
  const extra = total - names.length;
  if (names.length === 1 && extra <= 0) return names[0]!;
  if (names.length === 1 && extra > 0) return `${names[0]!} and ${extra} other${extra === 1 ? "" : "s"}`;
  if (names.length === 2 && extra <= 0) return `${names[0]!} and ${names[1]!}`;
  if (extra > 0) return `${names.slice(0, 3).join(", ")} and ${extra} more`;
  return names.join(", ");
}
