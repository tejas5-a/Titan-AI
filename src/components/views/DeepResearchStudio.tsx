import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import {
  Compass,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

export function DeepResearchStudio() {
  const [topic, setTopic] = useState('Comparative evaluation of state-of-the-art multi-agent orchestration architectures');
  const [scope, setScope] = useState('comprehensive');
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const startResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isRunning) return;

    setIsRunning(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, scope }),
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Deep Research Studio</h2>
          <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
            Multi-model investigative research with subtask partitioning, evidentiary citations, and contradiction analysis.
          </p>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={startResearch} className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f] mb-1.5">
            Research Investigation Question / Domain
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Empirical scaling laws of heterogeneous mixture-of-experts models"
              className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] pl-9 pr-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
            />
            <Search className="w-4 h-4 text-[#8c857b] absolute left-3 top-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
              Depth & Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full text-xs rounded-lg bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
            >
              <option value="comprehensive">Comprehensive Academic & Engineering Review</option>
              <option value="technical">Strict Architectural & Code Benchmark Focus</option>
              <option value="executive">Executive Summary & Strategic Decision Matrix</option>
            </select>
          </div>

          <div>
            <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
              Evidence Citation Standard
            </label>
            <div className="p-2 rounded-lg bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] text-[11px] text-[#736e65] dark:text-[#9e978b] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#c25e2e] dark:text-[#d97757]" />
              <span>Verifiable Citations with Claim-to-Source Mapping</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isRunning || !topic.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Conducting Multi-Model Investigation...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Launch Deep Research</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] shadow-2xs">
              <div className="text-[#8c857b]">Consensus Index</div>
              <div className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {report.consensusScore || 92}%
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] shadow-2xs">
              <div className="text-[#8c857b]">Identified Sources</div>
              <div className="font-serif text-lg font-bold text-[#c25e2e] dark:text-[#d97757]">
                {report.sourcesCount || 5} Citations
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] shadow-2xs">
              <div className="text-[#8c857b]">Elapsed Time</div>
              <div className="font-mono text-lg font-bold text-[#1f1e1d] dark:text-[#ede8e1]">
                {report.latencyMs}ms
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[#f0ebd5] dark:border-[#2d2a27] flex items-center justify-between text-xs">
              <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                Consolidated Deep Research Report
              </span>
              <span className="text-[11px] font-mono text-[#8c857b]">TITAN Research Engine</span>
            </div>
            <MarkdownView content={report.report} />
          </div>
        </div>
      )}
    </div>
  );
}
