import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import {
  BookOpen,
  Upload,
  FileText,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Database,
} from 'lucide-react';

export function KnowledgeBaseView() {
  const { knowledgeDocs, addDocument, removeDocument } = useApp();

  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const chunkCount = Math.max(1, Math.ceil(content.length / 500));

      addDocument({
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'text/plain',
        content,
        chunkCount,
        summary: `Document indexed: ${file.name} (${chunkCount} chunks parsed).`,
      });
    };
    reader.readAsText(file);
  };

  const handleAskKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isQuerying) return;

    setIsQuerying(true);
    setAnswer(null);

    try {
      const res = await fetch('/api/knowledge-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          documents: knowledgeDocs,
        }),
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Knowledge Base & RAG</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload documents, contracts, specs, and source code. Query with multi-model source-grounded citations.
            </p>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.ts,.js,.py,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <form
        onSubmit={handleAskKnowledge}
        className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search indexed knowledge documents (e.g. What are the invariant constraints for concurrency?)..."
            className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            {knowledgeDocs.length} document(s) in active retrieval index
          </span>
          <button
            type="submit"
            disabled={isQuerying || !query.trim()}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            {isQuerying ? 'Retrieving Chunks...' : 'Query Index'}
          </button>
        </div>
      </form>

      {/* Answer Output */}
      {answer && (
        <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Source-Grounded Knowledge Synthesis</span>
          </div>
          <MarkdownView content={answer} />
        </div>
      )}

      {/* Documents Index Table */}
      <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
            Indexed Document Catalog
          </h3>
          <span className="text-slate-400 font-mono text-[11px]">{knowledgeDocs.length} items</span>
        </div>

        {knowledgeDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No documents uploaded yet. Upload a text, markdown, or code file to start indexing.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {knowledgeDocs.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{doc.fileName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {Math.round(doc.fileSize / 1024)} KB • {doc.chunkCount} chunks • Indexed{' '}
                      {new Date(doc.indexedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
