Deployment notes — LunoVibe

Frontend (Vercel)
- Use the Vite preset or Other → Static Site.
- Root Directory: `client`
- Build Command: `npm run build --prefix client` (or run `npm run build` from repo root)
- Output Directory: `client/dist`
- Add Environment Variable (Vercel Project Settings):
  - `VITE_API_URL` = `https://<your-backend-url>`

Backend (Railway / Render recommended)
- The server listens on `process.env.PORT` and has a `start` script: `node index.js`.
- Recommended quick deploy:
  1. Create a new project on Railway or Render and connect your GitHub repo.
  2. For start command use: `node index.js`.
  3. Set `ALLOWED_ORIGINS` env var to the Vercel site URL, e.g. `https://your-app.vercel.app` (include comma-separated values if needed).
  4. After deploy, set `VITE_API_URL` in Vercel to the backend URL.

CORS
- The server reads `ALLOWED_ORIGINS` (comma-separated) and falls back to `http://localhost:5173,http://127.0.0.1:5173`.

Notes & Troubleshooting
- If Vercel build error shows `vite: command not found`, ensure Vercel is building the `client` package (we added `vercel.json` and a root `build` script).
- If embedding issues occur (YouTube error 150), playback may be restricted by video owner settings; fallback search attempts are implemented but may not always succeed.

Commands to test locally

# from repo root
npm run build
ls client/dist
npx serve client/dist
