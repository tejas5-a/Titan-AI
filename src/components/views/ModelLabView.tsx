import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import { StatusBadge } from '../common/StatusBadge';
import {
  FlaskConical,
  Play,
  Clock,
  Sparkles,
  Cpu,
  BarChart2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export function ModelLabView() {
  const { models } = useApp();

  const [prompt, setPrompt] = useState('Compare QuickSort vs MergeSort: time/space complexity, cache locality, and stability.');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    'gemini-3.8-flash',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [labResults, setLabResults] = useState<any[]>([]);

  const toggleLabModel = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length > 1) {
        setSelectedModelIds(selectedModelIds.filter((m) => m !== id));
      }
    } else {
      setSelectedModelIds([...selectedModelIds, id]);
    }
  };

  const runBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setLabResults([]);

    const promises = selectedModelIds.map(async (mId) => {
      const modelObj = models.find((m) => m.id === mId);
      const t0 = Date.now();
      try {
        const res = await fetch('/api/generate-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: modelObj?.provider || 'gemini',
            model: mId,
            prompt,
          }),
        });

        const data = await res.json();
        return {
          modelId: mId,
          modelName: modelObj?.name || mId,
          provider: modelObj?.provider || 'gemini',
          status: 'completed',
          text: data.text,
          latencyMs: data.latencyMs || Date.now() - t0,
          usage: data.usage,
          isSimulated: data.isSimulated,
        };
      } catch (err: any) {
        return {
          modelId: mId,
          modelName: modelObj?.name || mId,
          provider: modelObj?.provider || 'gemini',
          status: 'failed',
          error: err.message,
          latencyMs: Date.now() - t0,
        };
      }
    });

    const results = await Promise.all(promises);
    setLabResults(results);
    setIsRunning(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Model Laboratory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Head-to-head empirical comparison of distinct models on identical prompts. Measure real latency and token throughput.
          </p>
        </div>
      </div>

      {/* Lab Form */}
      <form onSubmit={runBenchmark} className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Shared Benchmark Prompt
          </label>
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Models to Compare ({selectedModelIds.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {models.map((m) => {
              const isSelected = selectedModelIds.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleLabModel(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.name} ({m.provider})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isRunning || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Running Side-by-Side Tests...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Laboratory Comparison</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comparison Grid Results */}
      {labResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Side-by-Side Empirical Results</span>
            <span>Measured live from server</span>
          </div>

          <div
            className={`grid grid-cols-1 ${
              labResults.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
            } gap-4`}
          >
            {labResults.map((res) => (
              <div
                key={res.modelId}
                className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{res.modelName}</h4>
                      <span className="text-[10px] uppercase font-mono text-slate-400">{res.provider}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {res.isSimulated && <StatusBadge status="simulated" label="Sim" />}
                      <StatusBadge status={res.status} />
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 custom-scrollbar">
                    {res.text ? (
                      <MarkdownView content={res.text} />
                    ) : (
                      <div className="text-rose-600 text-xs">{res.error || 'Failed to return response.'}</div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {res.latencyMs}ms
                  </span>
                  <span>Tokens: {res.usage?.totalTokens || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
