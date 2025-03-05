
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  Download, 
  FileText, 
  Save, 
  Share, 
  Check, 
  Pencil 
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentDisplayProps {
  content: string;
  isGenerating: boolean;
}

const ContentDisplay = ({ content, isGenerating }: ContentDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Update edited content when new content is generated
  if (content !== editedContent && !isEditing) {
    setEditedContent(content);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
      setCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'generated-content.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Content downloaded successfully');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Changes saved');
  };

  if (isGenerating) {
    return (
      <div className="glass-card rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center space-y-4">
        <div className="w-full h-4 bg-gray-200 rounded shimmer mb-2"></div>
        <div className="w-full h-4 bg-gray-200 rounded shimmer mb-2"></div>
        <div className="w-3/4 h-4 bg-gray-200 rounded shimmer mb-2"></div>
        <div className="w-full h-4 bg-gray-200 rounded shimmer mb-2"></div>
        <div className="w-5/6 h-4 bg-gray-200 rounded shimmer mb-2"></div>
        <div className="w-full h-4 bg-gray-200 rounded shimmer mb-2"></div>
        <div className="w-2/3 h-4 bg-gray-200 rounded shimmer"></div>
        <p className="text-muted-foreground text-sm mt-4">Generating your content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="glass-card rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        <FileText size={48} className="text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Content Generated Yet</h3>
        <p className="text-muted-foreground">
          Fill in the form and click "Generate Content" to create your content
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Generated Content</h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Check size={16} className="mr-1" />
              Save
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Pencil size={16} className="mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        {isEditing ? (
          <Textarea
            ref={textAreaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[250px] resize-none p-4 leading-relaxed"
          />
        ) : (
          <div className="bg-white border border-border rounded-md p-4 min-h-[250px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {editedContent}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={16} className="mr-1 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} className="mr-1" />
              Copy
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download size={16} className="mr-1" />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <Save size={16} className="mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <Share size={16} className="mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default ContentDisplay;
