
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center">
              WriteWise
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium ml-2">
                AI
              </span>
            </h3>
            <p className="text-foreground/70 mb-4">
              AI-powered content generation for modern creators and businesses.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">API</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Guides</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Support</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">API Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/70 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} WriteWise. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              <a href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-foreground/50 text-sm flex items-center justify-center">
            Made with <Heart size={14} className="mx-1 text-red-500" /> for creative writers everywhere
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
