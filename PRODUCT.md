# Product

<!-- impeccable:product-schema 1 -->

> Written unattended by an agent: no question tool was available, so facts below come from the
> repository and the owner's task brief. Lines marked *(inferred)* were not confirmed by the owner.

## Platform

web

## Users

One person: the owner, tracking their own household money. Used daily on a phone (being made an
installable PWA) to check the month and fix entries, and on a desktop for longer review sessions.
Most entries arrive from a WhatsApp bot (text or receipt photo), so the web app is mostly for
reviewing, correcting, categorising and occasionally adding by hand *(inferred from `source`
values `whatsapp`, `whatsapp_image`, `manual` and the `/pin` login flow)*.

## Product Purpose

Personal expense and income tracker with three extra ledgers: an investment portfolio
(3 buckets: Safety, Pension, Active 50/40/10), travel expenses in foreign currencies with
conversion to IDR, and category management including categories excluded from dashboard totals.
Success: the owner can see, in seconds, what came in, what went out and what is left for a period,
and can trust and correct every individual entry.

## Operating Context

- Money is Indonesian Rupiah (`id-ID` / `IDR`, no decimals); amounts routinely reach eight or nine
  digits (Rp 1.250.000, Rp 30.000.000). Travel entries carry foreign currencies (USD, JPY, ...).
- Login is email + PIN fetched from the WhatsApp bot (`/pin`).
- API: `expenses-api.solork.dev`. Frontend: Vite + React + Tailwind, Cloudflare Pages, auto-deploy
  from `main`.
- Checked at any hour, on a phone in hand and on a desktop monitor *(inferred)*.

## Capabilities and Constraints

- Dashboard: income, expenses, net, transaction count for a date range or all time; search and
  category filter; category breakdowns.
- Transactions: list, filter by type, detail view with receipt image and original WhatsApp
  message, add/edit/delete.
- Categories: income/expense, emoji icon, colour, "exclude from dashboard" flag.
- Investments and Travel: as above.
- Must work 390px to 1440px wide with no horizontal page scroll.
- Business logic, API calls, amount/date math and auth flow are owned elsewhere; design work does
  not change them.

## Evidence on Hand

No real data may appear in screenshots or docs; all illustrative data must be synthetic.

## Product Principles

1. Numbers first: amounts are legible, tabular, right-aligned and scannable at a glance.
2. Correcting an entry is as quick as reading it: every row opens to its full record.
3. Direction is never colour-only: income/expense carry sign and label as well as hue.
4. One tool, five ledgers: the same vocabulary across every tab.

## Accessibility & Inclusion

WCAG AA contrast in light and dark; keyboard reachable controls; respects reduced motion
*(inferred standard; no product-specific requirement stated)*.
