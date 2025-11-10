const fs = require('fs');
let fetch;
(async () => {
  const mod = await import('node-fetch');
  fetch = mod.default || mod;
})();

function readEnv() {
  const envPath = './.env';
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const l of lines) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) {
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      env[m[1]] = val;
    }
  }
  return env;
}

(async () => {
  const env = readEnv();
  const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('GEMINI_API_KEY not found in .env or environment');
    process.exit(1);
  }

  const systemPrompt = 'Say hi';
  const userPrompt = 'Hello from test script';
  const requestBody = {
    contents: [
      { parts: [ { text: `${systemPrompt}\n\n${userPrompt}` } ] }
    ],
    generationConfig: { temperature: 0.4, topK: 20, topP: 0.8, maxOutputTokens: 100 },
  };

  try {
    // wait for dynamic import to settle if needed
    if (!fetch) {
      const mod = await import('node-fetch');
      fetch = mod.default || mod;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`;
    console.log('Calling Gemini endpoint:', url);
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    console.log('Status', resp.status, resp.statusText);
    const data = await resp.text();
    console.log('Response body:', data);
  } catch (e) {
    console.error('Error calling Gemini:', e);
  }
})();
