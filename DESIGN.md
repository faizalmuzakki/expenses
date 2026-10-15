---
name: Finance Tracker
description: A personal IDR ledger drawn as a pad of kwitansi receipts, carbon-copy violet on copy paper.
colors:
  carbon: "#3b3fb0"
  carbon-hover: "#30339a"
  carbon-soft: "#e7e8fb"
  carbon-on: "#ffffff"
  shell: "#3b3fb0"
  shell-ink: "#ffffff"
  shell-dim: "#cfd1f7"
  hatch: "rgba(59, 63, 176, 0.28)"
  in: "#0b7a4b"
  in-soft: "#def3e8"
  out: "#c0321c"
  out-soft: "#fbe5e0"
  warn: "#8a5300"
  warn-soft: "#fcefd5"
  ground: "#f3f3f7"
  sheet: "#ffffff"
  well: "#ececf3"
  rule: "#e1e1ea"
  rule-strong: "#c9cad8"
  ink: "#16172b"
  ink-2: "#464862"
  ink-3: "#64667f"
  scrim: "rgba(10, 11, 22, 0.55)"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\" 1"
  amount:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"tnum\" 1"
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 650
    lineHeight: 1.45
    letterSpacing: "0.06em"
    fontVariation: "\"wdth\" 80"
  stamp:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
    fontVariation: "\"wdth\" 80"
rounded:
  stamp: "4px"
  segment: "6px"
  sheet: "8px"
  bottom-sheet: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.carbon-on}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.carbon-hover}"
  button-in:
    backgroundColor: "{colors.in}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.sheet}"
    padding: "0 12px"
    height: "40px"
  button-out:
    backgroundColor: "{colors.out}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.sheet}"
    padding: "0 12px"
    height: "40px"
  button-quiet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "0 16px"
    height: "40px"
  button-quiet-hover:
    backgroundColor: "{colors.well}"
  button-danger-quiet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.out}"
    rounded: "{rounded.sheet}"
    padding: "0 16px"
    height: "40px"
  button-danger-quiet-hover:
    backgroundColor: "{colors.out-soft}"
  icon-button:
    textColor: "{colors.ink-3}"
    rounded: "{rounded.sheet}"
    size: "36px"
  icon-button-hover:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
  field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "0 12px"
    height: "40px"
  field-disabled:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink-3}"
  segmented:
    backgroundColor: "{colors.well}"
    rounded: "{rounded.sheet}"
    padding: "4px"
  segmented-option:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.segment}"
    padding: "0 12px"
    height: "32px"
  segmented-option-pressed:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  amount-box:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.amount}"
    rounded: "{rounded.sheet}"
    padding: "6px 10px"
  amount-currency-tab:
    textColor: "{colors.ink-2}"
    padding: "0 8px"
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.sheet}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 8px"
    height: "24px"
  stamp:
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "0 6px"
    height: "20px"
  shell-header:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.shell-ink}"
    height: "56px"
  shell-tab:
    textColor: "{colors.shell-dim}"
    padding: "0 12px"
  shell-tab-active:
    textColor: "{colors.shell-ink}"
  bottom-tab-bar:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-3}"
    height: "64px"
  bottom-tab-active:
    textColor: "{colors.carbon}"
  dialog:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.bottom-sheet}"
    padding: "20px"
---

# Design System: Finance Tracker

## Overview

**Creative North Star: "The Kwitansi Pad"**

The app is a pad of Indonesian kwitansi receipts torn off and filed by period. Every money figure that matters is written into a printed amount box: a small hatched currency tab, a hairline frame, and a right-aligned tabular figure. Where an amount is being written or checked, it is also spelled out in words underneath, the way a receipt carries the terbilang line. The shell is the colour of carbon-copy paper: one confident violet that owns the header and the primary action, on a cool copy-paper ground with white sheets laid on it.

Density is that of a working ledger, not a marketing dashboard. Sheets are flat and separated by hairline rules; rows are 48 to 56px tall; labels are printed form heads in condensed caps. Numbers are the loudest thing on any screen, and they are always tabular. Colour carries direction (ledger green for money in, materai vermilion for money out) but never alone: every directed amount also carries a sign or a word. The world refuses the category default of pastel stat cards with icon tiles and decorative pie charts; summaries are boxed figures and ranked category lists with thin share bars.

