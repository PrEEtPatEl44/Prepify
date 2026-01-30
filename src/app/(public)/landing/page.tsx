import Link from "next/link";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Prepify" className="h-8 w-8" />
            <span className="text-xl font-bold font-[family-name:var(--font-archivo)]">
              Prepify
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#ai-agents" className="hover:text-foreground transition-colors">AI Agents</a>
          </nav>
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#636AE8]/5 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative">
            <p className="text-sm font-medium text-[#636AE8] mb-4">AI-Powered Career Preparation</p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-[family-name:var(--font-archivo)] max-w-3xl mx-auto leading-tight">
              Your AI-powered job search companion
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Score your resume with dual AI analysis, practice with personalized interview questions,
              and track every application from Applied to Offer — all in one platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="rounded-md bg-[#636AE8] px-8 py-3 text-sm font-medium text-white hover:bg-[#636AE8]/90 transition-colors shadow-lg shadow-[#636AE8]/25"
              >
                Get Started — It&apos;s Free
              </Link>
              <a
                href="#how-it-works"
                className="rounded-md border border-border px-8 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">No credit card required</p>

            {/* Dashboard mockup */}
            <div className="mt-16 max-w-4xl mx-auto rounded-xl border border-border bg-card shadow-2xl shadow-black/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="ml-2 text-xs text-muted-foreground">Prepify Dashboard</span>
              </div>
              <div className="p-8 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Resume Score</div>
                  <div className="text-2xl font-bold text-[#636AE8]">87/100</div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[87%] rounded-full bg-[#636AE8]" />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Applications</div>
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-green-600 mt-1">+5 this week</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Interviews</div>
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-muted-foreground mt-1">3 upcoming</div>
                </div>
                <div className="col-span-2 rounded-lg bg-muted/50 p-4 h-24">
                  <div className="text-xs text-muted-foreground mb-2">Activity Calendar</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: `color-mix(in oklch, #636AE8 ${Math.random() > 0.4 ? Math.floor(Math.random() * 80 + 20) : 5}%, transparent)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 h-24">
                  <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
                  <div className="space-y-1">
                    <div className="text-xs rounded bg-[#636AE8]/10 text-[#636AE8] px-2 py-1">+ New Application</div>
                    <div className="text-xs rounded bg-[#636AE8]/10 text-[#636AE8] px-2 py-1">Upload Resume</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center font-[family-name:var(--font-archivo)]">
              How It Works
            </h2>
            <p className="text-center text-muted-foreground mt-3 max-w-lg mx-auto">
              Three simple steps to accelerate your job search
            </p>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-border" />

              {[
                {
                  step: "1",
                  title: "Upload Your Resume",
                  desc: "Upload your resume in PDF or DOCX format and paste the job description you're targeting.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  ),
                },
                {
                  step: "2",
                  title: "AI Analyzes & Scores",
                  desc: "Our multi-agent AI pipeline scores your resume with keyword matching and holistic evaluation.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  ),
                },
                {
                  step: "3",
                  title: "Prep & Track",
                  desc: "Get tailored interview questions, practice with AI feedback, and track all your applications.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-[#636AE8]/10 flex items-center justify-center text-[#636AE8] relative z-10">
                    {item.icon}
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-6 h-6 rounded-full bg-[#636AE8] text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <h3 className="mt-6 font-semibold text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Deep-Dive */}
        <section id="features" className="py-24 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center font-[family-name:var(--font-archivo)]">
              Everything You Need to Land the Job
            </h2>
            <p className="text-center text-muted-foreground mt-3 max-w-lg mx-auto">
              Powerful tools designed to give you an unfair advantage
            </p>

            <div className="mt-20 space-y-24">
              {/* Resume Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#636AE8]/10 px-3 py-1 text-xs font-medium text-[#636AE8] mb-4">
                    Resume Analysis
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
                    Dual AI Scoring System
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Get a comprehensive resume score powered by two complementary AI evaluations:
                    keyword matching (40%) identifies missing skills and technologies,
                    while holistic analysis (60%) evaluates your experience, qualifications, and cultural fit.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {["PDF & DOCX support", "Keyword gap identification", "Actionable improvement recommendations", "Score breakdown by category"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <CheckIcon className="w-4 h-4 text-[#636AE8] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="text-sm font-medium mb-4">Resume Score Breakdown</div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Keyword Match (40%)</span>
                        <span className="font-medium">82%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[82%] rounded-full bg-[#636AE8]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Holistic Evaluation (60%)</span>
                        <span className="font-medium">90%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[90%] rounded-full bg-[#636AE8]/70" />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <span className="font-medium">Overall Score</span>
                      <span className="text-2xl font-bold text-[#636AE8]">87/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Prep */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="text-sm font-medium mb-4">Generated Questions</div>
                  <div className="space-y-3">
                    {[
                      { type: "Technical", q: "Explain the difference between REST and GraphQL APIs.", difficulty: "Intermediate" },
                      { type: "Behavioral", q: "Describe a time you resolved a conflict in your team.", difficulty: "Beginner" },
                      { type: "Technical", q: "How would you design a rate-limiting system?", difficulty: "Expert" },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs rounded bg-[#636AE8]/10 text-[#636AE8] px-1.5 py-0.5">{item.type}</span>
                          <span className="text-xs text-muted-foreground">{item.difficulty}</span>
                        </div>
                        <p className="text-sm">{item.q}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#636AE8]/10 px-3 py-1 text-xs font-medium text-[#636AE8] mb-4">
                    Interview Prep
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
                    AI-Generated Interview Practice
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Practice with questions customized to the specific job you&apos;re applying for.
                    Choose your difficulty level from beginner to expert, select question types,
                    and get real-time AI feedback on your answers.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {["Beginner to Expert difficulty levels", "Technical, behavioral, and mixed questions", "Real-time AI feedback on answers", "Customized to job description"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <CheckIcon className="w-4 h-4 text-[#636AE8] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Job Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#636AE8]/10 px-3 py-1 text-xs font-medium text-[#636AE8] mb-4">
                    Job Tracking
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
                    Kanban Board & Multi-View Tracking
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Stay on top of every application with a drag-and-drop kanban board,
                    or switch to list and table views. Track applications through custom stages
                    from Applied to Interview to Offer, and link resumes to each application.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {["Drag-and-drop kanban board", "List and table views", "Custom status stages", "Resume linking per application"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <CheckIcon className="w-4 h-4 text-[#636AE8] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="text-sm font-medium mb-4">Application Pipeline</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { stage: "Applied", count: 12, color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
                      { stage: "Interview", count: 5, color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
                      { stage: "Offer", count: 2, color: "bg-green-500/20 text-green-700 dark:text-green-300" },
                      { stage: "Rejected", count: 5, color: "bg-red-500/20 text-red-700 dark:text-red-300" },
                    ].map((s) => (
                      <div key={s.stage} className="text-center">
                        <div className={`rounded-lg p-3 ${s.color}`}>
                          <div className="text-xl font-bold">{s.count}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{s.stage}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    {["Acme Corp — Frontend Engineer", "Globex Inc — Full Stack Dev", "Initech — React Developer"].map((app) => (
                      <div key={app} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <span>{app}</span>
                        <span className="text-xs text-muted-foreground">Interview</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Applications</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold text-[#636AE8]">87%</div>
                      <div className="text-xs text-muted-foreground mt-1">Avg Resume Score</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-xs text-muted-foreground mt-1">Interviews</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold">5</div>
                      <div className="text-xs text-muted-foreground mt-1">Documents</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#636AE8]/10 px-3 py-1 text-xs font-medium text-[#636AE8] mb-4">
                    Dashboard & Analytics
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
                    Your Job Search at a Glance
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    See your activity calendar, track statistics across all applications,
                    manage uploaded documents, and access quick actions — all from a single dashboard.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {["Activity calendar heatmap", "Statistics overview", "Document management", "Quick actions"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <CheckIcon className="w-4 h-4 text-[#636AE8] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Powered by AI Agents */}
        <section id="ai-agents" className="py-24 border-t border-border/50 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center font-[family-name:var(--font-archivo)]">
              Powered by AI Agents
            </h2>
            <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto">
              Not just a single prompt — Prepify uses a multi-agent AI pipeline where specialized agents
              collaborate to deliver accurate, actionable insights.
            </p>

            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-4">
              {[
                { name: "Keyword Extractor", desc: "Identifies skills & technologies from your resume and the job description" },
                { name: "Keyword Comparator", desc: "Matches and scores overlapping keywords with gap analysis" },
                { name: "Holistic Comparator", desc: "Evaluates experience, qualifications, and cultural fit" },
                { name: "Orchestrator", desc: "Coordinates agents and produces your final score & recommendations" },
              ].map((agent, i) => (
                <div key={agent.name} className="flex items-center gap-4">
                  <div className="w-48 rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-[#636AE8]/10 flex items-center justify-center text-[#636AE8] mx-auto mb-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold">{agent.name}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{agent.desc}</p>
                  </div>
                  {i < 3 && (
                    <svg className="w-5 h-5 text-muted-foreground shrink-0 hidden md:block" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center font-[family-name:var(--font-archivo)]">
              Results That Speak
            </h2>
            <p className="text-center text-muted-foreground mt-3">
              How Prepify helps job seekers stand out
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { stat: "+32%", label: "Avg resume score improvement", quote: "I went from barely getting callbacks to landing 3 interviews in a week." },
                { stat: "2.5x", label: "More interview invitations", quote: "The AI feedback on my answers helped me feel prepared and confident." },
                { stat: "85%", label: "Users report faster job search", quote: "Tracking everything in one place saved me hours every week." },
              ].map((item) => (
                <div key={item.stat} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="text-3xl font-bold text-[#636AE8]">{item.stat}</div>
                  <div className="text-sm font-medium mt-1">{item.label}</div>
                  <p className="text-sm text-muted-foreground mt-4 italic">&ldquo;{item.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 border-t border-border/50 bg-[#636AE8]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-archivo)]">
              Start preparing smarter today
            </h2>
            <p className="mt-4 text-white/80 text-lg">
              Join job seekers who use AI to land their dream roles faster.
            </p>
            <Link
              href="/auth/signup"
              className="mt-8 inline-block rounded-md bg-white text-[#636AE8] px-8 py-3 text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Prepify" className="h-6 w-6" />
              <span className="font-semibold font-[family-name:var(--font-archivo)]">Prepify</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Log in</Link>
              <Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign up</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Prepify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
