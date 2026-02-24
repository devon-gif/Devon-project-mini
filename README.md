This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## Demo script (exact clicks for Michelle)

1. **Start**
   - `npm install` → `npm run dev`
   - Add `.env.local`: `DEMO_MODE=true`, `NEXT_PUBLIC_DEMO_MODE=true`, `USE_LOCAL_VIDEOS=true`
   - Place **Twill #100.csv** at project root, then: `curl -X POST http://localhost:3000/api/prospects/seed` (or run `npm run seed:demo` for demo people + videos)
   - Open [http://localhost:3000](http://localhost:3000)

2. **Login**
   - Any email + password → Sign In → lands on Mission Control

3. **Accounts (real CSV prospects)**
   - Sidebar → **Accounts**
   - Table shows company, person, title; search by company/person/title/email
   - Click a row → side panel opens; click **Email** (mailto), **LinkedIn** (new tab), **Website** (new tab)

4. **Video flow end-to-end**
   - Sidebar → **Videos** → **Create New Video**
   - Step 1: Select a **recipient** from the list (real prospects from CSV/DB)
   - Step 2: **Upload** an MP4/MOV
   - Step 3: **Generate** → wait for “Create landing page” → in the **Email Snippet** panel: **Open Gmail** (prefilled compose), **Copy link**, **Mark as Sent**
   - Open the **share link** in an **incognito** window (no login) → video plays; click **Forward to the right person** → fill name/email/note → **Send**
   - Back in CRM → **Videos** → click that video → **detail**: “Forwarded to …” section and timeline entry “Forward submitted: {name} ({email})”
   - Optional: open share link in new tab → play + CTA → events show in **Videos** → detail (views, clicks, watch %, activity timeline)

5. **Sanity**
   - Open [http://localhost:3000/ping](http://localhost:3000/ping) → JSON `{ "ok": true, "ping": "pong" }`

---

## Demo Runbook (quick path to “it works”)

### 1. Install deps

```bash
npm install
```

### 2. Seed data

```bash
# Load Twill #100.csv into DB (place CSV at project root first)
curl -X POST http://localhost:3000/api/prospects/seed
# Or after dev is running: npm run seed:demo (adds demo people + sample videos)
npm run seed:demo
```

Optional: `npm run seed:prospects` writes `public/prospects.json` for fallback when API has no data.

### 3. Env

Create `.env.local`:

- **DEMO_MODE=true**, **NEXT_PUBLIC_DEMO_MODE=true** — any email/password login
- **USE_LOCAL_VIDEOS=true** — SQLite + local uploads for videos

### 4. Run dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in → **Accounts** (real prospects) or **Videos** (create → share link → track).

**If you see "Unable to connect" in the browser:** the dev server is not running. In a terminal (Terminal.app, iTerm, or VS Code/Cursor’s terminal), from the project root run `npm run dev`, wait until you see "Ready" or "compiled", then open or refresh [http://localhost:3000](http://localhost:3000). If `npm run dev` fails with a `uv_interface_addresses` or network error, run it in a normal system terminal (not in a restricted/sandboxed environment).

### 5. Create a video

1. **Videos** → **Create New Video**
2. Select recipient → Upload MP4/MOV → **Generate**
3. Copy share link, **Mark as Sent**
4. Open share link in new tab (no login); play + CTA → events show in **Videos** → detail

### 6. Vercel

On Vercel (read-only FS), GIF generation is disabled; the app still runs and shows: “GIF generation disabled in this environment. Video is still shareable.”

### 7. Video storage: Supabase (recommended for production)

For **persistent** video hosting (past videos accessible forever), use **Supabase Storage** instead of local filesystem. Do **not** set `USE_LOCAL_VIDEOS=true` on Vercel.

#### Buckets (create in Supabase Dashboard → Storage)

| Bucket   | Purpose              | Public? | Notes |
|----------|----------------------|--------|--------|
| `videos` | MP4/MOV/WebM files   | Optional | Private + signed URLs (default), or public for simpler setup |
| `gifs`   | GIF previews         | Yes (recommended) | Used for landing previews |

#### Postgres table `videos` (reference)

Store **references** to Storage; paths are relative to the bucket:

- `video_path` — Storage path in `videos` bucket (e.g. `{user_id}/{uuid}.mp4`)
- `gif_path` — Storage path in `gifs` bucket (e.g. `{video_id}.gif`)
- `public_token` — Share URL token used in `/share/[token]`

Other columns: `owner_user_id`, `title`, `status`, `recipient_name`, `recipient_company`, `recipient_email`, `cta_type`, `cta_url`, `cta_label`, `created_at`, `sent_at`, `stats_*`, etc.

#### Env vars (set in Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for Supabase) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for Supabase) | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for Supabase) | Service role key (server-only; uploads, signed URLs) |
| `ADMIN_TOKEN` | Yes (production) | Secret token for admin APIs (invite-user, etc.). Use in header `x-admin-token`. |
| `SEED_TOKEN` | Yes (to seed) | Secret token for `POST /api/admin/seed-prospects`. Use in header `x-seed-token`. |
| `ADMIN_EMAILS` | No | Comma-separated emails that can see "Invite teammate" in Settings and call invite API. |
| `USE_LOCAL_VIDEOS` | No | Set to `true` only for **local/demo** (SQLite + `public/uploads`). Omit or `false` on Vercel. |
| `NEXT_PUBLIC_SUPABASE_VIDEOS_BUCKET_PUBLIC` | No | Set to `true` to use **public** video URLs instead of signed URLs (simpler; bucket must be public). |

#### Share page behavior

- **Local** (`USE_LOCAL_VIDEOS=true`): `/share/[token]` resolves via SQLite slug; video is served from `public/uploads/...`.
- **Supabase**: `/share/[token]` resolves by `public_token`, then serves the video via **signed URL** (private bucket) or **public URL** (if `NEXT_PUBLIC_SUPABASE_VIDEOS_BUCKET_PUBLIC=true`). No login required.

#### Local fallback

- `USE_LOCAL_VIDEOS=true` + `DEMO_MODE` = SQLite + `public/uploads` for demos. Works on your machine; **does not persist on Vercel** (read-only FS).

#### Quick check: which backend am I using?

| If you see … | You’re on … |
|--------------|-------------|
| `USE_LOCAL_VIDEOS=true` in env, or code writing to `public/uploads` | **Local** (SQLite + filesystem). Fine for demo; does not persist on Vercel. |
| `admin.storage.from("videos").upload(...)` and no `USE_LOCAL_VIDEOS` | **Supabase Storage**. Videos persist; share page uses signed or public URL. |

#### Supabase setup: schema + storage (canonical)

1. **Run the migration SQL**  
   - Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.  
   - Copy the contents of `supabase/migrations/001_create_videos.sql` and run it.  
   - This creates the `videos` and `video_events` tables (with `share_token`, `storage_video_path`, `storage_gif_path`, etc.) and indexes.

2. **Create Storage buckets**  
   - Go to **Storage** in the dashboard.  
   - Create bucket **`videos`**: private (recommended; app uses signed URLs) or public for demo.  
   - Create bucket **`gifs`**: public is fine.

3. **Public routes (no auth)**  
   Middleware already allows: `/share/*`, `/api/public/*`, `/figma-test`, `/ping`, `/login`.

4. **Confirm flow**  
   - Create video in CRM → upload file → copy share link.  
   - Open share link in incognito → video plays (signed URL) → events recorded → stats visible in `/videos/[id]`.

---

## Deploy checklist (production-ready for Vercel + Michelle)

1. **Apply migrations in Supabase**  
   - Supabase Dashboard → **SQL Editor**.  
   - Run `supabase/migrations/001_accounts_people.sql` (accounts + people).  
   - Optionally run `supabase/migrations/002_videos_events.sql` for video persistence.

2. **Set Vercel env vars**  
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key  
   - `SUPABASE_SERVICE_ROLE_KEY` — Service role key  
   - `ADMIN_TOKEN` — secret for admin APIs (e.g. invite)  
   - `SEED_TOKEN` — secret for seed endpoint  
   - `ADMIN_EMAILS` — comma-separated emails that can invite teammates (e.g. `you@company.com,michelle@company.com`)

3. **Deploy to Vercel**  
   - Push to Git; connect repo to Vercel; deploy.  
   - Check **Build** passes (`npm run build`).  
   - Visit `GET https://your-app.vercel.app/api/health` — should return `{ ok: true, env: { ... } }` when all required vars are set.

4. **Seed prospects once**  
   - Place **Twill #100.csv** in project root (or in `data/` or `public/` as `Twill_100.csv`).  
   - Then run (replace `YOUR_SEED_TOKEN` and your deployment URL):

   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/seed-prospects \
     -H "x-seed-token: YOUR_SEED_TOKEN" \
     -H "Content-Type: application/json"
   ```

   - Response: `{ ok: true, inserted: { accounts, people }, updated: { ... }, rowsProcessed }`.

5. **Invite a user (e.g. Michelle)**  
   - From server/curl (with admin token):

   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/invite-user \
     -H "x-admin-token: YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email":"michelle@example.com"}'
   ```

   - Response includes `inviteLink` (and optionally `tempPassword`). Send Michelle the invite link; she sets her password and can sign in.  
   - Or: log in as an admin (email in `ADMIN_EMAILS`), go to **Settings** → **Team** → **Invite teammate**, enter email, copy the returned link.

6. **Confirm /accounts**  
   - Log in → **Accounts**. Table should show companies from the CSV with domain, tier, status, score, and first contact; side panel shows full account and people with live website / LinkedIn / mailto links.

### Vercel env vars (exact list)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-only) |
| `ADMIN_TOKEN` | Yes | Secret for `x-admin-token` (invite-user, etc.) |
| `SEED_TOKEN` | Yes | Secret for `x-seed-token` (seed-prospects) |
| `ADMIN_EMAILS` | No | Comma-separated emails that can invite teammates |

### Files changed (mega prompt deliverables)

- **D1 (Vercel hardening):** `app/api/health/route.ts`, `middleware.ts`, `app/layout.tsx` (unchanged; already correct).
- **D2 (Supabase + seed):** `supabase/migrations/001_accounts_people.sql`, `002_videos_events.sql`, `lib/csv-parse.ts`, `app/api/admin/seed-prospects/route.ts`, `app/api/accounts/route.ts`, `app/api/accounts/[id]/route.ts`, `figma/pages/Accounts.tsx`, `figma/components/AccountSidePanel.tsx`.
- **D3 (Invite-only):** `app/api/admin/invite-user/route.ts`, `app/api/admin/am-i-admin/route.ts`, `app/api/invite-teammate/route.ts`, `figma/pages/Settings.tsx` (Invite teammate section), `app/login/LoginClient.tsx` (signup removed).
- **Build/routes:** `app/api/videos/create/route.ts` (duplicate vars removed), `app/api/videos/upload/route.ts` (duplicate `videoId` removed), `app/ping/page.tsx` removed (conflict with `app/ping/route.ts`).

---

## Acceptance checklist (A + B)

### A) Prospects from CSV

- [x] Parse **Twill #100.csv** into DB via `POST /api/prospects/seed` (or JSON fallback via `npm run seed:prospects` → `public/prospects.json`)
- [x] **/accounts** shows real rows: company, person, title, email, LinkedIn, website
- [x] **Links:** email = mailto; LinkedIn + website open in new tab (table row + side panel)
- [x] **Search** filters by person, company, title, email

### B) Video flow end-to-end

- [x] **Data:** SQLite `people` (prospects), `videos` (prospect_id, slug = share_slug), `events` (video_events)
- [x] **/videos/create** wizard: (1) Select recipient from prospects (2) Upload mp4/mov (3) Generate → share slug, GIF, DB row (4) Copy link + “Mark as Sent”
- [x] **/share/[slug]** public (no login): video player + CTA; tracks page_view, play, progress 25/50/75/100, cta_click
- [x] **/videos** list: cards with recipient, status, date, GIF preview
- [x] **/videos/[id]** detail: views, clicks, bookings (cta_click), avg watch %; activity timeline from events
- [x] **Vercel guard:** pages render; GIF generation disabled with clear message when FS read-only

---

## Getting Started (detailed)

### Accounts (100 prospects from CSV)

1. Place `Twill #100.csv` at the project root (or use mock data).
2. Run `npm run seed:prospects` then `npm run dev`.
3. Accounts page fetches `public/prospects.json`; if missing, uses mock data.

### Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
