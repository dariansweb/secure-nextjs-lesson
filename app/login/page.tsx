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
  <main className="mx-auto max-w-md px-4 py-16">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        Sign in
      </h1>

      {message && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {message}
        </p>
      )}

      <form method="POST" action="/api/login" className="space-y-4">
        <input type="hidden" name="csrf" value={csrf} />

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use the admin account we seeded for lesson-2.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
        >
          Login
        </button>
      </form>
    </section>


    <p className="mt-4 text-sm">
      <Link
        href="/"
        className="text-slate-700 underline underline-offset-2"
      >
        ← Back home
      </Link>
    </p>
  </main>
);


}
