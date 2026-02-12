import { useEffect, useRef, useState } from 'react';

const faqs = [
  {
    question: 'Is my data private?',
    answer: 'Yes. Your resume and job details are encrypted and never used to train models.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. Pro is month-to-month—cancel in one click.',
  },
  {
    question: 'What file types are supported?',
    answer: 'PDF and DOCX. More formats coming soon.',
  },
  {
    question: 'Do I need to write my own answers?',
    answer: 'Prepify suggests sample answers, but you\'re in control—edit them to sound like you.',
  },
];

export const FAQSection: React.FC = () => {
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
            background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--prepify-mint) / 0.03) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
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
            Questions? Answers.
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-300">
                <h3 className="font-semibold text-lg mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
