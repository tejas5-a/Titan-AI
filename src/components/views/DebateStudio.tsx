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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Claude Style Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
          <Swords className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">AI Debate Studio</h2>
          <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
            Stage structured multi-turn debates between models to expose trade-offs and reach verifiable consensus.
          </p>
        </div>
      </div>

      {/* Setup Form */}
      <form onSubmit={startDebate} className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f] mb-1.5">
            Debate Proposition / Architecture Decision
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. In-memory SQLite vs Distributed Postgres for AI Studio state management"
            className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div>
            <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
              Debater 1 (Advocate)
            </label>
            <select
              value={modelA}
              onChange={(e) => setModelA(e.target.value)}
              className="w-full text-xs rounded-lg bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
            >
              {models.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
              Debater 2 (Challenger)
            </label>
            <select
              value={modelB}
              onChange={(e) => setModelB(e.target.value)}
              className="w-full text-xs rounded-lg bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
            >
              {models.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
              Intensity & Exchange Rounds
            </label>
            <select
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full text-xs rounded-lg bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
            >
              <option value={1}>1 Round (Concise Exchange)</option>
              <option value={2}>2 Rounds (Critique & Rebuttal)</option>
              <option value={3}>3 Rounds (Exhaustive Probe)</option>
            </select>
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
                <span>Running Adversarial Debate...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {debateResult.timeline?.map((step: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] flex items-center gap-2 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">{step.phase}</div>
                  <div className="text-[10px] text-[#8c857b] capitalize">{step.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
              <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                Official Debate Transcript & Consensus Assessment
              </span>
              <span className="font-mono text-[#8c857b] text-[11px]">
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
