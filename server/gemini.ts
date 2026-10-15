// Direct REST API calls to Google Gemini using plain fetch()
// Compatible with Node 16 / Electron 22 without requiring @google/genai

export interface GeminiCallOption {
  apiKey: string;
  model: string;
  prompt: string;
  messages?: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  imageBase64?: string;
  mimeType?: string;
}

export async function callGeminiREST(options: GeminiCallOption) {
  const { apiKey, model, prompt, messages, systemInstruction, imageBase64, mimeType = 'image/jpeg' } = options;

  if (!apiKey) {
    throw new Error('Gemini API key is required.');
  }

  // Sanitize model ID (ensure no double models/ prefix)
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent`;

  const formattedContents: any[] = [];

  // If conversation history is provided, convert to Gemini role format
  if (messages && messages.length > 0) {
    for (const msg of messages) {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      formattedContents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  } else {
    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
    }
    parts.push({ text: prompt });
    formattedContents.push({
      role: 'user',
      parts,
    });
  }

  const requestBody: any = {
    contents: formattedContents,
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `Gemini API HTTP ${res.status}`;
      try {
        const json = JSON.parse(errText);
        if (json.error?.message) {
          errMsg = json.error.message;
        }
      } catch (_e) {
        if (errText) errMsg += `: ${errText.slice(0, 200)}`;
      }
      throw new Error(errMsg);
    }

    const data = await res.json();
    const latencyMs = Date.now() - startTime;

    const candidate = data.candidates?.[0];
    if (!candidate) {
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }
      throw new Error('Gemini returned no response candidates.');
    }

    const text = candidate.content?.parts?.map((p: any) => p.text || '').join('') || '';

    const promptTokens = data.usageMetadata?.promptTokenCount || Math.round(prompt.length / 4);
    const completionTokens = data.usageMetadata?.candidatesTokenCount || Math.round(text.length / 4);
    const totalTokens = data.usageMetadata?.totalTokenCount || promptTokens + completionTokens;

    return {
      text,
      latencyMs,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function fetchGeminiModelsList(apiKey: string) {
  if (!apiKey) {
    throw new Error('Gemini API key is required to fetch models.');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      headers: {
        'x-goog-api-key': apiKey,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `Gemini API HTTP ${res.status}`;
      try {
        const json = JSON.parse(errText);
        if (json.error?.message) errMsg = json.error.message;
      } catch (_e) {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    const rawModels: any[] = data.models || [];

    // Filter to generateContent models
    const filtered = rawModels.filter((m: any) => {
      const methods: string[] = m.supportedGenerationMethods || [];
      return methods.includes('generateContent');
    });

    const models = filtered.map((m: any) => {
      const cleanId = (m.name || '').replace(/^models\//, '');
      const name = m.displayName || cleanId;
      const desc = m.description || 'Google Gemini model';
      const inputTokenLimit = m.inputTokenLimit ? `${Math.round(m.inputTokenLimit / 1000)}k` : '128k';

      return {
        id: cleanId,
        name,
        provider: 'gemini' as const,
        description: desc,
        contextWindow: inputTokenLimit,
        supportsVision: Boolean(m.supportedGenerationMethods?.includes('generateContent')),
        supportsCoding: true,
      };
    });

    return models;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}
