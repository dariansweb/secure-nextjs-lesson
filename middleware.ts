import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const config = {
  matcher: ["/protected/:path*", "/admin/:path*"], // ← add /admin
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__Host-session")?.value;

  try {
    if (!token) throw new Error("no-token");

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("stale");

    // Role-based gate
    const pathname = req.nextUrl.pathname;
    const role = payload.role as string | undefined;
    if (pathname.startsWith("/admin") && role !== "admin") {
      // Non-admin trying to hit /admin → bounce to /protected
      const url = req.nextUrl.clone();
      url.pathname = "/protected";
      return NextResponse.redirect(url, 303);
    }

    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/api/csrf"; // ensures CSRF cookie exists before /login
    url.searchParams.set("err", "NEED_LOGIN");
    return NextResponse.redirect(url, 303); // PRG on unauth redirects
  }
}
