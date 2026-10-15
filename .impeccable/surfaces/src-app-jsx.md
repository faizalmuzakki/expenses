---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/Login.jsx","src/InvestmentTracker.jsx","src/TravelExpenses.jsx"]
---

# App shell (all tabs) — surface brief

Scope: the whole authenticated app (Dashboard, Transactions, Categories, Investments, Travel) plus Login. Mode: Operate.
Audience/job: the owner reviewing and correcting their own IDR money on a phone daily and on desktop. Task first: read the period's in/out/left, open any entry, fix it.
Constraints: no business-logic, API, amount/date math or auth changes. 390–1440px, no horizontal page scroll. Light + dark from system preference. Synthetic data only in captures.
Decision taken unattended (no answer channel in this run): assigned direction built as rolled.

## Direction contract

THESIS: The app is a pad of kwitansi. Every money figure that matters is written into the kwitansi amount box: a hatched "Rp" tab and a tabular figure, with the amount spelled out (terbilang) where a figure is being written or verified. Refuses the category default of pastel stat cards with icon tiles and decorative pies.

OWN-WORLD: Carbon-copy violet (#3B3FB0) owns the shell header and primary actions on a cool copy-paper ground (#F3F3F7) with white sheets; dark: night carbon (#0F1018) with a deep violet shell (#1E2060). Ledger green for money in, materai vermilion for money out, both always with a sign and label. One grotesk (Archivo) with condensed caps for printed form heads; tabular numerals everywhere. Hairline rules, 8px corners (12px on the phone bottom sheet), diagonal hatch only on the Rp tab and stamps. Adaptation: vermilion marks money out in totals, stamps and the out button; individual expense rows stay ink with a − sign so a normal day's list isn't a wall of alarm red, while income rows carry green + sign.

STORY: Open the app, read the period guide line and three boxed amounts (In, Out, Left), see where money went as a ranked category list, tap any row to its full kwitansi, correct it.

FIRST VIEWPORT: Violet header with wordmark and (desktop) tabs; phone gets a bottom tab bar. Below: the period guide line (span in words) with date/all-time/search/category filters; then the statement strip of three amount boxes, Left/Net carrying the expense-to-income bar; then category breakdown lists. Primary add actions sit on Transactions.

FORM: kwitansi receipt pad + materai, position 3 of 7 on the ordered list. seed: none (unavailable). Raises: lexicon (guide words: the period header always names the span), timetable rack (rank by weight and case, tight scale), ticket wallet (states as stamps: excluded, receipt, source), warm consumer canon (thumb-reachable bottom tab bar on phone).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
