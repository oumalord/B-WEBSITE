# BRAIDY SALON

React, TypeScript, Vite, Tailwind CSS, and a local Node.js API backed by Neon PostgreSQL.

## Run locally

Use Node.js 24 or newer, then run:

```sh
npm install
npm run dev
```

Set `DATABASE_URL` in `.env.local` to your Neon connection string before starting the app. `.env.local` is ignored by Git. The development command starts the website and API; the API listens on `127.0.0.1:3001`, and Vite proxies `/api` requests to it.

To copy existing local SQLite records, admin accounts, sessions, and uploaded photos into Neon, run `npm run migrate:neon` once. The importer is safe to rerun and does not delete the source SQLite database or local uploads.

For a production-style local run:

```sh
npm run build
npm start
```

The built website and API are served together on `http://127.0.0.1:3001`.

## Local data

The local SQLite database at `data/braidy.sqlite` and uploads in `public/uploads/` remain as a backup after migration. New site content, bookings, admin accounts, sessions, invitations, and uploaded photos are stored in Neon. Set `BRAIDY_API_PORT` to change the API port.

Open `/#/admin` and create the first admin account with an email address and a password of at least 10 characters. Additional admins can be invited by email from the Admins tab; invitations are stored locally and do not send email. An invited person creates an account using the invited email address.

## Content defaults

- `src/data/site.ts`: business details, contact information, hours, and currency
- `src/data/content.ts`: services, gallery, FAQs, and testimonials
- `src/data/copy.ts`: page wording
- `src/pages/`: site pages and admin UI
- `backend/neon.mjs`: Neon API, authentication, and uploads
- `backend/schema.sql`: PostgreSQL schema
- `scripts/migrate-neon.mjs`: repeatable SQLite-to-Neon import

Built-in content is used until changes are saved from the admin area.
