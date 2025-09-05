import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { logoutAction } from "./actions";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);

async function verify(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export default async function ProtectedPage() {
  const token = (await cookies()).get("__Host-session")?.value;
  const payload = await verify(token);

  if (!payload) {
    redirect("/login?error=" + encodeURIComponent("Please log in."));
  }

  return (
    <main style={{ maxWidth: 700, margin: "4rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1rem" }}>
        Protected Resource
      </h1>
      <p style={{ marginBottom: "1.25rem" }}>
        You’re inside, fair and square. This time the cookie is signed, so you
        can’t fake it with DevTools
      </p>

      <form method="POST" action={logoutAction}>
        <button
          type="submit"
          style={{
            display: "inline-block",
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            border: "1px solid #111827",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </form>
    </main>
  );
}
