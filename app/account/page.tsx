// app/account/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?:
    Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;

  const token = (await cookies()).get("__Host-session")?.value;
  if (!token) redirect("/login?err=NEED_LOGIN");

  let username = "unknown";
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("stale");
    username = String(payload.username ?? "unknown");
  } catch {
    redirect("/login?err=NEED_LOGIN");
  }

  const csrf = (await cookies()).get("__Host-csrf")?.value ?? "";

  const messages: Record<string, string> = {
    CSRF: "Session expired while submitting. Please try again.",
    BAD_CURRENT: "Current password is incorrect.",
    WEAK: "New password must be at least 8 characters.",
    MISMATCH: "New password and confirmation must match.",
    READONLY: "Password changes are disabled in production (JSON store).",
    FAIL: "Could not change password. Try again.",
  };

  return (
    <main className="container">
      <section className="card">
        <header className="header">
          <h1 className="title">Account</h1>
          <span className="badge">user</span>
        </header>

        <p className="muted">
          Signed in as <strong>{username}</strong>.
        </p>

        <div className="divider" />

        {ok === "1" && <p className="helper">Password changed.</p>}
        {err && (
          <p className="error">{messages[err] ?? "Something went wrong."}</p>
        )}

        {process.env.NODE_ENV !== "production" ? (
          <>
            <h2 className="title" style={{ fontSize: "1.2rem" }}>
              Change password
            </h2>

            <form
              method="POST"
              action="/api/account/change-password"
              className="stack"
              noValidate
            >
              <input type="hidden" name="csrf" value={csrf} />

              <div className="field">
                <label htmlFor="current" className="label">
                  Current password
                </label>
                <input
                  id="current"
                  name="current"
                  type="password"
                  className="input"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="next" className="label">
                  New password
                </label>
                <input
                  id="next"
                  name="next"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <p className="helper">Min 8 characters.</p>
              </div>

              <div className="field">
                <label htmlFor="confirm" className="label">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Update password
              </button>
            </form>
          </>
        ) : (
          <p className="helper">
            Password changes are disabled in production while using the JSON
            store.
          </p>
        )}

        <div className="toolbar">
          <form method="POST" action="/api/logout">
            <button type="submit" className="btn">
              Logout
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
