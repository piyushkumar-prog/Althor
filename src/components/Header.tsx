
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Set initial visibility with slight delay for entrance animation
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' 
          : 'bg-transparent py-5'
      } ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="text-primary text-2xl font-bold transition-transform duration-300 group-hover:scale-105">WriteWise</span>
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm flex items-center">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            AI
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Generator', 'About'].map((item, index) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
              style={{
                transitionDelay: `${index * 100}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              {item}
            </a>
          ))}
          
          <div className="flex items-center gap-2 transition-all duration-500" 
            style={{
              transitionDelay: '300ms',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
            }}>
            <Button size="sm" variant="outline" className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10">
              Sign In
            </Button>
            <Button size="sm" className="shadow-md hover:shadow-lg hover:shadow-primary/20">
              Get Started
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground p-2 transition-opacity duration-300 hover:text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          style={{
            opacity: isVisible ? 1 : 0,
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-border transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <a 
            href="#features" 
            className="text-foreground/80 hover:text-primary py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#generator" 
            className="text-foreground/80 hover:text-primary py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Generator
          </a>
          <a 
            href="#" 
            className="text-foreground/80 hover:text-primary py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </a>
          <div className="flex flex-col gap-3 pt-3">
            <Button variant="outline" size="sm" className="w-full">
              Sign In
            </Button>
            <Button size="sm" className="w-full">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
