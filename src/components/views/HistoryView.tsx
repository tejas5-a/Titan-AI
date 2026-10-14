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
      {/* Claude Style Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Conversation History</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Searchable persistent archive of collective reasoning rounds, peer reviews, and final syntheses.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[#8c857b]">
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
          className="w-full text-xs rounded-xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] pl-9 pr-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
        />
        <Search className="w-4 h-4 text-[#8c857b] absolute left-3 top-3" />
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-2xl border border-[#ded7cb] dark:border-[#383530] p-12 text-center text-xs text-[#8c857b] bg-white dark:bg-[#22201e]">
          No past sessions found. Start a collective chat to record your first multi-model session.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session.sessionId}
              className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-3 hover:border-[#c25e2e]/50 dark:hover:border-[#d97757]/50 transition-colors shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c25e2e] dark:text-[#d97757] font-semibold uppercase">
                    Session #{session.sessionId.slice(-8)}
                  </span>
                  <h3 className="font-serif text-sm font-semibold text-[#1f1e1d] dark:text-[#ede8e1] mt-0.5">
                    {session.userPrompt}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setActiveSession(session);
                      setActiveView('chat');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Chat</span>
                  </button>

                  <button
                    onClick={() => handleExportMarkdown(session)}
                    className="p-1.5 rounded-lg text-[#8c857b] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] hover:bg-[#f5f0e6] dark:hover:bg-[#2b2825] cursor-pointer transition-colors"
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
                    className="p-1.5 rounded-lg text-[#8c857b] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview of synthesis */}
              <p className="text-xs text-[#615c54] dark:text-[#9e988e] line-clamp-2 leading-relaxed">
                {session.rounds.round4_synthesis.synthesisText || 'No synthesis recorded.'}
              </p>

              {/* Participating models tags & metadata */}
              <div className="pt-3 border-t border-[#f0ebd5] dark:border-[#2d2a27] flex flex-wrap items-center justify-between text-[11px] text-[#8c857b] gap-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#c25e2e] dark:text-[#d97757]" />
                  <span>Participating:</span>
                  {session.rounds.round1_independent.map((r) => (
                    <span
                      key={r.modelId}
                      className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-[#f5f0e6] dark:bg-[#2b2825] text-[#5e584f] dark:text-[#9e978b] border border-[#e5ded0] dark:border-[#38342e]"
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
