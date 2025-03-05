
import { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Feather, 
  Search, 
  Download, 
  Gauge, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Content Generation',
    description: 'Create engaging articles, blog posts, social media captions, essays and more with our advanced AI technology.',
    icon: Sparkles,
    delay: 100
  },
  {
    title: 'Grammar & Style Suggestions',
    description: 'Get real-time grammar and style recommendations to polish your content to perfection.',
    icon: Feather,
    delay: 200
  },
  {
    title: 'SEO Optimization',
    description: 'Optimize your content for search engines with keyword analysis and readability improvements.',
    icon: Search,
    delay: 300
  },
  {
    title: 'Export & Save',
    description: 'Save your work to your account or export as PDF, Word, or HTML for immediate use.',
    icon: Download,
    delay: 400
  },
  {
    title: 'Fast & Efficient',
    description: 'Generate high-quality content in seconds, saving you hours of writing and editing time.',
    icon: Gauge,
    delay: 500
  },
  {
    title: 'Secure & Private',
    description: 'Your content and data remain private and secure with our state-of-the-art security measures.',
    icon: ShieldCheck,
    delay: 600
  }
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add visible class to all feature cards with staggered delay
            const featureCards = document.querySelectorAll('.feature-card');
            featureCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('is-visible');
              }, 100 * index);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Powerful Features
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/50 rounded-full transform scale-x-50 transition-transform duration-500 group-hover:scale-x-100"></span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to create outstanding content that engages your audience and drives results.
          </p>
        </div>

        <div 
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 opacity-0 transform translate-y-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className="mb-4 bg-primary/10 text-primary inline-flex p-3 rounded-lg">
                <feature.icon size={24} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .feature-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default Features;
