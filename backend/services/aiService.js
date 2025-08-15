const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Missing GOOGLE_AI_KEY environment variable');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function generateText({ prompt, model = 'gemini-1.5-flash', systemInstruction, generationConfig, fallbackModels }) {
  const client = getClient();
  const cfg = {
    temperature: 0.6,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
    ...(generationConfig || {}),
  };

  // Build model preference list with fallbacks
  const envFallback = (process.env.GEMINI_FALLBACK_MODELS || '').split(',').map(s => s.trim()).filter(Boolean);
  const modelsToTry = [model, ...(fallbackModels || []), ...envFallback, 'gemini-1.5-flash-8b', 'gemini-1.5-flash'];

  let lastErr;
  for (const mdl of modelsToTry) {
    try {
      const genModel = client.getGenerativeModel({ model: mdl, systemInstruction });
      // Retry with exponential backoff for transient errors
      const maxAttempts = 3;
      let attempt = 0;
      while (attempt < maxAttempts) {
        try {
          const result = await genModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }]}],
            generationConfig: cfg,
          });
          const text = result?.response?.text?.() || '';
          return text.trim();
        } catch (err) {
          const msg = String(err?.message || err || '');
          const isOverloaded = /\b503\b|overloaded|unavailable/i.test(msg);
          const isRate = /429|rate limit/i.test(msg);
          attempt += 1;
          lastErr = err;
          if (attempt >= maxAttempts || (!isOverloaded && !isRate)) {
            break; // break retry loop, will try next model if any
          }
          const delay = Math.min(2500, 400 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 150);
          await sleep(delay);
        }
      }
      // If we reach here, attempts for this model failed — continue to next model
    } catch (errOuter) {
      lastErr = errOuter;
      // Try next model
    }
  }
  // Out of options
  const errMsg = lastErr?.message || 'AI service unavailable';
  const friendly = /\b503\b|overloaded|unavailable/i.test(errMsg)
    ? 'The AI service is temporarily overloaded. Please try again in a moment.'
    : errMsg;
  const e = new Error(friendly);
  e.cause = lastErr;
  throw e;
}

async function healthCheck() {
  try {
    const text = await generateText({ prompt: 'Reply with OK', model: 'gemini-1.5-flash' });
    return text.length > 0;
  } catch {
    return false;
  }
}

module.exports = {
  generateText,
  healthCheck,
};
