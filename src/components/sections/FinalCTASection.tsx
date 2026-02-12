import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FinalCTASectionProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onNavigate }) => {
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
      { threshold: 0.2, rootMargin: '-50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[70vh] w-full overflow-hidden flex items-center justify-center py-24"
    >
      {/* Dark background with subtle gradients */}
      <div className="absolute inset-0 bg-[#0B0B10]">
        {/* Subtle gradient orbs */}
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--prepify-violet)) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', lineHeight: 1.05 }}
          >
            Ready to land your
            <br />
            <span className="text-primary">next role?</span>
          </h2>
        </div>
        
        <div 
          className={`transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto mb-10">
            Join thousands of job seekers using Prepify to apply smarter, practice harder, and stay organized.
          </p>
        </div>
        
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
            onClick={() => {
              const element = document.getElementById('pricing');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="h-14 px-8 text-lg font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            View pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
