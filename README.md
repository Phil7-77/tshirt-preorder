# Chalaph T-Shirt Pre-order

Browser-only pre-order tracker. Orders are stored in `localStorage` on each device — they do not sync across phones.

**Repo:** https://github.com/Phil7-77/tshirt-preorder

## Features

- Add / edit / delete orders (delete requires password)
- Locals: Riis, Prince of Peace, Promised Land, Emmanuel, Liberty
- Shirt colors with image picker + full preview
- Sizes S–XXXL
- Payment screenshot optional (orders without one are marked unpaid)
- CSV export

## Setup

```bash
npm install
npm run dev
```

Shirt photos live in `public/tshirts/` (`blue.jpg`, `white.jpg`, `yellow.jpg`, `black.jpg`).

## Deploy (make it public)

See **[DEPLOY.md](./DEPLOY.md)** for Cloudflare Pages steps. Build settings:

- Build command: `npm run build`
- Output directory: `dist`
