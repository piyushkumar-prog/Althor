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
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

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
  // New fields
  contentStructure: string[];
  targetAudience: string;
  language: string;
  sentiment: string;
  writingStyle: string;
  // Ensure all parameters are included
}


const ContentForm = ({ onGenerate, isGenerating }: ContentFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    contentType: 'blog-post',
    tone: 'professional',
    keywords: '',
    additionalInfo: '',
    // New fields with defaults
    contentStructure: ['headings', 'subheadings'],
    targetAudience: 'general',
    language: 'english',
    sentiment: 'neutral',
    writingStyle: 'informative',
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

  const handleStructureChange = (value: string) => {
    setFormData(prev => {
      const currentStructure = [...prev.contentStructure];
      
      if (currentStructure.includes(value)) {
        return {
          ...prev,
          contentStructure: currentStructure.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          contentStructure: [...currentStructure, value]
        };
      }
    });
  };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for your content');
      return;
    }
    
    // Ensure all parameters are passed to onGenerate
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

  const targetAudiences = [
    { value: 'general', label: 'General Public' },
    { value: 'professionals', label: 'Professionals' },
    { value: 'experts', label: 'Industry Experts' },
    { value: 'students', label: 'Students' },
    { value: 'kids', label: 'Children' },
    { value: 'seniors', label: 'Seniors' },
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'russian', label: 'Russian' },
  ];

  const sentiments = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const writingStyles = [
    { value: 'informative', label: 'Informative' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'technical', label: 'Technical' },
    { value: 'casual', label: 'Casual' },
    { value: 'academic', label: 'Academic' },
    { value: 'journalistic', label: 'Journalistic' },
    { value: 'persuasive', label: 'Persuasive' },
  ];

  const structureOptions = [
    { value: 'headings', label: 'Headings' },
    { value: 'subheadings', label: 'Subheadings' },
    { value: 'bullet-points', label: 'Bullet Points' },
    { value: 'numbered-lists', label: 'Numbered Lists' },
    { value: 'paragraphs', label: 'Paragraphs' },
    { value: 'quotes', label: 'Quotes' },
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
            <label htmlFor="language" className="block text-sm font-medium mb-1">
              Language
            </label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleSelectChange('language', value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium mb-1">
              Target Audience
            </label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) => handleSelectChange('targetAudience', value)}
            >
              <SelectTrigger id="targetAudience">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                {targetAudiences.map((audience) => (
                  <SelectItem key={audience.value} value={audience.value}>
                    {audience.label}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sentiment" className="block text-sm font-medium mb-1">
              Sentiment
            </label>
            <Select
              value={formData.sentiment}
              onValueChange={(value) => handleSelectChange('sentiment', value)}
            >
              <SelectTrigger id="sentiment">
                <SelectValue placeholder="Select sentiment" />
              </SelectTrigger>
              <SelectContent>
                {sentiments.map((sentiment) => (
                  <SelectItem key={sentiment.value} value={sentiment.value}>
                    {sentiment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="writingStyle" className="block text-sm font-medium mb-1">
              Writing Style
            </label>
            <Select
              value={formData.writingStyle}
              onValueChange={(value) => handleSelectChange('writingStyle', value)}
            >
              <SelectTrigger id="writingStyle">
                <SelectValue placeholder="Select writing style" />
              </SelectTrigger>
              <SelectContent>
                {writingStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Content Structure
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {structureOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`structure-${option.value}`} 
                  checked={formData.contentStructure.includes(option.value)}
                  onCheckedChange={() => handleStructureChange(option.value)}
                />
                <Label htmlFor={`structure-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Select the structural elements to include in your content
          </p>
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
