// app/protected/page.tsx
import { cookies } from "next/headers";
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

export default async function ProtectedPage({
  searchParams,
}: {
  // 👇 Next can pass this as a Promise in streaming mode; await it.
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Always await before using
  const sp = (await searchParams) ?? {};

  // read your debug bits safely
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  const dbg = {
    path: Array.isArray(sp.path) ? sp.path[0] : sp.path,
    rp: Array.isArray(sp.rp) ? sp.rp[0] : sp.rp,
    rr: Array.isArray(sp.rr) ? sp.rr[0] : sp.rr,
    rid: Array.isArray(sp.rid) ? sp.rid[0] : sp.rid,
    rn: Array.isArray(sp.rn) ? sp.rn[0] : sp.rn,
    me: Array.isArray(sp.me) ? sp.me[0] : sp.me,
    role: Array.isArray(sp.role) ? sp.role[0] : sp.role,
  };

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
      <main className="mx-auto max-w-3xl px-4 py-16">
        {/* User card */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              User Page
            </h1>
            <span className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-200">
              {role}
            </span>
          </header>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Welcome back, <span className="font-semibold">{username}</span>.
          </p>

          <div className="my-4 border-t border-slate-200 dark:border-slate-800" />

          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm md:grid-cols-[10rem_1fr]">
            <dt className="font-semibold text-slate-600 dark:text-slate-400">
              User
            </dt>
            <dd className="text-slate-800 dark:text-slate-100">{username}</dd>

            <dt className="font-semibold text-slate-600 dark:text-slate-400">
              Role
            </dt>
            <dd>
              <span className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-200">
                {role}
              </span>
            </dd>

            <dt className="font-semibold text-slate-600 dark:text-slate-400">
              User ID
            </dt>
            <dd className="text-slate-800 dark:text-slate-100">
              {payload.sub as string}
            </dd>
          </dl>

          <div className="mt-4 flex justify-end">
            <form method="POST" action="/api/logout">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Logout
              </button>
            </form>
          </div>
        </section>

        {/* ACL detail / dev-only explainer */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            ACL Detail
          </h2>

          {process.env.NODE_ENV !== "production" && err === "NO_ACCESS" && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              <p className="font-semibold">Access blocked (dev explain):</p>
              <div className="my-3 border-t border-red-200 dark:border-red-800" />
              <dl className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-[12rem_1fr]">
                <dt className="text-red-800 dark:text-red-200/80">Requested</dt>
                <dd>{dbg.path || "(unknown)"}</dd>

                <dt className="text-red-800 dark:text-red-200/80">
                  Matched rule
                </dt>
                <dd>{dbg.rp || "(none)"}</dd>

                <dt className="text-red-800 dark:text-red-200/80">
                  Rule allows roles
                </dt>
                <dd>{dbg.rr || "(none)"}</dd>

                <dt className="text-red-800 dark:text-red-200/80">
                  Rule whitelists
                </dt>
                <dd>
                  {dbg.rid ?? "0"} userId(s) · {dbg.rn ?? "0"} username(s)
                </dd>

                <dt className="text-red-800 dark:text-red-200/80">You</dt>
                <dd>
                  {dbg.me || "(unknown)"} — role: {dbg.role || "(unknown)"}
                </dd>
              </dl>
              <p className="mt-3 text-xs text-red-800/90 dark:text-red-200/80">
                Edit{" "}
                <code className="rounded bg-red-100/60 px-1 py-0.5 dark:bg-red-900/40">
                  acl.config.ts
                </code>{" "}
                to grant access for your user/role.
              </p>
            </div>
          )}
        </section>
      </main>
    );
  } catch {
    redirect("/login?err=NEED_LOGIN");
  }
}
