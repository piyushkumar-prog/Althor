
import { useState } from 'react';
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

// Mock content generation for demonstration
const generateMockContent = (formData: FormData): Promise<string> => {
  const contentTypes: Record<string, string> = {
    'blog-post': 'Blog Post',
    'article': 'Article',
    'social-media': 'Social Media Post',
    'email': 'Email',
    'product-description': 'Product Description',
    'essay': 'Essay'
  };

  const tones: Record<string, string> = {
    'professional': 'Professional',
    'conversational': 'Conversational',
    'enthusiastic': 'Enthusiastic',
    'informative': 'Informative',
    'formal': 'Formal',
    'humorous': 'Humorous'
  };

  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const contentType = contentTypes[formData.contentType] || 'Content';
      const tone = tones[formData.tone] || 'professional';
      const keywords = formData.keywords ? `incorporating keywords like ${formData.keywords}` : '';
      
      const title = formData.topic.charAt(0).toUpperCase() + formData.topic.slice(1);
      
      let content = '';
      
      // Different templates based on content type
      if (formData.contentType === 'blog-post' || formData.contentType === 'article') {
        content = `# ${title}\n\n`;
        content += `## Introduction\n\n`;
        content += `Welcome to this ${tone.toLowerCase()} exploration of ${formData.topic}. `;
        content += `This ${contentType.toLowerCase()} will provide valuable insights and information ${keywords ? keywords : 'on this topic'}.\n\n`;
        
        content += `## Main Points\n\n`;
        content += `1. The importance of understanding ${formData.topic}\n`;
        content += `2. Key strategies for implementing best practices\n`;
        content += `3. Future trends and developments to watch\n\n`;
        
        content += `## Detailed Analysis\n\n`;
        content += `When examining ${formData.topic} in detail, several important factors come into play. `;
        content += `First, it's essential to recognize the fundamental principles that govern this area. `;
        content += `Experts in the field consistently emphasize the need for a comprehensive approach.\n\n`;
        
        content += `## Conclusion\n\n`;
        content += `In summary, ${formData.topic} represents a significant area of interest with wide-ranging implications. `;
        content += `By adopting the strategies outlined in this ${contentType.toLowerCase()}, you can effectively navigate the complexities `;
        content += `and achieve superior results. Continue to stay informed on emerging developments to maintain a competitive edge.`;
      } else if (formData.contentType === 'social-media') {
        content = `📱 ${title} 📱\n\n`;
        content += `Did you know that understanding ${formData.topic} can transform your approach? `;
        content += `${formData.keywords ? 'Key focus: ' + formData.keywords : ''}\n\n`;
        content += `Check out our latest insights on this topic! Link in bio.\n\n`;
        content += `#${formData.topic.replace(/\s+/g, '')} #TrendingNow #MustRead`;
      } else if (formData.contentType === 'email') {
        content = `Subject: Important Updates About ${title}\n\n`;
        content += `Dear Valued Customer,\n\n`;
        content += `I hope this email finds you well. I wanted to share some important information about ${formData.topic}.\n\n`;
        content += `We've recently compiled new research that indicates significant developments in this area. `;
        content += `These findings suggest that a proactive approach will yield the best results going forward.\n\n`;
        content += `Please don't hesitate to reach out if you have any questions or would like to discuss this further.\n\n`;
        content += `Best regards,\n`;
        content += `The WriteWise Team`;
      } else {
        content = `${title}\n\n`;
        content += `This ${tone.toLowerCase()} ${contentType.toLowerCase()} explores the various aspects of ${formData.topic}. `;
        content += `${formData.keywords ? 'Key elements include ' + formData.keywords + '.' : ''}\n\n`;
        content += `When considering ${formData.topic}, it's important to examine both the theoretical foundations and practical applications. `;
        content += `Experts in this field have documented numerous approaches, each with their own merits and limitations.\n\n`;
        content += `By understanding these concepts fully, you'll be better equipped to make informed decisions and achieve optimal outcomes.`;
      }
      
      // Add additional info if provided
      if (formData.additionalInfo) {
        content += `\n\n## Additional Context\n\n`;
        content += `${formData.additionalInfo}`;
      }
      
      resolve(content);
    }, 2000);
  });
};

const ContentGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (formData: FormData) => {
    setIsGenerating(true);
    try {
      // In a real app, this would be an API call to an AI service
      const content = await generateMockContent(formData);
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
          <ContentDisplay content={generatedContent} isGenerating={isGenerating} />
        </div>
      </div>
    </section>
  );
};

export default ContentGenerator;
