# Expense Tracker Dashboard

A beautiful React dashboard for tracking expenses, designed to work with the self-hosted Expense Tracker API.

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

- 📈 Expense charts and analytics
- 📋 Transaction history
- 🏷️ Category breakdown
- 📅 Date range filtering
- 🌙 Dark mode support
