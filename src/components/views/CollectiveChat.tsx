import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import { StatusBadge } from '../common/StatusBadge';
import { ModelPill } from '../common/ModelPill';
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  Brain,
  MessageSquare,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';

export function CollectiveChat() {
  const {
    activeSession,
    isCollaborating,
    collaborationProgress,
    runCollaboration,
    cancelCollaboration,
    models,
    toggleModel,
    enableAllModels,
    disableAllModels,
    settings,
    updateSettings,
    newChat,
    inspectorOpen,
    setInspectorOpen,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'reviews' | 'debates' | 'individuals' | 'telemetry'>('synthesis');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enabledModels = models.filter((m) => m.isEnabled);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isCollaborating) return;

    const p = inputPrompt.trim();
    const img = attachedImage || undefined;
    setInputPrompt('');
    setAttachedImage(null);
    runCollaboration(p, img);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copySynthesis = () => {
    if (!activeSession?.rounds.round4_synthesis.synthesisText) return;
    navigator.clipboard.writeText(activeSession.rounds.round4_synthesis.synthesisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* MAIN CHAT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-[#0c0e14]">
        {/* Top Chat Subheader */}
        <div className="h-11 border-b border-slate-100 dark:border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#11131a]/50">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {activeSession ? 'Session: ' + activeSession.sessionId.slice(0, 14) : 'Ready for prompt'}
            </span>
            {activeSession && (
              <span className="text-[11px] font-mono text-slate-400">
                ({activeSession.summary.respondedCount}/{activeSession.summary.selectedCount} models responded)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collaboration Pipeline Settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pipeline Settings</span>
              {showConfigDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              title={inspectorOpen ? 'Hide Model Inspector' : 'Show Model Inspector'}
            >
              {inspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Inline Config Drawer */}
        {showConfigDrawer && (
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131620] p-4 text-xs space-y-3 z-10">
            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span>Pipeline Orchestration Parameters</span>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPeerReview}
                  onChange={(e) => updateSettings({ autoPeerReview: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">Round 2: Peer Review</div>
                  <div className="text-[11px] text-slate-400">Models critique other solutions</div>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDebate}
                  onChange={(e) => updateSettings({ autoDebate: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">Round 3: Debate</div>
                  <div className="text-[11px] text-slate-400">Challenge contradictions & trade-offs</div>
                </div>
              </label>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Master Synthesizer
                </label>
                <select
                  value={settings.synthesisModel}
                  onChange={(e) => updateSettings({ synthesisModel: e.target.value })}
                  className="w-full text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Max Concurrency ({settings.maxConcurrency})
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={settings.maxConcurrency}
                  onChange={(e) => updateSettings({ maxConcurrency: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* CHAT THREAD VIEWPORT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {!activeSession ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Ready for Multi-Model Collective Reasoning
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter any complex question or task below. TITAN AI will distribute it to{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">{enabledModels.length}</strong> enabled models,
                  facilitate cross-model peer critique, and synthesize one authoritative answer.
                </p>
              </div>

              <div className="w-full pt-4 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Suggested Collaborative Prompts
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  {[
                    'Design an idempotent distributed job queue with retry backoff in TypeScript.',
                    'Compare monolithic kernel vs. microkernel architecture: latency, security, and trade-offs.',
                    'What are the critical failure modes of Retrieval-Augmented Generation (RAG) at scale?',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputPrompt(preset)}
                      className="text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#131620] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Session Output */
            <div className="space-y-6">
              {/* User Prompt Bubble */}
              <div className="flex justify-end">
                <div className="max-w-2xl rounded-2xl bg-indigo-600 text-white p-4 shadow-sm space-y-2">
                  <div className="text-[11px] font-mono text-indigo-200 flex items-center justify-between">
                    <span>USER REQUEST</span>
                    <span>{new Date(activeSession.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {activeSession.attachedImage && (
                    <div className="rounded-lg overflow-hidden border border-indigo-400/40 my-2 max-w-sm">
                      <img src={activeSession.attachedImage} alt="User attachment" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{activeSession.userPrompt}</p>
                </div>
              </div>

              {/* Progress Banner while executing */}
              {isCollaborating && (
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>{collaborationProgress.message || 'Executing collaboration pipeline...'}</span>
                    </span>
                    <button
                      onClick={cancelCollaboration}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Round 1</div>
                      <div className="text-slate-400">Parallel Responses</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Round 2</div>
                      <div className="text-slate-400">Peer Reviews</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Round 3</div>
                      <div className="text-slate-400">Debate Verification</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Round 4</div>
                      <div className="text-slate-400">Final Master Synthesis</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs for Collective Insights */}
              <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2">
                {[
                  { id: 'synthesis', label: 'Unified Master Synthesis', icon: <Sparkles className="w-3.5 h-3.5" /> },
                  {
                    id: 'reviews',
                    label: `Peer Reviews (${activeSession.rounds.round2_peerReview.length})`,
                    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'debates',
                    label: `Debate Exchanges (${activeSession.rounds.round3_debate.length})`,
                    icon: <Brain className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'individuals',
                    label: `Individual Models (${activeSession.rounds.round1_independent.length})`,
                    icon: <Cpu className="w-3.5 h-3.5" />,
                  },
                  { id: 'telemetry', label: 'Trace & Latency', icon: <Clock className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: UNIFIED MASTER SYNTHESIS */}
              {activeTab === 'synthesis' && (
                <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Consolidated Collective Intelligence
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] border border-indigo-200 dark:border-indigo-800">
                        Synthesizer: {activeSession.rounds.round4_synthesis.modelUsed}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeSession.totalLatencyMs && (
                        <span className="text-slate-400 text-[11px] font-mono">
                          {activeSession.totalLatencyMs}ms total
                        </span>
                      )}
                      <button
                        onClick={copySynthesis}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                        title="Copy synthesis"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Synthesis'}</span>
                      </button>
                    </div>
                  </div>

                  {activeSession.rounds.round4_synthesis.synthesisText ? (
                    <MarkdownView
                      content={activeSession.rounds.round4_synthesis.synthesisText}
                      className="text-slate-800 dark:text-slate-200"
                    />
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Synthesis is pending or running...
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-2">
                      <span>Contributors:</span>
                      {activeSession.rounds.round1_independent.map((r) => (
                        <span
                          key={r.modelId}
                          className={`px-1.5 py-0.2 rounded font-mono text-[10px] border ${
                            r.status === 'completed'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {r.modelName}
                        </span>
                      ))}
                    </div>
                    <span>Attribution preserved. No single-model truncation.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: PEER REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {activeSession.rounds.round2_peerReview.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 bg-white dark:bg-[#131620]">
                      No peer reviews recorded for this session. (Enable "Round 2: Peer Review" in pipeline settings).
                    </div>
                  ) : (
                    activeSession.rounds.round2_peerReview.map((rev) => (
                      <div
                        key={rev.reviewerId}
                        className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              Reviewer: {rev.reviewerName}
                            </span>
                            <StatusBadge status={rev.status} />
                          </div>
                          {rev.latencyMs && (
                            <span className="text-[11px] text-slate-400 font-mono">{rev.latencyMs}ms</span>
                          )}
                        </div>
                        <MarkdownView content={rev.critique || rev.error || 'No critique provided.'} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: DEBATE EXCHANGES */}
              {activeTab === 'debates' && (
                <div className="space-y-4">
                  {activeSession.rounds.round3_debate.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 bg-white dark:bg-[#131620]">
                      No structured debate exchanges were triggered for this prompt. You can enable debates in Pipeline Settings or visit the AI Debate Studio.
                    </div>
                  ) : (
                    activeSession.rounds.round3_debate.map((deb, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{deb.topic}</span>
                          <span className="text-slate-400 text-[11px]">
                            {deb.participants?.join(' vs. ') || 'Debate'}
                          </span>
                        </div>
                        <MarkdownView content={deb.exchange || deb.error || ''} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: INDIVIDUAL MODEL OUTPUTS */}
              {activeTab === 'individuals' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeSession.rounds.round1_independent.map((item) => (
                    <div
                      key={item.modelId}
                      className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {item.modelName}
                            </span>
                            <span className="ml-2 font-mono text-[10px] uppercase text-slate-400">
                              {item.provider}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.isSimulated && <StatusBadge status="simulated" label="Simulation" />}
                            <StatusBadge status={item.status} />
                          </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 custom-scrollbar">
                          {item.response ? (
                            <MarkdownView content={item.response} />
                          ) : (
                            <div className="text-rose-600 dark:text-rose-400 text-xs">
                              {item.error || 'Model did not return a response.'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Latency: {item.latencyMs || 0}ms</span>
                        <span>Tokens: {item.usage?.totalTokens || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: TELEMETRY & LATENCY TRACE */}
              {activeTab === 'telemetry' && (
                <div className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-xs font-mono">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Execution Trace & Model Latency Matrix
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-2">MODEL</th>
                          <th className="py-2">PROVIDER</th>
                          <th className="py-2">STATUS</th>
                          <th className="py-2">LATENCY</th>
                          <th className="py-2">PROMPT TOKENS</th>
                          <th className="py-2">COMPLETION TOKENS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {activeSession.rounds.round1_independent.map((m) => (
                          <tr key={m.modelId}>
                            <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{m.modelName}</td>
                            <td className="py-2.5 uppercase text-slate-500">{m.provider}</td>
                            <td className="py-2.5">
                              <StatusBadge status={m.status} />
                            </td>
                            <td className="py-2.5 text-slate-700 dark:text-slate-300">{m.latencyMs || 0}ms</td>
                            <td className="py-2.5 text-slate-500">{m.usage?.promptTokens || 0}</td>
                            <td className="py-2.5 text-slate-500">{m.usage?.completionTokens || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER INPUT BOX */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131a] flex-shrink-0">
          <form onSubmit={handleSend} className="space-y-2 max-w-4xl mx-auto">
            {/* Attachment preview if image uploaded */}
            {attachedImage && (
              <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden p-1 bg-slate-50 dark:bg-slate-900">
                <img src={attachedImage} alt="Attachment" className="h-16 w-16 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131620] focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all p-2">
              <textarea
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask all enabled models... (Shift + Enter for new line, Ctrl + Enter to dispatch)"
                className="w-full resize-none bg-transparent px-2 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSend(e);
                  }
                }}
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Attach image for vision analysis"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Dispatching to <strong className="text-indigo-600 dark:text-indigo-400">{enabledModels.length}</strong> models
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCollaborating ? (
                    <button
                      type="button"
                      onClick={cancelCollaboration}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputPrompt.trim()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Collaborate</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLLABORATION INSPECTOR */}
      {inspectorOpen && (
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#11131a] flex flex-col h-full z-20 flex-shrink-0">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Model Inspector
              </h3>
            </div>
            <button
              onClick={() => setInspectorOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Model Toggles Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0e1017] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Active: {enabledModels.length} / {models.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={enableAllModels}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline px-1"
              >
                All
              </button>
              <span>|</span>
              <button
                onClick={disableAllModels}
                className="text-[11px] text-slate-500 hover:underline px-1"
              >
                None
              </button>
            </div>
          </div>

          {/* Model Selection List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {models.map((model) => (
              <ModelPill
                key={model.id}
                model={model}
                onToggle={() => toggleModel(model.id)}
              />
            ))}
          </div>

          {/* Participation Transparency Ledger */}
          {activeSession && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0e1017] text-xs space-y-2">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Participation Transparency
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                <div>Selected: {activeSession.summary.selectedCount}</div>
                <div>Responded: {activeSession.summary.respondedCount}</div>
                <div>Reviews: {activeSession.summary.peerReviewsCount}</div>
                <div>Failed: {activeSession.summary.failedCount}</div>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
