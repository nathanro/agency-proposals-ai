---
name: Agency Proposals AI — Architecture
description: Key runtime decisions for the ProposalAI app — ports, auth, DB, AI.
---

# ProposalAI Architecture

## Runtime ports (consistent, don't change)
- Frontend (Vite): PORT env var → currently 19365
- API server (Express): PORT env var → consistently 8080
- Vite proxy: `/api` → `http://localhost:8080` (configured in `vite.config.ts`)

## Auth
- JWT via `jsonwebtoken`, secret = `SESSION_SECRET` env var
- Tokens stored in `localStorage` on the client
- Middleware: `artifacts/api-server/src/middleware/auth.ts`

## Database
- Replit built-in PostgreSQL + Drizzle ORM (`@workspace/db`)
- Schema: `lib/db/src/schema/` — users, service_templates, proposals
- Push: `pnpm --filter @workspace/db run push`

## AI
- Replit OpenAI integration proxy (`AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY`)
- Model used: `gpt-5.6-luna` (cost-effective for generation)
- Endpoints: `POST /api/ai/generate-proposal`, `POST /api/ai/generate-tasks`

## Why Replit DB instead of Supabase
User did not provide Supabase credentials; Replit PostgreSQL needs zero external setup — better for a PoC.

## Demo account
- Email: demo@proposaiai.com / password: demo1234
- Has 3 seed templates: SEO Local, Social Media Management, Landing Page Premium
