import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProviderId, ModelDefinition } from '../../types';
import { ModelPill } from '../common/ModelPill';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Moon,
  Sun,
  Server,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

export function SettingsView() {
  const {
    providers,
    refreshProviders,
    models,
    toggleModel,
    enableAllModels,
    disableAllModels,
    settings,
    updateSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'collaboration' | 'appearance' | 'about'>('providers');

  // Provider configuration inputs
  const [editingProviderId, setEditingProviderId] = useState<ProviderId | null>('openrouter');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedProvider = providers.find((p) => p.id === editingProviderId);

  const handleTestConnection = async (id: ProviderId) => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/providers/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput || undefined,
          baseUrl: baseUrlInput || undefined,
        }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
      });
      refreshProviders();
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProviderId) return;

    try {
      const res = await fetch(`/api/providers/${editingProviderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput,
          baseUrl: baseUrlInput || undefined,
          enabled: true,
        }),
      });

      if (res.ok) {
        alert(`Provider ${editingProviderId} updated successfully.`);
        setApiKeyInput('');
        refreshProviders();
      }
    } catch (e) {
      alert('Failed to save provider config.');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all TITAN AI settings, models, and local preferences to default?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Claude Style Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Settings & Provider Integrations</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Manage provider API credentials, test network connectivity, configure models, and tune collaboration parameters.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ded7cb] dark:border-[#383530] text-[#736e65] dark:text-[#9e978b] hover:text-rose-600 text-xs font-medium cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#e8e2d8] dark:border-[#33302c] gap-2">
        {[
          { id: 'providers', label: 'Providers & API Keys', icon: <Key className="w-3.5 h-3.5" /> },
          { id: 'models', label: 'Models & Capabilities', icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'collaboration', label: 'Collaboration Pipeline', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'appearance', label: 'Appearance & Themes', icon: <Sun className="w-3.5 h-3.5" /> },
          { id: 'about', label: 'About TITAN AI', icon: <Sparkles className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#c25e2e] text-[#c25e2e] dark:border-[#d97757] dark:text-[#d97757] font-semibold'
                : 'border-transparent text-[#736e65] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROVIDERS & API KEYS */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Provider List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f]">
              Integrated Providers
            </span>
            <div className="space-y-1.5">
              {providers.map((p) => {
                const isSelected = editingProviderId === p.id;
                const isConnected = p.status === 'connected' || p.hasKey;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setEditingProviderId(p.id);
                      setTestResult(null);
                      setApiKeyInput('');
                      setBaseUrlInput(p.baseUrl || '');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#fbeee6] dark:bg-[#2d221c] border-[#c25e2e] dark:border-[#d97757] shadow-xs ring-1 ring-[#c25e2e]/20'
                        : 'bg-white dark:bg-[#22201e] border-[#ded7cb] dark:border-[#383530] hover:border-[#c25e2e]/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">{p.name}</div>
                      <div className="text-[11px] text-[#8c857b] truncate max-w-[140px]">{p.description}</div>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-emerald-500' : 'bg-[#ded7cb] dark:bg-[#383530]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Configuration Form */}
          <div className="md:col-span-2">
            {selectedProvider ? (
              <form
                onSubmit={handleSaveProvider}
                className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                      {selectedProvider.name} Configuration
                    </h3>
                    <p className="text-[#8c857b] text-[11px] mt-0.5">{selectedProvider.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase font-mono border ${
                      selectedProvider.hasKey || selectedProvider.status === 'connected'
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                        : 'bg-[#f5f0e6] text-[#736e65] dark:bg-[#282622] dark:text-[#9e978b] border-[#ded7cb] dark:border-[#383530]'
                    }`}
                  >
                    {selectedProvider.status}
                  </span>
                </div>

                {selectedProvider.id === 'gemini' ? (
                  <div className="p-4 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] border border-[#e5ded0] dark:border-[#38342e] text-xs text-[#2d2b28] dark:text-[#ded8ce] space-y-1">
                    <div className="font-serif font-semibold text-[#c25e2e] dark:text-[#d97757]">Automatic Server-Side Injection</div>
                    <p className="text-[11px] leading-relaxed text-[#736e65] dark:text-[#9e978b]">
                      Google Gemini API is configured via the <code className="font-mono bg-[#ebe4d8] dark:bg-[#1a1917] px-1 py-0.5 rounded">GEMINI_API_KEY</code> environment secret on the backend. No manual browser key entry is required.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 text-xs">
                      <label className="block text-[#615c54] dark:text-[#9e978b] font-medium">
                        API Key / Secret Token
                      </label>
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder="Paste API key (masked for security)..."
                          className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] font-mono pr-9 focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2.5 top-2.5 text-[#8c857b] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] cursor-pointer"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8c857b]">
                        Keys are submitted securely to the server session and never logged.
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="block text-[#615c54] dark:text-[#9e978b] font-medium">
                        Base Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={baseUrlInput || selectedProvider.baseUrl || ''}
                        onChange={(e) => setBaseUrlInput(e.target.value)}
                        placeholder="https://api.example.com/v1"
                        className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
                      />
                    </div>
                  </>
                )}

                {/* Test Result Message */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                  <button
                    type="button"
                    onClick={() => handleTestConnection(selectedProvider.id)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] hover:bg-[#ede5d5] text-[#2d2b28] dark:text-[#ded8ce] font-medium cursor-pointer transition-colors border border-[#ded7cb] dark:border-[#383530]"
                  >
                    <Clock className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#c25e2e]' : ''}`} />
                    <span>{isTesting ? 'Pinging Provider...' : 'Test Connection'}</span>
                  </button>

                  {selectedProvider.id !== 'gemini' && (
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium cursor-pointer shadow-xs transition-colors"
                    >
                      Save Configuration
                    </button>
                  )}
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: MODELS & CAPABILITIES */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Manage participating models across all providers. Enabled models participate in collective runs.
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={enableAllModels}
                className="px-3 py-1.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#2d2b28] dark:text-[#ded8ce] hover:bg-[#ede5d5] border border-[#ded7cb] dark:border-[#383530] font-medium cursor-pointer"
              >
                Enable All
              </button>
              <button
                onClick={disableAllModels}
                className="px-3 py-1.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#2d2b28] dark:text-[#ded8ce] hover:bg-[#ede5d5] border border-[#ded7cb] dark:border-[#383530] font-medium cursor-pointer"
              >
                Disable All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {models.map((model) => (
              <div
                key={model.id}
                className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-4 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={model.isEnabled}
                      onChange={() => toggleModel(model.id)}
                      className="rounded accent-[#c25e2e] cursor-pointer"
                    />
                    <span className="font-serif text-xs font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                      {model.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#f5f0e6] dark:bg-[#282622] text-[#736e65] dark:text-[#9e978b] border border-[#ded7cb] dark:border-[#383530]">
                      {model.provider}
                    </span>
                  </div>

                  {model.isFree && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                      Free Tier
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#736e65] dark:text-[#9e978b] leading-relaxed">
                  {model.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-mono text-[#8c857b] pt-1">
                  <span>Context: {model.contextWindow}</span>
                  <span>•</span>
                  <span>Vision: {model.capabilities.vision ? 'Yes' : 'No'}</span>
                  <span>•</span>
                  <span>Coding: {model.capabilities.coding ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COLLABORATION PIPELINE */}
      {activeTab === 'collaboration' && (
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
              Collective Reasoning & Pipeline Defaults
            </h3>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Configure how models interact across the 4 stages of collaboration.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#ded7cb] dark:border-[#383530] bg-[#fbfaf8] dark:bg-[#1a1917] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoPeerReview}
                onChange={(e) => updateSettings({ autoPeerReview: e.target.checked })}
                className="mt-0.5 rounded accent-[#c25e2e]"
              />
              <div>
                <div className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                  Round 2: Cross-Model Peer Review (Recommended)
                </div>
                <div className="text-[#736e65] dark:text-[#9e978b] mt-0.5 leading-relaxed">
                  Models critique each other's proposals, pinpointing missing edge cases, security vulnerabilities, and contradictions.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#ded7cb] dark:border-[#383530] bg-[#fbfaf8] dark:bg-[#1a1917] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoDebate}
                onChange={(e) => updateSettings({ autoDebate: e.target.checked })}
                className="mt-0.5 rounded accent-[#c25e2e]"
              />
              <div>
                <div className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                  Round 3: Automatic Debate Triggering
                </div>
                <div className="text-[#736e65] dark:text-[#9e978b] mt-0.5 leading-relaxed">
                  When opposing model proposals contradict, automatically stage an adversarial challenge round.
                </div>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[#615c54] dark:text-[#9e978b] font-medium mb-1">
                  Master Synthesizer Model
                </label>
                <select
                  value={settings.synthesisModel}
                  onChange={(e) => updateSettings({ synthesisModel: e.target.value })}
                  className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1]"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Built-in High Speed)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B Instruct</option>
                </select>
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e978b] font-medium mb-1">
                  Maximum Concurrent Invocations ({settings.maxConcurrency})
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.maxConcurrency}
                  onChange={(e) => updateSettings({ maxConcurrency: parseInt(e.target.value) })}
                  className="w-full accent-[#c25e2e] mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xs">
          <h3 className="font-serif text-sm font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Appearance & Workspace Theme</h3>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'border-[#c25e2e] bg-[#fbeee6]/60 text-[#1f1e1d] ring-2 ring-[#c25e2e]/20 shadow-xs'
                  : 'border-[#ded7cb] dark:border-[#383530] bg-white dark:bg-[#22201e] text-[#736e65] dark:text-[#9e978b]'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-[#c25e2e]" />
              <div className="font-serif text-xs font-semibold">Light Theme</div>
              <div className="text-[11px] text-[#8c857b]">Warm parchment ecru</div>
            </button>

            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'border-[#d97757] bg-[#2d221c]/60 text-[#ede8e1] ring-2 ring-[#d97757]/20 shadow-xs'
                  : 'border-[#ded7cb] dark:border-[#383530] bg-white dark:bg-[#22201e] text-[#736e65] dark:text-[#9e978b]'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-[#d97757]" />
              <div className="font-serif text-xs font-semibold">Dark Theme</div>
              <div className="text-[11px] text-[#8c857b]">Warm espresso obsidian</div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: ABOUT */}
      {activeTab === 'about' && (
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xs text-xs text-[#615c54] dark:text-[#9e978b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c25e2e] dark:bg-[#d97757] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
              T
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">TITAN AI</h3>
              <p className="text-[#c25e2e] dark:text-[#d97757] font-medium text-xs">
                Intelligence, Working Together.
              </p>
            </div>
          </div>

          <p className="leading-relaxed text-[#2d2b28] dark:text-[#ded8ce]">
            TITAN AI is a collective multi-model intelligence platform that rejects single-model routing in favor of true multi-perspective reasoning. By querying independent neural architectures concurrently, coordinating peer critiques, debating contentious trade-offs, and distilling unified master syntheses, TITAN AI elevates AI-assisted thinking to empirical consensus.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
            <div className="p-3 rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530]">
              <span className="text-[#8c857b]">Version:</span> 1.0.0 Production Core
            </div>
            <div className="p-3 rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530]">
              <span className="text-[#8c857b]">Design:</span> Claude UI (Warm Ecru & Espresso)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
