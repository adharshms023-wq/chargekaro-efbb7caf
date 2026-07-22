## Goal

Turn ChargeShare from a mock-data prototype into a launch-ready app: real accounts, real charger listings persisted in the database, and Payhip-powered payments so private hosts get paid.

## Why Payhip works here (and the tradeoff)

Payhip does not have a public API for creating dynamic per-session amounts. The real-world pattern is:

- Each private host adds a **Payhip product link** to their charger listing (e.g. one product per hour, or a "Pay what you want" product).
- Users tap **Pay host** on the charger detail page; we open the host's Payhip checkout in a new tab.
- After payment, Payhip redirects back to a thank-you route on our site and (optionally) hits a webhook we expose so the session is marked paid.

Both flows the user selected map to this:
- **Upfront estimate** — user runs the cost calculator, then clicks Pay host with the calculated amount pre-filled in the "note" field.
- **Metered (pay after)** — same button, host tells the user the final kWh, user pays the matching Payhip tier / pay-what-you-want amount.

We do not need a Payhip API key on our side. The webhook (optional) uses Payhip's shared signature secret.

## Scope

### 1. Enable Lovable Cloud
Database, auth, and secure server functions.

### 2. Auth
- Email + password and Google sign-in.
- `/auth` public page (sign in / sign up).
- `_authenticated/` gate for host-only routes (list charger, dashboard).
- Inline "Sign in to save / pay / post update" CTAs on public pages — no forced redirects.

### 3. Database schema

```text
profiles(id uuid pk -> auth.users, display_name, phone, is_host bool, created_at)
chargers(id uuid pk, owner_id uuid -> auth.users, name, address, lat, lng,
         source enum(public|community|place), power_kw, speed, connectors text[],
         price_per_kwh numeric, hours, description, image, phone,
         payhip_product_url text,   -- host's Payhip checkout link
         payhip_pricing_mode enum(fixed|pwyw),
         is_published bool, created_at)
charging_sessions(id uuid pk, charger_id, user_id nullable, mode enum(upfront|metered),
                  kwh numeric, amount numeric, status enum(pending|paid|cancelled),
                  payhip_reference text, created_at, paid_at)
favorites(user_id, charger_id, pk(user_id,charger_id))
live_updates(id, charger_id, author_id, kind, message, created_at, expires_at)
reviews(id, charger_id, author_id, rating, comment, created_at)
```

RLS: users read published chargers; hosts read/write their own; sessions readable by owner + host; live_updates readable by all, insert by authenticated. Roles handled via a separate `user_roles` table + `has_role()` per platform rules.

### 4. Remove dummy data
- Delete `src/data/chargers.ts` seed array (keep type + helpers).
- `ChargersProvider` fetches from DB via a server function; explore/list/detail/homepage all read from the database.
- Empty states everywhere ("No chargers yet — be the first host").
- Remove `src/data/news.ts` hardcoded feed from homepage or replace with static marketing copy (not seeded content).

### 5. Payhip integration
- Add `payhip_product_url` + `payhip_pricing_mode` to the List Your Charger form.
- On charger detail:
  - **Pay host** button → creates a `charging_sessions` row (pending) via server fn, then opens the host's Payhip link in a new tab with `?utm_source=chargeshare&session=<id>` appended.
  - User picks Upfront (from calculator) or Metered (enter final kWh) before paying.
- Public server route `POST /api/public/payhip-webhook` verifies Payhip signature (`PAYHIP_WEBHOOK_SECRET`) and marks the session paid.
- `/pay/thanks` public route the user lands on after Payhip checkout — shows confirmation and polls session status.

### 6. Host dashboard (real data)
- Lists the signed-in host's chargers with edit / unpublish.
- Shows their `charging_sessions` (paid + pending) and total earnings.

### 7. SEO + polish
- Per-route `head()` for `/`, `/explore`, `/about`, `/community`, `/auth`, `/dashboard`, `/charger/$id` (dynamic from loader).
- Empty states, loading skeletons, toasts for auth + payment flows.

## Secrets requested from user
- `PAYHIP_WEBHOOK_SECRET` — from Payhip → Account → Webhooks (only needed if they want auto-mark-paid; otherwise session stays pending until host manually confirms).

## Out of scope (MVP)
- Automated payouts / splitting fees (Payhip pays the host directly).
- In-app messaging.
- Booking / slot reservations (still UI-only stub).

## Technical notes
- Cloud enable is step one; migration + grants + RLS follow platform rules.
- `chargers` loader is a public server fn using the publishable-key server client + a narrow `TO anon` SELECT policy on `is_published = true`.
- Session create / list uses `requireSupabaseAuth`; webhook uses `supabaseAdmin` inside the handler after signature verification.
- `sessionStorage` used to remember the pending session id across the Payhip redirect.

Reply "go" to build.
