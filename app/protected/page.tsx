// app/protected/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const SESSION_VERSION = parseInt(process.env.SESSION_VERSION ?? "1", 10);

export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__Host-session")?.value;
  if (!token) redirect("/login?err=NEED_LOGIN");

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.v !== SESSION_VERSION) throw new Error("stale");

    const username = payload.username as string;
    const role = payload.role as string;

    return (
      <main className="container">
        <section className="card">
          <header className="header">
            <h1 className="title">Protected</h1>
            <span className="badge">{role}</span>
          </header>

          <p className="muted">
            Welcome back, <strong>{username}</strong>.
          </p>

          <div className="divider" />

          <dl className="kv">
            <dt>User</dt>
            <dd>{username}</dd>

            <dt>Role</dt>
            <dd>
              <span className="badge">{role}</span>
            </dd>

            {/* Add more claims if you start including them in the JWT */}
            {/* <dt>User ID</dt><dd>{payload.sub as string}</dd> */}
          </dl>

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
