import { useState, useRef } from 'react';
import axios from 'axios';
import { Mistral } from '@mistralai/mistralai';

import ContentForm from './ContentForm';
import ContentDisplay from './ContentDisplay';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface FormData {
  topic: string;
  contentType: string;
  tone: string;
  keywords: string;
  additionalInfo: string;
}

// Custom type definitions for Mistral API responses
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

const client = new Mistral({ 
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY 
});

const generateContentWithMistralAI = async (formData: FormData): Promise<string> => {
  // Construct prompt based on content type and requirements
  const prompt = `Generate a ${formData.contentType} about ${formData.topic} in a ${formData.tone} tone.${
    formData.keywords ? ` Include these keywords: ${formData.keywords}.` : ''
  }${
    formData.additionalInfo ? ` Additional context: ${formData.additionalInfo}` : ''
  }`;

  // Call Mistral API
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
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
};

// Function to process voice commands using Eleven Labs API
const processVoiceCommand = async (audioBlob: Blob): Promise<FormData> => {
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

    // Now use Mistral to parse the command into structured form data
    const parseResponse = await client.chat.complete({
      model: 'mistral-large-latest',
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

    // Parse the response to get structured form data
    const messageContent = parseResponse.choices[0].message.content;
    let parsedContent: string;
    
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
    
    let extractedData: FormData;
    
    try {
      extractedData = JSON.parse(parsedContent);
    } catch (e) {
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
  
  // References for voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleGenerate = async (formData: FormData) => {
    setIsGenerating(true);
    try {
      const content = await generateContentWithMistralAI(formData);
      setGeneratedContent(content);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
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
          // Process the voice command
          const extractedFormData = await processVoiceCommand(audioBlob);
          toast.success('Voice command processed successfully');
          
          // Automatically generate content with the extracted data
          await handleGenerate(extractedFormData);
        } catch (error) {
          console.error('Error processing voice command:', error);
          toast.error('Failed to process voice command. Please try again.');
        } finally {
          setIsProcessingVoice(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
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

  return (
    <section id="generator" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Generate Your Content
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Provide some details about what you want to create, and our AI will generate high-quality content for you in seconds.
          </p>
          <div className="mt-4">
            <Button
              onClick={isRecording ? stopVoiceCommand : startVoiceCommand}
              disabled={isProcessingVoice || isGenerating}
              className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : ''} mx-auto`}
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
            {isRecording && (
              <p className="text-sm text-red-500 mt-2">
                Recording... Speak your content requirements clearly
              </p>
            )}
          </div>
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