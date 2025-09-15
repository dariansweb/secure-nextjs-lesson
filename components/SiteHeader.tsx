"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type NavItem = { label: string; href: string; exact?: boolean };

const NAV: NavItem[] = [
  { label: "Explore", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Protected", href: "/protected" },
  { label: "Admin", href: "/admin" },
  { label: "Docs", href: "/docs" },
  { label: "Account", href: "/account" },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const linkBase =
    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition";
  const linkIdle =
    "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";
  const linkActive =
    "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900";

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
          >
            Secure Next.js Training
          </Link>
          <span className="ml-2 hidden rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:inline-flex">
            {process.env.NODE_ENV ?? "development"}
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                linkBase,
                isActive(item) ? linkActive : linkIdle,
                "border border-transparent hover:border-slate-200 dark:hover:border-slate-700",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-2 text-slate-800 hover:bg-slate-100 active:translate-y-px dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:hidden"
          aria-expanded={open ? "true" : "false"}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Dev/Prod strip */}
      <div
        className={[
          "border-t px-4 py-2 text-xs md:px-0",
          process.env.NODE_ENV === "production"
            ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
        ].join(" ")}
      >
        <div className="mx-auto max-w-5xl">
          <p>
            <strong className="font-semibold">
              {process.env.NODE_ENV === "production"
                ? "Production"
                : "Development"}
              :
            </strong>{" "}
            Sign in first; admins see everything. Users are gated by ACL rules
            under{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              /docs/*
            </code>
            .
          </p>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`${
          open ? "block" : "hidden"
        } border-t border-slate-200 dark:border-slate-800 md:hidden`}
      >
        <nav className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-lg border px-3 py-2 text-sm font-semibold",
                  isActive(item)
                    ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Sign in first; admins see everything. Users are gated by ACL rules
            under{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              /docs/*
            </code>
            .
          </p>
        </nav>
      </div>
    </header>
  );
}
