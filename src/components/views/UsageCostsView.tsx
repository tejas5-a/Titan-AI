import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  ShieldCheck,
  Cpu,
  Coins,
  Activity,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';

export function UsageCostsView() {
  const { usageRecords, settings, updateSettings, providers, models } = useApp();

  const [providerFilter, setProviderFilter] = useState<string>('all');

  const filteredRecords = usageRecords.filter(
    (r) => providerFilter === 'all' || r.provider === providerFilter
  );

  const totalTokens = filteredRecords.reduce((acc, r) => acc + (r.totalTokens || 0), 0);
  const promptTokens = filteredRecords.reduce((acc, r) => acc + (r.promptTokens || 0), 0);
  const completionTokens = filteredRecords.reduce((acc, r) => acc + (r.completionTokens || 0), 0);
  const avgLatency =
    filteredRecords.length > 0
      ? Math.round(
          filteredRecords.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / filteredRecords.length
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Usage & Cost Transparency</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit prompt/completion token volumes, request latency, and billing policy compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Policy:</span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-semibold uppercase font-mono border ${
              settings.allowPaidUsage
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {settings.allowPaidUsage ? 'Paid API Allowed' : 'Strictly Free Tier'}
          </span>
        </div>
      </div>

      {/* Policy Guard Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131620] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Zero Surprise Cost Enforcement Policy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When "Allow paid API usage" is OFF, TITAN AI blocks paid requests and limits calls to verified free models and local Ollama.
            </p>
          </div>
        </div>

        <button
          onClick={() => updateSettings({ allowPaidUsage: !settings.allowPaidUsage })}
          className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
            settings.allowPaidUsage
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          {settings.allowPaidUsage ? 'Turn Off Paid Usage' : 'Enable Paid Usage'}
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Total Token Volume</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {promptTokens.toLocaleString()} prompt / {completionTokens.toLocaleString()} out
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Recorded Invocations</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {filteredRecords.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Telemetry log entries</div>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Average Latency</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {avgLatency}ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all models</div>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Estimated Cloud Cost</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            $0.0000
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Free-tier / Local models</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Invocation Telemetry Ledger
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 text-slate-700 dark:text-slate-300 text-xs"
            >
              <option value="all">All Providers</option>
              <option value="gemini">Google Gemini</option>
              <option value="openrouter">OpenRouter</option>
              <option value="groq">Groq</option>
              <option value="cerebras">Cerebras</option>
              <option value="ollama">Ollama</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No usage records logged yet for this filter. Run a collective chat to generate real invocation metrics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2">TIMESTAMP</th>
                  <th className="py-2">MODEL</th>
                  <th className="py-2">PROVIDER</th>
                  <th className="py-2">PROMPT TOKENS</th>
                  <th className="py-2">COMPLETION</th>
                  <th className="py-2">TOTAL</th>
                  <th className="py-2">LATENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRecords.slice(0, 50).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 text-slate-400">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{r.modelName}</td>
                    <td className="py-2 uppercase text-slate-500">{r.provider}</td>
                    <td className="py-2 text-slate-500">{r.promptTokens}</td>
                    <td className="py-2 text-slate-500">{r.completionTokens}</td>
                    <td className="py-2 text-indigo-600 dark:text-indigo-400 font-semibold">{r.totalTokens}</td>
                    <td className="py-2 text-slate-500">{r.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
