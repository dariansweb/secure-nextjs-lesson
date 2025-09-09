import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";

export type Role = "user" | "admin";
export type User = {
  id: string;
  username: string;
  role: Role;
  passwordHash: string;
};

const USERS_JSON_PATH =
  process.env.USERS_JSON_PATH ?? path.join(process.cwd(), "data", "users.json");

// naive in-memory cache (safe for serverless cold starts)
let cache: User[] | null = null;

async function loadUsers(): Promise<User[]> {
  if (cache) return cache;
  const txt = await fs.readFile(USERS_JSON_PATH, "utf8");
  cache = JSON.parse(txt) as User[];
  return cache;
}

export async function findUserByUsername(username: string) {
  const users = await loadUsers();
  const u = users.find(
    (x) => x.username.toLowerCase() === username.toLowerCase()
  );
  return u ?? null;
}

export async function verifyUserPassword(user: User, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}
