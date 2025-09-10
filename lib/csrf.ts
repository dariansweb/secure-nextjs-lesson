// lib/csrf.ts
// Use this in every POST/PUT/PATCH/DELETE route you add later, not just login.

import type { NextRequest } from "next/server";

/** Double-submit CSRF check: hidden form field must match cookie. */
export function checkCsrf(req: NextRequest, form: FormData): boolean {
  const a = (form.get("csrf") ?? "") as string;
  const b = req.cookies.get("__Host-csrf")?.value ?? "";
  return !!a && !!b && a === b;
}
