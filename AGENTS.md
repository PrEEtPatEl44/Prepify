# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Build & Development Commands

```bash
npm run dev          # Start development server with Turbopack (http://localhost:3000)
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

**No test framework is configured.** If adding tests, use Vitest or Jest and document the single test command here.

## Tech Stack

- **Framework**: Next.js 15 with App Router (React 19, TypeScript 5)
- **Styling**: Tailwind CSS 4 with Radix UI primitives (shadcn/ui)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Auth**: Supabase SSR
- **AI**: LangChain with OpenAI/OpenRouter

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - always define types explicitly
- Use `interface` for object shapes, `type` for unions/complex types
- Place types in `src/types/*.ts` files
- Use `type` keyword when importing types: `import { type Job } from "@/types/jobs"`

### Imports
- Use `@/*` path alias for imports from `src/` (e.g., `@/components/ui/button`)
- Group imports: React/Next, third-party, `@/` aliases, relative imports
- No semicolons at end of statements

### Components
- Use function declarations (not arrow functions) for components
- Props interface named with component name + "Props" (e.g., `ButtonProps`)
- Use `cn()` utility from `@/lib/utils` for conditional class merging

### Naming Conventions
- **Files**: kebab-case for components (`my-component.tsx`), camelCase for utilities
- **Components**: PascalCase
- **Variables/functions**: camelCase
- **Types/interfaces**: PascalCase
- **Database tables**: camelCase (e.g., `jobApplications`)

### Error Handling
- Always wrap async operations in try/catch
- Return structured error responses: `{ success: boolean; error?: string }`
- Console.error with descriptive messages for debugging
- Check authentication before database operations

### Server Actions
- Add `"use server"` directive at the top of action files
- Place actions in `actions.ts` alongside the consuming page
- Use `revalidatePath()` after mutations to refresh UI
- Return consistent response shapes

### API Routes
- Use for data fetching (GET requests) only
- Place in `src/app/api/*/route.ts`
- Return `NextResponse.json()` with typed responses

### Database
- Use Drizzle ORM with explicit schema in `src/db/schema.ts`
- Always filter by `userId` for user data (RLS)
- Use transactions for multi-step operations

### Styling
- Use Tailwind CSS utility classes
- Prefer shadcn/ui components from `@/components/ui/*`
- Use `cn()` for conditional classes
- Follow existing component patterns (variants via `cva`)

## Project Structure

```
src/
  app/              # Next.js App Router
    (protected)/    # Protected routes group
    (public)/       # Public routes group
    api/            # API routes
  components/       # React components
    ui/             # shadcn/ui components
  lib/              # Utilities and services
  types/            # TypeScript types
  db/               # Database schema and config
  hooks/            # Custom React hooks
  utils/            # Utility functions (supabase clients)
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `OPENAI_API_KEY` (or `OPENROUTER_API_KEY`)
- `DATABASE_URL` & `DIRECT_URL` for Drizzle

## Commit Convention

Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
