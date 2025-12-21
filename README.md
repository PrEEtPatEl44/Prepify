# Prepify 🚀

> Your AI-powered career preparation platform for job applications and interview success

Prepify is a comprehensive career preparation platform that leverages AI agents to help job seekers optimize their resumes, track job applications, and prepare for interviews. Built with Next.js 15 and powered by LangChain agents, Prepify provides intelligent analysis and personalized recommendations to improve your chances of landing your dream job.

## ✨ Features

### 📄 Resume Analysis
- **AI-Powered Resume Scoring**: Upload your resume and get it analyzed against specific job descriptions
- **Comprehensive Scoring System**: 
  - Keyword matching analysis (40% weight)
  - Holistic evaluation (60% weight)
  - Detailed breakdown of strengths and areas for improvement
- **Smart Recommendations**: Get actionable suggestions to improve your resume for specific roles
- **Multi-Format Support**: Supports PDF and DOCX resume formats

### 💼 Job Application Tracking
- **Job Management Dashboard**: Keep track of all your job applications in one place
- **Kanban Board View**: Visualize your application pipeline with drag-and-drop functionality
- **List & Table Views**: Multiple ways to organize and view your job applications
- **Custom Statuses**: Track applications through stages like Applied, Interview, Offer, etc.
- **Resume Linking**: Associate specific resumes with each job application

### 🎤 Interview Preparation
- **Customized Interview Questions**: AI-generated interview questions based on:
  - Your resume
  - The job description
  - Your preferred difficulty level (beginner, intermediate, advanced, expert)
  - Question type (technical, behavioral, or mixed)
- **Job Analysis**: Get insights into key skills required and focus areas for your interview
- **Question Customization**: Control the number and type of questions generated
- **Interactive Practice**: Practice answering questions and track your progress

### 📊 Dashboard & Analytics
- **Activity Calendar**: Track your daily activity and progress
- **Statistics Overview**: View counts of jobs tracked and interviews prepared
- **Document Management**: Organize and access your resumes and cover letters
- **Quick Actions**: Easy access to upload resumes, find jobs, and prepare interviews

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Modern utility-first CSS
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful & consistent icons

### Backend & AI
- **LangChain**: Multi-agent orchestration framework
- **OpenAI/OpenRouter**: LLM integration for intelligent analysis
- **Supabase**: Authentication and database
- **Next.js API Routes**: Serverless backend functions

### Key Libraries
- **@tanstack/react-table**: Advanced table functionality
- **@dnd-kit**: Drag-and-drop interactions
- **react-pdf**: PDF rendering
- **mammoth**: DOCX parsing
- **zod**: Schema validation
- **sonner**: Toast notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager
- Supabase account (for authentication & database)
- OpenAI API key or OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/prepify.git
cd prepify
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI/OpenRouter Configuration (choose one)
OPENAI_API_KEY=your_openai_api_key
# OR
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL_NAME=openai/gpt-4o-mini

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
prepify/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── resume-analysis/    # Resume analysis endpoints
│   │   │   ├── interview/          # Interview generation endpoints
│   │   │   ├── jobs/               # Job management endpoints
│   │   │   └── ...
│   │   ├── auth/              # Authentication pages
│   │   ├── jobs/              # Job tracking pages
│   │   ├── interview/         # Interview preparation pages
│   │   └── docs/              # Document management pages
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── modals/           # Modal dialogs
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   │   ├── agents/           # LangChain AI agents
│   │   │   ├── orchestrator.ts           # Resume analysis orchestrator
│   │   │   ├── keywordExtractor.ts       # Keyword extraction agent
│   │   │   ├── keywordComparator.ts      # Keyword comparison agent
│   │   │   ├── holisticComparator.ts     # Holistic analysis agent
│   │   │   └── interview-agents/         # Interview preparation agents
│   │   └── services/         # Business logic services
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🤖 AI Agents Architecture

Prepify uses a multi-agent system powered by LangChain for intelligent analysis:

### Resume Analysis System

1. **Keyword Extractor Agent**: Extracts relevant keywords from resumes and job descriptions
   - Technical skills
   - Soft skills
   - Experience keywords
   - Education keywords
   - Industry terms

2. **Keyword Comparator Agent**: Compares keywords between resume and job description
   - Identifies matching keywords
   - Finds missing important keywords
   - Calculates keyword match score
   - Provides keyword insights

3. **Holistic Comparator Agent**: Performs comprehensive analysis
   - Experience match evaluation
   - Qualification alignment
   - Cultural fit assessment
   - Career trajectory analysis
   - Overall scoring (0-100)

4. **Resume Analysis Orchestrator**: Coordinates all agents
   - Orchestrates the analysis workflow
   - Combines scores (40% keywords, 60% holistic)
   - Generates actionable recommendations
   - Produces comprehensive analysis reports

### Interview Preparation System

1. **Job Analysis Agent**: Analyzes job requirements and candidate background
   - Identifies key skills required
   - Summarizes candidate experience
   - Determines interview focus areas

2. **Question Generator Agent**: Creates customized interview questions
   - Generates questions based on difficulty level
   - Creates technical, behavioral, or mixed question sets
   - Customizable question count
   - Context-aware question generation

3. **Interview Orchestrator**: Manages the interview preparation workflow
   - Coordinates job analysis and question generation
   - Provides interview preparation summary
   - Generates metadata for tracking

## 🔐 Authentication & Security

- **Supabase Authentication**: Secure user authentication with email/password
- **Session Management**: Server-side session handling with middleware
- **Row Level Security**: Database-level security policies
- **Protected Routes**: Automatic redirect for unauthenticated users

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `users`: User profiles and settings
- `resumes`: Resume files and metadata
- `jobs`: Job applications tracking
- `interviews`: Interview preparation data
- `documents`: General document storage

## 🎨 UI/UX Features

- **Dark/Light Mode**: Theme switching support
- **Responsive Design**: Mobile-first, works on all devices
- **Drag & Drop**: Intuitive file upload and kanban board
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: Real-time feedback
- **Accessible Components**: WCAG compliant UI elements

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

Ensure all production environment variables are configured:
- Supabase production credentials
- API keys (OpenAI/OpenRouter)
- Production URL

### Recommended Platforms
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Alternative deployment option
- **AWS/GCP**: Self-hosted options

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [LangChain](https://langchain.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Authentication by [Supabase](https://supabase.com/)

## 📧 Contact & Support

For questions, issues, or suggestions:
- Open an issue on GitHub

---

Made with ❤️ by the Prepify Team
