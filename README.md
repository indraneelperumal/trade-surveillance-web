This is a [Next.js](https://nextjs.org) project for the **Trade Surveillance** dashboard. It talks to the **FastAPI** backend only (no direct browser access to Postgres).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend API URL

The app reads **`NEXT_PUBLIC_API_BASE_URL`** (see [`src/lib/api/client.ts`](src/lib/api/client.ts)). Set it before `npm run dev`:

```bash
export NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```

On **Vercel**, add the same variable in Project → Settings → Environment Variables (e.g. `https://your-api.onrender.com` — **no trailing slash**). The FastAPI service must list your Vercel origin in **`ALLOWED_ORIGINS`** (comma-separated) or the browser will hit CORS errors.

## Deploy on Vercel

Use the [Vercel](https://vercel.com/new) import flow for this repo. Set `NEXT_PUBLIC_API_BASE_URL` for Production and Preview to your deployed API URL.

See the API repo README **Deploy (Phase 0)** for Render + Supabase steps.
