# Chalaph T-Shirt Pre-order

Shared pre-order tracker. Orders sync through a Google Sheet so every phone sees the same list.

**Repo:** https://github.com/Phil7-77/tshirt-preorder  
**Live:** https://chalaph-tshirt-preorder.techmativ1.workers.dev

## Features

- Shared orders via Google Sheets (+ Drive for payment screenshots)
- Add / edit / delete (delete requires password `thispage`)
- Locals: Riis, Prince of Peace, Promised Land, Emmanuel, Liberty
- Shirt colors with image picker + preview
- Sizes S–XXXL
- Payment optional (Unpaid until a screenshot is added)
- CSV export

## Setup

1. Follow **[SETUP_SHEETS.md](./SETUP_SHEETS.md)** (Sheet + Apps Script)
2. Copy `.env.example` → `.env` and fill in the URL + API key
3. Run the app:

```bash
npm install
npm run dev
```

Shirt photos live in `public/tshirts/`.

## Deploy

See **[DEPLOY.md](./DEPLOY.md)**. Set `VITE_SHEETS_API_URL` and `VITE_SHEETS_API_KEY` in Cloudflare build env vars.
