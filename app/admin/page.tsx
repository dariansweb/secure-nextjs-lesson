import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET required in production');
    }
    return 'dev-secret';
  })()
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const token = (await cookies()).get("__Host-session")?.value;
  if (!token) redirect("/login?err=NEED_LOGIN");

  // at top of the component after verifying the token:
  const csrf = (await cookies()).get("__Host-csrf")?.value ?? "";

  // Get search params from the current URL
  const url =
    typeof window === "undefined"
      ? (await headers()).get("x-url") || "http://localhost"
      : window.location.href;
  const searchParams = new URL(url).searchParams;
  const sp = {
    err: searchParams.get("err"),
    ok: searchParams.get("ok"),
    user: searchParams.get("user"),
  };
  const err = sp.err;
  const ok = sp.ok;
  const newUser = sp.user;

  const messages: Record<string, string> = {
    CSRF: "Session expired while submitting. Please try again.",
    BAD_USERNAME:
      "Username must be 3–32 chars: letters, numbers, dot, underscore, dash.",
    WEAK_PASSWORD: "Password must be at least 8 characters.",
    TAKEN: "That username is already taken.",
    READONLY: "Writes are disabled in production (JSON store).",
    FAIL: "Could not create user. Try again.",
  };

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("stale");
    const role = payload.role as string;
    const username = payload.username as string;

    // Extra belt-and-suspenders check at render time
    if (role !== "admin") redirect("/protected");

    return (
      <main className="container">
        <section className="card">
          <header className="header">
            <h1 className="title">Admin</h1>
            <span className="badge">admin</span>
          </header>

          <p className="muted">
            Hello <strong>{username}</strong>. You’ve got the keys.
          </p>

          <div className="divider" />

          <p>Imagine config toggles, audit logs, user management here.</p>

          <div className="toolbar">
            <form method="POST" action="/api/logout">
              <button type="submit" className="btn">
                Logout
              </button>
            </form>
          </div>
          {ok === "1" && (
            <p className="helper">
              User <strong>{newUser}</strong> created.
            </p>
          )}
          {err && (
            <p className="error">{messages[err] ?? "Something went wrong."}</p>
          )}

          {process.env.NODE_ENV !== "production" ? (
            <>
              <h2 className="title" style={{ fontSize: "1.2rem" }}>
                Add user
              </h2>

              <form
                method="POST"
                action="/api/admin/add-user"
                className="stack"
              >
                <input type="hidden" name="csrf" value={csrf} />

                <div className="field">
                  <label htmlFor="new-username" className="label">
                    Username
                  </label>
                  <input
                    id="new-username"
                    name="username"
                    type="text"
                    className="input"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="new-password" className="label">
                    Password
                  </label>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    className="input"
                    required
                  />
                  <p className="helper">Min 8 characters.</p>
                </div>

                <div className="field">
                  <label htmlFor="new-role" className="label">
                    Role
                  </label>
                  <select
                    id="new-role"
                    name="role"
                    className="input"
                    defaultValue="user"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Create user
                </button>
              </form>
            </>
          ) : (
            <p className="helper">
              User creation via JSON is disabled in production.
            </p>
          )}
        </section>
      </main>
    );
  } catch {
    redirect("/login?err=NEED_LOGIN");
  }
}
