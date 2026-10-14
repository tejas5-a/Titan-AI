import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import {
  Swords,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function DebateStudio() {
  const { models } = useApp();

  const [topic, setTopic] = useState('Monolithic vs Microservices for high-throughput AI pipelines');
  const [modelA, setModelA] = useState('Gemini 3.8 Flash');
  const [modelB, setModelB] = useState('DeepSeek R1');
  const [rounds, setRounds] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [debateResult, setDebateResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isRunning) return;

    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          sideA: modelA,
          sideB: modelB,
          rounds,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setDebateResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to execute debate.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <Swords className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Debate Studio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stage rigorous multi-turn debates between distinct models to expose blind spots and establish verifiable consensus.
          </p>
        </div>
      </div>

      {/* Setup Form */}
      <form onSubmit={startDebate} className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Debate Proposition / Architecture Decision
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., In-memory SQLite vs Distributed Postgres for AI Studio state management"
            className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Debater 1 (Advocate)
            </label>
            <select
              value={modelA}
              onChange={(e) => setModelA(e.target.value)}
              className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              {models.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Debater 2 (Challenger)
            </label>
            <select
              value={modelB}
              onChange={(e) => setModelB(e.target.value)}
              className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              {models.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Intensity & Exchange Rounds
            </label>
            <select
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value={1}>1 Round (Concise Exchange)</option>
              <option value={2}>2 Rounds (Deep Critique & Rebuttal)</option>
              <option value={3}>3 Rounds (Exhaustive Adversarial Probe)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isRunning || !topic.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Running Adversarial Debate...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Initiate Structured Debate</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Debate Results Output */}
      {debateResult && (
        <div className="space-y-6">
          {/* Timeline phases */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {debateResult.timeline?.map((step: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{step.phase}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{step.status}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Transcript card */}
          <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Official Debate Transcript & Consensus Assessment
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {debateResult.latencyMs}ms elapsed
              </span>
            </div>
            <MarkdownView content={debateResult.debateContent} />
          </div>
        </div>
      )}
    </div>
  );
}
