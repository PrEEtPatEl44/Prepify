# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

The app runs at http://localhost:3000.

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- **LLM**: Either `OPENAI_API_KEY` (recommended) or `OPENROUTER_API_KEY`
- **Optional**: Brandfetch, Syncfusion, RapidAPI keys for additional features

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router (React 19, TypeScript)
- **Styling**: Tailwind CSS 4 with Radix UI primitives
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security)
- **AI**: LangChain with OpenAI/OpenRouter for multi-agent orchestration

### Source Structure (`src/`)

**App Router** (`app/`):
- `/` - Dashboard with activity calendar and stats
- `/jobs` - Job application tracking (kanban, list, table views)
- `/docs` - Resume/document management
- `/interview` - AI interview preparation
- `/auth/*` - Authentication flows (Supabase-based)

**API Routes** (`app/api/`):
- `/resume-analysis` - Resume scoring against job descriptions
- `/interview/generate` - AI question generation
- `/interview/feedback` - Interview answer feedback
- `/applications/*` - Job application CRUD
- `/docs/*` - Document management and text extraction

### AI Agents System (`lib/agents/`)

**Resume Analysis Pipeline** (scoring weights: 40% keywords, 60% holistic):
1. `keywordExtractor.ts` - Extracts skills/keywords from resume and job description
2. `keywordComparator.ts` - Compares and scores keyword matches
3. `holisticComparator.ts` - Evaluates experience, qualifications, cultural fit
4. `orchestrator.ts` - `ResumeAnalysisOrchestrator` coordinates the pipeline

**Interview Preparation** (`interview-agents/`):
1. `jobAnalysisAgent.ts` - Analyzes job requirements and candidate profile
2. `questionGeneratorAgent.ts` - Generates customized questions (difficulty, type, count)
3. `feedbackGeneratorAgent.ts` - Evaluates interview answers
4. `interviewOrchestrator.ts` - `InterviewOrchestrator` coordinates preparation

### Key Services

- `lib/services/authService.ts` - Supabase authentication
- `lib/services/jobService.ts` - Job application business logic
- `utils/supabase/server.ts` & `client.ts` - Supabase client initialization
- `middleware.ts` - Session management via Supabase

### Path Alias

Use `@/*` to import from `src/*` (e.g., `@/components/ui/button`).

## Data Fetching & Mutations

- **Data fetching (GET)**: Use API routes (`app/api/`) for fetching data
- **Data mutations (POST/PUT/DELETE)**: Use Server Actions instead of API routes
  - Place server actions in `actions.ts` files alongside the page that uses them (e.g., `app/(protected)/templates/actions.ts`)
  - Always add `"use server"` directive at the top
  - Use `revalidatePath()` after mutations to update the UI

## Commit Convention

Follow conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
