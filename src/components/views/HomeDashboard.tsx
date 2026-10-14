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
  Flame,
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
      icon: <MessagesSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      color: 'border-indigo-500/30 hover:border-indigo-500',
    },
    {
      id: 'debate',
      title: 'AI Debate Studio',
      desc: 'Stage structured debates on controversial architectures, algorithms, or strategies.',
      icon: <Swords className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      color: 'border-purple-500/30 hover:border-purple-500',
    },
    {
      id: 'research',
      title: 'Deep Research',
      desc: 'Conduct parallel multi-step investigative briefings with source evidence.',
      icon: <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'border-blue-500/30 hover:border-blue-500',
    },
    {
      id: 'coding',
      title: 'AI Coding Studio',
      desc: 'Multi-model collaborative software engineering, patch diffs, and reviews.',
      icon: <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'border-emerald-500/30 hover:border-emerald-500',
    },
    {
      id: 'vision',
      title: 'Vision Studio',
      desc: 'Cross-examine user images and visual artifacts with multimodal perception.',
      icon: <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'border-amber-500/30 hover:border-amber-500',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* HERO SECTION */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Ultimate Collective Intelligence Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          MULTIPLE MODELS. SHARED CONTEXT. ONE UNIFIED RESULT.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          No single model possesses all knowledge. TITAN AI orchestrates parallel reasoning,
          peer critique, and structured consensus across independent neural models.
        </p>
      </div>

      {/* QUICK CONVERSATION PROMPT BOX */}
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleQuickSubmit}
          className="relative rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all"
        >
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask a challenging question, propose an architecture, or request a complex analysis across all enabled models..."
            className="w-full resize-none bg-transparent p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleQuickSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  <strong>{enabledModels.length}</strong> models selected
                </span>
              </span>
              <span>•</span>
              <span>Ctrl + Enter to dispatch</span>
            </div>
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
            >
              <span>Launch Collective</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* PROVIDER STATUS ALERT IF NEEDED */}
      {unconfiguredProviders.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Setup Additional Cloud Providers
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Google Gemini is ready out-of-the-box. Add keys for OpenRouter, Groq, Cerebras, or Ollama to expand collective reach.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('settings')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            Configure Providers
          </button>
        </div>
      )}

      {/* WORKSPACE METRICS TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Enabled Models</span>
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {enabledModels.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for parallel dispatch</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Connected Providers</span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {connectedProviders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gemini & Open-weights active</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Past Collaborations</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {sessions.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Persisted sessions</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Policy Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
            {settings.allowPaidUsage ? 'Paid Enabled' : 'Strictly Free'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero unexpected billing</p>
        </div>
      </div>

      {/* QUICK ACTION WORKSPACES */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Specialized Workspaces
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveView(action.id as any)}
              className={`rounded-xl bg-white dark:bg-[#131620] border p-4 text-left transition-all hover:shadow-xs group cursor-pointer ${action.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 mb-3">
                  {action.icon}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {action.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* RECENT CONVERSATIONS & PROJECTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Recent Collaborations */}
        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Collective Sessions
            </h3>
            <button
              onClick={() => setActiveView('history')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No sessions yet. Type a question above to start your first collective reasoning round.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 4).map((s) => (
                <button
                  key={s.sessionId}
                  onClick={() => {
                    setActiveSession(s);
                    setActiveView('chat');
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group cursor-pointer"
                >
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {s.userPrompt}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>{s.summary.respondedCount} models</span>
                    <span>•</span>
                    <span>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Projects & Workspaces
            </h3>
            <button
              onClick={() => setActiveView('projects')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {proj.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {proj.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('coding')}
                  className="px-2.5 py-1 text-xs rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Open Code
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
