# Prepify

> Your AI-powered career preparation platform — track job applications, manage your resume, and generate tailored resumes with LaTeX templates.

Prepify is a modern career preparation platform built with Next.js 15. It helps job seekers organize their job search, manage resume documents, maintain a master profile, and generate polished PDF resumes from LaTeX templates.

> **Note:** Features like AI resume scoring, keyword analysis, and interview question generation are from an older version and are no longer part of the active codebase.

## Features

### Job Application Tracking
- **Kanban Board**: Visualize your application pipeline with drag-and-drop columns
- **Table View**: Spreadsheet-style view of all applications
- **Custom Columns**: Create and rename status stages (Applied, Interview, Offer, etc.)
- **Job Details**: Store company name, job title, description, URL, and linked documents
- **Company Logos**: Automatic company logo fetching via Brandfetch

### Document Management
- **Resume & Cover Letter Upload**: Supports PDF and DOCX formats
- **Supabase Storage**: Files stored securely with per-user access
- **AI Data Extraction**: Background extraction of structured data from uploaded resumes (contact info, experience, education, skills, projects)
- **In-App Viewer**: Preview PDFs and DOCX files without leaving the app

### Master Profile
- **Centralized Profile**: Maintain a single source of truth for your career data
- **Import from Resume**: Auto-populate from any uploaded resume
- **Structured Sections**: Contact info, work experience, education, skills, certifications, projects, and links
- **Reusable for Generation**: Profile data feeds directly into resume generation

### LaTeX-Based Resume Generation
- **Template Management**: Create and store custom LaTeX resume templates
- **PDF Compilation**: Templates are compiled to PDF via an external LaTeX service
- **Built-in Jake Template**: Generate a polished PDF from your master profile using a pre-built LaTeX template
- **Cover Letter Templates**: Template system supports both resumes and cover letters

### Dashboard
- **Activity Calendar**: GitHub-style heatmap of your application activity
- **Application Stats**: At-a-glance count of tracked jobs and documents
- **Quick Actions**: Fast access to upload resumes or view documents

## Tech Stack

### Frontend
- **Next.js 15** — App Router with React 19
- **TypeScript** — end-to-end type safety
- **Tailwind CSS 4** — utility-first styling
- **shadcn/ui + Radix UI** — accessible component primitives
- **Lucide Icons** — consistent icon set
- **@dnd-kit** — drag-and-drop for Kanban board
- **@tanstack/react-table** — table view

### Backend & AI
- **Next.js Server Actions** — data mutations (colocated `actions.ts` files)
- **Next.js API Routes** — read-only data fetching
- **LangChain + OpenAI/OpenRouter** — resume data extraction agent
- **External LaTeX Service** — PDF compilation from LaTeX templates

### Database & Auth
- **Supabase** — PostgreSQL database, authentication, and file storage
- **Drizzle ORM** — type-safe database queries and migrations
- **Row Level Security** — database-level per-user data isolation

### Key Libraries
- **pdf-parse** / **mammoth** — PDF and DOCX text extraction
- **sonner** — toast notifications
- **next-themes** — dark/light mode
- **zod** — schema validation for AI-extracted data
- **react-pdf** — in-app PDF rendering

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase project (database, auth, storage)
- OpenAI API key or OpenRouter API key
- LaTeX service URL (for PDF compilation)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/prepify.git
cd prepify
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
DATABASE_URL=           # pooled connection
DIRECT_URL=             # direct connection for Drizzle migrations
OPENAI_API_KEY=         # or OPENROUTER_API_KEY
OPENAI_MODEL_NAME=      # defaults to gpt-4o-mini
LATEX_SERVICE_URL=      # external LaTeX compiler endpoint
NEXT_PUBLIC_APP_URL=    # your app URL
BRANDFETCH_CLIENT_ID=   # optional, for company logos
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
prepify/
├── src/
│   ├── app/
│   │   ├── (protected)/           # Authenticated routes
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── jobs/              # Job tracking (Kanban + Table)
│   │   │   ├── docs/              # Document management
│   │   │   ├── profile/           # Master profile
│   │   │   └── templates/         # LaTeX template management
│   │   ├── (public)/
│   │   │   └── landing/           # Marketing landing page
│   │   ├── api/                   # GET API routes
│   │   │   ├── applications/      # Job application data
│   │   │   ├── docs/              # Document listing + PDF generation
│   │   │   ├── templates/         # Template listing + compilation
│   │   │   ├── profile/           # Profile data
│   │   │   └── dashboard/         # Stats and calendar data
│   │   └── auth/                  # Login, signup, callback
│   ├── components/                # Shared React components
│   │   └── ui/                    # shadcn/ui components
│   ├── db/
│   │   ├── schema.ts              # Drizzle table definitions
│   │   ├── auth.ts                # getAuthUserId() utility
│   │   └── relations.ts           # Drizzle relations
│   ├── lib/
│   │   ├── agents/
│   │   │   └── resumeDataExtractor.ts  # LangChain extraction agent
│   │   ├── textExtraction.ts      # PDF/DOCX parsing
│   │   └── utils.ts               # cn() and shared utilities
│   ├── adapters/
│   │   └── jobAdapters.ts         # DB row ↔ UI type transforms
│   ├── hooks/                     # Custom React hooks
│   └── types/                     # Shared TypeScript types
└── supabase/
    └── migrations/                # Drizzle-generated SQL migrations
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `jobApplications` | Core job tracking — links to columns, resumes, cover letters |
| `columns` | User-defined Kanban board columns |
| `resumes` | Uploaded resume files + AI-extracted structured data (JSONB) |
| `coverLetters` | Uploaded cover letter files |
| `templates` | User-created LaTeX templates (resume or cover letter) |
| `userProfiles` | Master profile data (JSONB, sourced from resumes or manual input) |

## Data Flow

**Mutations** use Server Actions (`actions.ts` colocated with each route):
```
Client → Server Action → Drizzle → Supabase (PostgreSQL) → revalidatePath()
```

**Reads** use API routes:
```
Client → fetch() → GET /api/... → Drizzle → Supabase → JSON response
```

**Resume upload & AI extraction:**
```
POST /api/docs → Supabase Storage upload → DB insert → after() background job
  → ResumeDataExtractor agent → structured JSON → resumes.resumeData (JSONB)
```

**LaTeX PDF generation:**
```
Profile data / template content → LaTeX string → POST to LATEX_SERVICE_URL → PDF binary
```

## Development Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Authentication & Security

- **Supabase Auth** — email/password authentication
- **Middleware** — refreshes session on every request (`src/middleware.ts`)
- **Row Level Security** — all tables enforce per-user access at the database level
- **`getAuthUserId()`** — called first in every server action and API route

## Deployment

```bash
npm run build
npm start
```

Required environment variables must be set in your deployment environment. Recommended platforms: **Vercel** (optimized for Next.js), Netlify, or any Node.js host.

---

## License

MIT
