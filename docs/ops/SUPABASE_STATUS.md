# Supabase Status Baseline

> Baseline + delta document. Do not recheck Supabase for unrelated tasks.
> Never record service role keys, JWT secrets, user emails, session tokens, or private user data.

Last updated: 2026-06-17 by Codex

## Baseline Scope

This baseline was created from repository code plus the user-provided dashboard screenshot status. No Supabase Dashboard/API changes were made in this task.

## Project

| Field | Status |
|---|---|
| Project URL | `https://hgimtyrbnfooemepaovk.supabase.co` |
| Region | Not recorded in repository; needs dashboard confirmation |
| Compute | Not recorded in repository; needs dashboard confirmation |
| Health | `Unhealthy` per user-provided screenshot; pending diagnosis |
| Last checked | 2026-06-17 baseline |
| Current blocker | Health is reported as `Unhealthy`; root cause unknown |

## Auth Usage

| Area | Usage |
|---|---|
| Frontend auth | Browser uses Supabase JS client with publishable key from `index.html` |
| Cloudflare Functions auth | Server validates user session token via `supabase.auth.getUser(token)` |
| EJU essay critique | `analyze` / `follow-up` require logged-in user before DeepSeek call |
| Payments / entitlements | Checkout and webhook handlers use Supabase to read/update user entitlement rows |
| EJU reading | Reading APIs use Supabase for questions, records, wrong book, and history |

## Environment Variables

| Variable | Purpose | Status |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL for Functions | Configured in Cloudflare per previous sync board |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin access for Functions | Configured as secret; value must never be recorded |
| `SUPABASE_SERVICE_KEY` | Legacy fallback name used by some Functions | Code supports fallback; actual platform status not rechecked |
| `SUPABASE_PUBLISHABLE_KEY` | Browser client public key | Present in `index.html`; not a service role key |

## Database Surface Seen In Code

| Table | Purpose |
|---|---|
| `user_entitlements` | Word limit bonus, AI quota, premium/unlimited status |
| `payment_orders` | Stripe checkout result records |
| `eju_user_records` | EJU reading answer records |
| `eju_wrong_book` | EJU reading wrong-answer book |
| EJU reading content tables | Used by `eju-reading-*` Functions; exact schema not recorded in repo |

## Migrations / Backups

| Item | Status |
|---|---|
| Migration files in repo | None found during baseline scan |
| Supabase migration history | Not checked; needs dashboard/CLI confirmation if a DB task depends on it |
| Backups | Not checked; needs dashboard confirmation |

## Delta Update Triggers

Update this file when any of these happen:

- Auth settings change.
- Database table or column changes.
- RLS policy changes.
- Supabase environment variable changes.
- Login/register/user data faults.
- New critique history, usage limit, or user entitlement tables.
- Health status changes.

## Next Check

- Because current health is recorded as `Unhealthy`, recheck Supabase before work that depends on Auth, user data, purchases, essay history, or usage limits.
