// app/api/csrf/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function GET() {
  const token = crypto.randomBytes(32).toString("hex");

  const res = NextResponse.redirect("/login");
  res.cookies.set("__Host-csrf", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return res;
}
