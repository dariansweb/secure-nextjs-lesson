// lib/acl.ts
import { ACL, type AclRule } from "@/acl.config";

export type Who = {
  sub?: string;
  username?: string;
  role?: string;
};

function pickBestRule(pathname: string): AclRule | null {
  let best: AclRule | null = null;
  for (const r of ACL) {
    if (pathname.startsWith(r.pathPrefix)) {
      if (!best || r.pathPrefix.length > best.pathPrefix.length) best = r;
    }
  }
  return best;
}

/** Returns true if the user is allowed to view this pathname. */
export function allowedForPath(who: Who, pathname: string): boolean {
  // Admins can see everything by policy
  if (who.role === "admin") return true;

  const rule = pickBestRule(pathname);
  // No matching rule → not an ACL-protected subtree → allow
  if (!rule) return true;

  const allow = rule.allow ?? {};
  const roles: string[] = allow.roles ?? [];
  const userIds = allow.userIds ?? [];
  const usernames = (allow.usernames ?? []).map((s) => s.toLowerCase());

  if (who.role && roles.includes(who.role)) return true;
  if (userIds.includes(who.sub ?? "")) return true;
  if (usernames.includes((who.username ?? "").toLowerCase())) return true;

  return false;
}
