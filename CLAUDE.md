# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint

# Drizzle ORM (not in package.json scripts, use npx)
npx drizzle-kit generate   # Generate migration SQL from schema changes
npx drizzle-kit migrate    # Apply migrations (uses DIRECT_URL)
npx drizzle-kit studio     # Open Drizzle Studio GUI
```

The app runs at http://localhost:3000. No test framework is configured.

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- **Database**: `DATABASE_URL` (pooled), `DIRECT_URL` (for Drizzle migrations)
- **LLM**: `OPENAI_API_KEY` or `OPENROUTER_API_KEY`; `OPENAI_MODEL_NAME` (default: `gpt-4o-mini`); `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL_NAME`
- **Auth**: `NEXT_CALL_BACK_URL` (OAuth callback URL for Google sign-in)
- **Optional**: `BRANDFETCH_CLIENT_ID`, `LATEX_SERVICE_URL`, `NEXT_PUBLIC_APP_URL`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router (React 19, TypeScript)
- **Styling**: Tailwind CSS 4 with Radix UI primitives (shadcn/ui, **new-york** style, **neutral** base color)
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security) + Drizzle ORM
- **AI**: LangChain with OpenAI/OpenRouter
- **DnD**: `@dnd-kit` for kanban drag-and-drop

### Route Groups and Layout Structure

```
src/app/
  layout.tsx              — Root: fonts, ThemeProvider, NextTopLoader, Sonner Toaster
  (public)/
    layout.tsx            — Vercel Analytics wrapper
    landing/              — Marketing/landing page
  (protected)/
    layout.tsx            — SidebarProvider + AppSidebar + <main>
    page.tsx              — Dashboard (/)
    jobs/                 — Job application tracking (/jobs)
    docs/                 — Resume/document management (/docs)
    profile/              — User profile editor (/profile)
    templates/            — LaTeX template management (/templates)
  auth/
    callback/route.ts     — Exchanges OAuth code for session
    login/, signup/, error/
```

Middleware (`src/utils/supabase/middleware.ts`) refreshes Supabase session and redirects unauthenticated users to `/landing` (except `/auth`, `/error`, `/landing` paths).

### Database (`src/db/`)

- `schema.ts` — Tables: `columns`, `jobApplications`, `resumes`, `coverLetters`, `templates`, `userProfiles`
- `auth.ts` — `getAuthUserId()` utility; call this first in every server action/API route
- `types.ts` — Drizzle `InferSelectModel`/`InferInsertModel` types for all tables (DB-layer types, distinct from presentation types in `src/types/`)
- `relations.ts` — Drizzle foreign key relations
- Migrations go to `supabase/migrations/` (dialect: `postgresql`, schema filter: `public` only)

`userProfiles` table stores one `ResumeData` JSONB per user (the "master profile"), upserted via the profile page.

### AI Agents (`src/lib/agents/`)

**ResumeDataExtractorAgent** (`resumeDataExtractor.ts`):
- Extracts structured `ResumeData` from resume text (PDF/DOCX)
- Invoked in background via `after()` inside `POST /api/docs` after file upload
- Stores result as JSONB in `resumes.resumeData`

**ResumeTailorAgent** (`resumeTailor.ts`):
- Takes `ResumeData` + job description, returns tailored `ResumeData` (rephrased bullets, reordered skills, adjusted summary)
- Used in `generateResumeFromProfile()` server action

### Resume Generation Pipeline

The `generateResumeFromProfile` action in `src/app/(protected)/jobs/actions.ts`:
1. Fetch job details and user profile from `user_profiles`
2. `ResumeTailorAgent.tailorResume()` → job-specific `ResumeData`
3. `buildJakeResume(profileData)` from `src/lib/data/jake-resume-template.ts` → LaTeX string
4. POST LaTeX to `${LATEX_SERVICE_URL}/compile` (with `compiler: "pdflatex"`)
5. Upload PDF to Supabase Storage bucket `"documents"` at `{userId}/resumes/{timestamp}_resume_{company}.pdf`
6. Insert `resumes` row + link `resume_id` to `job_applications`

### Supabase Storage

Single bucket: **`"documents"`**. Path conventions:
- `{userId}/resumes/{timestamp}_{fileName}.{ext}` — uploaded originals
- `{userId}/resumes/{timestamp}_resume_{company}.pdf` — AI-generated
- `{userId}/coverLetters/{timestamp}_{fileName}.{ext}`
- Signed URLs use **7-day expiry**

### API Routes (`app/api/`)

GET (reads): `/applications`, `/applications/columns`, `/applications/by-resume`, `/docs`, `/docs/template-resume`, `/dashboard`, `/dashboard/calendar`, `/templates`, `/profile`

POST (special): `/api/templates/compile` — Accepts `{ content, compiler? }`, returns raw `application/pdf` binary; `/api/docs/template-resume` — Generates PDF from a resume's stored `resumeData`

### Key Utilities
- `lib/data/jake-resume-template.ts` — `buildJakeResume(resumeData)` converts `ResumeData` → LaTeX (Jake Gutierrez template)
- `lib/textExtraction.ts` — PDF/DOCX text parsing
- `adapters/jobAdapters.ts` — Transforms DB rows ↔ `Job`/`KanbanItem` types; generates Brandfetch logo URLs
- `lib/services/authService.ts` — `signupWithGoogle()`, `logout()` server actions
- `lib/utils.ts` — `cn()` for Tailwind class merging
- `hooks/useUser.ts` — Client-side auth state (user, profile, loading)
- `hooks/useCompanySearch.ts` — BrandFetch company search with fallback

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
- **Types**: `interface` for object shapes, `type` for unions; `src/types/*.ts` for presentation types, `src/db/types.ts` for DB-inferred types
- **Path alias**: `@/*` maps to `src/*`

## Commit Convention

Follow conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Do NOT** add `Co-Authored-By` lines to commit messages
