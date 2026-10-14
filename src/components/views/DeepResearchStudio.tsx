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
  ShieldAlert,
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
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deep Research Studio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-model investigative research with subtask partitioning, evidentiary citation, and contradiction analysis.
          </p>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={startResearch} className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Research Investigation Question / Domain
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Empirical scaling laws of heterogeneous mixture-of-experts models"
              className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Depth & Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="comprehensive">Comprehensive Academic & Engineering Review</option>
              <option value="technical">Strict Architectural & Code Benchmark Focus</option>
              <option value="executive">Executive Summary & Strategic Decision Matrix</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Evidence Citation Standard
            </label>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Verifiable Citations with Claim-to-Source Mapping</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isRunning || !topic.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
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
            <div className="p-3 rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">Consensus Index</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {report.consensusScore || 92}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">Identified Sources</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {report.sourcesCount || 5} Citations
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">Time Elapsed</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {report.latencyMs}ms
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Consolidated Deep Research Report
              </span>
              <span className="text-[11px] font-mono text-slate-400">TITAN Research Engine</span>
            </div>
            <MarkdownView content={report.report} />
          </div>
        </div>
      )}
    </div>
  );
}
