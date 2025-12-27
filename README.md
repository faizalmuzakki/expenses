# Finance Tracker Dashboard

A beautiful React dashboard for tracking expenses and income, designed to work with the self-hosted Expense Tracker API.

## Tech Stack

- ⚛️ **React 18** + **Vite**
- 🎨 **Tailwind CSS**
- 📊 **Recharts** for data visualization
- ✨ **Lucide React** icons

## Development

```bash
# Install dependencies
npm install

# Set API URL
cp .env.example .env
# Edit VITE_API_URL

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL of your Expense Tracker API |

## Deployment (Cloudflare Pages)

1. Connect this repo to Cloudflare Pages
2. Settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Environment variables:
   - `VITE_API_URL`: `https://expenses-api.solork.dev`

## Features

- 📈 **Dashboard**
  - Income, Expenses, and Net Balance cards
  - Income vs Expenses comparison charts
  - Separate category breakdowns for income and expenses
  - Top expense categories and income sources bar charts

- 📋 **Transaction History**
  - Filter by type (All / Expenses / Income)
  - Add income or expense with dedicated buttons
  - Visual distinction (green for income, red for expenses)
  - Type-filtered category selection in forms

- 🏷️ **Category Management**
  - Separate income and expense categories
  - Filter categories by type
  - Color-coded category cards
  - Grouped view when showing all categories

- 📅 Date range filtering
- 🌙 Dark mode support
- 🔐 Authentication

## API Compatibility

This dashboard is designed to work with the Expense Tracker API that supports:
- Transaction types (`expense` / `income`)
- Category types (`expense` / `income`)
- Stats endpoints with income/expense breakdown
