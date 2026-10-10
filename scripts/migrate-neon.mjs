import { DatabaseSync } from 'node:sqlite';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQLITE_FILE = path.join(ROOT, process.env.BRAIDY_DATA_DIR || 'data', 'braidy.sqlite');
const UPLOAD_DIR = path.join(ROOT, process.env.BRAIDY_UPLOAD_DIR || 'public/uploads');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; add it to .env.local first.');
if (!existsSync(SQLITE_FILE)) throw new Error(`Local SQLite database not found: ${SQLITE_FILE}`);

const source = new DatabaseSync(SQLITE_FILE, { readOnly: true });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 10000 });
const schema = await readFile(path.join(ROOT, 'backend', 'schema.sql'), 'utf8');
const client = await pool.connect();
const counts = { content: 0, bookings: 0, admins: 0, invites: 0, sessions: 0, images: 0 };

try {
  await client.query(schema);
  await client.query('BEGIN');

  for (const row of source.prepare('SELECT id, value, updated_at FROM content').all()) {
    const result = await client.query(
      'INSERT INTO content (id, value, updated_at) VALUES ($1, $2::jsonb, $3) ON CONFLICT (id) DO NOTHING',
      [row.id, row.value, row.updated_at],
    );
    counts.content += result.rowCount;
  }

  for (const row of source.prepare('SELECT * FROM bookings').all()) {
    const result = await client.query(`
      INSERT INTO bookings (id, name, phone, email, service, service_name, date, time, notes, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING
    `, [row.id, row.name, row.phone, row.email, row.service, row.service_name, row.date, row.time,
      row.notes, row.status, row.created_at]);
    counts.bookings += result.rowCount;
  }

  const adminIds = new Map();
  for (const row of source.prepare('SELECT * FROM admins').all()) {
    await client.query(`
      INSERT INTO admins (id, email, password_hash, password_salt, created_at)
      VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING
    `, [row.id, row.email, row.password_hash, row.password_salt, row.created_at]);
    const { rows } = await client.query('SELECT id FROM admins WHERE email = $1', [row.email]);
    if (rows[0]) adminIds.set(row.id, rows[0].id);
    const { rowCount } = await client.query('SELECT 1 FROM admins WHERE id = $1', [row.id]);
    if (rowCount) counts.admins += 1;
  }

  for (const row of source.prepare('SELECT * FROM invites').all()) {
    const result = await client.query(
      'INSERT INTO invites (id, email, invited_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      [row.id, row.email, row.invited_at],
    );
    counts.invites += result.rowCount;
  }

  for (const row of source.prepare('SELECT * FROM sessions').all()) {
    const adminId = adminIds.get(row.admin_id);
    if (!adminId) continue;
    const result = await client.query(`
      INSERT INTO sessions (token_hash, admin_id, expires_at, created_at)
      VALUES ($1, $2, $3, $4) ON CONFLICT (token_hash) DO NOTHING
    `, [row.token_hash, adminId, row.expires_at, row.created_at]);
    counts.sessions += result.rowCount;
  }

  for (const entry of await readdir(UPLOAD_DIR, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isFile() || !/^[\w.-]+\.(?:jpg|jpeg|png|webp)$/i.test(entry.name)) continue;
    const extension = path.extname(entry.name).slice(1).toLowerCase();
    const contentType = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`;
    const result = await client.query(
      'INSERT INTO images (path, content_type, data) VALUES ($1, $2, $3) ON CONFLICT (path) DO NOTHING',
      [`img/${entry.name}`, contentType, await readFile(path.join(UPLOAD_DIR, entry.name))],
    );
    counts.images += result.rowCount;
  }

  await client.query('COMMIT');
  console.log(`Migration complete. Imported rows: ${JSON.stringify(counts)}`);
  console.log('The original SQLite database and local uploads were left unchanged.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  source.close();
  await pool.end();
}