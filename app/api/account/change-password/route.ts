// app/api/account/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { checkCsrf } from "@/lib/csrf";
import { findUserById, verifyUserPassword, updatePassword } from "@/lib/users";

export const runtime = "nodejs";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);
const seeOther = (url: URL) => NextResponse.redirect(url, 303);

export async function POST(req: NextRequest) {
  try {
    // 0) AuthN: must be logged in
    const token = req.cookies.get("__Host-session")?.value;
    if (!token) throw new Error("NO_TOKEN");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("STALE");
    const userId = String(payload.sub ?? "");
    if (!userId) throw new Error("NO_SUB");

    // 1) Origin check (belt over suspenders)
    const origin = req.headers.get("origin") || "";
    const allowed = new URL(req.url).origin;
    if (origin !== allowed)
      return new NextResponse("Bad origin", { status: 403 });

    // 2) Parse form + CSRF
    const form = await req.formData();
    if (!checkCsrf(req, form)) {
      const url = new URL("/account", req.url);
      url.searchParams.set("err", "CSRF");
      return seeOther(url);
    }

    // 3) Inputs
    const current = String(form.get("current") ?? "");
    const next = String(form.get("next") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    // New: confirm match
    if (next !== confirm) {
      const url = new URL("/account", req.url);
      url.searchParams.set("err", "MISMATCH");
      return seeOther(url);
    }

    // Existing checks remain:
    if (next.length < 8) {
      const url = new URL("/account", req.url);
      url.searchParams.set("err", "WEAK");
      return seeOther(url);
    }
    
    // 4) Verify current password
    const user = await findUserById(userId);
    if (!user || !(await verifyUserPassword(user, current))) {
      const url = new URL("/account", req.url);
      url.searchParams.set("err", "BAD_CURRENT");
      return seeOther(url);
    }

    // 5) Update password (dev only; prod is read-only)
    try {
      await updatePassword(userId, next);
    } catch (e: unknown) {
      const url = new URL("/account", req.url);
      const code =
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        (e as { message?: string }).message === "WRITE_DISABLED"
          ? "READONLY"
          : "FAIL";
      url.searchParams.set("err", code);
      return seeOther(url);
    }

    // 6) Success → PRG back with ok=1
    const url = new URL("/account", req.url);
    url.searchParams.set("ok", "1");
    return seeOther(url);
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("err", "NEED_LOGIN");
    return seeOther(url);
  }
}
