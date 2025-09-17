// app/api/admin/add-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createUser } from "@/lib/users";
import { checkCsrf } from "@/lib/csrf";

export const runtime = "nodejs";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET required in production');
    }
    return 'dev-secret';
  })()
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);
const seeOther = (url: URL) => NextResponse.redirect(url, 303);

export async function POST(req: NextRequest) {
  try {
    // AuthN + AuthZ
    const token = req.cookies.get("__Host-session")?.value;
    if (!token) throw new Error("NO_TOKEN");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("STALE");
    if ((payload.role as string) !== "admin") throw new Error("FORBIDDEN");

    // Origin check
    const origin = req.headers.get("origin") || "";
    const allowed = new URL(req.url).origin;
    if (origin !== allowed)
      return new NextResponse("Bad origin", { status: 403 });

    // CSRF
    const form = await req.formData();
    if (!checkCsrf(req, form)) {
      const url = new URL("/admin", req.url);
      url.searchParams.set("err", "CSRF");
      return seeOther(url);
    }

    // Inputs
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const role =
      String(form.get("role") ?? "user") === "admin" ? "admin" : "user";

    // Simple validation
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
      const url = new URL("/admin", req.url);
      url.searchParams.set("err", "BAD_USERNAME");
      return seeOther(url);
    }
    if (password.length < 8) {
      const url = new URL("/admin", req.url);
      url.searchParams.set("err", "WEAK_PASSWORD");
      return seeOther(url);
    }

    try {
      await createUser(username, password, role as "user" | "admin");
    } catch (e: unknown) {
      const url = new URL("/admin", req.url);
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      const code =
        message === "USERNAME_TAKEN"
          ? "TAKEN"
          : message === "WRITE_DISABLED"
          ? "READONLY"
          : "FAIL";
      url.searchParams.set("err", code);
      return seeOther(url);
    }

    const url = new URL("/admin", req.url);
    url.searchParams.set("ok", "1");
    url.searchParams.set("user", username);
    return seeOther(url);
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("err", "NEED_LOGIN");
    return seeOther(url);
  }
}
