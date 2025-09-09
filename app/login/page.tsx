// app/login/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const rawErr = Array.isArray(sp.err) ? sp.err[0] : sp.err;

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
      <form method="POST" action="/api/login" className="stack">
        <input type="hidden" name="csrf" value={csrf} />

        <div className="field">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="input"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
          />
          <p className="helper">
            Use the admin account we seeded for lesson-2.
          </p>
        </div>

        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Back home</Link>
      </p>
    </main>
  );
}
