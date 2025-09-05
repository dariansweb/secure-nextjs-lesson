// app/api/csrf/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function GET(req: Request) {
  const token = crypto.randomBytes(16).toString("hex");

  const baseUrl = req.url || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`;
  const res = NextResponse.redirect(new URL("/login", baseUrl));
  res.cookies.set("__Host-csrf", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return res;
}
