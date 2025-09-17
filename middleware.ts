// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { allowedForPath } from "@/lib/acl";
import { isRateLimited } from "@/lib/rate-limit";


const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET required in production');
    }
    return 'dev-secret';
  })()
);


const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const config = {
  matcher: [
    "/protected/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/docs/:path*",
    // Also protect API routes
    "/api/((?!csrf|health).*)" 
  ],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__Host-session")?.value;
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Request size limit (1MB)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    return new NextResponse('Payload Too Large', { status: 413 });
  }

  // Block suspicious user agents
  const userAgent = req.headers.get('user-agent') || '';
  if (userAgent.length > 500 || /[<>"'&]/.test(userAgent)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Path traversal protection
  if (pathname.includes('../') || pathname.includes('..\\') || 
      pathname.includes('%2e%2e') || pathname.includes('%252e')) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Rate limiting
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  try {
    if (!token) throw new Error("no-token");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("stale");
    if (!payload.exp || payload.exp < Date.now() / 1000) throw new Error("expired");

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
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'");
    
    if (process.env.NODE_ENV === 'production') {
      res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    }
    return res;
  } catch {
    // Add small delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    const url = req.nextUrl.clone();
    url.pathname = "/api/csrf";
    url.searchParams.set("err", "NEED_LOGIN");
    return NextResponse.redirect(url, 303);
  }
}
