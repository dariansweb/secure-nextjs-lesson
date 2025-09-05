"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // wipe the session cookie
  (await cookies()).set("__Host-session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  // send them through CSRF mint, or straight to /login if you prefer
  redirect("/api/csrf"); // or redirect("/login")
}
