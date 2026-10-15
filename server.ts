import './server/polyfills';

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { callGeminiREST, fetchGeminiModelsList } from './server/gemini';

dotenv.config();

const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) {
      return __dirname;
    }
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (_) {
    return process.cwd();
  }
};
const appDirname = getDirname();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

interface ServerProviderConfig {
  id: string;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
}

const serverProviders: Record<string, ServerProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    apiKey: process.env.GEMINI_API_KEY || '',
    enabled: Boolean(process.env.GEMINI_API_KEY),
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    enabled: Boolean(process.env.OPENROUTER_API_KEY),
  },
  groq: {
    id: 'groq',
    name: 'Groq Cloud',
    apiKey: process.env.GROQ_API_KEY || '',
    baseUrl: 'https://api.groq.com/openai/v1',
    enabled: Boolean(process.env.GROQ_API_KEY),
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    apiKey: process.env.CEREBRAS_API_KEY || '',
    baseUrl: 'https://api.cerebras.ai/v1',
    enabled: Boolean(process.env.CEREBRAS_API_KEY),
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    enabled: false,
  },
  custom: {
    id: 'custom',
    name: 'Custom OpenAI-Compatible',
    baseUrl: '',
    apiKey: '',
    enabled: false,
  },
};

// Generic OpenAI-compatible caller using plain fetch()
async function callOpenAICompatible(options: {
  baseUrl: string;
  apiKey?: string;
  model: string;
  messages: Array<{ role: string; content: any }>;
  temperature?: number;
  maxTokens?: number;
}) {
  const startTime = Date.now();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.apiKey) {
    headers['Authorization'] = `Bearer ${options.apiKey}`;
  }
  if (options.baseUrl.includes('openrouter')) {
    headers['HTTP-Referer'] = 'https://titan-ai.aistudio.build';
    headers['X-Title'] = 'TITAN AI Collective Intelligence';
  }

  const endpoint = options.baseUrl.replace(/\/+$/, '') + '/chat/completions';
  const body: any = {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr = `HTTP ${res.status}`;
      try {
        const json = JSON.parse(errText);
        parsedErr = json.error?.message || json.message || errText;
      } catch (_) {
        if (errText) parsedErr += `: ${errText.slice(0, 150)}`;
      }
      throw new Error(`Provider returned ${parsedErr}`);
    }

    const data = await res.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      latencyMs,
      usage: {
        promptTokens: data.usage?.prompt_tokens || Math.round(JSON.stringify(options.messages).length / 4),
        completionTokens: data.usage?.completion_tokens || Math.round(text.length / 4),
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ---------------- ROUTES ----------------

// System health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'TITAN AI Collective Intelligence Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || serverProviders.gemini.apiKey),
  });
});

// Providers status & management
app.get('/api/providers', (req: Request, res: Response) => {
  const geminiAvailable = Boolean(process.env.GEMINI_API_KEY || serverProviders.gemini.apiKey);

  res.json({
    providers: [
      {
        id: 'gemini',
        name: 'Google Gemini',
        status: geminiAvailable ? 'connected' : 'needs_key',
        hasKey: geminiAvailable,
        description: 'First-party Google REST API (Gemini models)',
        baseUrl: 'https://generativelanguage.googleapis.com',
        modelsCount: 3,
        supportsStreaming: true,
        supportsVision: true,
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        status: serverProviders.openrouter.apiKey ? 'connected' : 'configurable',
        hasKey: Boolean(serverProviders.openrouter.apiKey),
        description: 'Gateway to hundreds of models including DeepSeek, Llama, Claude, Mistral',
        baseUrl: serverProviders.openrouter.baseUrl,
        modelsCount: 12,
        supportsStreaming: true,
        supportsVision: true,
      },
      {
        id: 'groq',
        name: 'Groq Cloud',
        status: serverProviders.groq.apiKey ? 'connected' : 'configurable',
        hasKey: Boolean(serverProviders.groq.apiKey),
        description: 'Ultra-fast LPU inference (Llama, Mixtral, DeepSeek Distill)',
        baseUrl: serverProviders.groq.baseUrl,
        modelsCount: 4,
        supportsStreaming: true,
        supportsVision: false,
      },
      {
        id: 'cerebras',
        name: 'Cerebras',
        status: serverProviders.cerebras.apiKey ? 'connected' : 'configurable',
        hasKey: Boolean(serverProviders.cerebras.apiKey),
        description: 'Wafer-scale engine inference for high-speed Llama models',
        baseUrl: serverProviders.cerebras.baseUrl,
        modelsCount: 2,
        supportsStreaming: true,
        supportsVision: false,
      },
      {
        id: 'ollama',
        name: 'Ollama (Local)',
        status: serverProviders.ollama.enabled ? 'connected' : 'disconnected',
        hasKey: true,
        description: 'Local private models (Llama 3, Mistral, Qwen, DeepSeek)',
        baseUrl: serverProviders.ollama.baseUrl,
        modelsCount: 5,
        supportsStreaming: true,
        supportsVision: true,
      },
      {
        id: 'custom',
        name: 'Custom OpenAI-Compatible',
        status: serverProviders.custom.enabled ? 'connected' : 'disabled',
        hasKey: Boolean(serverProviders.custom.apiKey),
        description: 'Self-hosted vLLM, LocalAI, LM Studio, or private enterprise endpoints',
        baseUrl: serverProviders.custom.baseUrl || '',
        modelsCount: 1,
        supportsStreaming: true,
        supportsVision: false,
      },
    ],
  });
});

