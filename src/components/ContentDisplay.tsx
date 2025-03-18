import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  Download, 
  FileText, 
  Check, 
  Pencil,
  FileCode
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';

interface ContentDisplayProps {
  content: string;
  isGenerating: boolean;
  className?: string;
}

const ContentDisplay = ({ content, isGenerating, className }: ContentDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  // Update the type to accept JSX.Element or an array of JSX.Elements or a string
  const [formattedContent, setFormattedContent] = useState<string | JSX.Element | JSX.Element[]>('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update edited content when new content is generated
  useEffect(() => {
    if (content !== editedContent && !isEditing) {
      setEditedContent(content);
    }
  }, [content]);

  // Format the content with syntax highlighting
  useEffect(() => {
    if (!isEditing && editedContent) {
      formatContent(editedContent);
    }
  }, [editedContent, isEditing]);

  // Apply syntax highlighting after rendering
  useEffect(() => {
    if (!isEditing && contentRef.current) {
      Prism.highlightAllUnder(contentRef.current);
    }
  }, [formattedContent, isEditing]);

  const formatContent = (text: string) => {
    // Detect code blocks with language specification
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    // Find all code blocks
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        parts.push(<div key={`text-${lastIndex}`} className="mb-4 whitespace-pre-wrap">{formatTextContent(textBefore)}</div>);
      }

      // Add code block with syntax highlighting
      const language = match[1] || 'plaintext';
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="mb-4 rounded-md overflow-hidden">
          <div className="bg-gray-800 text-white text-xs px-4 py-1 flex justify-between items-center">
            <span>{language.toUpperCase()}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-gray-300 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success('Code copied to clipboard');
              }}
            >
              <Copy size={12} className="mr-1" />
              Copy
            </Button>
          </div>
          <pre className="p-4 m-0 overflow-x-auto bg-gray-900 text-sm">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      parts.push(<div key={`text-${lastIndex}`} className="mb-4 whitespace-pre-wrap">{formatTextContent(textAfter)}</div>);
    }

    if (parts.length > 0) {
      // Now this is valid because we updated the type definition
      setFormattedContent(parts);
    } else {
      // No code blocks found, format as regular text
      setFormattedContent(formatTextContent(text));
    }
  };

  // Format regular text with headings, lists, etc.
  const formatTextContent = (text: string) => {
    // Split by double newlines to identify paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a heading (starts with # or ##)
      if (paragraph.trim().startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4">
            {paragraph.trim().substring(2)}
          </h1>
        );
      } else if (paragraph.trim().startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold mt-5 mb-3">
            {paragraph.trim().substring(3)}
          </h2>
        );
      } else if (paragraph.trim().startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-bold mt-4 mb-2">
            {paragraph.trim().substring(4)}
          </h3>
        );
      }
      
      // Check if it's a list
      if (paragraph.split('\n').some(line => line.trim().match(/^[-*•]\s/))) {
        const listItems = paragraph.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.match(/^[-*•]\s/)) {
            return (
              <li key={i} className="ml-6 list-disc">
                {trimmed.replace(/^[-*•]\s/, '')}
              </li>
            );
          }
          return <div key={i}>{trimmed}</div>;
        });
        
        return <div key={index} className="my-3">{listItems}</div>;
      }
      
      // Regular paragraph
      return (
        <p key={index} className="my-3">
          {paragraph.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < paragraph.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
      setCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async (format: 'txt' | 'pdf' | 'docx' | 'html' | 'md') => {
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
      
      case 'md': {
        // Markdown download
        // Convert plain text to basic markdown format
        const markdownContent = convertToMarkdown(editedContent);
        
        const element = document.createElement('a');
        const file = new Blob([markdownContent], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'generated-content.md';
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
      color: #333;
    }
    h1 {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-size: 24px;
    }
    h2 {
      font-size: 20px;
      margin-top: 20px;
    }
    h3 {
      font-size: 18px;
      margin-top: 16px;
    }
    p {
      margin-bottom: 16px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      margin: 15px 0;
    }
    code {
      font-family: 'Courier New', monospace;
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }
    ul, ol {
      margin-bottom: 16px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
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

  // Function to convert plain text to basic markdown
  const convertToMarkdown = (text: string): string => {
    // Add a title
    let markdown = `# Generated Content\n\n`;
    
    // Process the text
    const paragraphs = text.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      // Check if paragraph might be a heading (shorter, ends with no period)
      if (paragraph.length < 100 && !paragraph.trim().endsWith('.') && !paragraph.includes('\n')) {
        markdown += `## ${paragraph.trim()}\n\n`;
      } 
      // Check if paragraph might be a list
      else if (paragraph.split('\n').some(line => line.trim().match(/^[-*•]\s/))) {
        // Convert to markdown list items
        const lines = paragraph.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.match(/^[-*•]\s/)) {
            markdown += `- ${trimmed.replace(/^[-*•]\s/, '')}\n`;
          } else if (trimmed) {
            markdown += `${trimmed}\n`;
          }
        });
        markdown += '\n';
      }
      // Regular paragraph
      else {
        markdown += `${paragraph.trim()}\n\n`;
      }
    });
    
    return markdown;
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
          <div 
            ref={contentRef}
            className="bg-black border border-border rounded-md p-4 min-h-[250px] overflow-y-auto text-white"
          >
            {formattedContent}
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
        
        <Button variant="outline" size="sm" onClick={() => handleDownload('md')}>
          <FileCode size={16} className="mr-1" />
          Markdown
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