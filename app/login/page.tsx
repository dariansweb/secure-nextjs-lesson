// app/login/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  // Next 15: searchParams may be thenable; await it
  const sp = (await searchParams) ?? {};
  const rawErr = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  // Read existing CSRF cookie (do NOT set cookies in a Page)
  const csrf = (await cookies()).get("__Host-csrf")?.value ?? "";

  // If missing, bounce through the route handler that sets it
  if (!csrf) {
    redirect("/api/csrf");
  }

  // Map codes → fixed strings (no reflected text)
  const messages: Record<string, string> = {
    BAD_AUTH: "Wrong password.",
    NEED_LOGIN: "Please log in.",
    CSRF: "Session expired. Please try again.",
  };
  const message = rawErr ? messages[rawErr] ?? null : null;

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1rem" }}>
        Sign in
      </h1>

      {message && (
        <p
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            padding: "0.75rem",
            borderRadius: 8,
            marginBottom: "1rem",
          }}
        >
          {message}
        </p>
      )}

      <form method="POST" action="/api/login">
        {/* CSRF double-submit: value comes from cookie set by /api/csrf */}
        <input type="hidden" name="csrf" value={csrf} />

        <label htmlFor="password" style={{ display: "block", fontWeight: 600 }}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="enter the secret"
          required
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 16,
            padding: "0.6rem 0.75rem",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        />

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
          Login
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Back home</Link>
      </p>
    </main>
  );
}
