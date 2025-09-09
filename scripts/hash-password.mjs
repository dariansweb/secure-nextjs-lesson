// Run this: node scripts/hash-password.mjs "The user password here ..."

import bcrypt from "bcryptjs";

const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
const pwd = process.argv[2];
if (!pwd) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}
const hash = bcrypt.hashSync(pwd, rounds);
console.log(hash);
