# Cloudflare Pages

Public deploy for this static Vite app.

## 1. Push to GitHub

If the remote is not set yet:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin master
```

## 2. Create the Cloudflare Pages project

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. **Create** → **Connect to Git** → choose this repository
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave default)
4. Click **Save and Deploy**

After the first deploy succeeds, Cloudflare gives you a public URL like:

`https://<project-name>.pages.dev`

Share that link. Anyone can open it; orders still stay in each phone’s browser (`localStorage`).

## Optional: custom domain

In the Pages project → **Custom domains** → add a domain you own.
