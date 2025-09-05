// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);

const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__Host-session")?.value;
   
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/csrf";
    url.searchParams.set("err", "NEED_LOGIN");
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof payload.v !== "number" || payload.v !== SESSION_VERSION) {
      throw new Error("stale-session");
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/api/csrf";
    url.searchParams.set("err", "NEED_LOGIN");
    return NextResponse.redirect(url);
  } 
}

export const config = {
  matcher: ["/protected/:path*"], // guard everything under /protected
};
