// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { allowedForPath } from "@/lib/acl";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const config = {
  matcher: [
    // add your ACL-controlled directory root(s)
    "/protected/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/docs/:path*",
  ],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__Host-session")?.value;
  const pathname = req.nextUrl.pathname;

  try {
    if (!token) throw new Error("no-token");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("stale");

    // ACL check — only for paths that match our matcher
    const who = {
      sub: payload.sub as string | undefined,
      username: payload.username as string | undefined,
      role: payload.role as string | undefined,
    };

    if (!allowedForPath(who, pathname)) {
      if (process.env.NODE_ENV !== "production") {
        const url = req.nextUrl.clone();
        url.pathname = "/protected";
        url.searchParams.set("err", "NO_ACCESS");
        url.searchParams.set("path", pathname); // requested path
        // Optional crumbs about the rule that matched
        // (kept short & non-sensitive — no emails, no tokens)
        try {
          // path = requested path
          // rp = rule pathPrefix that matched (if any)
          // rr = roles that the rule allows (comma-separated, if present)
          // rid = how many userIds are whitelisted in the rule (count only)
          // rn = how many usernames are whitelisted (count only)
          // me = <username>#<id>
          // role = your role

          // Lazy import to avoid circulars
          const { ACL } = await import("@/acl.config");
          // Find longest matching rule (same logic as allowedForPath)
          const rule = ACL.filter((r) =>
            pathname.startsWith(r.pathPrefix)
          ).sort((a, b) => b.pathPrefix.length - a.pathPrefix.length)[0];
          if (rule) {
            url.searchParams.set("rp", rule.pathPrefix); // rule pathPrefix
            if (rule.allow?.roles?.length)
              url.searchParams.set("rr", rule.allow.roles.join(","));
            if (rule.allow?.userIds?.length)
              url.searchParams.set("rid", String(rule.allow.userIds.length));
            if (rule.allow?.usernames?.length)
              url.searchParams.set("rn", String(rule.allow.usernames.length));
          }
        } catch {
          /* swallow */
        }
        // Who am I (very coarse)
        url.searchParams.set(
          "me",
          [who.username ?? "unknown", who.sub ?? "no-id"].join("#")
        );
        url.searchParams.set("role", who.role ?? "unknown");
        return NextResponse.redirect(url, 303);
      }
      return new NextResponse("Not Found", { status: 404 });
    }

    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/api/csrf";
    url.searchParams.set("err", "NEED_LOGIN");
    return NextResponse.redirect(url, 303);
  }
}
