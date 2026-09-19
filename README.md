# Pinly — Pinterest-style media feed (Next.js + TypeScript)

A working Pinterest-style app: real login/signup, image upload, an admin
panel, a masonry feed with infinite scroll, likes/saves/comments, follow,
notifications, and profile pages — all backed by a small JSON-file database
so it runs with zero external services.

## Stack

- **Next.js 14** (App Router) + **TypeScript**, using **Route Handlers** as
  the backend API (`app/api/**`)
- **Tailwind CSS** + shadcn/ui-style primitives (Button, Avatar, Dialog, Tabs)
  on Radix
- **react-masonry-css** for the grid, **Framer Motion** for animation,
  **Lucide** for icons
- **bcryptjs** + **jsonwebtoken** for auth (password hashing + session cookie)
- A **JSON file** (`data/db.json`) as the database — see the note below

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then edit JWT_SECRET
npm run dev
```

Open http://localhost:3000. The database seeds itself on first run
(`data/db.json` is created automatically) with 5 demo users and 24 pins.

### Demo login

| Username      | Password      | Role  |
|---------------|---------------|-------|
| `halmat`      | `halmat1122!!@@` | admin |
| `kenjidesigns`| `password123` | user  |
| `astervale`   | `password123` | user  |

Or just sign up for a new account from `/signup` — the **first** account
ever created also becomes an admin automatically.

## What's implemented

- **Auth** (`/login`, `/signup`) — real signup/login/logout, JWT in an
  httpOnly cookie, password hashing with bcrypt
- **Image & video upload** — the navbar `+` button opens `/create`; pick one
  file for a single pin, or **multiple files to create an album** (all
  pins share the title/description/tags and are linked via `albumId`);
  images and short video clips (mp4/webm/mov) are both supported
- **Admin panel** (`/admin`, admins only — see the profile menu) —
  - **Reports tab**: every report goes straight here (not just a
    notification) with the reported pin, reporter, and reason; dismiss it
    or delete the pin
  - **Users tab**: promote/demote admins, delete accounts
  - **Pins tab**: delete any pin site-wide
  - Deleting someone else's pin as an admin opens a dialog with an
    **optional note field** — if filled in, the pin's author gets a
    notification with that note
- **Home** (`/`) and **Explore** (`/explore`) — real pins from `/api/pins`,
  category filters, text search, infinite scroll
- **Pin card / pin modal "more" menu** — see more like this, see less
  (hides it from your current feed), save, share (native share sheet with
  clipboard fallback), **copy link**, **real file download** (fetches the
  actual file and saves it — not just a link open), report, and delete
  (author/admin)
- **Report a pin** — the exact category list from Pinterest's own report
  flow (spam, nudity/sexual content, self-harm, misinformation, hateful
  activity, dangerous goods, harassment, graphic violence, privacy
  violation, non-consensual imagery); submitting sends it straight to the
  admin Reports tab
- **Notifications** — likes, saves, comments, follows, and moderation
  notices ("an admin removed your pin: <note>") all show up in the bell
  dropdown; opening it marks them read
- **Profile** (`/profile/[username]`) — real follower/following counts, a
  working Follow/Unfollow button, tabs for the user's pins and boards
- **Settings** (`/settings`) — edit your name, bio, and avatar (with upload)
- **Pin detail** (`/pin/[id]`) — like, save, comment, the same "more" menu,
  an album strip if the pin belongs to one, and a "more like this" row

## Project structure

```
app/
  api/                      All backend routes (see below)
  login/, signup/            Auth pages
  create/                    Upload + create-pin/album page (navbar "+")
  settings/                   Edit-profile page
  admin/                       Admin dashboard (Reports / Users / Pins)
  page.tsx                    Home feed
  explore/page.tsx            Explore/search
  pin/[id]/                   Pin detail + related/album pins + actions
  profile/[username]/         Profile page
  providers.tsx                Wraps the app in AuthProvider
  layout.tsx, globals.css      Root layout + all theme tokens

components/
  navbar.tsx, notifications-menu.tsx, masonry-grid.tsx,
  pin-card.tsx, pin-modal.tsx, pin-options-menu.tsx (the "more" dropdown),
  report-dialog.tsx, delete-pin-dialog.tsx, ui/ (button, avatar, dialog, tabs)

lib/
  db.ts, db-types.ts    JSON-file database, seed data, all queries/mutations
  auth.ts               JWT session helpers, getCurrentUser()
  auth-context.tsx      Client React context around /api/auth/me
  download-image.ts     Real fetch+blob file download helper
  types.ts              Frontend-facing Pin/Comment/Author shapes
```

### API routes

```
POST   /api/auth/signup            /api/auth/login          /api/auth/logout
GET    /api/auth/me

GET    /api/pins?category=&q=&page=       POST /api/pins
POST   /api/pins/album                    (create an album from multiple files)
GET    /api/pins/:id                      DELETE /api/pins/:id   (body: { note? })
POST   /api/pins/:id/like                 POST /api/pins/:id/save
POST   /api/pins/:id/comment              POST /api/pins/:id/report

POST   /api/upload                 (multipart file → { url })

GET    /api/users/:username        PATCH /api/users/me
POST   /api/users/:username/follow

GET    /api/notifications          PATCH /api/notifications   (mark all read)

GET    /api/admin/overview                                    (admin only)
GET    /api/admin/reports          PATCH /api/admin/reports/:id (dismiss)
PATCH  /api/admin/users/:id  DELETE /api/admin/users/:id       (admin only)
DELETE /api/admin/pins/:id         (body: { note? })            (admin only)
```

## ⚠️ About the database — read before deploying

`data/db.json` is a **flat file on disk**, not a real database. It's there
so the whole app works instantly with `npm install && npm run dev` — no
Postgres, no Docker, no signup for a hosted DB. It is genuinely fine for:

- local development and demos
- a single long-running Node process (`npm run build && npm start` on a VPS)

It will **not** work if you deploy to a serverless platform (Vercel,
Netlify, etc.) — their filesystems are read-only/ephemeral per request, so
writes will silently disappear or throw. The same caveat applies to
`public/uploads` for uploaded images.

To go to production, replace the functions in `lib/db.ts` (and the upload
logic in `app/api/upload/route.ts`) with calls to a real database (Postgres
+ Prisma, SQLite, Supabase, MongoDB, …) and real object storage (S3,
Cloudinary, Supabase Storage, …). Every function in `lib/db.ts` has a single
clear responsibility (`findUserByUsername`, `createPin`, `toggleLike`, …) —
keep the same signatures and nothing else in the app has to change.

## Theming

Every color, radius, and font is a CSS variable in `app/globals.css` — see
the comments there for how to rebrand the whole app in one place. The
masonry column breakpoints live at the top of `components/masonry-grid.tsx`.
