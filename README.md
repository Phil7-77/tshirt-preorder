# Chalaph T-Shirt Pre-order

Browser-only pre-order tracker. Orders are stored in `localStorage` on each device — they do not sync across phones.

## Features

- Add / edit / delete orders
- Locals: Riis, Prince of Peace, Promised Land, Emmanuel, Liberty
- Shirt colors with image picker + full preview
- Sizes S–XXXL
- Payment screenshot upload (compressed before save)
- CSV export

## Setup

```bash
npm install
npm run dev
```

Shirt photos live in `public/tshirts/` (`blue.jpg`, `white.jpg`, `yellow.jpg`, `black.jpg`).

## Deploy

Build with `npm run build`, then deploy the `dist` folder to Vercel or Netlify.
