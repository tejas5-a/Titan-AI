import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CollaborationSession } from '../../types';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Cpu,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';

export function HistoryView() {
  const { sessions, deleteSession, setActiveSession, setActiveView } = useApp();

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSessions = sessions.filter(
    (s) =>
      s.userPrompt.toLowerCase().includes(search.toLowerCase()) ||
      s.rounds.round4_synthesis?.synthesisText?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportJson = (session: CollaborationSession) => {
    const jsonStr = JSON.stringify(session, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan-session-${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = (session: CollaborationSession) => {
    const md = `# TITAN AI Collective Session: ${session.sessionId}
Date: ${new Date(session.timestamp).toLocaleString()}

## User Request:
${session.userPrompt}

## Participating Models:
${session.rounds.round1_independent.map((r) => `- ${r.modelName} (${r.provider}): ${r.status}`).join('\n')}

## Final Unified Master Synthesis:
${session.rounds.round4_synthesis.synthesisText}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan-session-${session.sessionId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Conversation History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Searchable persistent archive of collective reasoning rounds, peer reviews, and final syntheses.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          {sessions.length} Recorded Sessions
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search through past conversations and questions..."
          className="w-full text-xs rounded-lg bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#131620]">
          No past sessions found. Start a collective chat to record your first multi-model session.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session.sessionId}
              className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    Session #{session.sessionId.slice(-8)}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {session.userPrompt}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setActiveSession(session);
                      setActiveView('chat');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-medium cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Chat</span>
                  </button>

                  <button
                    onClick={() => handleExportMarkdown(session)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    title="Export Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this conversation from storage?')) {
                        deleteSession(session.sessionId);
                      }
                    }}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview of synthesis */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {session.rounds.round4_synthesis.synthesisText || 'No synthesis recorded.'}
              </p>

              {/* Participating models tags & metadata */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>Participating:</span>
                  {session.rounds.round1_independent.map((r) => (
                    <span
                      key={r.modelId}
                      className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]"
                    >
                      {r.modelName}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span>{session.totalLatencyMs || 0}ms</span>
                  <span>•</span>
                  <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
