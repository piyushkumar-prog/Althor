import { useState } from 'react';
import axios from 'axios';
import { Mistral } from '@mistralai/mistralai';

import ContentForm from './ContentForm';
import ContentDisplay from './ContentDisplay';
import { toast } from 'sonner';

interface FormData {
  topic: string;
  contentType: string;
  tone: string;
  keywords: string;
  additionalInfo: string;
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
  const content = Array.isArray(response.choices[0].message.content) 
    ? response.choices[0].message.content.join(' ')
    : response.choices[0].message.content;

  return content;
};

const ContentGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <ContentForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          <ContentDisplay 
            content={generatedContent} 
            isGenerating={isGenerating}
            className="bg-black text-white p-4 rounded-md" 
          />
        </div>
      </div>
    </section>
  );
};

export default ContentGenerator;
