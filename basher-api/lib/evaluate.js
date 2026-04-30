import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, userPrompt } from './prompt.js';

const MODEL = process.env.BASHER_MODEL || 'claude-sonnet-4-6';
const MAX_TOKENS = 16_000;

let client;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function evaluatePlan(planText) {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt(planText) }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('no text content in Claude response');
  const raw = textBlock.text.trim();
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('no JSON object in Claude response');
  const json = raw.slice(jsonStart, jsonEnd + 1);

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new Error(`failed to parse Claude JSON: ${err.message}`);
  }

  return validateAndNormalize(parsed);
}

function validateAndNormalize(r) {
  if (!r.company_name || typeof r.company_name !== 'string') throw new Error('missing company_name');
  if (!r.slug) r.slug = slugify(r.company_name);
  r.slug = slugify(r.slug);
  for (const arr of [
    ['financials', 12],
    ['pg_thinking', 20],
  ]) {
    const [key, expected] = arr;
    if (!Array.isArray(r[key]) || r[key].length !== expected) {
      throw new Error(`${key} must be an array of length ${expected}, got ${r[key]?.length}`);
    }
  }
  for (const k of ['bp', 'db', 'sq', 'cc', 'bg', 'sa']) {
    if (!r.frameworks?.[k]?.grade) throw new Error(`missing frameworks.${k}.grade`);
  }
  if (!r.pragmatic?.eleven_questions?.questions || r.pragmatic.eleven_questions.questions.length !== 11) {
    throw new Error('pragmatic.eleven_questions.questions must be an array of length 11');
  }
  for (const k of ['eleven_questions', 'steve_blank', 'eric_ries']) {
    if (!r.pragmatic?.[k]?.grade) throw new Error(`missing pragmatic.${k}.grade`);
  }
  return r;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'unnamed';
}
