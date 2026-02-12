import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '3 resume scans / month',
      '1 practice interview / week',
      'Basic job tracker',
      'Email support',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious job seekers',
    features: [
      'Unlimited resume scans',
      'Unlimited practice interviews',
      'Advanced tracker + reminders',
      'Priority support',
      'Export reports',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
];

export const PricingSection: React.FC<PricingSectionProps> = ({ onNavigate }) => {
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
      id="pricing"
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.03) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
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
            Simple pricing.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready to move faster.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div 
                className={`relative rounded-3xl p-8 h-full border transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted 
                    ? 'bg-card border-primary/30 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15' 
                    : 'bg-card border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  {plan.name}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span 
                    className="text-5xl font-bold"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-8">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full h-12 rounded-full font-medium transition-all duration-300 hover:scale-[1.02] ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                  onClick={() => onNavigate('signup')}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
