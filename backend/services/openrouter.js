require('dotenv').config({ path: '../.env' });

/**
 * Parse JSON from AI response text, stripping markdown code fences if present.
 */
function parseAIJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {}
  }
  return null;
}

/**
 * Call OpenRouter and return { content, parsed, model, usage, raw }
 * - content: the raw text of the assistant message
 * - parsed: JSON.parse of content (via parseAIJson), or null
 * - model: model id used
 * - usage: token usage object
 * - raw: full OpenRouter response
 */
async function callOpenRouter(systemPrompt, userPrompt, { jsonMode = false } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Bakery Production Manager',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: jsonMode ? 0.2 : 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const parsed = jsonMode ? parseAIJson(content) : null;

  return {
    content,
    parsed,
    model: data.model || model,
    usage: data.usage || {},
    raw: data,
  };
}

module.exports = { callOpenRouter, parseAIJson };
