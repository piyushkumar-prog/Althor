import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mistral } from '@mistralai/mistralai'; // New import

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const AIAgent = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string, thinking?: boolean}>>([
    {type: 'ai', content: "👋 Hi there! I'm Althor, your AI assistant. How can I help you today?"}
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Mistral API key');
  }
  const client = new Mistral({ apiKey });

  const fetchAIResponse = async (prompt: string) => {
    setIsThinking(true);
    setMessages(prevMessages => [
        ...prevMessages,
        { type: 'ai', content: '', thinking: true }
    ]);

    try {
        const chatResponse = await client.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
        });

const aiResponse = Array.isArray(chatResponse.choices[0].message.content) 
    ? chatResponse.choices[0].message.content.join(' ') 
    : chatResponse.choices[0].message.content; // Adjusted response handling


        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages.pop(); // Remove thinking message
            newMessages.push({ type: 'ai', content: aiResponse });
            return newMessages;
        });
    } catch (error) {
        console.error('Error fetching AI response:', error);
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages.pop(); // Remove thinking message
            newMessages.push({ type: 'ai', content: 'Sorry, I could not fetch a response at this time.' });
            return newMessages;
        });
    } finally {
        setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately
    setMessages(prevMessages => [
      ...prevMessages, 
      {type: 'user', content: userMessage}
    ]);
    
    // Fetch AI response
    fetchAIResponse(userMessage);
  };

  return (
    <div className="glass-card rounded-xl p-4 md:p-6 relative overflow-hidden w-full max-w-4xl mx-auto mt-10 mb-10 border border-primary/10">
      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-around ${10 + Math.random() * 15}s infinite linear`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Chat header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-primary/10">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Althor AI Assistant</h3>
          <p className="text-sm text-muted-foreground">Ask me anything!</p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-primary">Online</span>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex flex-col gap-4 mb-4 max-h-[400px] overflow-y-auto p-2">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={cn(
              "flex gap-3 animate-fade-in",
              message.type === 'user' ? "flex-row-reverse self-end" : ""
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              message.type === 'user' 
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary/20 text-primary"
            )}>
              {message.type === 'user' 
                ? <User className="w-4 h-4" />
                : <Bot className="w-4 h-4" />
              }
            </div>
            
            <div className={cn(
              "relative max-w-[80%] px-4 py-2 rounded-xl",
              message.type === 'user'
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-secondary text-secondary-foreground rounded-tl-none"
            )}>
              {message.thinking ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-10 shrink-0"
          disabled={!input.trim() || isThinking}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default AIAgent;
