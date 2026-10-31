/**
 * Vite Dev Server Plugin for StudyNest AI Assistant
 * Hooks directly into Vite's connect middleware to handle /api/ai/status and /api/ai/chat.
 * All API key interactions happen in Node.js on the server side — zero secrets exposed to client JS.
 */

import {
  getPublicAiStatus,
  processChatRequest,
  processGenerateNoteRequest,
  processRevisionToolRequest,
  loadEnvironment
} from './aiService.js';

export function aiApiPlugin() {
  const handleAiRequest = async (req, res, next) => {
    loadEnvironment();
    const url = req.url ? req.url.split('?')[0] : '';

    // Handle CORS preflight
    if (url.startsWith('/api/ai/')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
    }

    // 1. Status Check: GET /api/ai/status
    if (url === '/api/ai/status' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      try {
        const status = getPublicAiStatus();
        res.statusCode = 200;
        res.end(JSON.stringify(status));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message, configured: false }));
      }
      return;
    }

    // 2. Chat Completions: POST /api/ai/chat
    if (url === '/api/ai/chat' && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 2 * 1024 * 1024) {
          res.statusCode = 413;
          res.end(JSON.stringify({ error: 'Payload too large' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const result = await processChatRequest(parsed);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error('[StudyNest AI Server Middleware Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({
            ok: false,
            error: err.message || 'Server error processing AI request'
          }));
        }
      });

      return;
    }

    // 3. Structured Note Generation: POST /api/ai/generate-notes
    if (url === '/api/ai/generate-notes' && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 2 * 1024 * 1024) {
          res.statusCode = 413;
          res.end(JSON.stringify({ error: 'Payload too large' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const result = await processGenerateNoteRequest(parsed);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error('[StudyNest Note Generation Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({
            ok: false,
            error: err.message || 'Server error generating notes'
          }));
        }
      });

      return;
    }

    // 4. Smart Revision Tools: POST /api/ai/revision-tool
    if (url === '/api/ai/revision-tool' && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 2 * 1024 * 1024) {
          res.statusCode = 413;
          res.end(JSON.stringify({ error: 'Payload too large' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const result = await processRevisionToolRequest(parsed);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error('[StudyNest Revision Tool Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({
            ok: false,
            error: err.message || 'Server error processing revision tool'
          }));
        }
      });

      return;
    }

    next();
  };

  return {
    name: 'studynest-ai-api-plugin',
    configureServer(server) {
      server.middlewares.use(handleAiRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleAiRequest);
    }
  };
}

