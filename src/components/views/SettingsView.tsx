import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProviderId, FetchedModel } from '../../types';
import {
  Settings as SettingsIcon,
  Key,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sun,
  Eye,
  EyeOff,
  Search,
  Check,
  RefreshCw,
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
    addFetchedModels,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'collaboration' | 'appearance' | 'about'>('providers');

  // Provider configuration inputs
  const [editingProviderId, setEditingProviderId] = useState<ProviderId>('openrouter');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Model fetching state
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchedModelsList, setFetchedModelsList] = useState<FetchedModel[]>([]);
  const [selectedFetchedIds, setSelectedFetchedIds] = useState<Set<string>>(new Set());
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

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
        message: data.message || data.error,
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

  const handleFetchModels = async (id: ProviderId) => {
    setIsFetchingModels(true);
    setFetchError(null);
    setFetchedModelsList([]);
    setSelectedFetchedIds(new Set());

    try {
      const res = await fetch(`/api/providers/${id}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput || undefined,
          baseUrl: baseUrlInput || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to fetch models`);
      }

      const fetchedList: FetchedModel[] = data.models || [];
      if (fetchedList.length === 0) {
        setFetchError('No models returned by provider.');
      } else {
        setFetchedModelsList(fetchedList);
        // Pre-select models
        setSelectedFetchedIds(new Set(fetchedList.map((m) => m.id)));
      }
    } catch (err: any) {
      setFetchError(err.message || 'Error fetching models from provider.');
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleApplyFetchedModels = () => {
    if (fetchedModelsList.length === 0) return;

    const chosenModels = fetchedModelsList.filter((m) => selectedFetchedIds.has(m.id));
    if (chosenModels.length === 0) {
      alert('Please select at least one model from the list.');
      return;
    }

    addFetchedModels(editingProviderId, chosenModels);
    alert(`Successfully added ${chosenModels.length} model(s) for ${editingProviderId.toUpperCase()}.`);
    setFetchedModelsList([]);
    refreshProviders();
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
        alert(`Provider ${editingProviderId} configuration saved.`);
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

  const filteredFetchedModels = fetchedModelsList.filter(
    (m) =>
      m.id.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Settings & Provider Integrations</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Manage provider API credentials, fetch real available models, and configure participating model definitions.
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
                      setFetchError(null);
                      setFetchedModelsList([]);
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
                    <div className="font-serif font-semibold text-[#c25e2e] dark:text-[#d97757]">Google Gemini Key Active</div>
                    <p className="text-[11px] leading-relaxed text-[#736e65] dark:text-[#9e978b]">
                      Configured via <code className="font-mono bg-[#ebe4d8] dark:bg-[#1a1917] px-1 py-0.5 rounded">GEMINI_API_KEY</code> or server configuration. Click <strong>Fetch Models</strong> below to discover available Gemini models.
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
                        Keys are transmitted securely to the server session and never stored in cleartext.
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
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Fetch Error Message */}
                {fetchError && (
                  <div className="p-3 rounded-xl text-xs flex items-center gap-2 border bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{fetchError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection(selectedProvider.id)}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] hover:bg-[#ede5d5] text-[#2d2b28] dark:text-[#ded8ce] font-medium cursor-pointer transition-colors border border-[#ded7cb] dark:border-[#383530]"
                    >
                      <Clock className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#c25e2e]' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFetchModels(selectedProvider.id)}
                      disabled={isFetchingModels}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f2ecdf] dark:bg-[#2c2925] hover:bg-[#eae1d0] text-[#c25e2e] dark:text-[#d97757] font-semibold cursor-pointer transition-colors border border-[#e5ded0] dark:border-[#3d3831]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? 'Fetching Models...' : 'Fetch Models'}</span>
                    </button>
                  </div>

                  {selectedProvider.id !== 'gemini' && (
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium cursor-pointer shadow-xs transition-colors"
                    >
                      Save Key
                    </button>
                  )}
                </div>

                {/* Fetched Models Checklist Drawer */}
                {fetchedModelsList.length > 0 && (
                  <div className="pt-4 border-t border-[#f0ebd5] dark:border-[#2d2a27] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                        Fetched Models ({fetchedModelsList.length} found)
                      </div>
                      <span className="text-[11px] text-[#8c857b]">
                        {selectedFetchedIds.size} of {fetchedModelsList.length} selected
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8c857b]" />
                      <input
                        type="text"
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        placeholder="Search fetched models..."
                        className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] pl-9 pr-3 py-1.5 text-[#1f1e1d] dark:text-[#ede8e1]"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 border border-[#ded7cb] dark:border-[#383530] rounded-xl p-2 bg-[#fbfaf8] dark:bg-[#1a1917] custom-scrollbar">
                      {filteredFetchedModels.map((m) => {
                        const isChecked = selectedFetchedIds.has(m.id);
                        return (
                          <label
                            key={m.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2ecdf] dark:hover:bg-[#282622] cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const next = new Set(selectedFetchedIds);
                                  if (e.target.checked) next.add(m.id);
                                  else next.delete(m.id);
                                  setSelectedFetchedIds(next);
                                }}
                                className="rounded text-[#c25e2e] focus:ring-[#c25e2e]"
                              />
                              <div className="min-w-0">
                                <div className="font-mono text-xs text-[#1f1e1d] dark:text-[#ede8e1] truncate">{m.id}</div>
                                {m.name !== m.id && <div className="text-[11px] text-[#8c857b] truncate">{m.name}</div>}
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-[#8c857b] flex-shrink-0">{m.contextWindow || '128k'}</span>
                          </label>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyFetchedModels}
                      className="w-full py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                    >
                      Save Selected Models to Picker ({selectedFetchedIds.size})
                    </button>
                  </div>
                )}
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
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={model.isEnabled}
                      onChange={() => toggleModel(model.id)}
                      className="rounded text-[#c25e2e] focus:ring-[#c25e2e] cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="font-serif text-xs font-semibold text-[#1f1e1d] dark:text-[#ede8e1] truncate">{model.name}</div>
                      <div className="font-mono text-[10px] text-[#8c857b] uppercase">{model.provider} • {model.id}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      model.isEnabled ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {model.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-[#736e65] dark:text-[#9e978b]">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE SETTINGS */}
      {activeTab === 'collaboration' && (
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xs text-xs">
          <h3 className="font-serif text-sm font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
            Collective Reasoning Pipeline Controls
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[#ded7cb] dark:border-[#383530] bg-[#fbfaf8] dark:bg-[#1a1917] cursor-pointer">
              <div>
                <div className="font-medium text-[#1f1e1d] dark:text-[#ede8e1]">Round 2: Peer Review</div>
                <div className="text-[11px] text-[#736e65] dark:text-[#9e978b]">
                  Models evaluate each other's responses to spot errors and oversights before synthesis.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPeerReview}
                onChange={(e) => updateSettings({ autoPeerReview: e.target.checked })}
                className="rounded text-[#c25e2e] focus:ring-[#c25e2e]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#ded7cb] dark:border-[#383530] bg-[#fbfaf8] dark:bg-[#1a1917] cursor-pointer">
              <div>
                <div className="font-medium text-[#1f1e1d] dark:text-[#ede8e1]">Strictly Free Model Guard</div>
                <div className="text-[11px] text-[#736e65] dark:text-[#9e978b]">
                  Block paid model execution if turned off.
                </div>
              </div>
              <input
                type="checkbox"
                checked={!settings.allowPaidUsage}
                onChange={(e) => updateSettings({ allowPaidUsage: !e.target.checked })}
                className="rounded text-[#c25e2e] focus:ring-[#c25e2e]"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
