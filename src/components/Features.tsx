
import { useEffect, useRef, useState } from 'react';
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
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll animations for feature cards
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

    // Track scroll position for parallax effects
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Set up scroll-triggered animations
    const scrollElements = document.querySelectorAll('.reveal-on-scroll');
    
    const elementInView = (el: Element, scrollOffset = 100) => {
      const elementTop = el.getBoundingClientRect().top;
      return (elementTop <= window.innerHeight - scrollOffset);
    };
    
    const displayScrollElement = (element: Element) => {
      element.classList.add('visible');
    };
    
    const hideScrollElement = (element: Element) => {
      element.classList.remove('visible');
    };
    
    const handleScrollAnimation = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 100)) {
          displayScrollElement(el);
        } else {
          hideScrollElement(el);
        }
      });
    };
    
    // Initial check on load
    handleScrollAnimation();
    window.addEventListener('scroll', handleScrollAnimation);

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, rgba(15, 15, 15, 0.8) 0%, rgba(25, 25, 25, 0.9) 100%)`,
      }}
    >
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 70% 30%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)`,
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />
      
      {/* Moving particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.3,
              animation: `fadeInOut ${5 + Math.random() * 5}s infinite alternate, 
                          floatAround ${20 + Math.random() * 10}s infinite alternate`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Powerful Features
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/50 rounded-full transform scale-x-50 transition-transform duration-500 group-hover:scale-x-100"></span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4 reveal-on-scroll">
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
              className="feature-card bg-secondary/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/5 opacity-0 transform translate-y-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                transitionDelay: `${feature.delay}ms`,
                transform: `translateY(${8 + Math.sin(scrollY * 0.005 + index) * 5}px)`,
              }}
            >
              <div className="mb-4 bg-primary/20 text-primary inline-flex p-3 rounded-lg">
                <feature.icon size={24} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
              
              {/* Animated corner accent */}
              <div className="absolute w-8 h-8 top-0 right-0">
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 origin-top-right rotate-45 bg-primary/20 transform -translate-y-full translate-x-full group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated divider */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent" />

      <style>{`
        .feature-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
};

export default Features;
