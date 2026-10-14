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
      {/* Claude Style Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Usage & Cost Transparency</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Audit prompt/completion token volumes, request latency, and billing policy compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#736e65] dark:text-[#9e978b]">Policy:</span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase font-mono border ${
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
      <div className="rounded-2xl border border-[#ded7cb] dark:border-[#383530] bg-white dark:bg-[#22201e] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xs font-bold text-[#1f1e1d] dark:text-[#ede8e1]">
              Zero Surprise Cost Enforcement Policy
            </h3>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              When "Allow paid API usage" is OFF, TITAN AI blocks paid requests and limits calls to verified free models and local Ollama.
            </p>
          </div>
        </div>

        <button
          onClick={() => updateSettings({ allowPaidUsage: !settings.allowPaidUsage })}
          className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shadow-xs ${
            settings.allowPaidUsage
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-[#f5f0e6] dark:bg-[#282622] hover:bg-[#ede5d5] text-[#2d2b28] dark:text-[#ded8ce] border border-[#ded7cb] dark:border-[#383530]'
          }`}
        >
          {settings.allowPaidUsage ? 'Turn Off Paid Usage' : 'Enable Paid Usage'}
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 shadow-xs">
          <div className="text-xs text-[#736e65] dark:text-[#9e978b] mb-1">Total Token Volume</div>
          <div className="text-2xl font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8c857b] mt-1 font-mono">
            {promptTokens.toLocaleString()} in / {completionTokens.toLocaleString()} out
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 shadow-xs">
          <div className="text-xs text-[#736e65] dark:text-[#9e978b] mb-1">Recorded Invocations</div>
          <div className="text-2xl font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
            {filteredRecords.length}
          </div>
          <div className="text-[11px] text-[#8c857b] mt-1">Telemetry log entries</div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 shadow-xs">
          <div className="text-xs text-[#736e65] dark:text-[#9e978b] mb-1">Average Latency</div>
          <div className="text-2xl font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
            {avgLatency}ms
          </div>
          <div className="text-[11px] text-[#8c857b] mt-1">Across all models</div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 shadow-xs">
          <div className="text-xs text-[#736e65] dark:text-[#9e978b] mb-1">Estimated Cloud Cost</div>
          <div className="text-2xl font-serif font-semibold text-emerald-600 dark:text-emerald-400">
            $0.0000
          </div>
          <div className="text-[11px] text-[#8c857b] mt-1">Free-tier / Local models</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f]">
            Invocation Telemetry Ledger
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8c857b]">Filter Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-1.5 text-[#1f1e1d] dark:text-[#ede8e1] text-xs focus:outline-hidden focus:ring-1 focus:ring-[#c25e2e]"
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
          <div className="text-center py-8 text-xs text-[#8c857b]">
            No usage records logged yet for this filter. Run a collective chat to generate real invocation metrics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#ded7cb] dark:border-[#383530] text-[#8c857b] text-[11px]">
                  <th className="py-2.5">TIMESTAMP</th>
                  <th className="py-2.5">MODEL</th>
                  <th className="py-2.5">PROVIDER</th>
                  <th className="py-2.5">PROMPT TOKENS</th>
                  <th className="py-2.5">COMPLETION</th>
                  <th className="py-2.5">TOTAL</th>
                  <th className="py-2.5">LATENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ecdf] dark:divide-[#2b2825]">
                {filteredRecords.slice(0, 50).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 text-[#8c857b]">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 font-medium text-[#1f1e1d] dark:text-[#ede8e1]">{r.modelName}</td>
                    <td className="py-2.5 uppercase text-[#8c857b]">{r.provider}</td>
                    <td className="py-2.5 text-[#736e65] dark:text-[#9e978b]">{r.promptTokens}</td>
                    <td className="py-2.5 text-[#736e65] dark:text-[#9e978b]">{r.completionTokens}</td>
                    <td className="py-2.5 text-[#c25e2e] dark:text-[#d97757] font-semibold">{r.totalTokens}</td>
                    <td className="py-2.5 text-[#736e65] dark:text-[#9e978b]">{r.latencyMs}ms</td>
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
