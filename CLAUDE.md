# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

The app runs at http://localhost:3000. No test framework is configured.

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- **Database**: `DATABASE_URL` (pooled), `DIRECT_URL` (for Drizzle migrations)
- **LLM**: `OPENAI_API_KEY` or `OPENROUTER_API_KEY`; `OPENAI_MODEL_NAME` (default: `gpt-4o-mini`)
- **Optional**: `BRANDFETCH_CLIENT_ID`, `LATEX_SERVICE_URL`, `NEXT_PUBLIC_APP_URL`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router (React 19, TypeScript)
- **Styling**: Tailwind CSS 4 with Radix UI primitives (shadcn/ui)
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security) + Drizzle ORM
- **AI**: LangChain with OpenAI/OpenRouter

### Source Structure (`src/`)

**App Router** (`app/`):
- `/` — Dashboard with activity calendar and stats
- `/jobs` — Job application tracking (kanban, list, table views)
- `/docs` — Resume/document management
- `/auth/*` — Authentication flows (Supabase-based)

**API Routes** (`app/api/`) — GET only (reads):
- `/applications`, `/applications/columns`, `/applications/by-resume`
- `/docs`, `/docs/template-resume`
- `/dashboard`, `/dashboard/calendar`
- `/templates`, `/templates/compile`

**Database** (`db/`):
- `db/schema.ts` — Drizzle ORM table definitions (`columns`, `jobApplications`, `resumes`, `coverLetters`, `templates`)
- `db/auth.ts` — `getAuthUserId()` utility; call this first in every server action/API route
- `db/relations.ts` — Drizzle foreign key relations
- Migrations generated via Drizzle Kit into `supabase/migrations/`

**Key Utilities**:
- `utils/supabase/server.ts` & `client.ts` — Supabase client initialization
- `lib/agents/resumeDataExtractor.ts` — LangChain agent; extracts structured data from resume text using Zod schema + `ChatOpenAI`
- `lib/textExtraction.ts` — PDF/DOCX text parsing (pdf-parse, mammoth)
- `adapters/jobAdapters.ts` — Transforms DB rows ↔ `Job`/`KanbanItem` types; generates Brandfetch company logo URLs
- `lib/utils.ts` — `cn()` for Tailwind class merging
- `middleware.ts` — Refreshes Supabase session on every request

### AI Agent: ResumeDataExtractor
The only implemented agent (`lib/agents/resumeDataExtractor.ts`). Invoked in the background via Next.js `after()` inside `POST /api/docs` after file upload. Extracts structured resume data (contact, experience, education, skills, projects) into JSONB stored in `resumes.resumeData`.

## Data Fetching & Mutations

- **Data fetching (GET)**: Use API routes (`app/api/`)
- **Data mutations**: Use Server Actions
  - Place in `actions.ts` colocated with the page (e.g., `app/(protected)/jobs/actions.ts`)
  - Always add `"use server"` directive at top
  - Authenticate via `getAuthUserId()` from `@/db/auth`
  - Use `revalidatePath()` after mutations
  - Return `{ success: boolean; data?: T; error?: string }`

## Code Style

- **No semicolons** at end of statements
- **Components**: function declarations (not arrow functions); props interface named `ComponentNameProps`
- **Imports**: `import { type Foo }` for type-only imports; group React/Next → third-party → `@/` → relative
- **Naming**: kebab-case files, PascalCase components, camelCase variables/utilities
- **Classes**: use `cn()` from `@/lib/utils` for conditional Tailwind merging
- **Types**: `interface` for object shapes, `type` for unions; place in `src/types/*.ts`
- **Path alias**: `@/*` maps to `src/*`

## Commit Convention

Follow conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
