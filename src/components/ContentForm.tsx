import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { toast } from 'sonner';

interface ContentFormProps {
  onGenerate: (formData: FormData) => void;
  isGenerating: boolean;
}

interface FormData {
  topic: string;
  contentType: string;
  tone: string;
  keywords: string;
  additionalInfo: string;
}

const ContentForm = ({ onGenerate, isGenerating }: ContentFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    contentType: 'blog-post',
    tone: 'professional',
    keywords: '',
    additionalInfo: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for your content');
      return;
    }
    
    onGenerate(formData);
  };

  const contentTypes = [
    { value: 'blog-post', label: 'Blog Post' },
    { value: 'article', label: 'Article' },
    { value: 'social-media', label: 'Social Media Post' },
    { value: 'email', label: 'Email' },
    { value: 'product-description', label: 'Product Description' },
    { value: 'essay', label: 'Essay' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'informative', label: 'Informative' },
    { value: 'formal', label: 'Formal' },
    { value: 'humorous', label: 'Humorous' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 rounded-xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Topic or Title
          </label>
          <Input
            id="topic"
            name="topic"
            placeholder="What topic do you want to write about?"
            value={formData.topic}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium mb-1">
              Content Type
            </label>
            <Select
              value={formData.contentType}
              onValueChange={(value) => handleSelectChange('contentType', value)}
            >
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium mb-1">
              Tone
            </label>
            <Select
              value={formData.tone}
              onValueChange={(value) => handleSelectChange('tone', value)}
            >
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium mb-1">
            Keywords (Optional)
          </label>
          <Input
            id="keywords"
            name="keywords"
            placeholder="Enter keywords separated by commas"
            value={formData.keywords}
            onChange={handleChange}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Add keywords to improve SEO for your content
          </p>
        </div>

        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">
            Additional Information (Optional)
          </label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            placeholder="Any additional context or details for the content?"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full min-h-[100px]"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        ) : (
          'Generate Content'
        )}
      </Button>
    </form>
  );
};

export default ContentForm;
