import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/api/csrf", req.url), 303);
  res.cookies.set({
    name: "__Host-session",
    value: "",
    path: "/",
    maxAge: 0, // delete cookie
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  return res;
}

// Optional: if someone GETs this URL in a tab, just bounce
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url));
}