Light and dark follow the system preference through CSS custom properties. Dark mode is night carbon: a near-black blue ground, a deep violet shell, and the accents lifted in lightness so they keep AA contrast.

**Key Characteristics:**
- One grotesk (Archivo) used across its width axis: condensed caps for printed labels and stamps, normal width for everything else.
- Tabular, lining numerals everywhere, set on `body`.
- The amount box with a diagonally hatched currency tab is the signature.
- Flat sheets on a tinted ground; shadow only on things that float.
- Direction is sign + word + hue, never hue alone.
- Phone gets a thumb-reachable bottom tab bar; desktop gets tabs in the violet header.

## Colors

A single carbon violet over cool, faintly violet neutrals, with a green/vermilion pair reserved for the direction of money and an amber for cautions.

### Primary
- **Carbon-Copy Violet** (`carbon`, `shell`): the shell header band, primary buttons, the active bottom tab and its top marker, focus outlines, text caret, selection, the loading progress line, and the "Left over" figure when the period is positive. Hover deepens to `carbon-hover`. In dark mode the action colour lifts to a periwinkle (#9599ff) with near-black text on it, while the shell band drops to a deep violet (#1d1f52) so the header stays a band rather than a glare.
- **Carbon Wash** (`carbon-soft`): the 3px focus halo around fields and amount boxes, the pressed "All time" toggle fill.
- **Shell Dim** (`shell-dim`): inactive header tabs, sign-out link, secondary text on violet bands.
- **Carbon Hatch** (`hatch`): the 1px diagonal lines (every 6px, at -45°) that fill the currency tab of the amount box. Nowhere else.

### Secondary
- **Ledger Green** (`in`, wash `in-soft`): money in. Income figures, the `+` sign on income rows, the Add income button, the Income stamp, the top band of an income dialog, and the unspent track of the "Left over" bar. Dark: #4fd69b on #12382a.
- **Materai Vermilion** (`out`, wash `out-soft`): money out at the level of totals and actions. The Money out figure, the spent portion of the "Left over" bar, the Add expense button, the Expense stamp, the top band of an expense dialog, destructive quiet buttons and delete-icon hover, inline error messages on `out-soft`. Dark: #ff8a76 on #42201b.

### Tertiary
- **Stamp-Pad Amber** (`warn`, wash `warn-soft`): cautions that are not errors. The "Excluded from dashboard" stamp, medium-priority recommendation stamps. Dark: #f2b85b on #3a2a10.

### Neutral
- **Copy Paper** (`ground`): the page behind everything. Dark: night carbon #0f1018.
- **Sheet** (`sheet`): cards, lists, dialogs, fields, amount boxes, the phone bottom bar. Dark: #181926.
- **Well** (`well`): recessed areas. Segmented-control track, table header row, sticky date-group bands, row hover, chip fill, quoted WhatsApp message, the exclude-from-dashboard option block. Dark: #222335.
- **Hairline** (`rule`): dividers between rows and sheet borders. Dark: #2b2d42.
- **Strong Hairline** (`rule-strong`): field, button-quiet and amount-box borders, the currency-tab divider, the ring around colour dots. Dark: #3d3f5a.
- **Ink** (`ink`), **Ink 2** (`ink-2`), **Ink 3** (`ink-3`): primary text and every expense amount in a list; secondary text and chip labels; meta text, placeholders, form heads, inactive icons. Dark: #ececf5 / #b6b8ce / #9092ac.
- **Scrim** (`scrim`): the dimming layer behind dialogs.

### Named Rules
**The Sign-And-Word Rule.** Money direction is never colour-only. Income rows read `+Rp …` in ledger green; expense rows read `−Rp …` (a true minus, U+2212); summary figures sit under a printed label ("Money in", "Money out", "Left over"); dialogs and stamps say "Income" or "Expense".

**The Quiet Expense Row Rule.** In transaction lists, expense amounts stay ink with a minus sign. Vermilion is for totals, stamps, the add-expense action and destructive actions, so a normal day's list is not a wall of red.

**The Carbon Owns The Shell Rule.** Carbon violet marks the shell, the primary action, focus and the current place. It is not used to decorate sheets, headings or illustrations.

**The Dot Carries The Colour Rule.** User-chosen category colours appear only as an 8px dot (ringed in `rule-strong`) or a share bar. Category names stay in ink, so any colour a user picks remains legible in both themes.

## Typography

**Display Font:** Archivo (variable, width 75–100, weight 400–800), with ui-sans-serif / system-ui fallback
**Body Font:** Archivo
**Label Font:** Archivo at 80% width

**Character:** One sturdy grotesk does everything. The width axis is the second voice: condensed uppercase reads as the printed field labels on a receipt pad, and the normal width carries the handwriting-in-the-box figures and names.

### Hierarchy
- **Display** (800, 24px on phone / 28px from 640px, tight tracking): the period guide line at the top of Dashboard and Transactions ("30 Sept – 15 Oct 2026", or the words for all time), and the login wordmark. One per screen.
- **Amount** (700, 24px → 28px for statement figures; 20px default; 16–18px in compact boxes and form inputs): figures inside amount boxes. Right-aligned, tabular and lining, ellipsis on overflow rather than wrapping.
- **Headline** (700, 18px): tab titles ("Transactions", "Categories"), dialog titles, the 18px wordmark in the header (800, tight tracking).
- **Title** (700, 16px): section titles inside a tab ("Where it went", category group names).
- **Body** (400–600, 14px; 16px for row names): row descriptions, vendor lines, field values, button labels (600).
- **Caption** (400–500, 12px): meta lines under figures ("8 transactions in period", "91% of money in kept"), share percentages, chip text, and the terbilang line in italic.
- **Label** (650, 11px, 80% width, 0.06em tracking, uppercase, `ink-3`): printed form heads on fields, figures and table header cells.
- **Stamp** (700, 10px, 80% width, 0.06em tracking, uppercase): text inside rubber-stamp state marks.

### Named Rules
**The Tabular Everywhere Rule.** `tabular-nums` is set on the body, and `.num` adds lining figures and no-wrap. Any element showing a date, count, percentage or amount uses it so columns of figures align without a table.

**The Printed Form Head Rule.** The condensed-caps label always names the field, figure or column directly beneath or beside it. It is never a decorative kicker above a heading.

**The Terbilang Rule.** The spelled-out amount ("satu juta dua ratus lima puluh ribu rupiah", 12px italic `ink-3`, first letter capitalised) appears only where an amount is being written (forms) or verified (the transaction detail view). It never appears in lists or dashboard totals.

## Layout

One centred column, max 1152px wide, with a 16px side gutter that widens to 24px from 640px. Main content starts 20px below the header on phones and 32px on desktop. The header is a sticky 56px violet band holding the wordmark, then (from 768px) the five section tabs, then sign-out pushed right.

Below 768px the section tabs move to a fixed 64px bottom tab bar on a white sheet with a hairline top rule, five equal columns of icon over an 11px label; the page reserves 80px at the bottom for it. Sticky list headers sit at 56px from the top so they slide under the shell, not behind it.

The Dashboard reads top to bottom as a statement: period guide line; filter row (From/To dates, All time toggle, category select, search), two-up on phones and a single wrapped row from 1024px with search pushed right; a 2px progress line that animates only while refetching; the statement strip of three amount sheets (stacked on phones, three columns from 640px); then the two category breakdowns (stacked, side by side from 1024px).

The Transactions list is one sheet. From 768px it becomes a five-column grid (description, category, source, amount, actions at `minmax(0,1fr) 12rem 10rem 11rem 5.5rem`) under a `well` header row of form heads; below 768px each row collapses to description over vendor-and-category dot, amount right. Rows are grouped by day under sticky `well` date bands. The whole row is the hit target for opening the detail.

Spacing steps are 4, 8, 12, 16, 20, 24 and 32px. Sheets pad 16px (20px from 640px for list sheets); gaps between sheets are 12 to 16px; tab sections are separated by 20 to 24px. Must hold from 390 to 1440px wide with no horizontal page scroll.

## Elevation & Depth

Flat by default. Depth is tonal: white sheets on a tinted ground, recessed `well` bands for headers and tracks, hairline borders for edges. Only layers that actually float over the page get a shadow.

### Shadow Vocabulary
- **Float** (`--shadow`: `0 1px 2px rgba(22,23,43,0.06), 0 8px 24px -12px rgba(22,23,43,0.18)` light; `0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -12px rgba(0,0,0,0.6)` dark): dialogs and the login card that overlaps the violet band.
- **Pressed segment** (`0 1px 2px rgba(0,0,0,0.12)`): the selected option lifting out of a segmented-control well.
- **Focus halo** (`0 0 0 3px var(--carbon-soft)` with a `carbon` border): fields and amount-box inputs on focus. Other controls use a 2px `carbon` outline at 2px offset.

### Named Rules
**The Flat Sheet Rule.** Sheets, cards and list rows have no shadow at rest or on hover. Hover is a `well` background shift; elevation is reserved for dialogs and the login card.

## Shapes

Gently squared paper: 8px corners on sheets, buttons, fields, amount boxes and icon buttons; 6px on segmented options sitting inside an 8px track; 4px on stamps; 12px on the top corners of the phone bottom sheet (and all corners of the centred dialog from 640px). Full pills only for chips, colour dots and the 6px share bars. All borders are 1px hairlines. The only texture in the system is the diagonal hatch in the currency tab. Dialogs open with a 4px colour band across the top: carbon by default, green or vermilion when the dialog is about income or an expense.

## Components

### Buttons
Compact and solid; they look like the stamps you press at the bottom of a form.
- **Shape:** 8px corners, 40px tall (44px on the login form), 14px semibold label, icon 16px with 8px gap.
- **Primary:** carbon fill, `carbon-on` text, deepening to `carbon-hover`. Used for Edit, Sign in, Save.
- **Direction buttons:** "+ income" in ledger green and "+ expense" in vermilion, white label (dark text in dark mode), hover drops opacity to 90%. Their labels shorten to "income" / "expense" on phones but always keep the word.
- **Quiet:** sheet fill, `rule-strong` border, ink text, `well` on hover. **Danger quiet** is the same with vermilion text and an `out-soft` hover.
- **Hover / Focus / Active:** colour transitions 150ms ease-out; pressed nudges down 1px; disabled is 50% opacity with a not-allowed cursor.
- **Icon button:** 36px square, `ink-3` icon, `well` hover. Delete icons turn vermilion on hover.

### Amount Box (signature)
The kwitansi field. A flex row with a 1px `rule-strong` frame and 8px corners: on the left, a currency tab ("Rp", or a foreign currency code) in 13px bold condensed `ink-2` over the carbon hatch, divided by a hairline; on the right, the figure in the amount style, right-aligned, ellipsised on overflow. Tones: ink (default), green for money in, vermilion for money out, carbon for a positive balance. Used for the dashboard statement strip, Investments bucket totals, the transaction detail and every amount input; as an input it drops the number spinners and takes the focus halo on `focus-within`.

### Statement Strip
Three sheets side by side (stacked on phones): a printed label, one large amount box, a caption line. The "Left over" sheet adds a 6px pill bar whose `in-soft` track shows what was kept and whose vermilion fill shows the share spent.

### Category Breakdown
An ordered list ranked by amount, separated by hairlines: colour dot and name on the left, share percentage in caption and the figure in semibold on the right, then a 6px share bar in the category's own colour on a `well` track. No pie charts.

### Chips
- **Style:** 24px pill on `well`, `ink-2` 12px label, an 8px dot in the category colour, optional emoji, truncates inside its column.
- **State:** display only; uncategorised items show plain `ink-3` text instead of a chip.

### Stamps
Rubber-stamp state marks: 20px, 4px corners, 1px border and text in the same colour, transparent fill, 10px condensed uppercase. Variants in use: Income (green), Expense (vermilion), Receipt (carbon), Auto-pilot (carbon), Excluded from dashboard (amber), recommendation priority (vermilion for high, amber otherwise).

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** `sheet` on `ground`; inner recesses on `well`.
- **Shadow Strategy:** none (see The Flat Sheet Rule).
- **Border:** 1px `rule`.
- **Internal Padding:** 16px, 20px from 640px on list and breakdown sheets.

### Inputs / Fields
- **Style:** 40px tall, 12px horizontal padding, `sheet` fill, 1px `rule-strong` border, 8px corners, 14px ink text, `ink-3` placeholder. Search fields inset a 16px magnifier at 12px. Every field sits under a printed form head.
- **Focus:** border turns `carbon` and a 3px `carbon-soft` halo appears; no outline.
- **Error / Disabled:** disabled fills with `well` and greys text to `ink-3`. Errors appear as a 14px vermilion message on an `out-soft` block with 8px corners, announced with `role="alert"`.
- **PIN field:** 56px tall, 24px centred tabular digits with 0.5em tracking.

### Segmented Control
A `well` track with 4px padding holding 32px options in 14px semibold `ink-2`. The pressed option (`aria-pressed`) becomes a `sheet` lifted by the pressed-segment shadow. Used for type filters (All / Expense / Income) and the income/expense switch in forms; full width on phones.

### Navigation
- **Header (desktop, from 768px):** tabs stretch the full 56px band height, icon + 14px semibold label, `shell-dim` at rest and `shell-ink` on hover or when current. The current tab gets a 3px `shell-ink` underline with rounded top corners at the band's bottom edge.
- **Bottom tab bar (phone):** five columns, 20px icon over an 11px semibold label, `ink-3` at rest, carbon when current with a slightly heavier icon stroke (2.25 vs 1.75) and a 3px carbon marker with rounded bottom corners hanging from the bar's top edge.

### Dialog
A bottom sheet on phones (full width, 12px top corners, up to 92% of the dynamic viewport, safe-area padding) and a centred card from 640px (512px wide, 672px for wide forms). A 4px tone band on top, a sticky header with an 18px bold title and a close icon button, 20px body padding, a sticky footer of actions on a hairline. Opens with a 200ms rise-and-fade (`cubic-bezier(0.16, 1, 0.3, 1)`, 12px travel), which is removed under reduced motion. Escape and scrim click close it.

### Empty and Error States
Centred inside the sheet they replace: a 32px thin-stroke (1.5) `ink-3` icon, a semibold ink title, an optional 14px `ink-3` line capped at 384px. A tab that crashes shows the same pattern with a Reload quiet button, keeping the shell usable.

## Do's and Don'ts

### Do:
- **Do** put every statement total and every amount being entered into the amount box, with the currency in the hatched tab.
- **Do** write list amounts as signed tabular figures: `+` and ledger green for income, `−` and ink for expenses.
- **Do** spell the amount out (terbilang, 12px italic `ink-3`) under amount inputs and on the transaction detail.
- **Do** name the period in words at the top of any period-scoped view.
- **Do** use the CSS custom properties through the Tailwind colour names (`bg-sheet`, `text-ink-3`, `border-rule-strong`) so light and dark switch together, with no `dark:` variants.
- **Do** mark states (Income, Expense, Receipt, Excluded from dashboard) with stamps, coloured by meaning.
- **Do** keep row hover to a `well` fill and make the whole row the hit target for its detail.
- **Do** keep 150ms ease-out on state changes and drop the dialog motion under `prefers-reduced-motion`.

### Don't:
- **Don't** use pastel stat cards with icon tiles, or pie and donut charts, for summaries; use the statement strip and ranked share bars.
- **Don't** colour an expense row's amount vermilion, or signal direction with colour alone.
- **Don't** paint category names or chip text in the user's category colour; the dot carries it.
- **Don't** use the diagonal hatch anywhere except the currency tab.
- **Don't** put shadows on sheets, cards or rows; only dialogs and the login card float.
- **Don't** use carbon violet decoratively on content sheets; it belongs to the shell, the primary action, focus and the current location.
- **Don't** introduce raw Tailwind palette colours (`bg-blue-500`, `text-gray-600`) in chrome; user and data series colours are the only literal colours.
- **Don't** set the condensed-caps label as a kicker above a heading; it names a field, figure or column.
