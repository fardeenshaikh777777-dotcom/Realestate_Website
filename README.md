# Atrium Estates — Full-Stack Real Estate Platform (Demo Build)

A complete real-estate marketplace: curated listings, search + stylized map view,
property detail with gallery/lightbox, JWT-style auth, and three role-based
dashboards (buyer, agent, admin) — including a listing **approval workflow**
that spans agent → admin roles.

## Architecture

```
Client (this app)                 Simulated service layer
─────────────────                 ───────────────────────
React 18 + Vite + TS + Tailwind   src/lib/api.ts  ← in-browser REST mirror
hash router (SPA, static-host)    src/lib/store.ts ← session / toasts / favorites
                                  localStorage    ← persistent "PostgreSQL"
```

`src/lib/api.ts` mirrors the production REST surface 1:1 — every call is async
with realistic latency, input validation, and role checks (`BUYER` / `AGENT` /
`ADMIN`). Swapping it for the real backend means pointing the same functions at
`fetch()` calls:

| Frontend function            | REST endpoint                     | Guard      |
| ---------------------------- | --------------------------------- | ---------- |
| `login` / `register` / `logout` | `POST /api/auth/{login,register,refresh}` | — |
| `listProperties(filters)`    | `GET /api/properties?filters…`    | public     |
| `getProperty(id)`            | `GET /api/properties/:id`         | public     |
| `createProperty`             | `POST /api/properties`            | AGENT/ADMIN (agents → `pending`) |
| `updateProperty` / `deleteProperty` | `PUT/DELETE /api/properties/:id` | owner or ADMIN |
| `setPropertyStatus`          | `PATCH /api/properties/:id/status`| ADMIN (approvals) |
| `toggleFavorite` / `getSavedProperties` | `POST /api/favorites`, `GET /api/users/:id/saved` | session |
| `addInquiry` / `listInquiries` | `POST /api/properties/:id/inquiry` | session/validated |
| `addBooking` / `setBookingStatus` | `POST /api/bookings`           | session / listing agent |
| `listUsers` / `setUserRole` / `removeUser` | `GET/PATCH/DELETE /api/users` | ADMIN |
| `platformStats` / `agentStats` | `GET /api/stats/…`              | ADMIN / AGENT |

**Reference schema** (as designed for PostgreSQL + Prisma): `User`, `Property`
(composite index on `(city, price, type)` + `lat/lng`), `PropertyImage`,
`Booking`, `Inquiry`, `Review`, `Favorite`, `Payment`.

## Demo accounts

| Role  | Email              | Password   |
| ----- | ------------------ | ---------- |
| Buyer | sofia@mail.com     | demo1234   |
| Agent | daniel@atrium.est  | demo1234   |
| Admin | admin@atrium.est   | demo1234   |

Try the workflow: sign in as **Daniel** → create a listing (lands in *pending*)
→ sign in as **Amara** → approve it → it goes live on the marketplace.

## Run

```bash
npm install
npm run dev      # local dev
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

Footer → *Reset demo data* reseeds the store at any time.

## Deploying to GitHub Pages

Live at `https://<username>.github.io/Realestate_Website/`.

**How the base path works** — `vite.config.js` detects CI: in GitHub Actions it
bakes in `base: "/Realestate_Website/"`; locally it emits relative paths so the
same `dist/` runs from any location. The app uses **hash routing**, so Pages
needs no SPA 404 fallback.

**Recommended: GitHub Actions** (already configured in `.github/workflows/deploy.yml`)

1. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (the production branch) — the workflow runs
   `npm ci` → `npm run build` → publishes `dist/`.
3. Keep `package-lock.json` committed (the workflow uses `npm ci`).

**Manual fallback: branch deploy**

1. Repo → Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / `/ (root)`.
2. Run `npm run deploy` (builds with `--base=/Realestate_Website/` and pushes `dist/`).

**Secrets** — this app is fully client-side: no env vars, API keys, or tokens
are required. `.gitignore` blocks `.env*` and key files so credentials can
never be committed.

## Design system

- Type: **Fraunces** (display) + **Instrument Sans** (body)
- Palette: pine `#1e3a30` / ink `#16231d` / paper `#f4f2ec` / brass `#b08428` / clay `#a34e2c`
- Radii: `--radius-card: 14px`; shadows: `--shadow-soft`, `--shadow-lift`
- Motion: line-mask headline reveal, Ken Burns imagery, scroll reveals,
  marquee ticker, count-up stats — all honoring `prefers-reduced-motion`.
