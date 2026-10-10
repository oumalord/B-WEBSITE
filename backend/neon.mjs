import { createServer } from 'node:http';
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT, 'dist');
const MAX_BODY = 7 * 1024 * 1024;
const STATUSES = ['new', 'confirmed', 'declined', 'done'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMG = /^img\/[\w.-]+$/;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Set it in .env.local or your environment.');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10000 });
pool.on('error', (error) => console.error('Neon database connection error:', error.message));

const SCHEMA = await readFile(path.join(ROOT, 'backend', 'schema.sql'), 'utf8');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const normalizeEmail = (value) => clean(value, 120).toLowerCase();
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const passwordRecord = (password) => {
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
};

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

async function readJson(request) {
  if (request.body !== undefined) {
    if (typeof request.body === 'string' || Buffer.isBuffer(request.body)) {
      try {
        return JSON.parse(request.body.toString());
      } catch {
        throw new HttpError(400, 'Invalid JSON body');
      }
    }
    return request.body ?? {};
  }
  const chunks = [];
  let size = 0;
  await new Promise((resolve, reject) => {
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, 'Request body is too large'));
        request.resume();
      } else chunks.push(chunk);
    });
    request.on('end', resolve);
    request.on('error', reject);
  });
  if (!size) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

async function currentAdmin(request) {
  const token = request.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const tokenHash = hashToken(token);
  const { rows } = await pool.query(`
    SELECT admins.id, admins.email, sessions.expires_at
    FROM sessions JOIN admins ON admins.id = sessions.admin_id
    WHERE sessions.token_hash = $1
  `, [tokenHash]);
  const session = rows[0];
  if (!session) return null;
  if (Number(session.expires_at) <= Date.now()) {
    await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
    return null;
  }
  return session;
}

async function requireAdmin(request) {
  const admin = await currentAdmin(request);
  if (!admin) throw new HttpError(401, 'Sign in as an admin to continue');
  return admin;
}

async function createSession(adminId) {
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  await pool.query(
    'INSERT INTO sessions (token_hash, admin_id, expires_at, created_at) VALUES ($1, $2, $3, $4)',
    [hashToken(token), adminId, now + 30 * 24 * 60 * 60 * 1000, new Date(now).toISOString()],
  );
  return token;
}

function collectImagePaths(value, paths = new Set()) {
  if (typeof value === 'string' && IMG.test(value)) paths.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectImagePaths(item, paths));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectImagePaths(item, paths));
  return paths;
}

async function imageUrls(value) {
  const paths = [...collectImagePaths(value)];
  if (!paths.length) return {};
  const { rows } = await pool.query('SELECT path FROM images WHERE path = ANY($1::text[])', [paths]);
  return Object.fromEntries(rows.map(({ path: imagePath }) => [
    imagePath,
    `/api/images/${encodeURIComponent(imagePath.slice(4))}`,
  ]));
}

function resolveImages(value, urls) {
  if (typeof value === 'string') return urls[value] ?? value;
  if (Array.isArray(value)) return value.map((item) => resolveImages(item, urls));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveImages(item, urls)]));
  }
  return value;
}

