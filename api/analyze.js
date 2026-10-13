/**
 * /api/analyze - telc B2 Speaking Session AI Assessment Endpoint
 * Supports:
 * - Google Gemini (Recommended & 100% Free at Google AI Studio)
 * - Groq (Llama 3.3 / 3.1 - Free & Ultra Fast)
 * - OpenAI (GPT-4o-mini)
 * 
 * Works with server-side environment variables (GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY)
 * or optional client-supplied API key.
 */

const TELC_SYSTEM_PROMPT = `You are Frau Dr. Weber, an official, certified telc Deutsch B2 Oral Examiner (telc B2 Prüferin).
Your job is to rigorously evaluate a candidate's spoken German response according to official telc B2 oral examination criteria:
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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-API-Version', '20261014c'); // trigger fresh Vercel serverless build
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 1. Health & Server Environment Variable Status Check (GET)
  if (req.method === 'GET') {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GEMINI_APIKEY;
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

    const hasGemini = Boolean(geminiKey && String(geminiKey).trim().length > 5);
    const hasGroq = Boolean(groqKey && String(groqKey).trim().length > 5);
    const hasOpenAI = Boolean(openaiKey && String(openaiKey).trim().length > 5);

    if (req.query?.debug === 'models' && geminiKey) {
      try {
        const cleanKey = String(geminiKey).trim().replace(/^["']|["']$/g, '');
        const rBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`);
        const dBeta = await rBeta.json();
        return res.status(200).json({ betaStatus: rBeta.status, betaData: dBeta });
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }

    return res.status(200).json({
      success: true,
      serverConfigured: hasGemini || hasGroq || hasOpenAI,
      providers: {
        gemini: hasGemini,
        groq: hasGroq,
        openai: hasOpenAI
      },
      activeProvider: hasGemini ? 'gemini' : (hasGroq ? 'groq' : (hasOpenAI ? 'openai' : null))
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const {
      studentTranscript,
      examPart = 'teil1',
      taskTitle = 'Allgemeines Thema',
      taskContext = {},
      provider = 'gemini',
      clientApiKey = null
    } = req.body || {};

    const text = String(studentTranscript || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Transcript cannot be empty' });
    }

    const effectiveProvider = (provider || 'gemini').toLowerCase();

    // 2. Resolve API Key with aliases and quote stripping
    let apiKey = clientApiKey;
    if (!apiKey) {
      if (effectiveProvider === 'gemini') {
        apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GEMINI_APIKEY;
      } else if (effectiveProvider === 'groq') {
        apiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
      } else if (effectiveProvider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
      }
    }

    if (apiKey) {
      // Clean leading/trailing quotes often accidentally pasted into env vars
      apiKey = String(apiKey).trim().replace(/^["']|["']$/g, '');
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        noKeyConfigured: true,
        message: `No API key found for provider '${effectiveProvider}'. Please set an API key in the app settings or configure server environment variable.`
      });
    }

    // 2. Prepare Context Prompt
    const userPrompt = `
telc B2 Examination Part: ${examPart}
Exam Task Title: "${taskTitle}"
Task Details:
- Description / Prompt: "${taskContext.prompt || taskContext.situation || 'Keine Angabe'}"
- Outline / Key Points: "${Array.isArray(taskContext.outline) ? taskContext.outline.map(o => o.title || o.phrase || o).join(', ') : 'Themenspezifische Argumentation'}"

Candidate's Spoken Response:
"""
${text}
"""

Evaluate this candidate's performance thoroughly and return your response strictly as valid JSON adhering to the specified schema.
`;

    let resultJson = null;
    let modelUsed = 'gemini-2.5-flash';

    // 3. Provider Call
    if (effectiveProvider === 'gemini') {
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
            parts: [
              { text: `${TELC_SYSTEM_PROMPT}\n\n${userPrompt}` }
            ]
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
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const resp = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (resp.ok) {
            const data = await resp.json();
            const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              resultJson = JSON.parse(rawContent);
              modelUsed = model;
              break;
            }
          } else {
            const errText = await resp.text();
            lastError = `Google Gemini (${model}): ${errText}`;
          }
        } catch (err) {
          lastError = err.message;
        }
      }

      if (!resultJson) {
        throw new Error(lastError || 'All Gemini model endpoints failed');
      }

    } else if (effectiveProvider === 'groq') {
      const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const resp = await fetch(groqUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: TELC_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Groq API error (${resp.status}): ${errText}`);
      }

      const data = await resp.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      resultJson = JSON.parse(rawContent);

    } else if (effectiveProvider === 'openai') {
      const openAiUrl = 'https://api.openai.com/v1/chat/completions';
      const resp = await fetch(openAiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: TELC_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`OpenAI API error (${resp.status}): ${errText}`);
      }

      const data = await resp.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      resultJson = JSON.parse(rawContent);

    } else {
      return res.status(400).json({ success: false, message: `Unsupported provider: ${effectiveProvider}` });
    }

    return res.status(200).json({
      success: true,
      analysis: resultJson,
      provider: effectiveProvider === 'gemini' ? `Google Gemini (${modelUsed})` : effectiveProvider,
      modelUsed
    });

  } catch (error) {
    console.error('AI Assessment endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while contacting AI service'
    });
  }
}
