import { processRevisionToolRequest, loadEnvironment } from '../../server/aiService.js';

export default async function handler(req, res) {
  loadEnvironment();
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

