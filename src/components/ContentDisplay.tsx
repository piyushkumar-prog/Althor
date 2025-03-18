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
// Import these libraries after installing them
// npm install jspdf docx file-saver
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface ContentDisplayProps {
  content: string;
  isGenerating: boolean;
  className?: string;
}

const ContentDisplay = ({ content, isGenerating, className }: ContentDisplayProps) => {
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

  const handleDownload = async (format: 'txt' | 'pdf' | 'docx' | 'html') => {
    switch (format) {
      case 'txt': {
        // Plain text download
        const element = document.createElement('a');
        const file = new Blob([editedContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'generated-content.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        break;
      }
      
      case 'pdf': {
        try {
          // Create PDF document
          const doc = new jsPDF();
          
          // Split content into lines and add to PDF
          const lines = editedContent.split('\n');
          let y = 20; // Starting y position
          
          // Add title
          doc.setFontSize(16);
          doc.text('Generated Content', 20, y);
          y += 10;
          
          // Add content with normal font size
          doc.setFontSize(12);
          
          lines.forEach(line => {
            // Check if we need a new page
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            
            // Add the line, handling long lines with wrapping
            const splitLines = doc.splitTextToSize(line, 170); // 170 is the max width
            splitLines.forEach(splitLine => {
              doc.text(splitLine, 20, y);
              y += 7; // Line spacing
            });
            
            // Add extra space after paragraphs
            if (line.trim() === '') {
              y += 3;
            }
          });
          
          // Save the PDF
          doc.save('generated-content.pdf');
        } catch (error) {
          console.error('Error generating PDF:', error);
          toast.error('Failed to generate PDF. Please try again.');
        }
        break;
      }
      
      case 'docx': {
        try {
          // Split content into paragraphs
          const paragraphs = editedContent.split('\n').map(line => {
            return new Paragraph({
              children: [new TextRun(line)]
            });
          });
          
          // Create Word document
          const doc = new Document({
            sections: [{
              properties: {},
              children: paragraphs
            }]
          });
          
          // Generate and save the document
          Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'generated-content.docx');
          });
        } catch (error) {
          console.error('Error generating Word document:', error);
          toast.error('Failed to generate Word document. Please try again.');
        }
        break;
      }
      
      case 'html': {
        // HTML download with proper formatting
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Generated Content</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <h1>Generated Content</h1>
  <div>
    ${editedContent.split('\n\n').map(paragraph => 
      `<p>${paragraph.replace(/\n/g, '<br>')}</p>`
    ).join('')}
  </div>
</body>
</html>`;
        
        const element = document.createElement('a');
        const file = new Blob([htmlContent], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        element.download = 'generated-content.html';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        break;
      }
    }
    
    toast.success(`Content downloaded as ${format.toUpperCase()}`);
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
      <div className={`glass-card rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center space-y-4 ${className}`}>
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
      <div className={`glass-card rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center ${className}`}>
        <FileText size={48} className="text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Content Generated Yet</h3>
        <p className="text-muted-foreground">
          Fill in the form and click "Generate Content" to create your content
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-xl p-6 ${className}`}>
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

      <div className="mb-4 overflow-hidden">
        {isEditing ? (
          <Textarea
            ref={textAreaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[250px] resize-none p-4 leading-relaxed !bg-black text-white"
          />
        ) : (
          <div className="bg-black border border-border rounded-md p-4 min-h-[250px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
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
        
        <Button variant="outline" size="sm" onClick={() => handleDownload('txt')}>
          <Download size={16} className="mr-1" />
          Text
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
          <Download size={16} className="mr-1" />
          PDF
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => handleDownload('docx')}>
          <Download size={16} className="mr-1" />
          Word
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => handleDownload('html')}>
          <Download size={16} className="mr-1" />
          HTML
        </Button>
      </div>
    </div>
  );
};

export default ContentDisplay;