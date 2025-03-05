
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ContentGenerator from '@/components/ContentGenerator';
import Footer from '@/components/Footer';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay before showing the content for a smoother experience
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    // Set dark mode class on the document
    document.documentElement.classList.add('dark');

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} dark`}>
      <Header />
      
      <main>
        <Hero />
        <Features />
        <ContentGenerator />
      </main>
      
      <Footer />
      
      {/* Decorative floating elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1]">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-primary/10 blur-3xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              opacity: 0.3,
              animationDuration: `${15 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 5}s`,
              animationIterationCount: 'infinite',
              animationName: 'floatUp',
              animationTimingFunction: 'ease-in-out'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
