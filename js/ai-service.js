/**
 * Telc B2 Oral AI Service
 * Handles AI speaking assessment with:
 * - Google Gemini (Recommended & 100% Free at Google AI Studio)
 * - Groq Llama 3.3 (100% Free & Fast)
 * - OpenAI GPT-4o-mini
 * - Hybrid mode: Uses server-side /api/analyze OR direct client-side fetch
 */

class AIService {
  constructor() {
    this.STORAGE_KEY_PROVIDER = 'ente_ai_provider';
    this.STORAGE_KEY_API_KEY = 'ente_ai_api_key';
    this.STORAGE_KEY_ENABLED = 'ente_ai_enabled';
    this.STORAGE_KEY_MODEL = 'ente_ai_custom_model';

    // System prompt for Telc B2 Oral Examiners
    this.systemPrompt = `You are Frau Dr. Weber, an official, certified telc Deutsch B2 Oral Examiner (telc B2 Prüferin).
Your job is to evaluate a candidate's spoken German response according to official telc B2 oral examination criteria:
1. Aufgabenbewältigung (Task Fulfillment & Topic Relevance):
   - Check strictly for Themaverfehlung (off-topic). If the candidate speaks about something unrelated to the specified topic, set isThemaverfehlung: true and cap aufgabe rating below 25.
2. Ausdrucksfähigkeit (B2 Vocabulary, Collocations, Redemittel, Nomen-Verb-Verbindungen):
   - Check for B2-level collocations, two-part connectors, and formal register.
3. Formale Richtigkeit (Grammar, Verb placement in Nebensätze, Cases, Declensions):
   - Especially watch for common errors made by South Asian / Malayalam native speakers (e.g. verb placement in 'weil'/'dass'/'obwohl' clauses, dropping articles, wrong prepositions).
4. Kohärenz & Flüssigkeit (Coherence & Structure).

You must respond ONLY with a valid JSON object matching this EXACT schema:
{
  "scoreTotal": number (0-100),
  "isThemaverfehlung": boolean,
  "ratings": {
    "aufgabe": number (0-100),
    "ausdruck": number (0-100),
    "grammatik": number (0-100),
    "fluency": number (0-100)
  },
  "detectedConnectors": [string],
  "detectedNVV": [string],
  "detectedRedemittel": [string],
  "grammarAlerts": [
    {
      "type": string,
      "original": string,
      "corrected": string,
      "rule": string (in German),
      "ml": string (concise Malayalam explanation for Kerala learners)
    }
  ],
  "improvements": [
    {
      "original": string,
      "betterB2": string,
      "tip": string (in German),
      "ml": string (in Malayalam)
    }
  ],
  "pronunciationTips": [
    {
      "tip": string (in German),
      "ml": string (in Malayalam)
    }
  ],
  "germanExaminerComment": string (authentic Telc examiner feedback in professional German),
  "englishFeedback": string (clear summary in English),
  "malayalamFeedback": string (encouraging and actionable feedback in Malayalam script),
  "examinerFollowUp": {
    "question": string (German follow-up question addressing what candidate said),
    "questionMl": string (Malayalam translation of question),
    "sampleAnswer": string (high-scoring B2 sample answer in German),
    "sampleAnswerMl": string (Malayalam explanation of sample answer)
  }
}`;
  }

  getSettings() {
    return {
      provider: localStorage.getItem(this.STORAGE_KEY_PROVIDER) || 'gemini',
      apiKey: localStorage.getItem(this.STORAGE_KEY_API_KEY) || '',
      enabled: localStorage.getItem(this.STORAGE_KEY_ENABLED) !== 'false',
      customModel: localStorage.getItem(this.STORAGE_KEY_MODEL) || ''
    };
  }

