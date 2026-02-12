import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Layout, ArrowRight, CheckCircle } from 'lucide-react';

interface FeaturesSectionProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
}

interface FeatureCardProps {
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  visualContent: React.ReactNode;
  reverse?: boolean;
  onCtaClick: () => void;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  cta,
  icon,
  visualContent,
  reverse = false,
  onCtaClick,
  index,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative min-h-screen w-full flex items-center py-20"
    >
      {/* Subtle background accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: reverse 
            ? 'radial-gradient(ellipse at 20% 50%, hsl(var(--primary) / 0.03) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 80% 50%, hsl(var(--prepify-violet) / 0.03) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className={`relative z-10 w-full px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        {/* Text Content */}
        <div 
          className={`flex-1 max-w-xl ${reverse ? 'lg:text-right' : ''} transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${reverse ? 'translate-x-12' : '-translate-x-12'}`
          }`}
        >
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 ${reverse ? 'lg:flex-row-reverse' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {icon}
            <span className="text-sm font-medium">Feature {index + 1}</span>
          </div>
          
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.05 }}
          >
            {title}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>
          
          <Button
            onClick={onCtaClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 text-base font-medium rounded-full hover:scale-105 transition-all duration-300"
          >
            {cta}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Visual Content */}
        <div 
          className={`flex-1 flex justify-center transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0 scale-100' : `opacity-0 ${reverse ? '-translate-x-12' : 'translate-x-12'} scale-95`
          }`}
        >
          {visualContent}
        </div>
      </div>
    </div>
  );
};

// Resume Score Card Component
const ResumeScoreCard: React.FC = () => (
  <div className="bg-card rounded-3xl p-8 shadow-xl shadow-foreground/5 border border-border/50 w-full max-w-md hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500">
    <div className="text-center mb-8">
      <div 
        className="text-7xl font-bold text-primary mb-2"
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        88
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">Resume Score</div>
    </div>
    
    <div className="space-y-4">
      {[
        { label: 'Keyword match', value: 92 },
        { label: 'Experience fit', value: 85 },
        { label: 'Tone check', value: 88 },
      ].map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000"
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <CheckCircle className="w-4 h-4 text-primary" />
      <span>Analysis complete</span>
    </div>
  </div>
);

// Interview Card Component
const InterviewCard: React.FC = () => (
  <div className="bg-card rounded-3xl p-6 shadow-xl shadow-foreground/5 border border-border/50 w-full max-w-md hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500">
    <div className="flex items-center gap-2 mb-6">
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
        Technical
      </span>
      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
        Intermediate
      </span>
    </div>
    
    <h3 className="text-lg font-semibold mb-4 leading-relaxed">
      &ldquo;Describe a time when you had to optimize a slow-performing API endpoint. What was your approach?&rdquo;
    </h3>
    
    <div className="space-y-3 mb-6">
      {[
        'I analyzed the database queries and added indexes',
        'I implemented caching using Redis',
        'I refactored the code to use async processing',
      ].map((option, index) => (
        <div 
          key={index}
          className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all cursor-pointer group"
        >
          <span className="text-sm group-hover:text-primary transition-colors">{option}</span>
        </div>
      ))}
    </div>
    
    <div className="flex justify-end">
      <Button size="sm" className="bg-primary text-primary-foreground rounded-full px-6 hover:scale-105 transition-transform">
        Next
      </Button>
    </div>
  </div>
);

// Job Tracker Card Component
const JobTrackerCard: React.FC = () => (
  <div className="bg-card rounded-3xl p-6 shadow-xl shadow-foreground/5 border border-border/50 w-full max-w-md hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Layout className="w-5 h-5 text-primary" />
        <span className="font-semibold">Interview</span>
      </div>
      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
        3 jobs
      </span>
    </div>
    
    <div className="space-y-3">
      {[
        { company: 'Stripe', role: 'Senior Frontend Engineer', location: 'San Francisco', color: 'from-violet-500 to-violet-600' },
        { company: 'Notion', role: 'Product Designer', location: 'New York', color: 'from-pink-500 to-pink-600' },
        { company: 'Figma', role: 'Design Engineer', location: 'Remote', color: 'from-emerald-500 to-emerald-600' },
      ].map((job, index) => (
        <div 
          key={index}
          className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${job.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {job.company[0]}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm group-hover:text-primary transition-colors">{job.role}</div>
              <div className="text-xs text-muted-foreground">{job.company} • {job.location}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  return (
    <div id="features" className="relative">
      {/* Section header */}
      <div className="text-center py-20 px-6">
        <h2 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Everything you need to
          <span className="text-primary"> land the job</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Three powerful tools working together to supercharge your job search
        </p>
      </div>

      {/* Resume Feature */}
      <FeatureCard
        title="Resume scored in seconds."
        description="Upload your resume and a job description. Prepify compares keywords, experience, and tone—then gives you a clear score and actionable fixes."
        cta="Upload your resume"
        icon={<FileText className="w-4 h-4" />}
        visualContent={<ResumeScoreCard />}
        onCtaClick={() => onNavigate('signup')}
        index={0}
      />

      {/* Interview Feature */}
      <FeatureCard
        title="Practice interviews that feel real."
        description="Get AI-generated questions based on your resume and the job description. Choose your difficulty, review sample answers, and build confidence."
        cta="Start a practice round"
        icon={<MessageSquare className="w-4 h-4" />}
        visualContent={<InterviewCard />}
        reverse
        onCtaClick={() => onNavigate('signup')}
        index={1}
      />

      {/* Tracker Feature */}
      <FeatureCard
        title="Stay organized. Stay sane."
        description="Track every application, follow-up, and interview in one place. Drag, drop, and move jobs through your pipeline without the spreadsheet chaos."
        cta="Explore the tracker"
        icon={<Layout className="w-4 h-4" />}
        visualContent={<JobTrackerCard />}
        onCtaClick={() => onNavigate('signup')}
        index={2}
      />
    </div>
  );
};

export default FeaturesSection;
