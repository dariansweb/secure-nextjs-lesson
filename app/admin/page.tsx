import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const token = (await cookies()).get("__Host-session")?.value;
  if (!token) redirect("/login?err=NEED_LOGIN");

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
        </section>
      </main>
    );
  } catch {
    redirect("/login?err=NEED_LOGIN");
  }
}
