import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { findUserByUsername, verifyUserPassword } from "@/lib/users";
import { loginRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs"; // bcrypt needs Node, not Edge

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

// tiny helpers
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const seeOther = (url: URL) => NextResponse.redirect(url, 303);

function ipFrom(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return (
    first ||
    (typeof (req as { ip?: string }).ip === "string"
      ? (req as { ip?: string }).ip
      : undefined) ||
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url));
}

export async function POST(req: NextRequest) {
  try {
    // rate limit
    const rl = await loginRateLimit.limit(ipFrom(req));
    if (!rl.success) {
      await sleep(rand(150, 450));
      return new NextResponse("Too many attempts. Try again soon.", {
        status: 429,
      });
    }

    const form = await req.formData();
    const csrfForm = (form.get("csrf") ?? "") as string;
    const csrfCookie = req.cookies.get("__Host-csrf")?.value ?? "";
    const username = (form.get("username") ?? "") as string;
    const password = (form.get("password") ?? "") as string;
    const user = await findUserByUsername(username);

    // Force PRG (Post→Redirect→Get) for redirects from POST handlers
    const seeOther = (url: URL) => NextResponse.redirect(url, 303);

    // CSRF mismatch
    if (!csrfForm || !csrfCookie || csrfForm !== csrfCookie) {
      await sleep(rand(120, 320));
      const url = new URL("/login", req.url);
      url.searchParams.set("err", "CSRF");
      return seeOther(url); // <-- 303 here
    }

    // Bad username/password
    if (!user || !(await verifyUserPassword(user, password))) {
      await sleep(rand(120, 320));
      const url = new URL("/login", req.url);
      url.searchParams.set("err", "BAD_AUTH");
      return seeOther(url); // <-- 303 here
    }

    // identity claims
    const token = await new SignJWT({
      sub: user.id,
      username: user.username,
      role: user.role,
      v: SESSION_VERSION,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    const res = seeOther(new URL("/protected", req.url));
    res.cookies.set({
      name: "__Host-session",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 2h, match your JWT exp
    });
    return res;
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("err", "NEED_LOGIN");
    return seeOther(url);
  }
}
