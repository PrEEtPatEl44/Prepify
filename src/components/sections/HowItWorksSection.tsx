import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Search, MessageCircle, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
}

const steps = [
  {
    number: '01',
    title: 'Upload',
    description: 'Add your resume and paste the job description.',
    icon: Upload,
  },
  {
    number: '02',
    title: 'Review',
    description: 'Get a score, keyword gaps, and quick fixes.',
    icon: Search,
  },
  {
    number: '03',
    title: 'Practice',
    description: 'Run mock interviews and track your progress.',
    icon: MessageCircle,
  },
];

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLElement>(null);
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
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.03) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Three steps to a
            <br />
            <span className="text-primary">stronger application.</span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="bg-card rounded-3xl p-8 h-full border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 group">
                {/* Number Circle */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <step.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>

                {/* Step Number */}
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Step {step.number}
                </div>

                {/* Title */}
                <h3 
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div 
          className={`text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <Button
            size="lg"
            onClick={() => onNavigate('signup')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base font-medium rounded-full hover:scale-105 transition-all duration-300"
          >
            Get started for free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
