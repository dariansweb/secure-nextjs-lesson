import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { loginRateLimit } from "@/lib/rateLimit";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret");
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

// jitter helpers
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function ipFrom(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  // Some Next.js deployments may provide req.ip, but it's not always typed
  const ip = (req as NextRequest & { ip?: string }).ip;
  return first || ip || "unknown";
}

// Optional: people sometimes open /api/login in the browser
export async function GET(req: NextRequest) {
  const baseUrl = req.url || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`;
  return NextResponse.redirect(new URL("/login", baseUrl));
}

export async function POST(req: NextRequest) {
  try {
    // --- rate limit ---
    const ip = ipFrom(req);
    const rl = await loginRateLimit.limit(ip);
    if (!rl.success) {
      await sleep(rand(150, 450));
      return new NextResponse("Too many attempts. Try again soon.", { status: 429 });
    }

    // --- parse form ---
    const form = await req.formData();
    const provided = (form.get("password") ?? "") as string;

    // --- CSRF check (double-submit) ---
    const csrfFromForm = (form.get("csrf") ?? "") as string;
    const csrfFromCookie = req.cookies.get("__Host-csrf")?.value ?? "";
    if (!csrfFromForm || !csrfFromCookie || csrfFromForm !== csrfFromCookie) {
      await sleep(rand(120, 320));
      const baseUrl = req.url || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`;
      const url = new URL("/login", baseUrl);
      url.searchParams.set("err", "CSRF");
      return NextResponse.redirect(url);
    }

    // --- check password ---
    const expected = process.env.LOGIN_PASSWORD ?? "letmein";
    if (provided !== expected) {
      await sleep(rand(120, 320));
      const baseUrl = req.url || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`;
      const url = new URL("/login", baseUrl);
      url.searchParams.set("err", "BAD_AUTH");
      return NextResponse.redirect(url);
    }

    // --- issue JWT (short-lived, versioned) ---
    const token = await new SignJWT({ loggedIn: true, v: SESSION_VERSION })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    // --- set cookie + redirect ---
    const baseUrl = req.url || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`;
    const res = NextResponse.redirect(new URL("/protected", baseUrl));
    res.cookies.set({
      name: "__Host-session",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 2h to match JWT exp
    });

    return res;
  } catch {
    // Avoid leaking details; log server-side if you have a logger
    const baseUrl = req.url || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`;
    const url = new URL("/login", baseUrl);
    url.searchParams.set("err", "NEED_LOGIN");
    return NextResponse.redirect(url);
  }
}
