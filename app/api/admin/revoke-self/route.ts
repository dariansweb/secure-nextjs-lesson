import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { bumpUserVersion } from "@/lib/userVersion";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("__Host-session")?.value;
    if (!token) throw new Error("no token");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // optional: only allow admins to use this endpoint
    // if (payload.role !== "admin") throw new Error("forbidden");

    const sub = String(payload.sub ?? "");
    if (!sub) throw new Error("no sub");

    await bumpUserVersion(sub);

    // Don’t clear the cookie; the middleware will reject it on next request
    const url = new URL("/admin?revoked=1", req.url);
    return NextResponse.redirect(url, 303);
  } catch {
    const url = new URL("/login?err=NEED_LOGIN", req.url);
    return NextResponse.redirect(url, 303);
  }
}
