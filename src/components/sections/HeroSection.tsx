import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Modern Sleek Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Animated gradient orbs - subtle and elegant */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-20">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--prepify-violet) / 0.5) 0%, transparent 70%)',
              filter: 'blur(100px)',
              animation: 'float 10s ease-in-out infinite reverse',
            }}
          />
        </div>
        
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] opacity-15">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--prepify-mint) / 0.4) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'float 12s ease-in-out infinite',
            }}
          />
        </div>
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium">AI-Powered Career Platform</span>
        </div>
        
        {/* Headline */}
        <h1 
          className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ 
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            lineHeight: 0.95,
          }}
        >
          Your AI career
          <br />
          <span className="relative">
            <span className="text-primary">co-pilot</span>
            <svg 
              className="absolute -bottom-2 left-0 w-full" 
              height="8" 
              viewBox="0 0 200 8" 
              fill="none"
              preserveAspectRatio="none"
            >
              <path 
                d="M2 6C50 2 150 2 198 6" 
                stroke="hsl(var(--primary))" 
                strokeWidth="3" 
                strokeLinecap="round"
                className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: isVisible ? 0 : 200,
                  transition: 'stroke-dashoffset 1s ease-out 0.5s',
                }}
              />
            </svg>
          </span>
        </h1>
        
        {/* Subheadline */}
        <p 
          className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Prepify scores your resume, generates interview questions, and keeps your job search organized—so you can focus on landing the role.
        </p>
        
        {/* CTAs */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Button
            size="lg"
            onClick={() => onNavigate('signup')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg font-medium rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={scrollToFeatures}
            className="h-14 px-8 text-lg font-medium hover:bg-primary/5 transition-all duration-300"
          >
            See how it works
          </Button>
        </div>

        {/* Stats */}
        <div 
          className={`flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-border/30 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '100K+', label: 'Resumes Scored' },
            { value: '85%', label: 'Success Rate' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className="text-2xl sm:text-3xl font-bold text-primary"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/60 flex flex-col items-center gap-2 cursor-pointer hover:text-primary transition-colors"
        onClick={scrollToFeatures}
      >
        <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(-5px, 5px); }
          75% { transform: translate(5px, 10px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
