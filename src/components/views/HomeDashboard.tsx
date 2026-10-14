import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessagesSquare,
  Swords,
  Compass,
  Code2,
  Eye,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  Key,
  FolderGit2,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowUp,
  Paperclip,
} from 'lucide-react';

export function HomeDashboard() {
  const {
    setActiveView,
    models,
    providers,
    sessions,
    projects,
    runCollaboration,
    setActiveSession,
    settings,
  } = useApp();

  const [promptInput, setPromptInput] = useState('');

  const enabledModels = models.filter((m) => m.isEnabled);
  const connectedProviders = providers.filter((p) => p.status === 'connected' || p.hasKey);
  const unconfiguredProviders = providers.filter((p) => p.status === 'needs_key');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setActiveView('chat');
    runCollaboration(promptInput.trim());
    setPromptInput('');
  };

  const quickActions = [
    {
      id: 'chat',
      title: 'Collective Chat',
      desc: 'Multiple models analyze, peer review, and synthesize one master answer.',
      icon: <MessagesSquare className="w-5 h-5 text-[#c25e2e] dark:text-[#d97757]" />,
    },
    {
      id: 'debate',
      title: 'AI Debate Studio',
      desc: 'Stage structured debates on controversial architectures, algorithms, or strategies.',
      icon: <Swords className="w-5 h-5 text-[#c25e2e] dark:text-[#d97757]" />,
    },
    {
      id: 'research',
      title: 'Deep Research',
      desc: 'Conduct parallel multi-step investigative briefings with source evidence.',
      icon: <Compass className="w-5 h-5 text-[#c25e2e] dark:text-[#d97757]" />,
    },
    {
      id: 'coding',
      title: 'AI Coding Studio',
      desc: 'Multi-model collaborative software engineering, patch diffs, and reviews.',
      icon: <Code2 className="w-5 h-5 text-[#c25e2e] dark:text-[#d97757]" />,
    },
    {
      id: 'vision',
      title: 'Vision Studio',
      desc: 'Cross-examine user images and visual artifacts with multimodal perception.',
      icon: <Eye className="w-5 h-5 text-[#c25e2e] dark:text-[#d97757]" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* CLAUDE STYLE GREETING */}
      <div className="text-center space-y-2.5 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f2ecdf] dark:bg-[#282622] text-[#824422] dark:text-[#e08967] border border-[#e5ded0] dark:border-[#38342e]">
          <Sparkles className="w-3.5 h-3.5 text-[#c25e2e] dark:text-[#d97757]" />
          <span>Collective Intelligence Platform</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1f1e1d] dark:text-[#ede8e1] tracking-tight font-medium">
          What would you like to solve together today?
        </h1>
        <p className="text-xs sm:text-sm text-[#736e65] dark:text-[#9e978b] max-w-xl mx-auto leading-relaxed">
          Multiple independent models share context, conduct peer reviews, and reason in concert to deliver one unified result.
        </p>
      </div>

      {/* CLAUDE STYLE COMPOSER BOX */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleQuickSubmit}
          className="relative rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-3 shadow-md focus-within:ring-2 focus-within:ring-[#c25e2e]/30 focus-within:border-[#c25e2e] transition-all"
        >
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask a question, propose an architecture, or request collaborative analysis across all enabled models..."
            className="w-full resize-none bg-transparent p-2 text-sm text-[#1f1e1d] dark:text-[#ede8e1] placeholder-[#9c9589] focus:outline-hidden leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleQuickSubmit(e);
              }
            }}
          />

          <div className="flex items-center justify-between pt-2 border-t border-[#f0ebd5] dark:border-[#2d2a27] px-2 text-xs">
            <div className="flex items-center gap-2 text-[#736e65] dark:text-[#9e978b]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f0e6] dark:bg-[#2a2825] border border-[#e5ded0] dark:border-[#38342e] text-[11px] font-medium text-[#2d2b28] dark:text-[#ded8ce]">
                <Cpu className="w-3 h-3 text-[#c25e2e] dark:text-[#d97757]" />
                <span>{enabledModels.length} models active</span>
              </span>
              <span className="text-[11px] hidden sm:inline">• Ctrl + Enter</span>
            </div>

            {/* Claude round send button */}
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#c25e2e] hover:bg-[#b05225] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-xs"
              title="Launch Collective"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* PROVIDER NOTICE IF NEEDED */}
      {unconfiguredProviders.length > 0 && (
        <div className="rounded-xl border border-[#ded7cb] dark:border-[#383530] bg-[#f8f5ee] dark:bg-[#201e1b] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ede5d5] dark:bg-[#2c2925] text-[#c25e2e] dark:text-[#d97757]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                Connect Additional Model Providers
              </h4>
              <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
                Google Gemini is ready out of the box. Connect OpenRouter, Groq, Cerebras, or Ollama to expand collective breadth.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('settings')}
            className="px-3.5 py-1.5 rounded-lg bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            Configure
          </button>
        </div>
      )}

      {/* QUICK WORKSPACE TILES */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f]">
          Specialized Workspaces
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveView(action.id as any)}
              className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 text-left transition-all hover:border-[#c25e2e] dark:hover:border-[#d97757] hover:shadow-xs group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-[#f5f0e6] dark:bg-[#2a2825] mb-2.5">
                  {action.icon}
                </div>
                <ChevronRight className="w-4 h-4 text-[#aba396] group-hover:text-[#c25e2e] transition-colors" />
              </div>
              <h4 className="font-serif text-sm font-semibold text-[#1f1e1d] dark:text-[#ede8e1] mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-[#736e65] dark:text-[#9e978b] leading-relaxed">
                {action.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* RECENT CONVERSATIONS */}
      <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f]">
            Recent Collective Sessions
          </h3>
          <button
            onClick={() => setActiveView('history')}
            className="text-xs text-[#c25e2e] dark:text-[#d97757] hover:underline"
          >
            View all
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9c9589]">
            No sessions yet. Type a question above to begin your first collaborative run.
          </div>
        ) : (
          <div className="divide-y divide-[#f2ecdf] dark:divide-[#2b2825]">
            {sessions.slice(0, 3).map((s) => (
              <button
                key={s.sessionId}
                onClick={() => {
                  setActiveSession(s);
                  setActiveView('chat');
                }}
                className="w-full text-left py-2.5 group cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0 pr-4">
                  <div className="text-xs font-medium text-[#1f1e1d] dark:text-[#ede8e1] truncate group-hover:text-[#c25e2e] dark:group-hover:text-[#d97757]">
                    {s.userPrompt}
                  </div>
                  <div className="text-[11px] text-[#8c857b] font-mono mt-0.5">
                    {s.summary.respondedCount} models • {new Date(s.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#aba396] group-hover:text-[#c25e2e] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
