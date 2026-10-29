# Symphony Urban Living — website & reservations

The marketing website and table-booking system for **Symphony Urban Living**, a standalone restaurant at Str. Moților nr. 16, Sector 3, București, operated by Symphony Urban Living SRL.

- **Public website**: Home, Menu, Gallery, Story & Chef, Private Events, Contact (with a live "Open now" badge), Reserve a Table, Privacy Policy and Cookie Notice.
- **Real reservations**: guests pick a date, time and party size. The site checks live availability, saves the booking, emails the guest, and emails everyone on your notification list.
- **Dashboard at `/admin`**: today's bookings for use during service, a calendar, search, confirm, reschedule, cancel and phone bookings. Owners and admins can also edit the menu, prices, opening hours and capacity, with no code.

> Everything written for this guide assumes **no programming experience**. If you get stuck, see [Troubleshooting](#troubleshooting).

---

## Contents

1. [Before going live — checklist](#1-before-going-live--checklist)
2. [Try it on your computer](#2-try-it-on-your-computer)
3. [Deploying to Netlify](#3-deploying-to-netlify)
4. [Email setup](#4-email-setup)
5. [Everyday changes: menu, prices, hours](#5-everyday-changes-menu-prices-hours)
6. [Change the name, texts, logo and photos](#6-change-the-name-texts-logo-and-photos)
7. [Staff logins](#7-staff-logins)
8. [How bookings work](#8-how-bookings-work)
9. [Environment variables reference](#9-environment-variables-reference)
10. [For developers](#10-for-developers)
11. [Troubleshooting](#troubleshooting)

---

## 1. Before going live — checklist

- [ ] Replace the **owner** and **staff** demo logins with real emails and strong passwords (see [section 7](#7-staff-logins)). The admin login uses `andreescuandrei190@gmail.com` and is ready to test right away. **Change its password too.**
- [ ] Set the real **address, phone, email and company details** in `content/site-content.ts` (search for `TODO`).
- [ ] Replace the **placeholder photos** in `public/images/` (every one says "PLACEHOLDER PHOTO").
- [ ] Replace the sample **testimonials** with real guest reviews. EU consumer law does not allow invented reviews.
- [ ] Check the **menu and prices** in `/admin → Menu & prices`.
- [ ] Check **opening hours and capacity** in `/admin → Settings`.
- [ ] Set up **email** ([section 4](#4-email-setup)) and press **Send test email** in Settings.
- [ ] Have the **Privacy Policy** reviewed by a lawyer (`app/(site)/privacy/page.tsx`).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your real domain.

---

## 2. Try it on your computer

You need **Node.js 20 or newer**. Download the "LTS" version from <https://nodejs.org> and install it.

Open the **Terminal** app (Mac) or **PowerShell** (Windows) inside this project folder and run these commands one at a time:

```bash
npm install                 # downloads the building blocks (once)
cp .env.example .env        # creates your private settings file (Windows: copy .env.example .env)
npm run setup               # creates the local database, logins, menu and default hours
npm run dev                 # starts the website
```

Open <http://localhost:3000> in your browser. The dashboard is at <http://localhost:3000/admin>.

**Demo logins** (created by `npm run setup` from the values in `.env`):

| Role  | Email                            | Password           | Can do |
|-------|----------------------------------|--------------------|--------|
| Admin | `andreescuandrei190@gmail.com`   | `Symphony-Admin-2026!` | Everything, including team logins |
| Owner | `owner@symphony-urban-living.example`     | `Symphony-Owner-2026!` | Bookings, menu & prices, settings |
| Staff | `host@symphony-urban-living.example`      | `Symphony-Staff-2026!` | Bookings only (host / floor manager) |

Until email is configured, emails are **printed in the Terminal window** instead of being sent. This lets you test bookings safely.

To stop the website, press `Ctrl + C` in the Terminal.

---

## 3. Deploying to Netlify

It takes about 20 minutes, and the free tiers are enough to start. You need three free accounts: **GitHub** (stores the code), **Neon** (stores the bookings) and **Netlify** (runs the website).

### Step 1 — Create the database (Neon)
On your computer the bookings live in a small file. That doesn't work online: Netlify throws its files away between visits, so every booking would disappear. The live site therefore uses a free hosted Postgres database.

1. Sign up at <https://neon.tech> and create a project. Choose the region **Europe (Frankfurt)**.
2. On the project dashboard click **Connect**, make sure **Connection pooling** is **off**, and copy the connection string. It starts with `postgresql://` and ends with `sslmode=require`. Keep it somewhere safe; it is a password.

*(Supabase also works. Use its "Session pooler" connection string.)*

If you forget this step, the Netlify build stops with the message *"This deploy needs a hosted Postgres database"* instead of putting a broken site online.

### Step 2 — Collect your settings
You will paste these into Netlify in the next step (see the [full list](#9-environment-variables-reference)):

| Name | Value |
|------|-------|
| `DATABASE_URL` | the Neon connection string from step 1 |
| `SESSION_SECRET` | a long random text, e.g. from <https://1password.com/password-generator> with 48+ characters. **Don't reuse the one from your `.env`.** |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.ro`, or the `https://<site-name>.netlify.app` address Netlify gives you at first |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | the admin login |
| `OWNER_EMAIL` / `OWNER_PASSWORD` | the owner's real email and a strong password |
| `STAFF_EMAIL` / `STAFF_PASSWORD` | the host's real email and a strong password |
| `NOTIFY_EMAILS` | who gets new-booking emails, comma separated |
| `EMAIL_FROM`, `EMAIL_REPLY_TO`, `RESEND_API_KEY` | see [Email setup](#4-email-setup) |

Everything else (build command, Node.js version, the Netlify Next.js plugin) is already set in `netlify.toml`, so you don't need to touch **Build settings** in Netlify.

### Step 3, option A — Deploy from GitHub (recommended)
With this option every change you push to GitHub goes live automatically.

1. Create a free account at <https://github.com>, create a new **private** repository called `symphony-urban-living` and upload this folder. GitHub Desktop (<https://desktop.github.com>) makes this point-and-click. The `.env` file is ignored automatically, so your passwords are **not** uploaded.
2. Sign up at <https://app.netlify.com> with your GitHub account.
3. Click **Add new project → Import an existing project → GitHub** and pick `symphony-urban-living`. (If you don't see it, click **Configure the Netlify app on GitHub** and give Netlify access to that repository.)
4. Leave the build settings as they are. Netlify reads them from `netlify.toml`.
5. Click **Add environment variables** (or, after creating the project, go to **Project configuration → Environment variables**) and add every setting from step 2.
6. Click **Deploy**. The first deploy takes 2–4 minutes. When it says **Published**, open the `*.netlify.app` link.

### Step 3, option B — Deploy from your computer (Netlify CLI)
Use this if you don't want to use GitHub. Run these in the Terminal, inside the project folder:

```bash
npm install -g netlify-cli      # installs the Netlify command (once)
netlify login                   # opens the browser so you can sign in
netlify init                    # choose "Create & configure a new project", pick a name
```

Then add every setting from step 2, either in the Netlify dashboard (**Project configuration → Environment variables**) or one at a time in the Terminal:

```bash
netlify env:set DATABASE_URL "postgresql://…"
netlify env:set SESSION_SECRET "…"
# …and so on for each variable in the table
netlify env:list                # check that they're all there
```

Finally, publish:

```bash
netlify deploy --prod
```

This builds the site on your computer and uploads it. Always set **every** variable in Netlify first: anything missing there falls back to the value in your local `.env` file (your test passwords and test session secret). Run `netlify deploy --prod` again whenever you want to publish changes.

### What happens on every deploy
Netlify runs `npm run build:deploy`, which:
- creates or updates the database tables
- creates the three logins (only if they don't exist yet; production **requires** the `*_PASSWORD` variables)
- stores the default opening hours
- imports the menu (only if the menu is empty)
- builds the website

It never overwrites changes made in the dashboard. Photos are resized and converted to modern formats by Netlify's Image CDN automatically.

### Step 4 — Check it works
1. Open your Netlify address and make a test booking on **Reserve a table**.
2. Go to `/admin`, log in, and check the booking is there. Confirm it, then log out and back in. It should still be confirmed.
3. In `/admin → Settings`, press **Send test email**.
4. Delete the test booking when you are done (open it → **Delete**).

### Step 5 — Your own domain
Netlify → your project → **Domain management → Add a domain** → enter `your-domain.ro` (for example) and follow the DNS instructions. HTTPS is switched on automatically. Then update `NEXT_PUBLIC_SITE_URL` in **Environment variables** and redeploy (**Deploys → Trigger deploy → Deploy project**, or `netlify deploy --prod`).

### Updating the site later
- **GitHub method:** any change pushed to GitHub (for example a new photo or a text edit) goes live within about two minutes.
- **CLI method:** run `netlify deploy --prod` again.
- Changed an environment variable? It only takes effect after a new deploy.

---

## 4. Email setup

Every website booking sends **two kinds of email**:
1. a confirmation to the **guest** ("we've received your request")
2. a notification to **every address** in `NOTIFY_EMAILS` plus any added in `/admin → Settings`

When staff **confirm**, **cancel** or **reschedule** in the dashboard, the guest is emailed too. There is a tick-box to turn that off.

### Option A — Resend (recommended)
1. Sign up at <https://resend.com>. The free plan covers 3,000 emails a month.
2. **Domains → Add domain** → enter your domain and add the DNS records it shows you (at your domain registrar, or in Netlify if the domain is there). Wait for "Verified".
3. **API Keys → Create** → copy the key.
4. In Netlify (**Project configuration → Environment variables**) set:
   - `RESEND_API_KEY` = the key
   - `EMAIL_FROM` = `Symphony Urban Living <rezervari@your-domain.ro>`
   - `EMAIL_REPLY_TO` = the inbox that should receive guest replies
5. Redeploy, then go to `/admin → Settings → Send test email`.

> **Quick test without a domain:** keep `EMAIL_FROM="Symphony Urban Living <onboarding@resend.dev>"`. Resend will then only deliver to the email address you signed up with, which is enough to try the full flow.

### Option B — SMTP (Gmail, Zoho, Brevo, your hosting company…)
Leave `RESEND_API_KEY` empty and set `SMTP_HOST`, `SMTP_PORT` (587 or 465), `SMTP_USER`, `SMTP_PASSWORD`. For Gmail you need an "App password" (Google Account → Security → 2-Step Verification → App passwords).

### Who gets notified
- `NOTIFY_EMAILS` (in Netlify) — the permanent list, e.g. `owner@…,host@…,andreescuandrei190@gmail.com`
- `/admin → Settings → Reservation notifications` — add or remove extra addresses at any time, no redeploy needed.

---

## 5. Everyday changes: menu, prices, hours

All of these are done **in the dashboard** and appear on the website immediately.

| What | Where | Who |
|------|-------|-----|
| Change a price or description | `/admin → Menu & prices → Edit` | Owner, Admin |
| Add or delete a dish | `/admin → Menu & prices → + Add item` | Owner, Admin |
| Sold out today? Hide a dish | click **On menu** to switch it to **Hidden** | Owner, Admin |
| Chef's specials section | click **★ Special** on a dish | Owner, Admin |
| Opening hours (lunch / dinner per day) | `/admin → Settings → Opening hours` | Owner, Admin |
| How many guests per time slot | `/admin → Settings → Booking capacity` | Owner, Admin |
| Holidays / private buyouts | `/admin → Settings → Closed dates` | Owner, Admin |
| Who receives booking emails | `/admin → Settings → Reservation notifications` | Owner, Admin |

**Re-importing the menu from the content file.** The first menu comes from `content/site-content.ts`. If you would rather maintain the menu in that file, edit it and run `npm run menu:import`. This **replaces** the menu in the database, including dashboard edits.

---

## 6. Change the name, texts, logo and photos

**All business text lives in one file:** `content/site-content.ts`. It is heavily commented, and every section of the website reads from it:

- restaurant name, tagline, description, location line, legal company name
- address, phone, email, social links, company details for the privacy policy
- home page texts, testimonials, chef bio, story, private events, gallery captions
- booking form options (seating areas, occasions)
- default menu, default opening hours and booking rules

Open it in any text editor (e.g. <https://code.visualstudio.com>), change the text between the quotes, save, then push to GitHub (or refresh `npm run dev` locally).

**Photos.** Put the real photos in `public/images/` **with the same file names** (e.g. `dish-scallops.jpg`) and nothing else needs to change. To use different names, update the `src` in `content/site-content.ts`. Always keep a short, accurate `alt` description. Photos are resized and optimised automatically; large JPGs are fine.

**Homepage hero plates.** The first screen shows the signature dishes floating over the dining room like product photos, slowly taking turns (one every 7.5 seconds). Replace `public/images/hero-plate.png`, `hero-plate-lamb.png`, `hero-plate-risotto.png` and `hero-plate-tart.png` with real **top-down photos of each plate, cut out onto a transparent background** (square PNG or WebP, at least 1600 × 1600 px, the plate filling the frame). The page adds the shadows and lighting itself. To feature different dishes, or more or fewer (3–5 works best), edit `hero.plates` in `content/site-content.ts`. Each `dish` name must match the menu.

**Logo.** Put `logo.svg` (or `.png`) in `public/images/` and set in `content/site-content.ts`:
```ts
logo: { src: "/images/logo.svg", width: 160, height: 40 },
```
The browser tab icon is `app/icon.svg`. Replace it with your own square SVG.

**Colours.** The brand palette (charcoal, cream, gold, emerald, burgundy) is at the top of `tailwind.config.ts`.

---

## 7. Staff logins

**The easy way:** log in as **Admin** → **Team logins**.
- **+ Add team member**: name, email, role, password. Share the password privately.
- **Edit**: change the role, reset a password (this signs the person out everywhere), or untick **Active** to block someone who has left.
- There must always be at least one active admin.

Everyone can change their own password under **My account**.

**Roles**
- **Admin**: everything, including team logins
- **Owner**: bookings, menu & prices, settings
- **Staff** (host / floor manager): bookings only (view, confirm, seat, reschedule, cancel, add phone bookings). No access to menu, prices or settings.

**Locked out?** From the project folder, with `DATABASE_URL` pointing at the right database:
```bash
npm run user:password -- someone@example.com "New-Password-123" admin "Full Name"
```
This resets the password (or creates the login if it doesn't exist).

---

## 8. How bookings work

**Guest side**
1. The guest picks party size → date (closed days are greyed out) → time. Times come from your opening hours; full slots are crossed out, and a gold dot means "few tables left".
2. They choose a seating preference, fill in their details, and tick the privacy consent (required, never pre-ticked).
3. The booking is saved as **Pending**. The guest sees an on-screen summary with a reference like `SU-7F3K2`, and the emails go out.

**Capacity rule.** Each service (lunch / dinner) has a **maximum number of guests per time slot**. Example: dinner max 24 means that at 19:00 you can take bookings of 10 + 10 + 4, and then 19:00 shows as full. Cancelled and no-show bookings free the seats again. Online bookings are also limited by:
- the largest party size bookable online (default 10; bigger groups are pointed to Private Events)
- minimum notice (default 2 hours)
- how many days ahead guests can book (default 60)

**Staff side (`/admin`)**
- **Today**: every booking by time with covers per service, allergy notes highlighted, and one-tap **Confirm / Seat / No-show / Cancel**. It refreshes itself every 30 seconds. Use ← → to see other days.
- **Reservations**: search by name, email, phone or reference, and filter by dates, status and party size.
- **Calendar**: month view with bookings and covers per day; a gold badge means requests are waiting.
- **Reservation page**: edit details or **reschedule** (the guest is emailed about the change), see who did what, and an "Override hours & capacity" box for squeezing someone in.
- **+ New booking**: for phone and walk-in reservations.

**Statuses:** Pending → Confirmed → Seated, or Cancelled / No-show.

---

## 9. Environment variables reference

| Variable | Required | What it is |
|----------|----------|------------|
| `DATABASE_URL` | yes | `file:./dev.db` locally, `postgresql://…` in production |
| `SESSION_SECRET` | yes (production) | random text, 32+ characters, keeps logins secure |
| `NEXT_PUBLIC_SITE_URL` | yes | public address, e.g. `https://your-domain.ro` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes | admin login created on first setup |
| `OWNER_EMAIL`, `OWNER_PASSWORD` | recommended | owner login created on first setup |
| `STAFF_EMAIL`, `STAFF_PASSWORD` | recommended | staff login created on first setup |
| `NOTIFY_EMAILS` | yes | comma-separated emails notified of every booking |
| `EMAIL_FROM` | yes | sender name and address |
| `EMAIL_REPLY_TO` | recommended | where guest replies go |
| `RESEND_API_KEY` | one of these | Resend API key |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | …or these | SMTP fallback |

The `*_EMAIL` / `*_PASSWORD` values are only used to **create** the logins the first time. Changing them later does nothing; use **Team logins** instead. Secrets are only ever read on the server and never sent to browsers.

---

## 10. For developers

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Prisma (SQLite locally / Postgres in production) · iron-session · zod · bcrypt · Resend REST API or Nodemailer.

```
app/
  (site)/            public pages (layout: header, footer, JSON-LD, sticky mobile CTA)
  admin/             login + (dashboard) pages, server actions in actions.ts
  api/availability   GET live slot availability
  api/reservations   POST create booking (zod, rate limit, CSRF check, emails)
  sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg
components/
  site/  home/  reservations/  admin/  motion/
content/site-content.ts   ← ALL business content
lib/
  availability.ts   slot + capacity rules        hours.ts     opening-hours maths (client-safe)
  reservations.ts   serializable booking insert  settings.ts  DB-backed settings (cached, tag "settings")
  menu.ts           DB menu (cached, tag "menu") validation.ts zod schemas shared client/server
  session.ts        iron-session + role checks   roles.ts     permission matrix
  rate-limit.ts     DB sliding-window limiter    email/       send, templates, notify
prisma/schema.prisma, prisma/seed.ts (idempotent)
scripts/select-db.mjs          picks sqlite/postgresql from DATABASE_URL
scripts/generate-placeholders  regenerates labelled placeholder images
```

**Scripts:** `dev`, `build`, `start`, `setup`, `db:push`, `db:seed`, `db:studio`, `menu:import`, `user:password`, `images`, `typecheck`. Netlify runs `build:deploy` (see `netlify.toml`), which refuses to deploy with a SQLite `DATABASE_URL`.

**Implementation notes**
- **Database provider switch:** Prisma needs a literal provider, so `scripts/select-db.mjs` rewrites it from `DATABASE_URL` before every Prisma command. Enum-like fields are strings validated with zod, so one schema works on both databases. The schema is applied with `prisma db push`. If you later need versioned migrations, switch to `prisma migrate` per provider.
- **Netlify:** `@netlify/plugin-nextjs` turns the app into one server function plus an edge function for `middleware.ts`. Three things are set up for it:
  - `prisma/schema.prisma` adds the `rhel-openssl-3.0.x` engine, because Netlify builds on Ubuntu but functions run on Amazon Linux
  - when `NETLIFY` is set, `next.config.mjs` sends `next/image` straight to Netlify's Image CDN (`lib/netlify-image-loader.ts`) and turns off Next's own gzip, since the CDN compresses
  - cached pages and `revalidateTag` are stored in Netlify Blobs automatically
- **Race-safe capacity:** the slot re-check and insert run in a serializable transaction with retries.
- **Security:**
  - bcrypt (cost 12) password hashing
  - HTTP-only signed session cookie that is invalidated on password change
  - server-side role checks on every page and server action
  - booking endpoint: JSON-only with an origin check (CSRF), 5 requests per 10 min per hashed IP, honeypot field, 8 KB body cap
  - login limited to 10 attempts per 15 min
  - security headers set in `next.config.mjs`; `/admin` is `noindex`
- **GDPR:**
  - consent checkbox, never pre-ticked; consent time and version stored
  - IPs are only stored hashed and are purged after 24 h
  - Google Maps loads only after a click; fonts are self-hosted
  - admins can permanently delete a reservation (erasure request)
- **Performance:**
  - hero text is animated with CSS, so it paints before JavaScript loads
  - ambient background uses composited CSS transforms plus a capped canvas (40 fps max, DPR ≤ 1.5, pauses off-screen or in hidden tabs, still frame under `prefers-reduced-motion`)
  - Framer Motion loads via `LazyMotion` with `reducedMotion="user"`
  - public pages are static with tag-based revalidation, and images are served through `next/image` (AVIF/WebP)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL is not set` | You skipped `cp .env.example .env`, or the variable is missing in Netlify (**Project configuration → Environment variables**). |
| Netlify build says "This deploy needs a hosted Postgres database" | `DATABASE_URL` in Netlify is missing or still `file:./dev.db`. Paste the Neon `postgresql://…` string and redeploy. |
| Netlify build fails at `prisma db push` | Check the Neon connection string (pooling **off**, ends with `sslmode=require`). |
| Can't log in after deploy | In production, logins are only created if the `*_PASSWORD` variables were set **before** the first deploy. Add them and redeploy, or use `npm run user:password`. |
| No emails arrive | `/admin → Settings` shows whether an email service is connected. Press **Send test email**. With `onboarding@resend.dev` Resend only delivers to your own Resend account email. Check spam. |
| Menu change not visible | Hard-refresh the page (`Cmd/Ctrl + Shift + R`). Dashboard saves update the site instantly; `menu:import` changes can take up to an hour unless you also save any item in the dashboard. |
| Wrong "Open now" status | Hours are in Romanian time (`Europe/Bucharest`). Check `/admin → Settings`. |
| "Too many booking attempts" while testing | Wait 10 minutes. It's the spam protection working. |
