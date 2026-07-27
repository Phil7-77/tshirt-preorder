# Google Sheets setup (shared database)

Orders are stored in one Google Sheet so every phone sees the same list. Payment screenshots are saved to a Google Drive folder; the Sheet stores the image link + Paid/Unpaid.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a spreadsheet  
   e.g. **Chalaph T-Shirt Pre-orders**
2. Keep it under an account the admin can open anytime

## 2. Add the Apps Script

1. In the Sheet: **Extensions → Apps Script**
2. Delete any default code
3. Paste everything from `google-apps-script/Code.gs`
4. Change this line to a long random secret:

```js
var SCRIPT_API_KEY = 'CHANGE_ME_TO_A_LONG_SECRET'
```

Example: `chalaph-tshirt-2026-xK92mQ...`

5. Click **Save**
6. Select function **`initializeSheet`** → **Run**
7. Approve Google permissions (Sheet + Drive)

This creates an **Orders** tab and a Drive folder **Chalaph T-Shirt Payments**.

## 3. Deploy the web app

1. **Deploy → New deployment**
2. Type: **Web app**
3. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. **Deploy**
5. Copy the **Web app URL**  
   (looks like `https://script.google.com/macros/s/XXXX/exec`)

If you edit the script later: **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**.

## 4. Connect the React app

Create a `.env` file in the project root:

```env
VITE_SHEETS_API_URL=https://script.google.com/macros/s/XXXX/exec
VITE_SHEETS_API_KEY=your-same-secret-from-Code.gs
```

Then restart the dev server:

```bash
npm run dev
```

## 5. Cloudflare production

In the Cloudflare Worker project → **Settings → Build** (environment variables), add:

- `VITE_SHEETS_API_URL` = your web app URL  
- `VITE_SHEETS_API_KEY` = the same secret  

Redeploy / push so the build picks them up.

## Admin tip

Open the Google Sheet directly for live totals, filters by Local, and Paid/Unpaid. The website and the Sheet stay in sync.
