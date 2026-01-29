import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Prepify" className="h-8 w-8" />
          <span className="text-xl font-bold font-[family-name:var(--font-archivo)]">
            Prepify
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-[#636AE8] px-4 py-2 text-sm font-medium text-white hover:bg-[#636AE8]/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight font-[family-name:var(--font-archivo)] max-w-2xl">
          Your AI-powered job search companion
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          Analyze resumes, prepare for interviews, and track applications — all
          in one place.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/auth/signup"
            className="rounded-md bg-[#636AE8] px-6 py-3 text-sm font-medium text-white hover:bg-[#636AE8]/90 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Log in
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="rounded-lg border border-border p-6 text-left">
            <h3 className="font-semibold mb-2">Resume Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Score your resume against job descriptions with AI-powered keyword
              and holistic analysis.
            </p>
          </div>
          <div className="rounded-lg border border-border p-6 text-left">
            <h3 className="font-semibold mb-2">Interview Prep</h3>
            <p className="text-sm text-muted-foreground">
              Generate tailored interview questions and get real-time feedback on
              your answers.
            </p>
          </div>
          <div className="rounded-lg border border-border p-6 text-left">
            <h3 className="font-semibold mb-2">Job Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Manage applications with kanban boards, lists, and tables to stay
              organized.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Prepify
      </footer>
    </div>
  );
}
