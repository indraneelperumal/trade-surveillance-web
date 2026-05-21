This is a [Next.js](https://nextjs.org) project for the **Trade Surveillance** dashboard. It talks to the **FastAPI** backend only (no direct browser access to Postgres).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `env.local.example` to `.env.local`. The web app only needs:

- **`NEXT_PUBLIC_API_BASE_URL`** — FastAPI base URL (no trailing slash), e.g. `http://localhost:8000`

Auth (email/password login, JWT issuance) runs on the **API** (`POST /api/v1/auth/login`). Supabase keys stay in the API `.env`, not here.

On **Vercel**, set `NEXT_PUBLIC_API_BASE_URL` to your deployed API. The API must list your Vercel origin in **`ALLOWED_ORIGINS`** or the browser will hit CORS errors.

## Deploy on Vercel

Use the [Vercel](https://vercel.com/new) import flow for this repo. Set `NEXT_PUBLIC_API_BASE_URL` for Production and Preview to your deployed API URL.

See the API repo README **Deploy (Phase 0)** for Render + Supabase steps.