function sendImage(response, image) {
  response.writeHead(200, {
    'Content-Type': image.content_type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(image.data);
}

export async function handleApi(request, response, url) {
  const method = request.method ?? 'GET';
  const pathname = url.pathname;
  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readJson(request) : {};

  if (method === 'GET' && pathname === '/api/_healthcheck') {
    await pool.query('SELECT 1');
    sendJson(response, 200, { message: 'Success', database: 'neon' });
    return;
  }

  const imageRoute = pathname.match(/^\/api\/images\/([\w.-]+)$/);
  if (method === 'GET' && imageRoute) {
    const { rows } = await pool.query('SELECT content_type, data FROM images WHERE path = $1', [`img/${imageRoute[1]}`]);
    if (!rows[0]) throw new HttpError(404, 'Image not found');
    sendImage(response, rows[0]);
    return;
  }

  if (method === 'GET' && pathname === '/api/content') {
    const { rows } = await pool.query('SELECT value FROM content WHERE id = 1');
    const content = rows[0]?.value ?? null;
    const urls = await imageUrls(content);
    sendJson(response, 200, { content: content ? resolveImages(content, urls) : null });
    return;
  }

  if (method === 'POST' && pathname === '/api/bookings') {
    if (clean(body.website, 200)) {
      sendJson(response, 200, { ok: true });
      return;
    }
    const booking = {
      name: clean(body.name, 100), phone: clean(body.phone, 30), email: clean(body.email, 120),
      service: clean(body.service, 60), serviceName: clean(body.serviceName, 100),
      date: clean(body.date, 10), time: clean(body.time, 5), notes: clean(body.notes, 1000),
    };
    if (booking.name.length < 2) throw new HttpError(400, 'Name is required');
    if (booking.phone.replace(/\D/g, '').length < 7 || !/^[+()\d\s-]+$/.test(booking.phone)) {
      throw new HttpError(400, 'A valid phone number is required');
    }
    if (booking.email && !EMAIL.test(booking.email)) throw new HttpError(400, 'Email is not valid');
    if (!booking.service || !/^\d{4}-\d{2}-\d{2}$/.test(booking.date) || !/^\d{2}:\d{2}$/.test(booking.time)) {
      throw new HttpError(400, 'Service, date and time are required');
    }
    const id = randomUUID();
    await pool.query(`
      INSERT INTO bookings (id, name, phone, email, service, service_name, date, time, notes, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', $10)
    `, [id, booking.name, booking.phone, booking.email, booking.service, booking.serviceName,
      booking.date, booking.time, booking.notes, new Date().toISOString()]);
    sendJson(response, 201, { id });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/status') {
    const admin = await currentAdmin(request);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admins');
    sendJson(response, 200, { signedIn: !!admin, isAdmin: !!admin, claimable: rows[0].count === 0 });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/signin') {
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const { rows } = await pool.query('SELECT id, password_hash, password_salt FROM admins WHERE email = $1', [email]);
    const admin = rows[0];
    if (!admin || !password) throw new HttpError(401, 'Email or password is incorrect');
    const expected = Buffer.from(admin.password_hash, 'hex');
    const actual = scryptSync(password, admin.password_salt, 64);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new HttpError(401, 'Email or password is incorrect');
    }
    sendJson(response, 200, { token: await createSession(admin.id), email });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/setup') {
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address');
    if (password.length < 10) throw new HttpError(400, 'Use a password with at least 10 characters');

    const { salt, hash } = passwordRecord(password);
    const adminId = randomUUID();
    const now = new Date().toISOString();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1)', [72041921]);
      const { rows: adminRows } = await client.query('SELECT COUNT(*)::int AS count FROM admins');
      const { rows: inviteRows } = await client.query('SELECT id FROM invites WHERE email = $1', [email]);
      if (adminRows[0].count > 0 && !inviteRows[0]) {
        throw new HttpError(403, 'First-admin setup is complete; this email needs an invitation');
      }
      await client.query(
        'INSERT INTO admins (id, email, password_hash, password_salt, created_at) VALUES ($1, $2, $3, $4, $5)',
        [adminId, email, hash, salt, now],
      );
      if (inviteRows[0]) await client.query('DELETE FROM invites WHERE id = $1', [inviteRows[0].id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') throw new HttpError(409, 'An admin already uses that email');
      throw error;
    } finally {
      client.release();
    }
    sendJson(response, 201, { token: await createSession(adminId), email });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/signout') {
    const token = request.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
    sendJson(response, 200, { ok: true });
    return;
  }

  const admin = await requireAdmin(request);

  if (method === 'GET' && pathname === '/api/admin/content') {
    const { rows } = await pool.query('SELECT value FROM content WHERE id = 1');
    const content = rows[0]?.value ?? null;
    sendJson(response, 200, { content, urls: await imageUrls(content) });
    return;
  }

  if (method === 'PUT' && pathname === '/api/admin/content') {
    if (!body.content || typeof body.content !== 'object' || Array.isArray(body.content)) {
      throw new HttpError(400, 'Invalid content');
    }
    const serialized = JSON.stringify(body.content);
    if (serialized.length > 240000) throw new HttpError(413, 'Content is too large');
    await pool.query(`
      INSERT INTO content (id, value, updated_at) VALUES (1, $1::jsonb, $2)
      ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `, [serialized, new Date().toISOString()]);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/upload') {
    if (typeof body.data !== 'string' || body.data.length < 100) throw new HttpError(400, 'No image received');
    if (body.data.length > 5500000) throw new HttpError(413, 'Image is too large');
    const contentType = clean(body.contentType, 50);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
      throw new HttpError(400, 'Unsupported image type');
    }
    const filename = `${randomUUID()}.${contentType === 'image/jpeg' ? 'jpg' : contentType.slice(6)}`;
    const imagePath = `img/${filename}`;
    await pool.query('INSERT INTO images (path, content_type, data) VALUES ($1, $2, $3)', [
      imagePath, contentType, Buffer.from(body.data, 'base64'),
    ]);
    sendJson(response, 200, { path: imagePath, url: `/api/images/${encodeURIComponent(filename)}` });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/bookings') {
    const { rows } = await pool.query(`
      SELECT id, name, phone, email, service, service_name AS "serviceName", date, time, notes,
        status, created_at AS "createdAt"
      FROM bookings ORDER BY created_at DESC LIMIT 200
    `);
    sendJson(response, 200, { bookings: rows });
    return;
  }

  const bookingRoute = pathname.match(/^\/api\/admin\/bookings\/([^/]+)$/);
  if (bookingRoute && method === 'PUT') {
    const status = clean(body.status, 20);
    if (!STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
    const result = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, decodeURIComponent(bookingRoute[1])]);
    if (!result.rowCount) throw new HttpError(404, 'Booking not found');
    sendJson(response, 200, { ok: true });
    return;
  }
  if (bookingRoute && method === 'DELETE') {
    await pool.query('DELETE FROM bookings WHERE id = $1', [decodeURIComponent(bookingRoute[1])]);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/admins') {
    const { rows: admins } = await pool.query('SELECT id, email FROM admins ORDER BY created_at');
    const { rows: invites } = await pool.query('SELECT id, email FROM invites ORDER BY invited_at');
    sendJson(response, 200, {
      admins: admins.map((item) => ({ ...item, isYou: item.id === admin.id })), invites,
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/invites') {
    const email = normalizeEmail(body.email);
    if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address');
    const { rows: existing } = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existing[0]) throw new HttpError(409, 'That person is already an admin');
    await pool.query(
      'INSERT INTO invites (id, email, invited_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      [randomUUID(), email, new Date().toISOString()],
    );
    sendJson(response, 201, { ok: true });
    return;
  }

  const inviteRoute = pathname.match(/^\/api\/admin\/invites\/([^/]+)$/);
  if (inviteRoute && method === 'DELETE') {
    await pool.query('DELETE FROM invites WHERE id = $1', [decodeURIComponent(inviteRoute[1])]);
    sendJson(response, 200, { ok: true });
    return;
  }

  const adminRoute = pathname.match(/^\/api\/admin\/admins\/([^/]+)$/);
  if (adminRoute && method === 'DELETE') {
    const id = decodeURIComponent(adminRoute[1]);
    if (id === admin.id) throw new HttpError(400, 'You cannot remove yourself');
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admins');
    if (rows[0].count < 2) throw new HttpError(400, 'At least one admin is required');
    await pool.query('DELETE FROM admins WHERE id = $1', [id]);
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { message: 'API route not found' });
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
};

