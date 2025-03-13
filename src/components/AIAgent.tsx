
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mistral } from '@mistralai/mistralai';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, Sparkles, User, Mic, MicOff, Loader2, ThumbsUp, ThumbsDown, RefreshCw, FileText, Copy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Custom type definitions for Mistral API responses
interface ContentChunk {
  type: string;
  text: string;
  [key: string]: any;
}

interface ChatMessage {
  role: string;
  content: string | ContentChunk[];
  timestamp?: Date;
  feedback?: 'positive' | 'negative' | null;
  id?: string; // Unique identifier for each message
  isContentGeneration?: boolean; // Flag for content generation messages
}

// Mistral API specific message types
type MistralRole = "system" | "user" | "assistant" | "tool";

interface MistralMessage {
  role: MistralRole;
  content: string;
}

// Content types and tone options are kept for reference in the system prompt
const contentTypes = [
  'blog post', 'article', 'social media post', 'email', 
  'product description', 'ad copy', 'press release', 
  'newsletter', 'website copy'
];

const toneOptions = [
  'professional', 'conversational', 'enthusiastic', 
  'informative', 'persuasive', 'humorous', 
  'formal', 'friendly'
];

const client = new Mistral({ 
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY 
});

const AIAgent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Althor AI, your advanced content writing assistant. I can help you create engaging blog posts, articles, social media content, emails, and more. Just describe what you need or use the voice command button to speak your request.",
      timestamp: new Date(),
      id: 'welcome-message',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true); // New state to control auto-scrolling
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Scroll to bottom of messages only when autoScroll is true
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, autoScroll]);

  // Generate a unique ID for messages
  const generateMessageId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Convert our ChatMessage array to Mistral API compatible format
  const prepareMessagesForAPI = (messageHistory: ChatMessage[], newMessage: string): MistralMessage[] => {
    // Add system message to guide the AI toward content writing
    const systemMessage: MistralMessage = {
      role: 'system' as MistralRole,
      content: `You are Althor AI, an advanced content writing assistant. Your goal is to create high-quality, engaging content based on the user's requirements. 
      Focus on being creative, clear, and tailored to the specified audience and purpose.
      You can create various types of content including: ${contentTypes.join(', ')}.
      You can write in different tones such as: ${toneOptions.join(', ')}.
      When the user asks for content, provide complete, ready-to-use content that requires minimal editing.
      Always maintain a helpful, professional tone and provide thoughtful responses.`
    };
    
    const apiMessages: MistralMessage[] = [systemMessage];
    
    // Add conversation history
    messageHistory.forEach(msg => {
      if (msg.role !== 'system') {
        apiMessages.push({
          role: msg.role as MistralRole,
          content: typeof msg.content === 'string' 
            ? msg.content 
            : msg.content.map(chunk => {
                if (typeof chunk === 'string') return chunk;
                return chunk.text || '';
              }).join(' ')
        });
      }
    });
    
    // Add new message
    apiMessages.push({
      role: 'user' as MistralRole,
      content: newMessage,
    });
    
    return apiMessages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Disable auto-scrolling when send button is clicked
    setAutoScroll(false);
    
    // Check if this is a content generation request
    const isContentRequest = detectContentRequest(input);
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      id: generateMessageId(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsThinking(true);
    
    try {
      // Prepare conversation history for the API
      const apiMessages = prepareMessagesForAPI(messages, input);
      
      // If it's a content request, add more specific instructions
      if (isContentRequest) {
        apiMessages[0].content += ' Structure it appropriately for the content type requested.';
      }
      
      // Call Mistral API
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: apiMessages,
      });
      
      // Extract response content
      const messageContent = response.choices[0].message.content;
      let content: string;
      
      if (typeof messageContent === 'string') {
        content = messageContent;
      } else {
        content = messageContent.map(chunk => {
          if (typeof chunk === 'string') {
            return chunk;
          } else if (chunk.type === 'text') {
            return chunk.text;
          }
          return '';
        }).join(' ');
      }
      
      // Add assistant response to messages
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        id: generateMessageId(),
        isContentGeneration: isContentRequest,
      };
      
      setIsThinking(false);
      setMessages(prev => [...prev, assistantMessage]);
      
      // If it was a content request, show a success toast
      if (isContentRequest) {
        toast.success('Content generated successfully! You can copy it or provide feedback.');
      }
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      toast.error('Failed to get a response. Please try again.');
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Detect if the user is requesting content generation
  const detectContentRequest = (userInput: string): boolean => {
    const contentKeywords = [
      'write', 'create', 'generate', 'draft', 'compose', 'blog post', 'article', 
      'social media', 'content', 'copy', 'text', 'email', 'newsletter', 'post'
    ];
    
    const lowercaseInput = userInput.toLowerCase();
    return contentKeywords.some(keyword => lowercaseInput.includes(keyword));
  };

  const processVoiceInput = async (transcribedText: string) => {
    if (!transcribedText.trim()) {
      toast.error('No speech detected. Please try again.');
      return;
    }
    
    // Set the transcribed text as input
    setInput(transcribedText);
    
    // Disable auto-scrolling for voice commands too
    setAutoScroll(false);
    
    // Automatically submit the form
    const userMessage: ChatMessage = {
      role: 'user',
      content: transcribedText,
      timestamp: new Date(),
      id: generateMessageId(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsThinking(true);
    
    try {
      // Prepare conversation history for the API
      const apiMessages = prepareMessagesForAPI(messages, transcribedText);
      
      // Check if this is a content generation request
      const isContentRequest = detectContentRequest(transcribedText);
      
      // If it's a content request, add more specific instructions
      if (isContentRequest) {
        apiMessages[0].content += ' Structure it appropriately for the content type requested.';
      }
      
      // Call Mistral API
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: apiMessages,
      });
      
      // Extract response content
      const messageContent = response.choices[0].message.content;
      let content: string;
      
      if (typeof messageContent === 'string') {
        content = messageContent;
      } else {
        content = messageContent.map(chunk => {
          if (typeof chunk === 'string') {
            return chunk;
          } else if (chunk.type === 'text') {
            return chunk.text;
          }
          return '';
        }).join(' ');
      }
      
      // Add assistant response to messages
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        id: generateMessageId(),
        isContentGeneration: isContentRequest,
      };
      
      setIsThinking(false);
      setMessages(prev => [...prev, assistantMessage]);
      
      // If it was a content request, show a success toast
      if (isContentRequest) {
        toast.success('Content generated successfully! You can copy it or provide feedback.');
      }
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      toast.error('Failed to get a response. Please try again.');
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceCommand = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsProcessingVoice(true);
        
        try {
          // Process the voice command using Eleven Labs
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');
          formData.append('model_id', 'eleven_multilingual_v2');

          const transcriptionResponse = await axios.post(
            'https://api.elevenlabs.io/v1/speech-to-text',
            formData,
            {
              headers: {
                'xi-api-key': import.meta.env.VITE_ELEVEN_LABS_API_KEY,
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const transcribedText = transcriptionResponse.data.text;
          await processVoiceInput(transcribedText);
          
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast.error('Failed to process voice command. Please try again.');
        } finally {
          setIsProcessingVoice(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Listening... Speak your content request');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceCommand = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Handle feedback for a message
  const handleFeedback = async (messageId: string, feedbackType: 'positive' | 'negative') => {
    // Update the message with feedback
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback: feedbackType } 
          : msg
      )
    );

    // If negative feedback, offer to regenerate
    if (feedbackType === 'negative') {
      toast.error('Sorry about that. Would you like me to try again?', {
        action: {
          label: 'Regenerate',
          onClick: () => regenerateResponse(messageId),
        },
      });
    } else {
      toast.success('Thanks for your feedback!');
    }
  };

  // Regenerate a response based on the previous context
  const regenerateResponse = async (messageId: string) => {
    // Find the message and its corresponding user query
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex <= 0 || messages[messageIndex].role !== 'assistant') {
      toast.error('Cannot regenerate this response.');
      return;
    }

    // Get the user message that prompted this response
    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') {
      toast.error('Cannot find the corresponding user query.');
      return;
    }

    setIsRegenerating(true);
    setRegeneratingMessageId(messageId);
    setIsThinking(true);

    try {
      // Prepare conversation history up to the user message
      const conversationHistory = messages.slice(0, messageIndex - 1);
      const apiMessages = prepareMessagesForAPI(
        conversationHistory, 
        typeof userMessage.content === 'string' 
          ? userMessage.content 
          : userMessage.content.map(chunk => {
              if (typeof chunk === 'string') return chunk;
              return chunk.text || '';
            }).join(' ')
      );

      // Check if this was a content generation message
      const isContentMessage = messages[messageIndex].isContentGeneration;
      
      // Add a system message to improve the response
      if (isContentMessage) {
        apiMessages[0].content = 'You are Althor AI, an advanced content writing assistant. The previous content was not satisfactory. Please create a completely new version that is more engaging, well-structured, and better addresses the user\'s requirements. Focus on quality, creativity, and relevance.';
      } else {
        apiMessages.unshift({
          role: 'system' as MistralRole,
          content: 'You are Althor AI. The previous response was not satisfactory. Please provide a more helpful, accurate, and comprehensive answer.',
        });
      }

      // Call Mistral API for a new response
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: apiMessages,
      });

      // Extract response content
      const messageContent = response.choices[0].message.content;
      let content: string;
      
      if (typeof messageContent === 'string') {
        content = messageContent;
      } else {
        content = messageContent.map(chunk => {
          if (typeof chunk === 'string') {
            return chunk;
          } else if (chunk.type === 'text') {
            return chunk.text;
          }
          return '';
        }).join(' ');
      }

      // Replace the old assistant message with the new one
      const newAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        id: generateMessageId(),
        isContentGeneration: isContentMessage,
      };

      setIsThinking(false);
      setMessages(prev => [
        ...prev.slice(0, messageIndex),
        newAssistantMessage,
        ...prev.slice(messageIndex + 1)
      ]);

      toast.success('Content regenerated successfully.');
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast.error('Failed to regenerate the response. Please try again.');
      setIsThinking(false);
    } finally {
      setIsRegenerating(false);
      setRegeneratingMessageId(null);
    }
  };

  // Helper function to extract plain text content from a message
  const getMessageContent = (message: ChatMessage): string => {
    return typeof message.content === 'string'
      ? message.content
      : message.content.map(chunk => {
          if (typeof chunk === 'string') return chunk;
          return chunk.text || '';
        }).join(' ');
  };

  // Copy content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast.success('Content copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy content.');
      }
    );
  };

  // Control scrolling behavior
  const enableAutoScroll = () => {
    setAutoScroll(true);
    // Immediately scroll to bottom when enabled
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] w-full max-w-5xl mx-auto p-4 bg-gradient-to-b from-background to-background/80">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-xl tracking-tight">Althor AI Agent</h3>
          <p className="text-sm text-muted-foreground">Advanced content creation & assistance</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary">Powered by Mistral AI</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              "flex gap-4 p-5 rounded-xl shadow-sm transition-all duration-200",
              message.role === 'assistant'
                ? message.isContentGeneration 
                  ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50" 
                  : "bg-muted/50 border border-muted"
                : "bg-primary/5 border border-primary/10"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
              message.role === 'assistant' 
                ? message.isContentGeneration
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : "bg-muted"
                : "bg-primary/10"
            )}>
              {message.role === 'assistant' ? (
                message.isContentGeneration ? (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Bot className="w-5 h-5 text-primary" />
                )
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                message.isContentGeneration && "whitespace-pre-wrap font-mono text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner"
              )}>
                {typeof message.content === 'string' 
                  ? message.content 
                  : message.content.map((chunk, i) => 
                      typeof chunk === 'string' 
                        ? chunk 
                        : chunk.text || ''
                    ).join(' ')
                }
              </div>
              <div className="flex items-center justify-between mt-3">
                {message.timestamp && (
                  <div className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
                
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    {isRegenerating && regeneratingMessageId === message.id ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Regenerating...</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-7 px-2 text-xs gap-1.5",
                            message.isContentGeneration 
                              ? "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-950/50"
                              : "text-muted-foreground"
                          )}
                          onClick={() => copyToClipboard(getMessageContent(message))}
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </Button>
                        <div className="flex bg-muted/30 rounded-full p-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-7 w-7 rounded-full", 
                              message.feedback === 'positive' ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" : ""
                            )}
                            onClick={() => handleFeedback(message.id!, 'positive')}
                            disabled={!!message.feedback || isRegenerating}
                            title="Helpful"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-7 w-7 rounded-full", 
                              message.feedback === 'negative' ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" : ""
                            )}
                            onClick={() => handleFeedback(message.id!, 'negative')}
                            disabled={!!message.feedback || isRegenerating}
                            title="Not helpful"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {message.feedback === 'negative' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1.5"
                            onClick={() => regenerateResponse(message.id!)}
                            disabled={isRegenerating}
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Regenerate</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Smaller Thinking/Writing indicator */}
        {isThinking && (
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-background/80 shadow-sm text-xs animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-medium text-primary">
                {detectContentRequest(messages[messages.length - 1]?.content?.toString() || '') 
                  ? "Writing..." 
                  : "Thinking..."}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Auto-scroll control button - appears when auto-scroll is disabled */}
      {!autoScroll && (
        <div className="flex justify-center mb-3">
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs flex items-center gap-1.5"
            onClick={enableAutoScroll}
          >
            <RefreshCw className="h-3 w-3" />
            <span>Scroll to Bottom</span>
          </Button>
        </div>
      )}
      
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Althor AI to create content or answer questions..."
              className="resize-none pr-10 py-3 min-h-[60px] border-primary/20 focus-visible:ring-primary/30 shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-2 bottom-2 h-8 w-8 text-muted-foreground hover:text-black dark:hover:text-white"
              onClick={isRecording ? stopVoiceCommand : startVoiceCommand}
              disabled={isLoading || isProcessingVoice || isRegenerating}
            >
              {isProcessingVoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button 
            type="submit" 
            className="h-[60px] px-4 bg-primary hover:bg-primary/90"
            disabled={!input.trim() || isLoading || isRegenerating}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                <span>Send</span>
              </>
            )}
          </Button>
        </form>
        {isRecording && (
          <div className="absolute -top-10 left-0 right-0 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm py-2 px-3 rounded-md border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Recording... Speak your request clearly
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgent;