  saveSettings({ provider, apiKey, enabled, customModel }) {
    if (provider) localStorage.setItem(this.STORAGE_KEY_PROVIDER, provider);
    if (apiKey !== undefined) localStorage.setItem(this.STORAGE_KEY_API_KEY, apiKey.trim());
    if (enabled !== undefined) localStorage.setItem(this.STORAGE_KEY_ENABLED, String(enabled));
    if (customModel !== undefined) localStorage.setItem(this.STORAGE_KEY_MODEL, customModel.trim());
  }

  isAIEnabled() {
    const s = this.getSettings();
    if (!s.enabled) return false;
    // Also count as enabled if the server has a key configured (cached from prior check)
    if (this._cachedServerStatus && this._cachedServerStatus.serverConfigured) return true;
    // If no server status cached yet, return true so the attempt happens (server check will clarify)
    return true;
  }

  hasClientKey() {
    const s = this.getSettings();
    return Boolean(s.apiKey && s.apiKey.length > 5);
  }

  /**
   * Check if the Vercel/Netlify server has an AI API key configured in env
   */
  async checkServerStatus(forceRefresh = false) {
    if (!forceRefresh && this._cachedServerStatus) {
      return this._cachedServerStatus;
    }
    try {
      const resp = await fetch('/api/analyze', { method: 'GET' });
      if (resp.ok) {
        const data = await resp.json();
        this._cachedServerStatus = data;
        return data;
      }
    } catch (e) {
      // not on a serverless deployment
    }
    this._cachedServerStatus = { serverConfigured: false, providers: {} };
    return this._cachedServerStatus;
  }

  /**
   * Test API connectivity with a minimal payload
   */
  async testConnection(provider, apiKey) {
    const p = (provider || 'gemini').toLowerCase();
    const key = (apiKey || '').trim();

    if (!key) {
      throw new Error('Bitte geben Sie zuerst einen API-Schlüssel ein (Please provide an API key).');
    }

    if (p === 'gemini') {
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      const payload = {
        contents: [{ role: 'user', parts: [{ text: 'Respond with JSON: {"status":"ok"}' }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
      };

      let successModel = null;
      let lastErrText = '';
      for (const m of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(key)}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (resp.ok) {
            successModel = m;
            break;
          } else {
            lastErrText = await resp.text();
          }
        } catch (e) {
          lastErrText = e.message;
        }
      }

      if (!successModel) {
        throw new Error(`Google Gemini Fehler: ${lastErrText}`);
      }
      return { ok: true, provider: `Google Gemini (${successModel})` };

    } else if (p === 'groq') {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Respond with JSON: {"status":"ok"}' }],
          response_format: { type: 'json_object' }
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Groq Fehler (${resp.status}): ${err}`);
      }
      return { ok: true, provider: 'Groq (Llama 3.3)' };

    } else if (p === 'openai') {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Respond with JSON: {"status":"ok"}' }],
          response_format: { type: 'json_object' }
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI Fehler (${resp.status}): ${err}`);
      }
      return { ok: true, provider: 'OpenAI (GPT-4o-mini)' };
    }

