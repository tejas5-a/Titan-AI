import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  if (!content) return null;

  // Render markdown text into structured elements (headers, code blocks, lists, bold)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockLines.join('\n');
        elements.push(
          <CodeBlockItem
            key={`code-${i}`}
            language={codeBlockLanguage}
            code={codeText}
          />
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLanguage = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">
          {formatInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
          {formatInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3">
          {formatInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-indigo-500/80 pl-3 py-1 my-2 text-slate-600 dark:text-slate-400 italic text-sm">
          {formatInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet points
    if (line.match(/^[\*\-]\s/)) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
          {formatInline(line.replace(/^[\*\-]\s+/, ''))}
        </li>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^\d+\.\s+(.*)/);
      elements.push(
        <div key={`ol-${i}`} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium select-none">
            {line.split('.')[0]}.
          </span>
          <span>{formatInline(match ? match[1] : line)}</span>
        </div>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm text-slate-700 dark:text-slate-300 my-1.5 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  // If ended in code block without closing tag
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <CodeBlockItem
        key="code-unclosed"
        language={codeBlockLanguage}
        code={codeBlockLines.join('\n')}
      />
    );
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}

function formatInline(text: string): React.ReactNode {
  // Bold formatting **text**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs border border-slate-200 dark:border-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function CodeBlockItem({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 text-xs shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
        <span>{language || 'text'}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
