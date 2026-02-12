import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I finally understand why my resume wasn't getting callbacks. The keyword comparison is chef's kiss.",
    name: 'Alex R.',
    role: 'Product Designer',
    initials: 'AR',
    color: 'from-violet-500 to-violet-600',
  },
  {
    quote: "The interview practice actually feels like a real conversation. I walked into my onsite calm and prepared.",
    name: 'Priya M.',
    role: 'Software Engineer',
    initials: 'PM',
    color: 'from-pink-500 to-pink-600',
  },
  {
    quote: "No more spreadsheet tabs. I track everything in Prepify and actually enjoy the process.",
    name: 'Jordan T.',
    role: 'Marketing Lead',
    initials: 'JT',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export const TestimonialsSection: React.FC = () => {
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
            background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--prepify-violet) / 0.03) 0%, transparent 50%)',
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
            Loved by job seekers.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From new grads to career switchers—Prepify keeps the search sane.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="bg-card rounded-3xl p-8 h-full border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-primary/30" />
                </div>

                {/* Quote Text */}
                <p className="text-lg leading-relaxed mb-8">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold shadow-lg`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
