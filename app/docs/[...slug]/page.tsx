// app/docs/[...slug]/page.tsx
export const dynamic = "force-dynamic";

export default async function DocFolder({
  params,
}: {
  params?: Promise<{ slug?: string[] }>;
}) {
  const p = (await params) ?? {};
  const parts = p.slug ?? [];
  const path = "/docs/" + parts.join("/");

return (
  <main className="mx-auto max-w-3xl px-4 py-16">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        {path}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        This folder is protected by middleware &amp; ACL. If you’re seeing it, you’re allowed.
      </p>
    </section>
  </main>
);

}
