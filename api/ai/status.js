import { getPublicAiStatus, loadEnvironment } from '../../server/aiService.js';

export default function handler(req, res) {
  loadEnvironment();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  try {
    const status = getPublicAiStatus();
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message, configured: false });
  }
}

