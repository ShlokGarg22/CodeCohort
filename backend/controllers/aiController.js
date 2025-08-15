const { generateText, healthCheck } = require('../services/aiService');
const Problem = require('../models/Problem');

const isMember = async (projectId, userId) => {
  const p = await Problem.findById(projectId).select('createdBy teamMembers');
  if (!p) return false;
  if (p.createdBy?.toString() === userId.toString()) return true;
  return p.teamMembers?.some(m => m.user?.toString() === userId.toString());
};

exports.prompt = async (req, res) => {
  try {
  const { projectId } = req.params;
  const { prompt, maxTokens } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    if (!(await isMember(projectId, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const systemInstruction = [
      'You are a helpful, knowledgeable assistant for a general audience.',
      'Answer in general terms only — do not tailor to any project, team, or task context.',
      'Provide thorough, neutral answers with clear structure; include step-by-step guidance where useful and concise reasoning.',
      'If you reference APIs, tools, or concepts, add links to official docs or reputable sources (MDN, RFCs, vendor docs, GitHub).',
      'When code is appropriate, provide complete snippets. Keep output plain text (no HTML).',
      'Never include statements like "Not relevant to project", "Focus on tasks", or similar meta commentary. Do not ask follow-up questions unless explicitly requested.',
    ].join(' ');
    const text = await generateText({ prompt, systemInstruction, generationConfig: maxTokens ? { maxOutputTokens: Math.max(512, Math.min(Number(maxTokens) || 4096, 8192)) } : undefined });
    // Post-process to remove unwanted trailing meta lines like "Relevant to our project?"
    const cleaned = String(text)
      .split(/\r?\n/)
      .filter((line) => {
        const t = line.trim();
        if (/\brelevant to (our|the|your) project\?*$/i.test(t)) return false;
        if (/^not\s+relevant.*project/i.test(t)) return false;
        if (/focus\s+on\s+tasks/i.test(t)) return false;
        if (/stay\s+on\s+task/i.test(t)) return false;
        return true;
      })
      .join('\n')
      .trim();
    res.json({ success: true, data: { text: cleaned } });
  } catch (e) {
  const msg = e?.message || 'AI service error';
  console.error('AI prompt error:', msg);
  res.status(503).json({ success: false, message: msg });
  }
};

exports.health = async (req, res) => {
  try {
    const ok = await healthCheck();
    res.json({ success: ok });
  } catch (e) {
    res.status(200).json({ success: false });
  }
};
