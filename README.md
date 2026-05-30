# Sentinel — Trade Surveillance Web

Next.js (App Router) dashboard for **compliance analysts** and **compliance officers**. All data flows through the **FastAPI** backend; there is no direct browser access to PostgreSQL.

**Product & UX spec (v2):** [`trade-surveillance-api/docs/SENTINEL_PRODUCT_SPEC_V2.md`](../trade-surveillance-api/docs/SENTINEL_PRODUCT_SPEC_V2.md) — case-centric workflow, RBAC, screens, and API shapes.

**Live (example):** [Vercel overview](https://trade-surveillance-web.vercel.app/overview)

---

## Project overview

| Layer | Role |
|--------|------|
| **This app** | UI, TanStack Query, session in browser storage; sends `Authorization: Bearer` to the API |
| **FastAPI API** | Login (`POST /api/v1/auth/login`), JWT validation, RBAC, CRUD, metrics, case actions, async investigation trigger |
| **Supabase Postgres** | Trades, alerts, investigations, notes, users (backend only) |
| **Supabase Storage** | ML pipeline artefacts — used by backend jobs, not the web app |

**Core workflow (v2):** **Queue** → open a **case** (`/cases/{alertId}`) → inspect trade + SHAP → optional **AI investigation** → notes and officer actions (assign, escalate, close with disposition).

---

## Current product state

- **Auth:** API email/password login; `AuthGate`, session via `src/lib/auth/session.ts` (no Supabase client in this repo)
- **Queue:** Primary triage surface (`/queue`)
- **Cases:** Case-centric detail page with investigation CTA and actions
- **Overview:** Ops metrics, anomaly distribution, recent activity
- **Investigations:** List + detail
- **Team / Users:** Officer-only surfaces (`usePermissions` / `useRole`)
- **UI:** Dark sidebar, light/dark theme toggle, Sentinel v2 navigation

Each login user must exist in the API **`users`** table (provisioned via auth login or admin) with the correct **role** (`ANALYST` / `COMPLIANCE_OFFICER` per spec).

---

## Local development

```bash
npm install
cp env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `env.local.example` to `.env.local`. The web app only needs:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI base URL (no trailing slash), e.g. `http://localhost:8000` |

Auth (email/password, JWT) runs on the **API**. Supabase keys stay in the API `.env`, not here.

On **Vercel**, set `NEXT_PUBLIC_API_BASE_URL` for Production and Preview. The API must list your Vercel origin in **`ALLOWED_ORIGINS`**.

---

## Deploy (Vercel)

Import this repo in [Vercel](https://vercel.com/new), set `NEXT_PUBLIC_API_BASE_URL`, and deploy. Backend setup (Render, Supabase, JWT) is in the **API repo** `README.md`.

---

## Repo map

| Path | Notes |
|------|--------|
| `src/app/(dashboard)/queue/` | Alert queue |
| `src/app/(dashboard)/cases/[alertId]/` | Case detail |
| `src/app/(dashboard)/overview/` | Dashboard |
| `src/app/(dashboard)/investigations/` | Investigation list + detail |
| `src/app/(dashboard)/team/` | Team (officer) |
| `src/app/login/` | API login |
| `src/features/cases/` | Case page UI |
| `src/features/queue/` | Queue UI |
| `src/lib/api/endpoints/` | Typed API clients |
| `src/lib/auth/` | Session storage + constants |
| `src/contexts/AuthContext.tsx` | Auth state + permissions |

---

## Related repository

**Backend / ML / agents:** `trade-surveillance-api` — FastAPI, pipelines, LangGraph investigation orchestrator.

See also `AGENTS.md` and `CLAUDE.md` for tooling notes.
