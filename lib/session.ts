// lib/session.ts
import { jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);

export type SessionPayload = JWTPayload & {
  sub: string; // user id
  username: string;
  role: "user" | "admin";
  v: number; // session version
};

export async function verifySession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