async function serveFile(response, filePath) {
  const content = await readFile(filePath);
  response.writeHead(200, {
    'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(content);
}

async function handleStatic(response, pathname) {
  const requested = decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = path.resolve(DIST_DIR, requested || 'index.html');
  if (!filePath.startsWith(`${DIST_DIR}${path.sep}`) || !existsSync(filePath)) {
    if (existsSync(path.join(DIST_DIR, 'index.html'))) {
      await serveFile(response, path.join(DIST_DIR, 'index.html'));
      return;
    }
    sendJson(response, 404, { message: 'File not found. Run npm run build first.' });
    return;
  }
  await serveFile(response, filePath);
}

const port = Number(process.env.BRAIDY_API_PORT || 3001);
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    if (url.pathname.startsWith('/api/')) await handleApi(request, response, url);
    else await handleStatic(response, url.pathname);
  } catch (error) {
    if (!response.headersSent) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error(error);
      sendJson(response, status, { message: error instanceof Error ? error.message : 'Unexpected server error' });
    } else response.destroy();
  }
});

let schemaPromise;
export function ensureSchema() {
  schemaPromise ??= pool.query(SCHEMA);
  return schemaPromise;
}

async function start() {
  await ensureSchema();
  server.listen(port, '127.0.0.1', () => console.log(`Neon API ready at http://127.0.0.1:${port}`));
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  start().catch(async (error) => {
    console.error('Could not connect to Neon. Check DATABASE_URL and Neon network access.');
    console.error(error.message);
    await pool.end();
    process.exitCode = 1;
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  }
}