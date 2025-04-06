
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ContentGenerator from '@/components/ContentGenerator';
import Footer from '@/components/Footer';
import AIAgent from '@/components/AIAgent';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Add a small delay before showing the content for a smoother experience
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    // Set dark mode class on the document
    document.documentElement.classList.add('dark');

    // Add scroll listener
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} dark`}>
      <Header />
      
      <main>
        <Hero />
        <Features />
        <div id="generator" className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-6">Experience the Power of AI</h2>
        </div>
        <ContentGenerator />
      </main>
      
      <Footer />
      
      {/* Enhanced floating elements with parallax effect */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1]">
        {/* Animated glowing orbs */}
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-primary/10 blur-3xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 300}px`,
              height: `${100 + Math.random() * 300}px`,
              opacity: 0.3 - (scrollY * 0.0003) * (i % 3 === 0 ? -1 : 1),
              transform: `translateY(${scrollY * (0.05 + i * 0.01) * (i % 2 === 0 ? 1 : -1)}px)`,
              animationDuration: `${15 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              animationIterationCount: 'infinite',
              animationName: i % 2 === 0 ? 'floatUp' : 'floatAround',
              animationTimingFunction: 'ease-in-out'
            }}
          />
        ))}
        
        {/* Grid background - subtle matrix effect */}
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />
        
        {/* Top gradient overlay */}
        <div 
          className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-background to-transparent"
          style={{
            opacity: 0.8 - (scrollY * 0.001)
          }}
        />
        
        {/* Animated dots constellation */}
        <div className="constellation">
          {[...Array(20)].map((_, i) => (
            <div
              key={`dot-${i}`}
              className="dot"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `translateY(${scrollY * (0.03 + i * 0.005) * (i % 2 === 0 ? 1 : -1)}px)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div 
        className="fixed top-0 left-0 h-1 bg-primary z-50"
        style={{
          width: `${(scrollY / (document.body.scrollHeight - window.innerHeight)) * 100}%`,
          opacity: scrollY > 20 ? 1 : 0,
          transition: 'opacity 0.3s, width 0.1s'
        }}
      />
    </div>
  );
};

export default Index;
