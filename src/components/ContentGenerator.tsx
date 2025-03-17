import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mistral } from '@mistralai/mistralai';

import ContentForm from './ContentForm';
import ContentDisplay from './ContentDisplay';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Mic, MicOff, Loader2, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

interface FormData {
  topic: string;
  contentType: string;
  tone: string;
  keywords: string;
  additionalInfo: string;
}

// Custom type definitions for API responses
interface ContentChunk {
  type: string;
  text: string;
  [key: string]: any;
}

interface ChatMessage {
  role: string;
  content: string | ContentChunk[];
}

interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// AI Model configuration interface
interface AIModelConfig {
  provider: string;
  model: string;
  apiKey: string;
  useCustomKey: boolean;
}

// Available AI models by provider
const availableModels = {
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large (Latest)' },
    { id: 'mistral-medium', name: 'Mistral Medium' },
    { id: 'mistral-small', name: 'Mistral Small' },
  ],
  openai: [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
  ],
};

// Default Mistral client
const getDefaultMistralClient = () => {
  return new Mistral({ 
    apiKey: import.meta.env.VITE_MISTRAL_API_KEY 
  });
};

const generateContentWithMistralAI = async (formData: FormData, modelConfig: AIModelConfig): Promise<string> => {
  // Construct prompt based on content type and requirements
  const prompt = `Generate a ${formData.contentType} about ${formData.topic} in a ${formData.tone} tone.${
    formData.keywords ? ` Include these keywords: ${formData.keywords}.` : ''
  }${
    formData.additionalInfo ? ` Additional context: ${formData.additionalInfo}` : ''
  }`;

  try {
    // Use custom API key if provided
    const client = modelConfig.useCustomKey && modelConfig.apiKey 
      ? new Mistral({ apiKey: modelConfig.apiKey }) 
      : getDefaultMistralClient();

    // Call Mistral API
    const response = await client.chat.complete({
      model: modelConfig.model,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract and return generated content
    const messageContent = response.choices[0].message.content;
    
    // Handle the case where content might be a string or an array
    let content: string;
    if (typeof messageContent === 'string') {
      content = messageContent;
    } else {
      // If it's an array of content chunks, join them
      content = messageContent.map(chunk => {
        if (typeof chunk === 'string') {
          return chunk;
        } else if (chunk.type === 'text') {
          return chunk.text;
        }
        return '';
      }).join(' ');
    }

    return content;
  } catch (error) {
    console.error('Error with Mistral API:', error);
    throw new Error(`Mistral API error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const generateContentWithOpenAI = async (formData: FormData, modelConfig: AIModelConfig): Promise<string> => {
  // Construct prompt based on content type and requirements
  const prompt = `Generate a ${formData.contentType} about ${formData.topic} in a ${formData.tone} tone.${
    formData.keywords ? ` Include these keywords: ${formData.keywords}.` : ''
  }${
    formData.additionalInfo ? ` Additional context: ${formData.additionalInfo}` : ''
  }`;

  try {
    // Require API key for OpenAI
    if (!modelConfig.apiKey) {
      throw new Error('API key is required for OpenAI models');
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: modelConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelConfig.apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`OpenAI API error: ${error.response.data.error?.message || error.message}`);
    }
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const generateContentWithAnthropic = async (formData: FormData, modelConfig: AIModelConfig): Promise<string> => {
  // Construct prompt based on content type and requirements
  const prompt = `Generate a ${formData.contentType} about ${formData.topic} in a ${formData.tone} tone.${
    formData.keywords ? ` Include these keywords: ${formData.keywords}.` : ''
  }${
    formData.additionalInfo ? ` Additional context: ${formData.additionalInfo}` : ''
  }`;

  try {
    // Require API key for Anthropic
    if (!modelConfig.apiKey) {
      throw new Error('API key is required for Anthropic models');
    }

    // Call Anthropic API with the correct format
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: modelConfig.model,
        max_tokens: 1000,
        system: "You are a helpful content generation assistant.",
        messages: [
          { role: 'user', content: prompt }
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': modelConfig.apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    // Extract the content from the response
    if (response.data.content && response.data.content.length > 0) {
      return response.data.content[0].text;
    }
    
    throw new Error('No content returned from Anthropic API');
  } catch (error) {
    console.error('Error with Anthropic API:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Anthropic API error: ${error.response.data.error?.message || error.message}`);
    }
    throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Function to process voice commands using Eleven Labs API
const processVoiceCommand = async (audioBlob: Blob, modelConfig: AIModelConfig): Promise<FormData> => {
  try {
    // First, transcribe the audio using Eleven Labs
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

    // Use the selected AI model to parse the command
    let parsedContent = '';
    
    if (modelConfig.provider === 'mistral') {
      try {
        // Use custom API key if provided
        const client = modelConfig.useCustomKey && modelConfig.apiKey 
          ? new Mistral({ apiKey: modelConfig.apiKey }) 
          : getDefaultMistralClient();
          
        const parseResponse = await client.chat.complete({
          model: modelConfig.model,
          messages: [
            { 
              role: 'system', 
              content: `You are a helpful assistant that extracts content generation parameters from voice commands. 
              Extract the following information: topic, content type, tone, keywords, and additional information.
              Return ONLY a JSON object with these fields. If a field is not mentioned, leave it as an empty string or use default values.
              Default content type is "blog-post" and default tone is "professional".`
            },
            { role: 'user', content: transcribedText }
          ],
        });

        // Extract content from response
        const messageContent = parseResponse.choices[0].message.content;
        
        if (typeof messageContent === 'string') {
          parsedContent = messageContent;
        } else {
          parsedContent = messageContent.map(chunk => {
            if (typeof chunk === 'string') {
              return chunk;
            } else if (chunk.type === 'text') {
              return chunk.text;
            }
            return '';
          }).join(' ');
        }
      } catch (error) {
        console.error('Error parsing with Mistral:', error);
        throw error;
      }
    } else if (modelConfig.provider === 'openai') {
      try {
        // Require API key for OpenAI
        if (!modelConfig.apiKey) {
          throw new Error('API key is required for OpenAI models');
        }

        const parseResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: modelConfig.model,
            messages: [
              { 
                role: 'system', 
                content: `You are a helpful assistant that extracts content generation parameters from voice commands. 
                Extract the following information: topic, content type, tone, keywords, and additional information.
                Return ONLY a JSON object with these fields. If a field is not mentioned, leave it as an empty string or use default values.
                Default content type is "blog-post" and default tone is "professional".`
              },
              { role: 'user', content: transcribedText }
            ],
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${modelConfig.apiKey}`,
            },
          }
        );
        
        parsedContent = parseResponse.data.choices[0].message.content;
      } catch (error) {
        console.error('Error parsing with OpenAI:', error);
        throw error;
      }
    } else if (modelConfig.provider === 'anthropic') {
      try {
        // Require API key for Anthropic
        if (!modelConfig.apiKey) {
          throw new Error('API key is required for Anthropic models');
        }

        const parseResponse = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: modelConfig.model,
            max_tokens: 1000,
            system: "You are a helpful assistant that extracts content generation parameters from voice commands.",
            messages: [
              { 
                role: 'user', 
                content: `Extract the following information from this transcribed text: "${transcribedText}"
                
                Extract: topic, content type, tone, keywords, and additional information.
                Return ONLY a JSON object with these fields. If a field is not mentioned, leave it as an empty string or use default values.
                Default content type is "blog-post" and default tone is "professional".`
              }
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': modelConfig.apiKey,
              'anthropic-version': '2023-06-01',
            },
          }
        );
        
        if (parseResponse.data.content && parseResponse.data.content.length > 0) {
          parsedContent = parseResponse.data.content[0].text;
        } else {
          throw new Error('No content returned from Anthropic API');
        }
      } catch (error) {
        console.error('Error parsing with Anthropic:', error);
        throw error;
      }
    }
    
    let extractedData: FormData;
    
    try {
      extractedData = JSON.parse(parsedContent);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      // If parsing fails, use a simpler approach to extract data
      extractedData = {
        topic: transcribedText,
        contentType: 'blog-post',
        tone: 'professional',
        keywords: '',
        additionalInfo: ''
      };
    }

    return {
      topic: extractedData.topic || '',
      contentType: extractedData.contentType || 'blog-post',
      tone: extractedData.tone || 'professional',
      keywords: extractedData.keywords || '',
      additionalInfo: extractedData.additionalInfo || ''
    };
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw error;
  }
};

const ContentGenerator: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // AI Model configuration
  const [modelConfig, setModelConfig] = useState<AIModelConfig>({
    provider: 'mistral',
    model: 'mistral-large-latest',
    apiKey: '',
    useCustomKey: false
  });
  
  // References for voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load saved model config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('aiModelConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setModelConfig(parsedConfig);
      } catch (e) {
        console.error('Error parsing saved model config:', e);
      }
    }
  }, []);

  // Save model config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiModelConfig', JSON.stringify(modelConfig));
  }, [modelConfig]);

  const handleGenerate = async (formData: FormData) => {
    setIsGenerating(true);
    try {
      // Validate API key for non-Mistral providers
      if (modelConfig.provider !== 'mistral' && !modelConfig.apiKey) {
        throw new Error(`API key is required for ${modelConfig.provider} models`);
      }

      let content = '';
      
      // Generate content based on selected provider
      if (modelConfig.provider === 'mistral') {
        content = await generateContentWithMistralAI(formData, modelConfig);
      } else if (modelConfig.provider === 'openai') {
        content = await generateContentWithOpenAI(formData, modelConfig);
      } else if (modelConfig.provider === 'anthropic') {
        content = await generateContentWithAnthropic(formData, modelConfig);
      }
      
      setGeneratedContent(content);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate content: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoiceCommand = async () => {
    try {
      // Validate API key for non-Mistral providers
      if (modelConfig.provider !== 'mistral' && !modelConfig.apiKey) {
        throw new Error(`API key is required for ${modelConfig.provider} models`);
      }

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
          // Process the voice command
          const extractedFormData = await processVoiceCommand(audioBlob, modelConfig);
          toast.success('Voice command processed successfully');
          
          // Automatically generate content with the extracted data
          await handleGenerate(extractedFormData);
        } catch (error) {
          console.error('Error processing voice command:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to process voice command: ${errorMessage}`);
        } finally {
          setIsProcessingVoice(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Could not access microphone: ${errorMessage}`);
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

  const handleProviderChange = (provider: string) => {
    // Set default model for the selected provider
    const defaultModel = availableModels[provider as keyof typeof availableModels][0].id;
    
    // For non-Mistral providers, always require custom API key
    const useCustomKey = provider !== 'mistral';
    
    setModelConfig({
      ...modelConfig,
      provider,
      model: defaultModel,
      useCustomKey
    });
  };

  const handleSaveSettings = () => {
    // Validate API key for non-Mistral providers
    if (modelConfig.provider !== 'mistral' && !modelConfig.apiKey) {
      toast.error(`API key is required for ${modelConfig.provider} models`);
      return;
    }
    
    setSettingsOpen(false);
    toast.success('AI model settings saved');
  };

  // Determine if API key input should be disabled
  const isApiKeyInputDisabled = modelConfig.provider === 'mistral' && !modelConfig.useCustomKey;

  return (
    <section id="generator" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Generate Your Content
            </h2>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">AI Model Settings</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Configure the AI model settings for optimal content generation.
                  </DialogDescription>

                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="provider" className="text-right font-medium">
                      Select AI Provider
                    </Label>

                    <Select
                      value={modelConfig.provider}
                      onValueChange={handleProviderChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mistral">Mistral AI (Default)</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="model" className="text-right font-medium">
                      Select AI Model
                    </Label>

                    <Select
                      value={modelConfig.model}
                      onValueChange={(value) => setModelConfig({...modelConfig, model: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels[modelConfig.provider as keyof typeof availableModels].map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {modelConfig.provider === 'mistral' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="useCustomKey" className="text-right font-medium">
                      Enable Custom API Key
                    </Label>

                      <div className="col-span-3">
                        <Switch
                          id="useCustomKey"
                          checked={modelConfig.useCustomKey}
                          onCheckedChange={(checked) => setModelConfig({...modelConfig, useCustomKey: checked})}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="apiKey" className="text-right font-medium">
                      API Key
                      {modelConfig.provider !== 'mistral' && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please enter your API key for the selected provider.
                    </p>

                    <Input
                      id="apiKey"
                      type="password"
                      value={modelConfig.apiKey}
                      onChange={(e) => setModelConfig({...modelConfig, apiKey: e.target.value})}
                      className="col-span-3"
                      placeholder={`Enter your ${modelConfig.provider} API key`}
                      disabled={isApiKeyInputDisabled}
                      required={modelConfig.provider !== 'mistral'}
                    />
                  </div>
                  
                  {modelConfig.provider !== 'mistral' && (
                    <p className="text-sm text-red-500 col-span-4 text-right">
                      * API key is required for {modelConfig.provider} models
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSaveSettings}>
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Provide some details about what you want to create, and our AI will generate high-quality content for you in seconds.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              onClick={isRecording ? stopVoiceCommand : startVoiceCommand}
              disabled={isProcessingVoice || isGenerating}
              className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              {isProcessingVoice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing voice...
                </>
              ) : isRecording ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Voice Command
                </>
              )}
            </Button>
            <div className="text-sm text-muted-foreground">
              Using: {availableModels[modelConfig.provider as keyof typeof availableModels].find(m => m.id === modelConfig.model)?.name || modelConfig.model}
              {modelConfig.provider !== 'mistral' && !modelConfig.apiKey && (
                <span className="text-red-500 ml-1">(API key required)</span>
              )}
            </div>
          </div>
          {isRecording && (
            <p className="text-sm text-red-500 mt-2">
              Recording... Speak your content requirements clearly
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <ContentForm onGenerate={handleGenerate} isGenerating={isGenerating || isProcessingVoice} />
          <ContentDisplay 
            content={generatedContent} 
            isGenerating={isGenerating || isProcessingVoice}
            className="bg-black text-white p-4 rounded-md" 
          />
        </div>
      </div>
    </section>
  );
};

export default ContentGenerator;
