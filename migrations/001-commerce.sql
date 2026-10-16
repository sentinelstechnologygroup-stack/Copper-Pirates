CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS customers (
 user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
 phone text NOT NULL DEFAULT '', dob text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
 id text PRIMARY KEY, slug text UNIQUE NOT NULL, data jsonb NOT NULL,
 price_cents integer NOT NULL CHECK(price_cents>=0), active boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS addresses (
 id text PRIMARY KEY,user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
 data jsonb NOT NULL,is_default boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default ON addresses(user_id) WHERE is_default;
CREATE INDEX IF NOT EXISTS addresses_owner ON addresses(user_id);
CREATE TABLE IF NOT EXISTS payment_methods (
 id text PRIMARY KEY,user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
 provider text NOT NULL,provider_reference text NOT NULL,brand text NOT NULL,last4 text NOT NULL CHECK(last4 ~ '^[0-9]{4}$'),
 is_demo boolean NOT NULL DEFAULT true,is_default boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,provider_reference)
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_one_default ON payment_methods(user_id) WHERE is_default;
CREATE TABLE IF NOT EXISTS orders (
 id text PRIMARY KEY,user_id text REFERENCES "user"(id) ON DELETE SET NULL, request_id uuid NOT NULL,request_hash text NOT NULL,
 status text NOT NULL DEFAULT 'demo_created' CHECK(status IN ('demo_created','cancelled')),
 fulfillment text NOT NULL CHECK(fulfillment IN ('pickup','shipping')),
 data jsonb NOT NULL, subtotal_cents integer NOT NULL CHECK(subtotal_cents>=0),is_demo boolean NOT NULL DEFAULT true CHECK(is_demo),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,request_id)
);
CREATE INDEX IF NOT EXISTS orders_owner ON orders(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS reviews (
 id text PRIMARY KEY,data jsonb NOT NULL,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 featured boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_public ON reviews(status,featured,created_at DESC);
CREATE TABLE IF NOT EXISTS inquiries (
 id text PRIMARY KEY,data jsonb NOT NULL,status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','resolved')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,actor_id text,action text NOT NULL,resource_id text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS rate_buckets (
 key text PRIMARY KEY, hits integer NOT NULL DEFAULT 1, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS email_outbox (
 id text PRIMARY KEY,recipient text NOT NULL,subject text NOT NULL,body text NOT NULL,
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sent')), attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now(),sent_at timestamptz
);