    throw new Error(`Unbekannter Provider: ${p}`);
  }

  /**
   * Main speech analysis dispatcher
   * Tries server /api/analyze or direct client API
   */
  async analyzeSpeakingSession(studentTranscript, examPart, taskContext) {
    const settings = this.getSettings();
    if (!settings.enabled) {
      return { success: false, fallbackNeeded: true, reason: 'AI_DISABLED' };
    }

    const payload = {
      studentTranscript,
      examPart,
      taskTitle: taskContext?.title || 'telc B2 Thema',
      taskContext: taskContext || {},
      provider: settings.provider || 'gemini',
      clientApiKey: settings.apiKey || null
    };

    // Strategy 1 (PRIORITY): Always try the server /api/analyze endpoint first.
    // The server may have its own GEMINI_API_KEY configured even without a client key.
    try {
      const serverResp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (serverResp.ok) {
        const data = await serverResp.json();
        if (data.success && data.analysis) {
          return {
            success: true,
            analysis: data.analysis,
            provider: data.provider || 'Google Gemini (Serverless)'
          };
        }
      }

      if (serverResp.status === 400) {
        const errJson = await serverResp.json().catch(() => ({}));
        if (errJson.noKeyConfigured) {
          // Server has no key - fall through to client-key strategies
          console.info('Server has no AI key configured, trying client key...');
        } else {
          // Server responded with a real error (model error, etc.)
          console.warn('Server /api/analyze returned error:', errJson);
          return { success: false, fallbackNeeded: true, reason: 'SERVER_ERROR' };
        }
      } else if (!serverResp.ok) {
        console.warn('Server /api/analyze non-OK response:', serverResp.status);
        return { success: false, fallbackNeeded: true, reason: 'SERVER_ERROR' };
      }
    } catch (serverErr) {
      console.warn('Server endpoint /api/analyze not reachable:', serverErr.message);
    }

    // Strategy 2: Client has a direct Gemini key - try direct browser fetch
    if (settings.apiKey && settings.provider === 'gemini') {
      try {
        const directResult = await this.callGeminiDirect(studentTranscript, examPart, taskContext, settings.apiKey);
        return {
          success: true,
          analysis: directResult,
          provider: 'Google Gemini (Client Direct)'
        };
      } catch (directErr) {
        console.warn('Direct Gemini fetch failed:', directErr.message);
      }
    }

    // Strategy 3: Client has Groq/OpenAI key
    if (settings.apiKey) {
      try {
        if (settings.provider === 'groq') {
          const directGroq = await this.callGroqDirect(studentTranscript, examPart, taskContext, settings.apiKey);
          return { success: true, analysis: directGroq, provider: 'Groq Llama 3.3 (Client Direct)' };
        } else if (settings.provider === 'openai') {
          const directOpenAI = await this.callOpenAIDirect(studentTranscript, examPart, taskContext, settings.apiKey);
          return { success: true, analysis: directOpenAI, provider: 'OpenAI GPT-4o-mini (Client Direct)' };
        }
      } catch (err) {
        console.warn('Direct client API call failed:', err.message);
      }
    }

    return {
      success: false,
      fallbackNeeded: true,
      reason: 'NO_KEY_CONFIGURED'
    };
  }

  buildUserPrompt(studentTranscript, examPart, taskContext) {
    return `
telc B2 Examination Part: ${examPart}
Exam Task Title: "${taskContext.title || 'Thema'}"
Task Details:
- Description / Situation: "${taskContext.prompt || taskContext.situation || 'Keine Angabe'}"
- Key Points / Outline: "${Array.isArray(taskContext.outline) ? taskContext.outline.map(o => o.title || o.phrase || o).join(', ') : 'Allgemeine Argumentation'}"

Candidate's Spoken Response:
"""
${studentTranscript}
"""

Evaluate this candidate's performance thoroughly and return your response strictly as valid JSON adhering to the specified schema.
`;
  }

  async callGeminiDirect(transcript, examPart, taskContext, apiKey) {
    const prompt = this.buildUserPrompt(transcript, examPart, taskContext);
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];
    
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${this.systemPrompt}\n\n${prompt}` }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25
      }
    };

    let lastError = null;
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          const data = await resp.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            return JSON.parse(raw);
          }
        } else {
          lastError = await resp.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    throw new Error(`Gemini direct call error: ${lastError || 'All models failed'}`);
  }

  async callGroqDirect(transcript, examPart, taskContext, apiKey) {
    const prompt = this.buildUserPrompt(transcript, examPart, taskContext);
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async callOpenAIDirect(transcript, examPart, taskContext, apiKey) {
    const prompt = this.buildUserPrompt(transcript, examPart, taskContext);
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content);
  }
}

if (typeof window !== 'undefined') {
  window.AIService = AIService;
  window.aiService = new AIService();
}
