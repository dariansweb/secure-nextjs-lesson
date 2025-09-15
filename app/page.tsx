// app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const env = process.env.NODE_ENV ?? "development";
  const isProd = env === "production";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-2">
      {/* Header card */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Dev vs Prod strip */}
        <div
          className={[
            "px-5 py-3 text-sm",
            isProd
              ? "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              : "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
          ].join(" ")}
        >
          {isProd ? (
            <p>
              <strong className="font-semibold">Production mode:</strong>{" "}
              JSON-backed write operations are disabled. “Add user” (Admin) and
              “Change password” (Account) show read-only hints. All routes are
              enforced by middleware (JWT + RBAC + ACL) with PRG 303 redirects
              and CSRF.
            </p>
          ) : (
            <p>
              <strong className="font-semibold">Development mode:</strong>{" "}
              JSON-backed writes are enabled for learning. Try “Add user” on{" "}
              <Link href="/admin" className="underline underline-offset-2">
                /admin
              </Link>{" "}
              and “Change password” on{" "}
              <Link href="/account" className="underline underline-offset-2">
                /account
              </Link>
              . Security features are live (CSRF double-submit, SameSite
              cookies, middleware gates).
            </p>
          )}
        </div>
        {/* CTA row: Star / View repo */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Source code available on GitHub — audit, fork, improve the lessons.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/dariansweb/secure-nextjs-lesson"
              className="inline-flex items-center rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 active:translate-y-px dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="mr-2 h-4 w-4"
                fill="currentColor"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59..." />
              </svg>
              View on GitHub
            </a>
            <a
              href="https://github.com/dariansweb/secure-nextjs-lesson/stargazers"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              ⭐ Star the repo
            </a>
          </div>
        </div>
        {/* Intro */}
        <div className="px-5 pt-5 text-slate-700 dark:text-slate-300">
          <p className="text-sm leading-relaxed">
            A step-by-step, production-shaped walkthrough of building safer auth
            and access controls with the App Router and Tailwind. The app is
            intentionally simple, but the edges — cookies, CSRF, middleware, and
            redirects — are treated like the real world.
          </p>
          <p>ADMIN - 
            Username: admin Password: password
            </p>
          <p>USER -
            Username: reader Password: password
          </p>
        </div>

        {/* Quick nav */}
        <div className="px-5 py-5">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Explore
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Login
              </Link>
              <Link
                href="/protected"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Protected
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Admin
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Docs
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Account
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in first; admins see everything. Users are gated by ACL rules
              under{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /docs/*
              </code>
              .
            </p>
          </div>
        </div>

        <div className="mx-5 border-t border-slate-200 dark:border-slate-800" />

        {/* What’s implemented */}
        <section className="px-5 py-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
            What’s implemented
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-[12rem_1fr]">
            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Auth model
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              Username + password (bcrypt), users in{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                data/users.json
              </code>{" "}
              (dev). Writes disabled in production.
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Session
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              Signed JWT (HS256) in host-scoped cookie{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                __Host-session
              </code>
              , short expiry, verified in middleware with versioning.
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              CSRF
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              Double-submit token (
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                __Host-csrf
              </code>{" "}
              + hidden field) and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                SameSite=Lax
              </code>
              .
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Redirect hygiene
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              PRG flow with <span className="font-semibold">303 See Other</span>{" "}
              after POSTs (no{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                POST /protected
              </code>{" "}
              ghosts).
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Access control
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              Middleware gates{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /protected
              </code>
              ,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /admin
              </code>
              ,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /account
              </code>
              , and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /docs
              </code>
              . RBAC via JWT{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                role
              </code>
              . Per-directory ACL for{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /docs/*
              </code>{" "}
              (most-specific prefix wins). Dev-only “NO_ACCESS” explainer on the
              protected page.
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Hardening
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              HttpOnly/Secure cookies, strict cache control{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                private, no-store
              </code>
              , CSP/HSTS/nosniff/frame-ancestors, origin checks on POSTs, and
              login rate limiting with jitter.
            </dd>
          </dl>
        </section>

        <div className="mx-5 border-t border-slate-200 dark:border-slate-800" />

        {/* Lessons timeline */}
        <section className="px-5 py-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
            How we got here (lesson timeline)
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li>
              <span className="font-semibold">
                Lesson 1 — Training-wheels login:
              </span>{" "}
              fixed insecure flows; added CSRF, SameSite, rate limiting, and 303
              PRG.
            </li>
            <li>
              <span className="font-semibold">
                Lesson 2 — Real identity (file-based):
              </span>{" "}
              JSON users, bcrypt hashes, JWT cookie with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                sub / username / role / v
              </code>
              ; middleware verification.
            </li>
            <li>
              <span className="font-semibold">
                Lesson 3 — RBAC + protected routes:
              </span>{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /protected
              </code>{" "}
              &{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /admin
              </code>{" "}
              gates, clean logout.
            </li>
            <li>
              <span className="font-semibold">Lesson 4 — Directory ACLs:</span>{" "}
              rule file for{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                /docs/*
              </code>{" "}
              and dev-only “why blocked?” panel.
            </li>
            <li>
              <span className="font-semibold">
                Lesson 5 — Account management:
              </span>{" "}
              change password (with confirm) and admin-only “add user.” Writes
              in dev; read-only in prod.
            </li>
          </ol>
        </section>

        <div className="mx-5 border-t border-slate-200 dark:border-slate-800" />

        {/* Architecture snapshot & next */}
        <section className="px-5 py-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
            Architecture snapshot
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-[12rem_1fr]">
            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Runtime
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              App Router (Next 15), route handlers (no Server Actions), Node
              runtime for bcrypt.
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Perimeter
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              Middleware verifies JWT on every protected request, sets cache
              headers, and enforces RBAC & ACL.
            </dd>

            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              State
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              Stateless JWT (short-lived). Global rotation via{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                SESSION_VERSION
              </code>
              .
            </dd>
          </dl>

          <h2 className="mt-6 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            What’s next (DB-ready path)
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-700 dark:text-slate-300">
            <li>
              Swap the JSON repo for a Prisma/Postgres adapter, keeping the same
              interface (
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                findUserByUsername / findById / createUser / updatePassword
              </code>
              ).
            </li>
            <li>
              Keep JWT claims stable (
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                sub / username / role / v
              </code>
              ) so middleware remains unchanged.
            </li>
            <li>
              Optional: migrate ACL rules into a table; the helper API stays the
              same.
            </li>
          </ul>

          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-slate-900 bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800 active:translate-y-px dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              Start the tour →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
