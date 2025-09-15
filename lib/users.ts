// lib/users.ts
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
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

let cache: User[] | null = null;

async function loadUsers(): Promise<User[]> {
  if (cache) return cache;
  const txt = await fs.readFile(USERS_JSON_PATH, "utf8");
  cache = JSON.parse(txt) as User[];
  return cache;
}

export async function findUserByUsername(username: string) {
  const users = await loadUsers();
  return (
    users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ??
    null
  );
}

export async function verifyUserPassword(user: User, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

// NEW: createUser for dev (JSON). In production, reject with WRITE_DISABLED.
export async function createUser(
  username: string,
  password: string,
  role: Role = "user"
) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("WRITE_DISABLED");
  }

  const users = await loadUsers();
  const exists = users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) throw new Error("USERNAME_TAKEN");

  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
  const passwordHash = await bcrypt.hash(password, rounds);
  const user: User = { id: crypto.randomUUID(), username, role, passwordHash };

  const next = [...users, user];
  await fs.mkdir(path.dirname(USERS_JSON_PATH), { recursive: true });
  await fs.writeFile(USERS_JSON_PATH, JSON.stringify(next, null, 2));

  cache = next; // refresh in-memory cache
  return user;
}
