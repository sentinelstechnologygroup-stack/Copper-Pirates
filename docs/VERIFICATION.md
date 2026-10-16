# Migration verification — October 15, 2026 (America/Denver)

The shopping story runs from the React screens through the same-origin API into SQL and back to order/account screens. Local integration checks use the actual Better Auth handler and PostgreSQL protocol via PGlite, not mocked customer sessions. GitHub CI is configured to repeat API checks on PostgreSQL 17.

| Boundary | Evidence |
| --- | --- |
| Dependency removal | No Base44 package, import, endpoint or media URL in runtime source, package manifest, lockfile or public assets. |
| Static checks/build | ESLint, TypeScript checking and Vite production build pass. |
| Dependency audit | npm audit reports zero known vulnerabilities after the Tailwind 4/toolchain migration. |
| Identity and authorization | Eleven integration tests pass, covering verified registration, logout, password reset, email change, session revocation, role protection, deletion, ownership, admin actions and public rate limiting. |
| Commerce | Orders use database prices and snapshots; concurrent duplicate requests resolve to one order; unavailable products and another customer's records are rejected. All orders are enforced as demo records. |
| Browser → API → SQL → UI | Chromium flow passes: registration, email activation, profile edit, saved address, persistent demo payment method, cart, checkout, SQL order assertion, cancellation, logout and protected-route redirect. |
| Desktop/mobile | Desktop home and 390-pixel mobile navigation rendered and inspected. Mobile has no horizontal document overflow. Cart supports focus containment, Escape and focus restoration. |

No live Vercel database, email sender, Blob store, payment/POS or shipping account has been configured by these local checks. Those integrations need the deployment environment and the acceptance checks in DEPLOYMENT.md. Real alcohol sales remain disabled. The model is noindex and still contains highlighted owner-content placeholders.