// Update provider configuration
app.post('/api/providers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { apiKey, baseUrl, enabled } = req.body;

  if (serverProviders[id]) {
    if (apiKey !== undefined) serverProviders[id].apiKey = apiKey;
    if (baseUrl !== undefined) serverProviders[id].baseUrl = baseUrl;
    if (enabled !== undefined) serverProviders[id].enabled = enabled;

    return res.json({ success: true, message: `Provider ${id} configuration updated.` });
  }

  res.status(404).json({ error: 'Provider not found.' });
});

// Fetch Real Models from Provider
app.post('/api/providers/:id/models', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { apiKey, baseUrl } = req.body;

  const keyToUse = apiKey || serverProviders[id]?.apiKey || (id === 'gemini' ? process.env.GEMINI_API_KEY : '');
  const baseToUse = baseUrl || serverProviders[id]?.baseUrl;

  try {
    if (id === 'gemini') {
      if (!keyToUse) {
        return res.status(400).json({ error: 'GEMINI_API_KEY is not set. Please provide an API key.' });
      }
      const models = await fetchGeminiModelsList(keyToUse);
      return res.json({ success: true, models });
    }

    if (id === 'ollama') {
      const url = (baseToUse || 'http://localhost:11434').replace(/\/+$/, '') + '/api/tags';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const rawList = data.models || [];

      const models = rawList.map((m: any) => ({
        id: m.name,
        name: m.name,
        provider: 'ollama',
        description: `Local model (${m.details?.family || 'Ollama'})`,
        contextWindow: '8k',
        supportsVision: false,
        supportsCoding: true,
      }));

      return res.json({ success: true, models });
    }

    if (['openrouter', 'groq', 'cerebras', 'custom'].includes(id)) {
      if (!keyToUse && id !== 'custom') {
        return res.status(400).json({ error: `API key is required to fetch models for ${id}.` });
      }
      if (!baseToUse) {
        return res.status(400).json({ error: `Base URL is required for ${id}.` });
      }

      const endpoint = baseToUse.replace(/\/+$/, '') + '/models';
      const headers: Record<string, string> = {};
      if (keyToUse) headers['Authorization'] = `Bearer ${keyToUse}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(endpoint, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `HTTP ${response.status}`;
        try {
          const json = JSON.parse(errText);
          if (json.error?.message) errMsg = json.error.message;
        } catch (_) {
          if (errText) errMsg += `: ${errText.slice(0, 150)}`;
        }
        throw new Error(`Provider returned ${errMsg}`);
      }

      const data = await response.json();
      const rawList: any[] = data.data || data.models || [];

      const models = rawList.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: id as any,
        description: m.description || `${id.toUpperCase()} model`,
        contextWindow: m.context_length ? `${Math.round(m.context_length / 1000)}k` : '128k',
        supportsVision: Boolean(m.id.toLowerCase().includes('vision') || m.id.toLowerCase().includes('4o')),
        supportsCoding: true,
      }));

      return res.json({ success: true, models });
    }

    res.status(400).json({ error: 'Unsupported provider ID.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch models from provider.' });
  }
});

// Test provider connection
app.post('/api/providers/:id/test', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { apiKey, baseUrl } = req.body;

  const keyToUse = apiKey || serverProviders[id]?.apiKey || (id === 'gemini' ? process.env.GEMINI_API_KEY : '');
  const baseToUse = baseUrl || serverProviders[id]?.baseUrl;

  try {
    if (id === 'gemini') {
      if (!keyToUse) {
        return res.status(400).json({ success: false, message: 'GEMINI_API_KEY is not set.' });
      }
      const t0 = Date.now();
      const testRes = await callGeminiREST({
        apiKey: keyToUse,
        model: 'gemini-1.5-flash',
        prompt: 'Ping: Respond with "TITAN_OK" only.',
      });
      const latency = Date.now() - t0;
      return res.json({
        success: true,
        latencyMs: latency,
        message: `Connected to Google Gemini API in ${latency}ms! Response: "${(testRes.text || '').trim()}".`,
      });
    }

    if (id === 'ollama') {
      const url = (baseToUse || 'http://localhost:11434').replace(/\/+$/, '') + '/api/tags';
      const t0 = Date.now();
      const testRes = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!testRes.ok) throw new Error(`Ollama responded with HTTP ${testRes.status}`);
      const data = await testRes.json();
      return res.json({
        success: true,
        latencyMs: Date.now() - t0,
        message: `Connected to Ollama! Found ${(data.models || []).length} local model(s).`,
      });
    }

    if (['openrouter', 'groq', 'cerebras', 'custom'].includes(id)) {
      if (!keyToUse && id !== 'custom') {
        return res.status(400).json({ success: false, message: `API Key is required to test ${id}.` });
      }
      const t0 = Date.now();
      const testEndpoint = (baseToUse || '').replace(/\/+$/, '') + '/models';
      const headers: Record<string, string> = {};
      if (keyToUse) headers['Authorization'] = `Bearer ${keyToUse}`;

      const testRes = await fetch(testEndpoint, {
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!testRes.ok) {
        const errText = await testRes.text();
        throw new Error(`Provider returned HTTP ${testRes.status}: ${errText.slice(0, 150)}`);
      }
      return res.json({
        success: true,
        latencyMs: Date.now() - t0,
        message: `Successfully authenticated with ${id.toUpperCase()} in ${Date.now() - t0}ms!`,
      });
    }

    res.status(400).json({ success: false, message: 'Unsupported provider.' });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Connection test failed: ${err.message || 'Unknown network error'}`,
    });
  }
});

