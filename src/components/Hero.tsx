
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mount
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      {/* Content container */}
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main heading with animated reveal */}
          <div className={`transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              AI-Powered Writing Assistant
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Craft Perfect Content with{' '}
              <span className="text-primary relative">
                AI Precision
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-primary/30" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,17.5 C30,2.5 70,2.5 100,17.5 L100,0 L0,0 L0,17.5" fill="currentColor"/>
                </svg>
              </span>
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
            <Button size="lg" className="px-8 font-medium" asChild>
              <a href="#generator">Try Now</a>
            </Button>
            <Button size="lg" variant="outline" className="px-8 font-medium">
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-20 hidden md:block">
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
    </section>
  );
};

export default Hero;
