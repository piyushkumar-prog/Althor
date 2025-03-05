
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Trigger animation after component mount
    setIsVisible(true);
    
    // Track scroll position for parallax effects
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Background elements with parallax effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/20 to-transparent pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.3,
              animation: `pulse ${3 + Math.random() * 4}s infinite alternate`,
              transform: `translateY(${scrollY * (0.02 + i * 0.001) * (i % 2 === 0 ? 1 : -1)}px)`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Animated background circles with parallax effect */}
      <div 
        className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"
        style={{ transform: `translate3d(${scrollY * -0.05}px, ${scrollY * 0.02}px, 0)` }}
      />
      <div 
        className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" 
        style={{ 
          animationDelay: '1s',
          transform: `translate3d(${scrollY * 0.05}px, ${scrollY * -0.02}px, 0)` 
        }}
      />
      
      {/* Abstract geometric shapes */}
      <div 
        className="absolute top-32 right-1/4 w-32 h-32 border border-primary/20 rounded-lg opacity-30"
        style={{ 
          transform: `rotate(${45 + scrollY * 0.05}deg) translate3d(${scrollY * 0.03}px, ${scrollY * -0.02}px, 0)` 
        }}
      />
      <div 
        className="absolute bottom-1/3 left-1/4 w-24 h-24 border border-primary/20 rounded-full opacity-20"
        style={{ 
          transform: `translate3d(${scrollY * -0.03}px, ${scrollY * 0.02}px, 0)` 
        }}
      />
      
      {/* Content container */}
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Tag with animated reveal */}
          <div className={`transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <Sparkles className="inline-block w-4 h-4 mr-2 animate-pulse" />
              AI-Powered Writing Assistant
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Craft Perfect Content with{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                AI Precision
                <svg 
                  className="absolute -bottom-1 left-0 w-full h-2 text-primary/30" 
                  viewBox="0 0 100 20" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: `translateY(${scrollY * 0.05}px)` }}
                >
                  <path d="M0,17.5 C30,2.5 70,2.5 100,17.5 L100,0 L0,0 L0,17.5" fill="currentColor"/>
                </svg>
              </span>
              <span className="inline-block w-3 h-8 border-r-2 border-primary ml-1 animate-blink"></span>
            </h1>
          </div>
          
          {/* Subtitle with animated reveal */}
          <div className={`transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Generate high-quality articles, blog posts, essays, and more with our advanced AI writing assistant. Save time, boost creativity, and deliver content that resonates.
            </p>
          </div>
          
          {/* CTA buttons with animated reveal */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <Button size="lg" className="px-8 font-medium shadow-lg hover:shadow-primary/20 group bg-primary text-primary-foreground relative overflow-hidden" asChild>
              <a href="#generator" className="group">
                <span className="relative z-10">Try Now</span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 relative z-10 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 font-medium backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 relative overflow-hidden group"
            >
              <span className="relative z-10">Learn More</span>
              <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator with parallax effect */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-20 hidden md:block"
          style={{ transform: `translate(-50%, ${20 + scrollY * 0.1}px)` }}
        >
          <a 
            href="#features" 
            className="flex flex-col items-center text-foreground/60 hover:text-primary transition-colors"
            aria-label="Scroll down"
          >
            <span className="text-xs font-medium mb-2">Discover Features</span>
            <ArrowDown size={18} className="animate-bounce" />
          </a>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
