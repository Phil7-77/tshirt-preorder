# Cloudflare deploy

Public deploy for this static Vite app.

**GitHub repo:** https://github.com/Phil7-77/tshirt-preorder

This project includes `wrangler.jsonc` so Cloudflare can upload the built `dist/` folder as static assets.

## Build settings (Workers / Pages CI)

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler versions upload`  
  (or `npx wrangler deploy` if your project uses that)
- **Output / assets:** `./dist` (configured in `wrangler.jsonc`)

### Required build environment variables

After finishing [SETUP_SHEETS.md](./SETUP_SHEETS.md), add these in Cloudflare → Worker → Settings → Variables:

- `VITE_SHEETS_API_URL` — Apps Script web app URL  
- `VITE_SHEETS_API_KEY` — same secret as in `Code.gs`  

## Connect Git (first time)

1. Sign up / log in at [Cloudflare](https://dash.cloudflare.com/sign-up) (free)
2. **Workers & Pages** → **Create** → connect **`Phil7-77/tshirt-preorder`**
3. Use the build settings above
4. Deploy — you’ll get a public `*.workers.dev` or `*.pages.dev` URL

## Updates later

Push to your connected branch and Cloudflare rebuilds automatically:

```bash
git add .
git commit -m "Your message"
git push
```

## Optional: custom domain

In the project → **Custom domains** → add a domain you own.
