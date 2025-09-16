# Secure Next.js Training App (TypeScript + Tailwind)

![Next.js](https://img.shields.io/badge/Next.js-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

<!-- Runtime + Tooling posture -->
![Node Support](https://img.shields.io/badge/node-%3E=18.18%20%3C23-339933?logo=node.js)
![Package Manager](https://img.shields.io/badge/package%20manager-npm%4010.x-CB3837?logo=npm)

<!-- Automation + Security hygiene -->
![Dependabot](https://img.shields.io/badge/Dependabot-enabled-025E8C?logo=dependabot)

<!-- Deploys + Repo signals -->
[![Vercel Deployments](https://img.shields.io/github/deployments/dariansweb/https://github.com/dariansweb/secure-nextjs-lesson/production?label=vercel&logo=vercel)](https://github.com/dariansweb/https://github.com/dariansweb/secure-nextjs-lesson/deployments)
![Last Commit](https://img.shields.io/github/last-commit/dariansweb/https://github.com/dariansweb/secure-nextjs-lesson)
[![License](https://img.shields.io/github/license/dariansweb/https://github.com/dariansweb/secure-nextjs-lesson)](LICENSE)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

This repo is a pragmatic Next.js 15 + React + TypeScript training ground with a bias for security and maintainability.  Expect strict types, Tailwind for velocity, and guardrails everywhere: least-privilege CI, CodeQL scanning, and curated  Dependabot updates. Each pull request gets a clean install, typecheck, and build; Vercel previews make review tactile. Contributions are welcome—small, focused PRs with clear intent. The goal: a nimble codebase with professional hygiene,  not ceremony for ceremony’s sake.

---


A production-shaped, pedagogy-first Next.js (App Router) project that teaches **secure login flows**, **JWT sessions**, **CSRF protection**, **RBAC**, and **per-directory ACLs** — all with **Tailwind** and **TypeScript**. Minimal by design, but the *edges* (cookies, middleware, redirects) are treated seriously so you can learn the right habits.

Built collaboratively by **Dude** and **GPT-5 Thinking** (your friendly “Dudeness” AI mentor). 👋

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dariansweb/secure-nextjs-lesson)


https://nextjs-security-lesson.vercel.app/

---

## Table of Contents

- [Secure Next.js Training App (TypeScript + Tailwind)](#secure-nextjs-training-app-typescript--tailwind)
  - [Table of Contents](#table-of-contents)
  - [What this app teaches](#what-this-app-teaches)
  - [Tech stack](#tech-stack)
  - [Quick start](#quick-start)
  - [Environment variables](#environment-variables)
  - [Dev vs Prod behavior](#dev-vs-prod-behavior)
  - [Routes overview](#routes-overview)
  - [Security features](#security-features)
  - [Lessons timeline](#lessons-timeline)
  - [Architecture snapshot](#architecture-snapshot)
  - [ACL config (per-directory access)](#acl-config-per-directory-access)
  - [Seeding users (dev)](#seeding-users-dev)
  - [Styling notes (Tailwind only)](#styling-notes-tailwind-only)
  - [Contributing](#contributing)
  - [License](#license)

---

## What this app teaches

* **Credential auth** with bcrypt (JSON user store in dev)
* **JWT in httpOnly cookie** (`__Host-session`) and App Router **middleware** guard
* **CSRF** with the **double-submit pattern** (`__Host-csrf` + hidden input)
* **PRG redirects**: every POST ends with **303 See Other** (no “POST /protected” ghosts)
* **RBAC**: `role` claim in JWT gates `/admin`
* **Per-directory ACL** for `/docs/*` paths (most-specific prefix wins)
* **Strict headers** + **SameSite=Lax** + **no inline styles** (Tailwind only)

---

## Tech stack

* **Next.js 15** (App Router, Route Handlers, Middleware)
* **TypeScript**
* **Tailwind CSS** (no global utility classes; all Tailwind)
* **[jose](https://github.com/panva/jose)** for JWTs
* **bcryptjs** for password hashing
* Optional: **Upstash** (or any store) if you wire rate limiting (not required to run)

---

## Quick start

```bash
# 1) Install
npm i

# 2) Create env file
cp .env.local.example .env.local
# (edit values — see section below)

# 3) Seed a user (dev only, see "Seeding users")
# Option A: npm script if present
# Option B: hand-edit data/users.json from the example below

# 4) Run
npm run dev

# Build and preview (optional)
npm run build && npm run start
```

---

## Environment variables

Create `.env.local`:

```ini
# Required
SESSION_SECRET=change-me-to-a-long-random-string
SESSION_VERSION=1
BCRYPT_ROUNDS=12

# Optional (only if you wired a remote store like Upstash for rate limiting)
# UPSTASH_REDIS_REST_URL=https://<your-upstash-url>
# UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

> **Tip:** Bump `SESSION_VERSION` to immediately invalidate all sessions.

---

## Dev vs Prod behavior

* **Development**

  * JSON store writes are **enabled**: you can “Add user” (admin) and “Change password” (account).
  * Dev-only ACL debug panel explains **why** access was denied.
* **Production**

  * JSON store writes are **disabled**: those UIs show a read-only note.
  * ACL denials return **404** (no information leak).
  * Security headers are active; cookies are `Secure`/`HttpOnly` with `SameSite=Lax`.

The header includes an environment strip, and the homepage explains the differences.

---

## Routes overview

* `GET /` – Tour guide (explains features, links everywhere)
* `GET /login` – Credential sign-in form (CSRF hidden field)
* `POST /api/login` – Authenticates, mints JWT, sets `__Host-session`, **303** → `/protected`
* `POST /api/logout` – Clears session cookie, **303** → `/api/csrf` → `/login`
* `GET /api/csrf` – Mints `__Host-csrf` token cookie and redirects to `/login`
* `GET /protected` – User page; requires valid JWT
* `GET /admin` – Admin-only (JWT `role === "admin"`)
* `GET /account` – Change password (dev only)
* `POST /api/account/change-password` – Update password (dev only)
* `GET /docs` – Docs index
* `GET /docs/[...slug]` – Any docs subpath; **ACL-controlled**
* **Middleware** gates: `/protected/*`, `/admin/*`, `/account/*`, `/docs/*`

---

## Security features

* **JWT session cookie**:

  * `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Lax`, short TTL
  * Claims: `sub`, `username`, `role`, `v` (session version)
* **CSRF**:

  * Double-submit token (`__Host-csrf` cookie + hidden form field)
  * `SameSite=Lax` mitigates most drive-by POSTs; we still enforce CSRF for defense-in-depth
  * Optional **Origin** check added to POST routes
* **PRG 303**: Every POST ends with a **303 See Other** (classic Post-Redirect-Get)
* **RBAC & ACL**:

  * RBAC: role-gated `/admin`
  * ACL: path-prefix rules for `/docs/*`, most-specific wins, admins see everything
* **Headers & caching**:

  * `Cache-Control: private, no-store` on protected responses
  * Strict security headers (CSP/HSTS/XFO/referrer/permissions) via Next config
* **Rate limiting** (login): local or store-backed; tiny random delay on failures

> This is a teaching app, not “unhackable.” It aims to model sane defaults and clean seams so you can evolve it safely.

---

## Lessons timeline

1. **Training-wheels login** → fix insecure flows, add **CSRF**, **SameSite**, rate limit, and **303 PRG**
2. **Real identity (file-based)** → JSON users, bcrypt hashes, JWT cookie (`sub/username/role/v`), middleware verification
3. **RBAC + protected routes** → `/protected` & `/admin` gates; clean logout
4. **Directory ACLs** → rule file guards `/docs/*` (most-specific wins), dev-only “why blocked?” panel
5. **Account management (dev)** → change password (with confirm), admin “add user” — dev-only writes; prod read-only notes

---

## Architecture snapshot

* **App Router**, **Route Handlers** (no Server Actions)
* **Middleware** verifies JWT, sets cache headers, enforces RBAC & ACL
* **Stateless sessions**: short-lived JWT; bump `SESSION_VERSION` to revoke globally
* **Tailwind everywhere**: no custom utility classes, no inline styles

---

## ACL config (per-directory access)

`acl.config.ts` (example):

```ts
export const ACL = [
  // Only u1 and u2 (and admins) can see /docs/project-a/*
  { pathPrefix: "/docs/project-a", allow: { userIds: ["u1", "u2"], roles: ["admin"] } },

  // Only u1 (and admins) can see /docs/finance/q4/*
  { pathPrefix: "/docs/finance/q4", allow: { userIds: ["u1"], roles: ["admin"] } },

  // Default for /docs/*
  { pathPrefix: "/docs", allow: { roles: ["admin"] } },
];
```

Notes:

* **Most-specific rule wins** (longest matching `pathPrefix`)
* You can allow by `roles`, `userIds` (JWT `sub`), and optionally `usernames`

---

## Seeding users (dev)

Create `data/users.json` (dev only) and put users like:

```json
[
  {
    "id": "u1",
    "username": "admin",
    "role": "admin",
    "passwordHash": "$2a$12$...your_bcrypt_hash..."
  },
  {
    "id": "u2",
    "username": "reader",
    "role": "user",
    "passwordHash": "$2a$12$...another_hash..."
  }
]
```

You can generate a hash in Node:

```bash
node -e "import('bcryptjs').then(b=>b.hash('SupaPassw0rd!',12).then(h=>console.log(h)))"
```

Or use the included `scripts/add-user.mjs` (if present) to add users safely.

**Production**: the filesystem is read-only on Vercel; the app will **not** write to `data/users.json` in prod and will show read-only hints in the UI.

---

## Styling notes (Tailwind only)

* All pages/components use Tailwind utility classes (no custom global classnames).
* Dark-mode variants are included (`dark:`). Set `darkMode` to `"media"` or `"class"` in `tailwind.config.js`.

---

## Contributing

Ideas, critiques, PRs — all welcome. This repo is intentionally instructional; we value feedback on:

* Security ergonomics (CSRF, PRG, middleware matcher)
* ACL rule design and dev UX
* Next steps for a DB adapter (Prisma/Postgres)
* Documentation clarity for newcomers

Open an issue with “Suggestion:” in the title so we can triage fast.

---

## License

MIT © Dude + GPT-5 Thinking

---

**Attribution**

This tutorial and code were co-created by **Dude** and **GPT-5 Thinking** (the AI assistant in this repo’s issues and commits). The assistant focused on safe defaults, clear seams, and a calm, stepwise curriculum so others can learn without being overwhelmed.
