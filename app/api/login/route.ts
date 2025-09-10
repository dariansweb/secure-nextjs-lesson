// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { findUserByUsername, verifyUserPassword } from "@/lib/users";
import { checkCsrf } from "@/lib/csrf";
import { loginRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs"; // bcrypt + most DB clients need Node runtime

const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret");
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

// PRG helper (Post→Redirect→Get)
const seeOther = (url: URL) => NextResponse.redirect(url, 303);

// tiny helpers
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function ipFrom(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();

  // NextRequest.ip is available on some adapters/Vercel
  // @ ts-ignore

  return first || (req as NextRequest & { ip?: string }).ip || "unknown";
}

// Optional convenience if someone opens /api/login in a tab
export async function GET(req: NextRequest) {
  return seeOther(new URL("/login", req.url));
}

export async function POST(req: NextRequest) {
  try {
    // 0) Rate limit
    const rl = await loginRateLimit.limit(ipFrom(req));
    if (!rl.success) {
      await sleep(rand(150, 450));
      return new NextResponse("Too many attempts. Try again soon.", { status: 429 });
    }

    // 1) Origin check — belt over suspenders
    const origin = req.headers.get("origin") || "";
    const allowed = new URL(req.url).origin;
    if (origin !== allowed) {
      return new NextResponse("Bad origin", { status: 403 });
    }

    // 2) Parse form once
    const form = await req.formData();

    // 3) CSRF check — double-submit helper (REPLACES the old manual compare)
    if (!checkCsrf(req, form)) {
      await sleep(rand(120, 320));
      const url = new URL("/login", req.url);
      url.searchParams.set("err", "CSRF");
      return seeOther(url);
    }

    // 4) Credentials
    const username = (form.get("username") ?? "") as string;
    const password = (form.get("password") ?? "") as string;

    const user = await findUserByUsername(username);
    const ok = user && (await verifyUserPassword(user, password));
    if (!ok) {
      await sleep(rand(120, 320));
      const url = new URL("/login", req.url);
      url.searchParams.set("err", "BAD_AUTH");
      return seeOther(url);
    }

    // 5) ✅ Identity: mint JWT and set session cookie
    const token = await new SignJWT({
      sub: user!.id,
      username: user!.username,
      role: user!.role,
      v: SESSION_VERSION,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    const res = seeOther(new URL("/protected", req.url)); // PRG → GET /protected
    res.cookies.set({
      name: "__Host-session",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 2h; match JWT exp
    });
    return res;
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("err", "NEED_LOGIN");
    return seeOther(url);
  }
}
