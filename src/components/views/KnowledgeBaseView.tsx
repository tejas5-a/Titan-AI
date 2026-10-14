import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import {
  BookOpen,
  Upload,
  FileText,
  Search,
  Trash2,
  Sparkles,
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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Claude Style Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Knowledge Base & RAG</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Index documents, contracts, specs, and source code. Query with multi-model source-grounded citations.
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <form
        onSubmit={handleAskKnowledge}
        className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 shadow-xs space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search indexed knowledge documents (e.g. What are the invariant constraints for concurrency?)..."
            className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] pl-9 pr-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
          />
          <Search className="w-4 h-4 text-[#8c857b] absolute left-3 top-3" />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8c857b] text-[11px]">
            {knowledgeDocs.length} document(s) in active retrieval index
          </span>
          <button
            type="submit"
            disabled={isQuerying || !query.trim()}
            className="px-4 py-1.5 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            {isQuerying ? 'Retrieving Chunks...' : 'Query Index'}
          </button>
        </div>
      </form>

      {/* Answer Output */}
      {answer && (
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
            <Sparkles className="w-4 h-4 text-[#c25e2e] dark:text-[#d97757]" />
            <span>Source-Grounded Knowledge Synthesis</span>
          </div>
          <MarkdownView content={answer} />
        </div>
      )}

      {/* Documents Index Table */}
      <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-semibold text-[#8a8377] dark:text-[#8f887f] uppercase tracking-wider text-[11px]">
            Indexed Document Catalog
          </h3>
          <span className="text-[#8c857b] font-mono text-[11px]">{knowledgeDocs.length} items</span>
        </div>

        {knowledgeDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8c857b]">
            No documents uploaded yet. Upload a text, markdown, or code file to start indexing.
          </div>
        ) : (
          <div className="divide-y divide-[#f2ecdf] dark:divide-[#2b2825]">
            {knowledgeDocs.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#f5f0e6] dark:bg-[#2a2825] text-[#c25e2e] dark:text-[#d97757]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-[#1f1e1d] dark:text-[#ede8e1]">{doc.fileName}</h4>
                    <p className="text-[11px] text-[#8c857b] font-mono">
                      {Math.round(doc.fileSize / 1024)} KB • {doc.chunkCount} chunks • Indexed{' '}
                      {new Date(doc.indexedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-1.5 rounded-lg text-[#8c857b] hover:text-rose-600 transition-colors cursor-pointer"
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
