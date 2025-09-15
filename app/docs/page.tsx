import Link from "next/link";
export const dynamic = "force-dynamic"; // avoid caching behind auth

export default function DocsHome() {
return (
  <main className="mx-auto max-w-3xl px-4 py-16">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        Docs
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Pick a folder:</p>

      <ul className="mt-4 list-disc space-y-2 pl-5">
        <li>
          <Link
            href="/docs/project-a"
            className="text-slate-800 underline underline-offset-2 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
          >
            Project A
          </Link>
        </li>
        <li>
          <Link
            href="/docs/finance/q4"
            className="text-slate-800 underline underline-offset-2 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
          >
            Finance / Q4
          </Link>
        </li>
      </ul>
    </section>
  </main>
);

}
