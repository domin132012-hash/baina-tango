# Stripe Catalog Baseline

> Baseline + delta document. Do not recheck Stripe for unrelated tasks.
> Never record secret keys, webhook signing secrets, customer information, payment records, card data, or private billing data.

Last updated: 2026-06-17 by Codex

## Baseline Scope

This baseline was created from repository code and visible checkout buttons only. Stripe Dashboard/API was not checked in this task.

## Product Catalog

| Product code | Product name in UI | Price shown | Status | product_id | price_id | Site entitlement |
|---|---|---:|---|---|---|---|
| `WORD_LIMIT_10` | 10词上限包 | JP¥50 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWUHEJwEImJY61ci4uFqSpj` | Permanent +10 word limit |
| `WORD_LIMIT_50` | 50词上限包 | JP¥120 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWZQpJwEImJY61cHRzXR3t` | Permanent +50 word limit |
| `WORD_LIMIT_100` | 100词上限包 | JP¥199 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWZReJwEImJY61cdrztMzYB` | Permanent +100 word limit |
| `WORD_LIMIT_500` | 500词上限包 | JP¥299 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWZT9JwEImJY61cZ2TBDgu3` | Permanent +500 word limit |
| `WORD_LIMIT_UNLIMITED_30D` | 无限词库 30天 | JP¥399 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWZWcJwEImJY61cVOZemJg7` | Unlimited word limit for 30 days |
| `AI_QUOTA_5` | AI 5次体验包 | JP¥50 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWZZbJwEImJY61ctCRgERaL` | +5 AI quota |
| `AI_QUOTA_100` | AI 100次使用包 | JP¥299 | Configured in app; dashboard status not rechecked | Pending dashboard baseline | `price_1TWZbwJwEImJY61cDxj5VKpm` | +100 AI quota |

## Checkout Flow

| Component | Status |
|---|---|
| Frontend buttons | `index.html` uses `data-checkout` with Stripe `price_id` values |
| Create checkout endpoint | `functions/api/create-checkout-session.js` |
| Auth requirement | Requires logged-in Supabase user token |
| Checkout metadata | Includes user id, product code, price id, word limit bonus, AI quota, unlimited days |

## Webhook

| Field | Status |
|---|---|
| Handler | `functions/api/stripe-webhook.js` |
| Secret status | `STRIPE_WEBHOOK_SECRET` required; value not recorded |
| Events handled | `checkout.session.completed` |
| Other events | Returned as ignored |
| Entitlement write | Upserts `user_entitlements` |
| Order write | Upserts `payment_orders` |
| Endpoint configured in Stripe Dashboard | Not checked; needs dashboard confirmation before payment changes |

## Delta Update Triggers

Update this file when any of these happen:

- Product changes.
- Price changes.
- `price_id` or `product_id` changes.
- Webhook endpoint or event type changes.
- Payment success entitlement logic changes.
- Payment succeeds but entitlement is missing or wrong.

## Next Check

- Before touching payment code or product pricing, verify dashboard product status, product IDs, price IDs, webhook endpoint, and enabled event types.
