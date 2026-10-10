CREATE TABLE IF NOT EXISTS content (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  service_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invited_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS images (
  path TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);

COMMENT ON TABLE content IS 'Site settings, page copy, services, and gallery content.';
COMMENT ON COLUMN content.value IS 'JSONB document. Service IDs are referenced by bookings.service; image paths reference images.path.';
COMMENT ON TABLE bookings IS 'Customer appointment requests.';
COMMENT ON COLUMN bookings.service IS 'Logical reference to a service ID in content.value.services.';
COMMENT ON TABLE admins IS 'Local admin accounts with salted password hashes.';
COMMENT ON TABLE invites IS 'Pending admin invitations, matched to accounts by email during signup.';
COMMENT ON TABLE sessions IS 'Hashed sign-in tokens; admin_id references admins.id.';
COMMENT ON TABLE images IS 'Uploaded image bytes stored in Neon.';
COMMENT ON COLUMN images.path IS 'Logical image key referenced from content.value, for example img/<filename>.';