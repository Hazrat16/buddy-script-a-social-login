import type { PublicUser } from "../feed/feed-types";

function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

type AvatarUser = Pick<PublicUser, "id" | "firstName" | "lastName">;

export function UserAvatar({
  user,
  size = 40,
  className = "",
  shape = "rounded-xl",
}: {
  user: AvatarUser;
  size?: number;
  className?: string;
  shape?: "rounded-xl" | "rounded-full";
}) {
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "?";
  const hue = hueFromId(user.id);
  const h2 = (hue + 42) % 360;

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-semibold text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10 ${shape} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.36),
        background: `linear-gradient(135deg, hsl(${hue} 58% 46%), hsl(${h2} 52% 38%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