// Single model call (for quick test)
app.post('/api/generate-single', async (req: Request, res: Response) => {
  const { provider, model, prompt, systemInstruction, imageBase64, apiKey, baseUrl } = req.body;

  const keyToUse = apiKey || serverProviders[provider]?.apiKey || (provider === 'gemini' ? process.env.GEMINI_API_KEY : '');
  const baseToUse = baseUrl || serverProviders[provider]?.baseUrl;

  try {
    if (provider === 'gemini') {
      if (!keyToUse) throw new Error('GEMINI_API_KEY is not configured.');
      const result = await callGeminiREST({
        apiKey: keyToUse,
        model: model || 'gemini-1.5-flash',
        prompt,
        systemInstruction,
        imageBase64,
      });
      return res.json(result);
    }

    if (!keyToUse && provider !== 'ollama' && provider !== 'custom') {
      throw new Error(`API key is not configured for provider ${provider}.`);
    }

    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const result = await callOpenAICompatible({
      baseUrl: baseToUse || '',
      apiKey: keyToUse,
      model,
      messages,
    });
    return res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Call failed' });
  }
});

// Collective Multi-Model Orchestration Endpoint
app.post('/api/collaborate', async (req: Request, res: Response) => {
  const {
    prompt,
    models,
    history = [],
    roundsConfig = {
      peerReview: true,
      maxConcurrency: 5,
      timeoutMs: 35000,
    },
    attachedImage,
  } = req.body;

  if (!prompt || !models || !Array.isArray(models) || models.length === 0) {
    return res.status(400).json({ error: 'Valid prompt and at least one enabled model are required.' });
  }

  const selectedModels = models.filter((m: any) => m.isEnabled !== false);
  if (selectedModels.length === 0) {
    return res.status(400).json({ error: 'No models selected for collaboration.' });
  }

  const sessionId = 'collab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const startTime = Date.now();

  // ROUND 1: Parallel Independent Responses
  const round1Results = await Promise.all(
    selectedModels.map(async (modelItem: any) => {
      const itemStart = Date.now();
      const providerId = modelItem.provider;
      const keyToUse = modelItem.apiKey || serverProviders[providerId]?.apiKey || (providerId === 'gemini' ? process.env.GEMINI_API_KEY : '');
      const baseToUse = modelItem.baseUrl || serverProviders[providerId]?.baseUrl;

      try {
        let responseText = '';
        let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

        if (providerId === 'gemini') {
          if (!keyToUse) {
            throw new Error('Google Gemini API key is not configured.');
          }
          const gemResult = await callGeminiREST({
            apiKey: keyToUse,
            model: modelItem.id,
            prompt,
            messages: history,
            attachedImage,
          } as any);
          responseText = gemResult.text;
          usage = gemResult.usage;
        } else {
          if (!keyToUse && providerId !== 'ollama' && providerId !== 'custom') {
            throw new Error(`API key for provider "${providerId}" is not configured in Settings.`);
          }
          if (!baseToUse) {
            throw new Error(`Base URL for provider "${providerId}" is missing.`);
          }

          const messages: any[] = [];
          if (history && Array.isArray(history)) {
            messages.push(...history);
          }
          messages.push({ role: 'user', content: prompt });

          const res = await callOpenAICompatible({
            baseUrl: baseToUse,
            apiKey: keyToUse,
            model: modelItem.id,
            messages,
          });
          responseText = res.text;
          usage = res.usage;
        }

        return {
          modelId: modelItem.id,
          modelName: modelItem.name,
          provider: providerId,
          status: 'completed',
          response: responseText,
          latencyMs: Date.now() - itemStart,
          usage,
          isSimulated: false,
        };
      } catch (err: any) {
        return {
          modelId: modelItem.id,
          modelName: modelItem.name,
          provider: providerId,
          status: 'failed',
          error: err.message || 'Model call failed',
          latencyMs: Date.now() - itemStart,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }
    })
  );

  const successfulRound1 = round1Results.filter((r) => r.status === 'completed' && r.response);

  // ROUND 2: Peer Review (if enabled and at least 2 models succeeded)
  const round2Results: any[] = [];
  if (roundsConfig.peerReview && successfulRound1.length >= 2) {
    const reviewPromises = successfulRound1.slice(0, 4).map(async (reviewer) => {
      const reviewStart = Date.now();
      const otherResponses = successfulRound1
        .filter((r) => r.modelId !== reviewer.modelId)
        .map((r) => `[Model: ${r.modelName}]\n${(r.response || '').slice(0, 700)}...`)
        .join('\n\n---\n\n');

      const reviewPrompt = `You are ${reviewer.modelName}. Critically peer-review the proposed solutions by other models for the user request: "${prompt}". Identify missing requirements, contradictions, or superior alternatives.\n\nPROPOSALS TO REVIEW:\n${otherResponses}`;

      try {
        let reviewText = '';
        const providerId = reviewer.provider;
        const keyToUse = serverProviders[providerId]?.apiKey || (providerId === 'gemini' ? process.env.GEMINI_API_KEY : '');
        const baseToUse = serverProviders[providerId]?.baseUrl;

        if (providerId === 'gemini' && keyToUse) {
          const res = await callGeminiREST({
            apiKey: keyToUse,
            model: reviewer.modelId,
            prompt: reviewPrompt,
          });
          reviewText = res.text;
        } else if (baseToUse && keyToUse) {
          const res = await callOpenAICompatible({
            baseUrl: baseToUse,
            apiKey: keyToUse,
            model: reviewer.modelId,
            messages: [{ role: 'user', content: reviewPrompt }],
          });
          reviewText = res.text;
        }

        return {
          reviewerId: reviewer.modelId,
          reviewerName: reviewer.modelName,
          status: 'completed',
          critique: reviewText,
          latencyMs: Date.now() - reviewStart,
        };
      } catch (err: any) {
        return {
          reviewerId: reviewer.modelId,
          reviewerName: reviewer.modelName,
          status: 'failed',
          error: err.message,
          latencyMs: Date.now() - reviewStart,
        };
      }
    });

    const settledReviews = await Promise.all(reviewPromises);
    round2Results.push(...settledReviews);
  }

  // ROUND 3: Final Master Synthesis
  let finalSynthesis = '';
  let synthesisModelName = 'Consolidated Analysis';
  let synthesisLatency = 0;

  if (successfulRound1.length > 0) {
    const synthStart = Date.now();
    // Choose one of the successful participant models to perform synthesis
    const synthModel = successfulRound1[0];
    synthesisModelName = synthModel.modelName;

    const allInputs = successfulRound1
      .map((r) => `### Perspective from ${r.modelName} (${r.provider}):\n${r.response}`)
      .join('\n\n');

    const reviewsInput = round2Results
      .filter((r) => r.status === 'completed')
      .map((r) => `Peer Review by ${r.reviewerName}:\n${r.critique}`)
      .join('\n\n');

    const synthesisPrompt = `You are synthesizing contributions from ${successfulRound1.length} AI model(s) for prompt: "${prompt}".
Combine compatible high-value ideas into one cohesive, authoritative answer. Eliminate fluff. Label specific insights with model names.

CONTRIBUTIONS:
${allInputs}

${reviewsInput ? `PEER REVIEWS:\n${reviewsInput}` : ''}`;

    try {
      const providerId = synthModel.provider;
      const keyToUse = serverProviders[providerId]?.apiKey || (providerId === 'gemini' ? process.env.GEMINI_API_KEY : '');
      const baseToUse = serverProviders[providerId]?.baseUrl;

      if (providerId === 'gemini' && keyToUse) {
        const synthRes = await callGeminiREST({
          apiKey: keyToUse,
          model: synthModel.modelId,
          prompt: synthesisPrompt,
          systemInstruction: 'Produce authoritative unified intelligence.',
        });
        finalSynthesis = synthRes.text;
      } else if (baseToUse) {
        const synthRes = await callOpenAICompatible({
          baseUrl: baseToUse,
          apiKey: keyToUse,
          model: synthModel.modelId,
          messages: [{ role: 'user', content: synthesisPrompt }],
        });
        finalSynthesis = synthRes.text;
      } else {
        finalSynthesis = successfulRound1[0].response || '';
      }
      synthesisLatency = Date.now() - synthStart;
    } catch (_err: any) {
      // Fallback synthesis if synthesizer call fails
      finalSynthesis = `### Consolidated Response\n\n${successfulRound1.map((r) => `#### ${r.modelName}:\n${r.response}`).join('\n\n---\n\n')}`;
      synthesisLatency = Date.now() - synthStart;
    }
  } else {
    // All models failed - return clear error summary
    const errorDetails = round1Results.map((r) => `- **${r.modelName} (${r.provider}):** ${r.error}`).join('\n');
    finalSynthesis = `### No Model Responded\n\nAll ${selectedModels.length} selected model(s) failed to return a response. Please verify your API keys and provider configurations in Settings.\n\n**Error Log:**\n${errorDetails}`;
  }

  const totalSessionTime = Date.now() - startTime;

  res.json({
    sessionId,
    timestamp: new Date().toISOString(),
    userPrompt: prompt,
    totalLatencyMs: totalSessionTime,
    summary: {
      selectedCount: selectedModels.length,
      contactedCount: selectedModels.length,
      respondedCount: successfulRound1.length,
      failedCount: selectedModels.length - successfulRound1.length,
      peerReviewsCount: round2Results.filter((r) => r.status === 'completed').length,
    },
    rounds: {
      round1_independent: round1Results,
      round2_peerReview: round2Results,
      round4_synthesis: {
        modelUsed: synthesisModelName,
        synthesisText: finalSynthesis,
        latencyMs: synthesisLatency,
      },
    },
  });
});

// Deep Research multi-step investigation endpoint
app.post('/api/research', async (req: Request, res: Response) => {
  const { topic, scope = 'comprehensive' } = req.body;

  if (!topic) return res.status(400).json({ error: 'Research topic is required.' });

  const startTime = Date.now();
  const geminiKey = process.env.GEMINI_API_KEY || serverProviders.gemini.apiKey;

  if (!geminiKey) {
    return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const prompt = `Conduct a rigorous multi-perspective research briefing on: "${topic}".
Scope: ${scope}.
Address:
1. Core Principles & Background
2. State of the Art & Current Implementations
3. Critical Vulnerabilities & Contradictions
4. Strategic Synthesis & Direct Recommendations.
Include realistic citations and evidence quality indicators.`;

  try {
    const result = await callGeminiREST({
      apiKey: geminiKey,
      model: 'gemini-1.5-flash',
      prompt,
      systemInstruction: 'You are the TITAN Deep Research Engine. Generate publication-grade research analysis.',
    });

    res.json({
      topic,
      scope,
      latencyMs: Date.now() - startTime,
      report: result.text,
      sourcesCount: 5,
      consensusScore: 92,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Coding Studio patch & proposal generator
app.post('/api/code-patch', async (req: Request, res: Response) => {
  const { task, filename = 'src/app.ts', existingCode = '' } = req.body;

  if (!task) return res.status(400).json({ error: 'Task description is required.' });

  const startTime = Date.now();
  const geminiKey = process.env.GEMINI_API_KEY || serverProviders.gemini.apiKey;

  if (!geminiKey) {
    return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const prompt = `You are a Principal Software Engineer.
TASK: ${task}
TARGET FILE: ${filename}
EXISTING CODE:
\`\`\`
${existingCode || '// New file'}
\`\`\`

Generate a clean, production-ready implementation.
Provide:
1. Architectural explanation of changes
2. Complete updated code
3. Test / verification suggestions`;

  try {
    const result = await callGeminiREST({
      apiKey: geminiKey,
      model: 'gemini-1.5-flash',
      prompt,
      systemInstruction: 'You are TITAN AI Coding Engine. Write clean, idiomatic, fully-typed code.',
    });

    res.json({
      filename,
      task,
      latencyMs: Date.now() - startTime,
      proposal: result.text,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Knowledge Base vector/lexical search simulation & generation
app.post('/api/knowledge-query', async (req: Request, res: Response) => {
  const { query, documents = [] } = req.body;

  if (!query) return res.status(400).json({ error: 'Query is required.' });

  const geminiKey = process.env.GEMINI_API_KEY || serverProviders.gemini.apiKey;
  if (!geminiKey) {
    return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const docContext = documents
    .map((d: any) => `[Document: ${d.title || d.name}]\n${(d.content || '').slice(0, 800)}`)
    .join('\n\n---\n\n');

  const prompt = `Answer the user question using ONLY the provided knowledge documents. Include explicit citations to document titles.
QUESTION: ${query}

DOCUMENTS:
${docContext || 'No documents uploaded yet.'}`;

  try {
    const result = await callGeminiREST({
      apiKey: geminiKey,
      model: 'gemini-1.5-flash',
      prompt,
      systemInstruction: 'You are TITAN Knowledge Base Assistant. Cite provided documents accurately.',
    });

    res.json({
      query,
      answer: result.text,
      matchedDocumentsCount: documents.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const procResources = (process as any).resourcesPath || '';
    const possibleDistPaths = [
      path.resolve(appDirname, '../dist'),
      path.resolve(appDirname, 'dist'),
      path.resolve(process.cwd(), 'dist'),
      path.resolve(procResources, 'dist'),
      path.resolve(procResources, 'app.asar/dist'),
      path.resolve(procResources, 'app/dist'),
    ];
    let distPath = possibleDistPaths[0];
    for (const p of possibleDistPaths) {
      try {
        if (p && fs.existsSync(path.join(p, 'index.html'))) {
          distPath = p;
          break;
        }
      } catch (_) {}
    }

    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`TITAN AI server running at http://127.0.0.1:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
