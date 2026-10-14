import React, { useState, useRef } from 'react';
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
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Brain,
  Clock,
  ArrowUp,
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
    <div className="flex h-full w-full overflow-hidden bg-[#faf8f5] dark:bg-[#181716]">
      {/* MAIN CHAT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Subheader - Claude style */}
        <div className="h-11 border-b border-[#e8e2d8] dark:border-[#33302c] px-4 flex items-center justify-between text-xs text-[#736e65] dark:text-[#9e978b] bg-[#f5f2eb]/60 dark:bg-[#1d1c1a]/60">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-[#1f1e1d] dark:text-[#ede8e1]">
              {activeSession ? 'Collective Session: #' + activeSession.sessionId.slice(-6) : 'New Collective Thread'}
            </span>
            {activeSession && (
              <span className="text-[11px] font-mono text-[#8c857b]">
                ({activeSession.summary.respondedCount}/{activeSession.summary.selectedCount} responded)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs hover:bg-[#ede7dc] dark:hover:bg-[#282623] transition-colors cursor-pointer"
              title="Orchestration Parameters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#c25e2e] dark:text-[#d97757]" />
              <span>Pipeline Settings</span>
              {showConfigDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="p-1 rounded-lg text-[#736e65] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] hover:bg-[#ede7dc] dark:hover:bg-[#282623] cursor-pointer"
              title={inspectorOpen ? 'Hide Artifact Inspector' : 'Show Artifact Inspector'}
            >
              {inspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Inline Config Drawer */}
        {showConfigDrawer && (
          <div className="border-b border-[#e8e2d8] dark:border-[#33302c] bg-[#f5f2eb] dark:bg-[#201e1b] p-4 text-xs space-y-3 z-10">
            <div className="flex items-center justify-between font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
              <span>Collective Reasoning Pipeline Settings</span>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="text-[#8c857b] hover:text-[#1f1e1d]"
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
                  className="rounded text-[#c25e2e] focus:ring-[#c25e2e]"
                />
                <div>
                  <div className="font-medium text-[#1f1e1d] dark:text-[#ede8e1]">Round 2: Peer Review</div>
                  <div className="text-[11px] text-[#736e65] dark:text-[#9e978b]">Models critique each other</div>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDebate}
                  onChange={(e) => updateSettings({ autoDebate: e.target.checked })}
                  className="rounded text-[#c25e2e] focus:ring-[#c25e2e]"
                />
                <div>
                  <div className="font-medium text-[#1f1e1d] dark:text-[#ede8e1]">Round 3: Debate</div>
                  <div className="text-[11px] text-[#736e65] dark:text-[#9e978b]">Expose disagreements</div>
                </div>
              </label>

              <div>
                <label className="block text-[#1f1e1d] dark:text-[#ede8e1] font-medium mb-1">
                  Master Synthesizer
                </label>
                <select
                  value={settings.synthesisModel}
                  onChange={(e) => updateSettings({ synthesisModel: e.target.value })}
                  className="w-full text-xs rounded-lg bg-white dark:bg-[#282623] border border-[#ded7cb] dark:border-[#383530] px-2 py-1 text-[#1f1e1d] dark:text-[#ede8e1]"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1f1e1d] dark:text-[#ede8e1] font-medium mb-1">
                  Max Concurrency ({settings.maxConcurrency})
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={settings.maxConcurrency}
                  onChange={(e) => updateSettings({ maxConcurrency: parseInt(e.target.value) })}
                  className="w-full accent-[#c25e2e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* THREAD VIEWPORT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {!activeSession ? (
            /* Claude style empty serene hero */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f2ecdf] dark:bg-[#282622] border border-[#e5ded0] dark:border-[#38342e] flex items-center justify-center text-[#c25e2e] dark:text-[#d97757] shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-xl font-medium text-[#1f1e1d] dark:text-[#ede8e1]">
                  Collective Intelligence Workspace
                </h3>
                <p className="text-xs text-[#736e65] dark:text-[#9e978b] leading-relaxed">
                  Every prompt is sent to all <strong className="text-[#c25e2e] dark:text-[#d97757] font-semibold">{enabledModels.length} enabled models</strong>. They evaluate in parallel, critique each other's blind spots, and synthesize one authoritative answer.
                </p>
              </div>

              <div className="w-full pt-4 space-y-2">
                <div className="text-[11px] font-semibold text-[#8c857b] uppercase tracking-wider">
                  Suggested Prompts
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  {[
                    'Design an idempotent distributed job queue with retry backoff in TypeScript.',
                    'Compare monolithic kernel vs. microkernel architecture: latency, security, and trade-offs.',
                    'What are the critical failure modes of Retrieval-Augmented Generation (RAG) at scale?',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputPrompt(preset)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] text-[#2d2b28] dark:text-[#ded8ce] hover:border-[#c25e2e] dark:hover:border-[#d97757] transition-all cursor-pointer shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Session Thread */
            <div className="space-y-6">
              {/* User Prompt (Claude warm bubble) */}
              <div className="flex justify-end">
                <div className="max-w-2xl rounded-2xl bg-[#ede7dc] dark:bg-[#282623] border border-[#ded7cb] dark:border-[#383530] text-[#1f1e1d] dark:text-[#ede8e1] p-4 shadow-2xs space-y-2">
                  <div className="text-[10px] font-mono text-[#857e74] dark:text-[#8a847a] flex items-center justify-between">
                    <span>USER REQUEST</span>
                    <span>{new Date(activeSession.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {activeSession.attachedImage && (
                    <div className="rounded-xl overflow-hidden border border-[#ded7cb] my-2 max-w-sm">
                      <img src={activeSession.attachedImage} alt="User attachment" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{activeSession.userPrompt}</p>
                </div>
              </div>

              {/* Progress Banner while executing */}
              {isCollaborating && (
                <div className="rounded-2xl border border-[#ded7cb] dark:border-[#383530] bg-[#f8f5ee] dark:bg-[#201e1b] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#824422] dark:text-[#e08967] font-medium">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-[#c25e2e]" />
                      <span>{collaborationProgress.message || 'Executing collaboration pipeline...'}</span>
                    </span>
                    <button
                      onClick={cancelCollaboration}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#242220] border border-[#e5ded0] dark:border-[#33302c] text-center">
                      <div className="font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Round 1</div>
                      <div className="text-[#8c857b]">Parallel Responses</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#242220] border border-[#e5ded0] dark:border-[#33302c] text-center">
                      <div className="font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Round 2</div>
                      <div className="text-[#8c857b]">Peer Reviews</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#242220] border border-[#e5ded0] dark:border-[#33302c] text-center">
                      <div className="font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Round 3</div>
                      <div className="text-[#8c857b]">Debate Verification</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#242220] border border-[#e5ded0] dark:border-[#33302c] text-center">
                      <div className="font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Round 4</div>
                      <div className="text-[#8c857b]">Unified Synthesis</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs - Claude style terracotta underline */}
              <div className="border-b border-[#e8e2d8] dark:border-[#33302c] flex gap-2">
                {[
                  { id: 'synthesis', label: 'Master Synthesis', icon: <Sparkles className="w-3.5 h-3.5" /> },
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
                  { id: 'telemetry', label: 'Latency & Tokens', icon: <Clock className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#c25e2e] text-[#c25e2e] dark:border-[#d97757] dark:text-[#d97757] font-semibold'
                        : 'border-transparent text-[#787268] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: UNIFIED MASTER SYNTHESIS */}
              {activeTab === 'synthesis' && (
                <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c25e2e] dark:bg-[#d97757]" />
                      <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1] text-sm">
                        Consolidated Collective Intelligence
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#f5f0e6] dark:bg-[#2b2825] text-[#824422] dark:text-[#e08967] font-mono text-[10px] border border-[#e5ded0] dark:border-[#38342e]">
                        Synthesizer: {activeSession.rounds.round4_synthesis.modelUsed}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeSession.totalLatencyMs && (
                        <span className="text-[#8c857b] text-[11px] font-mono">
                          {activeSession.totalLatencyMs}ms total
                        </span>
                      )}
                      <button
                        onClick={copySynthesis}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f5f0e6] dark:bg-[#2b2825] hover:bg-[#ede5d5] text-[#2d2b28] dark:text-[#ded8ce] text-xs font-medium transition-colors cursor-pointer border border-[#e5ded0] dark:border-[#38342e]"
                        title="Copy synthesis"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {activeSession.rounds.round4_synthesis.synthesisText ? (
                    <MarkdownView
                      content={activeSession.rounds.round4_synthesis.synthesisText}
                      className="text-[#1f1e1d] dark:text-[#ede8e1]"
                    />
                  ) : (
                    <div className="text-center py-6 text-xs text-[#8c857b]">
                      Synthesis is pending or running...
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#f0ebd5] dark:border-[#2d2a27] flex flex-wrap items-center justify-between text-[11px] text-[#8c857b] gap-2">
                    <div className="flex items-center gap-2">
                      <span>Contributors:</span>
                      {activeSession.rounds.round1_independent.map((r) => (
                        <span
                          key={r.modelId}
                          className="px-1.5 py-0.2 rounded-md font-mono text-[10px] bg-[#f5f0e6] dark:bg-[#2b2825] text-[#5e584f] dark:text-[#9e978b] border border-[#e5ded0] dark:border-[#38342e]"
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
                    <div className="rounded-2xl border border-[#ded7cb] dark:border-[#383530] p-8 text-center text-xs text-[#8c857b] bg-white dark:bg-[#22201e]">
                      No peer reviews recorded for this session. (Enable "Round 2: Peer Review" in pipeline settings).
                    </div>
                  ) : (
                    activeSession.rounds.round2_peerReview.map((rev) => (
                      <div
                        key={rev.reviewerId}
                        className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                              Reviewer: {rev.reviewerName}
                            </span>
                            <StatusBadge status={rev.status} />
                          </div>
                          {rev.latencyMs && (
                            <span className="text-[11px] text-[#8c857b] font-mono">{rev.latencyMs}ms</span>
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
                    <div className="rounded-2xl border border-[#ded7cb] dark:border-[#383530] p-8 text-center text-xs text-[#8c857b] bg-white dark:bg-[#22201e]">
                      No structured debate exchanges were triggered for this prompt.
                    </div>
                  ) : (
                    activeSession.rounds.round3_debate.map((deb, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                          <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">{deb.topic}</span>
                          <span className="text-[#8c857b] text-[11px]">
                            {deb.participants?.join(' vs. ') || 'Debate'}
                          </span>
                        </div>
                        <MarkdownView content={deb.exchange || deb.error || ''} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: INDIVIDUAL MODELS */}
              {activeTab === 'individuals' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeSession.rounds.round1_independent.map((item) => (
                    <div
                      key={item.modelId}
                      className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-3 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                          <div>
                            <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                              {item.modelName}
                            </span>
                            <span className="ml-2 font-mono text-[10px] uppercase text-[#8c857b]">
                              {item.provider}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.isSimulated && <StatusBadge status="simulated" label="Simulation" />}
                            <StatusBadge status={item.status} />
                          </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto text-xs text-[#2e2c29] dark:text-[#ded8ce] custom-scrollbar">
                          {item.response ? (
                            <MarkdownView content={item.response} />
                          ) : (
                            <div className="text-rose-600 text-xs">
                              {item.error || 'Model did not return a response.'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#f0ebd5] dark:border-[#2d2a27] flex items-center justify-between text-[11px] text-[#8c857b] font-mono">
                        <span>Latency: {item.latencyMs || 0}ms</span>
                        <span>Tokens: {item.usage?.totalTokens || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: TELEMETRY & LATENCY */}
              {activeTab === 'telemetry' && (
                <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-4 text-xs font-mono">
                  <h4 className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1] text-sm">
                    Execution Trace & Latency Matrix
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#ded7cb] dark:border-[#383530] text-[#8c857b] text-[11px]">
                          <th className="py-2">MODEL</th>
                          <th className="py-2">PROVIDER</th>
                          <th className="py-2">STATUS</th>
                          <th className="py-2">LATENCY</th>
                          <th className="py-2">PROMPT TOKENS</th>
                          <th className="py-2">COMPLETION TOKENS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f2ecdf] dark:divide-[#2b2825]">
                        {activeSession.rounds.round1_independent.map((m) => (
                          <tr key={m.modelId}>
                            <td className="py-2.5 font-medium text-[#1f1e1d] dark:text-[#ede8e1]">{m.modelName}</td>
                            <td className="py-2.5 uppercase text-[#8c857b]">{m.provider}</td>
                            <td className="py-2.5">
                              <StatusBadge status={m.status} />
                            </td>
                            <td className="py-2.5 text-[#2d2b28] dark:text-[#ded8ce]">{m.latencyMs || 0}ms</td>
                            <td className="py-2.5 text-[#8c857b]">{m.usage?.promptTokens || 0}</td>
                            <td className="py-2.5 text-[#8c857b]">{m.usage?.completionTokens || 0}</td>
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

        {/* CLAUDE STYLE COMPOSER AT BOTTOM */}
        <div className="p-4 border-t border-[#e8e2d8] dark:border-[#33302c] bg-[#faf8f5]/80 dark:bg-[#181716]/80 flex-shrink-0">
          <form onSubmit={handleSend} className="space-y-2 max-w-3xl mx-auto">
            {attachedImage && (
              <div className="relative inline-block border border-[#ded7cb] rounded-xl overflow-hidden p-1 bg-white dark:bg-[#22201e]">
                <img src={attachedImage} alt="Attachment" className="h-16 w-16 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-[#181716]/80 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative rounded-2xl border border-[#ded7cb] dark:border-[#383530] bg-white dark:bg-[#22201e] focus-within:ring-2 focus-within:ring-[#c25e2e]/30 focus-within:border-[#c25e2e] transition-all p-2.5 shadow-md">
              <textarea
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask all enabled models... (Shift + Enter for newline, Ctrl + Enter to collaborate)"
                className="w-full resize-none bg-transparent px-2 py-1 text-sm text-[#1f1e1d] dark:text-[#ede8e1] placeholder-[#9c9589] focus:outline-hidden leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSend(e);
                  }
                }}
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#f0ebd5] dark:border-[#2d2a27] px-2 text-xs">
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
                    className="p-1.5 rounded-lg text-[#8c857b] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] hover:bg-[#f5f0e6] dark:hover:bg-[#2b2825] transition-colors cursor-pointer"
                    title="Attach image"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-[#8c857b] font-medium hidden sm:inline">
                    Dispatching to <strong className="text-[#c25e2e] dark:text-[#d97757]">{enabledModels.length}</strong> models
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCollaborating ? (
                    <button
                      type="button"
                      onClick={cancelCollaboration}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputPrompt.trim()}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#c25e2e] hover:bg-[#b05225] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-xs"
                      title="Collaborate"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* CLAUDE STYLE ARTIFACT / MODEL INSPECTOR DRAWER */}
      {inspectorOpen && (
        <aside className="w-80 border-l border-[#e8e2d8] dark:border-[#33302c] bg-[#f5f2eb] dark:bg-[#1d1c1a] flex flex-col h-full z-20 flex-shrink-0">
          <div className="p-3.5 border-b border-[#e8e2d8] dark:border-[#33302c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#c25e2e] dark:text-[#d97757]" />
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#1f1e1d] dark:text-[#ede8e1]">
                Model Inspector
              </h3>
            </div>
            <button
              onClick={() => setInspectorOpen(false)}
              className="text-[#8c857b] hover:text-[#1f1e1d] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-[#e8e2d8] dark:border-[#33302c] bg-[#ede7dc]/40 dark:bg-[#181716] flex items-center justify-between text-xs">
            <span className="text-[#6e685e] dark:text-[#9e978b] font-medium">
              Active: {enabledModels.length} / {models.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={enableAllModels}
                className="text-[11px] text-[#c25e2e] dark:text-[#d97757] hover:underline"
              >
                All
              </button>
              <span className="text-[#aba396]">|</span>
              <button
                onClick={disableAllModels}
                className="text-[11px] text-[#8c857b] hover:underline"
              >
                None
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {models.map((model) => (
              <ModelPill
                key={model.id}
                model={model}
                onToggle={() => toggleModel(model.id)}
              />
            ))}
          </div>

          {activeSession && (
            <div className="p-3 border-t border-[#e8e2d8] dark:border-[#33302c] bg-[#ede7dc]/50 dark:bg-[#181716] text-xs space-y-1.5">
              <div className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                Participation Transparency
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#736e65] dark:text-[#9e978b] font-mono">
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
