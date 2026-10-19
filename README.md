# Copper Pirates

## Current relaunch mode

The public site now promotes the flagship rum and distributor inquiries. Shopping code, customer accounts, sample inventory and order history are preserved, with public shopping routes, signup, checkout and order creation disabled by default. Both VITE_COMMERCE_ENABLED and COMMERCE_ENABLED must be independently enabled for a future commerce phase. No public pricing or sample eight-bottle lineup is presented. Staff access remains at /admin.

The proposed label proof is credited to Treeline Creative. Product specifications and producer attribution remain unconfirmed. Trade inquiries collect company, territory, interest and contact consent, with staff statuses and follow-up notes. Apply migration 002 before using the new follow-up statuses.

Standalone Copper Pirates Distillery storefront and backend. Vite + React, Express, Better Auth, PostgreSQL, optional Vercel Blob uploads and Resend email. No Base44 SDK, build plugin, API, hosted media, or runtime is required.

The current site is a review model: eight sample spirits, supplied cocktail ingredient lists, copper script logo and CP monogram favicon, and highlighted owner-information placeholders. Every order is explicitly a **demo**. This backend cannot charge a card or authorize alcohol fulfillment.

## Run locally

Requires Node 24 and PostgreSQL 16 or later.

```sh
npm ci
cp .env.example .env
# Fill DATABASE_URL and a random BETTER_AUTH_SECRET in .env.
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` to the local server on 127.0.0.1:3001. Use this same exact origin in BETTER_AUTH_URL. Migrations are an explicit deployment step, never part of a build or public HTTP request. Seeds insert sample products only and preserve existing products.

For a self-contained development database, run `npm run db:dev` in another terminal; it listens on 127.0.0.1:5433 and persists in `.dev-db`. Set DATABASE_URL to `postgresql://postgres:postgres@127.0.0.1:5433/postgres`. This development database has no network authentication: keep it loopback-only, never deploy it.

## What works

- Verified email registration, login, password recovery/reset, logout, password changes, verified email changes, session listing/revocation, account deletion and demo-order anonymization.
- Editable customer profiles, saved shipping/billing addresses, persistent demo payment methods with default/removal controls. No card numbers or CVVs are collected or stored.
- Server-priced demo checkout, owner-protected order history/details, cancellation, transactional idempotency and immutable item snapshots.
- Admin catalog editing/archiving, authenticated image uploads, review moderation/manual entry, inquiry inbox, demo order management and audit history.
- Persistent shared rate limits, same-origin mutation checks, validation, secure session cookies on HTTPS, no-store private responses, versioned database migrations.

Email verification and resets use a persistent mail outbox. Configure RESEND_API_KEY and EMAIL_FROM to deliver email. Without delivery configured, the developer can inspect queued links using the **local-only** `npm run mail:dev` command. Never expose that command or its output in public logs or an HTTP endpoint. Admin roles cannot be granted from signup or a browser request:

```sh
npm run admin:grant -- owner@example.com
```

The owner must first register and verify that account. The grant revokes existing sessions; sign in again.

## Validate

```sh
npm run check
npm audit
npx playwright install chromium
npm run test:browser
```

API integration tests use real Better Auth handlers, cookies and SQL through an isolated PGlite PostgreSQL engine. CI repeats them against PostgreSQL 17 via TEST_DATABASE_URL. No mock authentication is used. Tests cover verification/logout/reset/deletion, account isolation, role escalation, admin mutation, pricing, duplicate requests, availability, moderation, inquiries, and origin rejection.

See [deployment instructions](docs/DEPLOYMENT.md) and [migration status](docs/HARDENING-AND-MIGRATION.md). Vercel serves the static frontend and `api/index.mjs` function. The server also runs on any Node host with PostgreSQL.

## Brand artwork

The October 19, 2026 owner-supplied Copper Pirates script reference was refined into the transparent `public/images/copper-pirates-logo-master.png` and optimized web export `copper-pirates-logo.png`. The shared BrandMark displays it in the header, footer and age confirmation. The matching CP monogram has a master in `public/images/copper-pirates-monogram-master.png`, PNG favicon sizes 16/32/48/192/512, a multi-size ICO and 180px Apple touch icon. Browser links use the cp3 revision to refresh prior icons.
