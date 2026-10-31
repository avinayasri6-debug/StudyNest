import { processRevisionToolRequest, loadEnvironment } from '../../server/aiService.js';

export const maxDuration = 60;

export default async function handler(req, res) {
  loadEnvironment();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const result = await processRevisionToolRequest(body);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Vercel AI Revision Tool Error]:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
}

