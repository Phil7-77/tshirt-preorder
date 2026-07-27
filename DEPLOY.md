# Cloudflare Pages

Public deploy for this static Vite app.

**GitHub repo:** https://github.com/Phil7-77/tshirt-preorder

## Create the Cloudflare Pages project

1. Sign up / log in at [Cloudflare](https://dash.cloudflare.com/sign-up) (free)
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access GitHub, then select **`Phil7-77/tshirt-preorder`**
4. Build settings:
   - **Framework preset:** Vite
   - **Production branch:** `master`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**

When it finishes, you’ll get a public URL like:

`https://tshirt-preorder.pages.dev`

(or a similar name Cloudflare assigns)

Share that link. Anyone can open it; each phone still keeps its own order list.

## Updates later

Push to `master` and Cloudflare rebuilds automatically:

```bash
git add .
git commit -m "Your message"
git push
```

## Optional: custom domain

In the Pages project → **Custom domains** → add a domain you own.
