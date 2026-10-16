# Standalone migration status

The exported model has been migrated to a standalone React/Vite frontend and Express/PostgreSQL backend. The hosted builder's SDK, Vite plugin, OAuth consent scaffold, token bootstrap, image transformations and remote media dependencies have been removed. The generated preview photographs and approved favicon are stored in public assets.

The backend owns verified identity, account profiles, addresses, demo payment references, products, moderated reviews, inquiries, demo orders, audit events and a transactional email outbox. Authentication uses Better Auth's maintained implementation rather than custom password/JWT code. Server routes enforce ownership/admin rights, input validation, exact-origin checks, distributed SQL rate limits, current catalog prices and transactional request idempotency. The SQL schema explicitly prevents live orders.

The site is ready for infrastructure configuration and a Vercel preview review. It is not a completed live alcohol-commerce launch. Actual payment/POS integration, shipping permissions, age verification, taxes, inventory reservations, final owner content and approved disclosures remain pending. See DEPLOYMENT.md for the exact setup and launch checks.

The migration does not copy hosted customer accounts, sessions, orders or private data. Customers must register with the new identity system. Any later migration of real customer data requires an explicit data mapping/export and verification. Hosted password hashes are not assumed transferable.

The model remains noindex. Route metadata, brand content, age gate and high-contrast navigation are preserved. Legal/compliance qualification and SEO/PPC production readiness are not inferred from a passing build.
