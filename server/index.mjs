import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

loadEnv(path.join(rootDir, '.env'));

const config = {
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 3001),
  databasePath: path.resolve(rootDir, process.env.DATABASE_PATH || './data/sanguo.sqlite'),
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  deepseekBaseUrl: (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, ''),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  deepseekThinking: process.env.DEEPSEEK_THINKING || 'disabled',
  deepseekTimeoutMs: Number(process.env.DEEPSEEK_TIMEOUT_MS || 12000),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 12 * 1024 * 1024)
};

mkdirSync(path.dirname(config.databasePath), { recursive: true });

const db = new DatabaseSync(config.databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT,
    is_guest INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    slot TEXT NOT NULL,
    name TEXT NOT NULL,
    client_version TEXT,
    summary_json TEXT,
    save_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, slot),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ai_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    kind TEXT NOT NULL,
    model TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    request_json TEXT,
    response_json TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

const statements = {
  findUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  findUserById: db.prepare('SELECT id, username, display_name, is_guest, created_at, updated_at FROM users WHERE id = ?'),
  createUser: db.prepare('INSERT INTO users (username, display_name, password_hash, is_guest, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'),
  createSession: db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)'),
  findSession: db.prepare(`
    SELECT sessions.id AS session_id, sessions.expires_at, users.id, users.username, users.display_name, users.is_guest, users.created_at, users.updated_at
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
  `),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  deleteExpiredSessions: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),
  listSaves: db.prepare('SELECT slot, name, client_version, summary_json, created_at, updated_at FROM saves WHERE user_id = ? ORDER BY updated_at DESC'),
  getSave: db.prepare('SELECT slot, name, client_version, summary_json, save_json, created_at, updated_at FROM saves WHERE user_id = ? AND slot = ?'),
  upsertSave: db.prepare(`
    INSERT INTO saves (user_id, slot, name, client_version, summary_json, save_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, slot) DO UPDATE SET
      name = excluded.name,
      client_version = excluded.client_version,
      summary_json = excluded.summary_json,
      save_json = excluded.save_json,
      updated_at = excluded.updated_at
  `),
  deleteSave: db.prepare('DELETE FROM saves WHERE user_id = ? AND slot = ?'),
  logAiRequest: db.prepare(`
    INSERT INTO ai_requests (user_id, kind, model, status, latency_ms, request_json, response_json, error, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
};

const server = createServer(async (request, response) => {
  try {
    setCorsHeaders(response);
    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const route = normalizeRoute(url.pathname);

    if (request.method === 'GET' && (route === '/' || route === '/index.html')) {
      serveIndex(response);
      return;
    }

    if (request.method === 'GET' && serveStaticAsset(route, response)) {
      return;
    }

    if (route === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, {
        ok: true,
        database: path.relative(rootDir, config.databasePath),
        deepseekConfigured: Boolean(config.deepseekApiKey),
        model: config.deepseekModel
      });
      return;
    }

    if (route === '/api/auth/guest' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const deviceId = cleanTokenPart(body.deviceId || randomBytes(12).toString('hex'));
      const username = `guest:${deviceId}`;
      const displayName = safeString(body.displayName, 40) || 'Guest';
      let user = statements.findUserByUsername.get(username);
      if (!user) {
        const now = nowIso();
        statements.createUser.run(username, displayName, null, 1, now, now);
        user = statements.findUserByUsername.get(username);
      }
      sendJson(response, 200, createSessionPayload(user));
      return;
    }

    if (route === '/api/auth/register' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const username = cleanUsername(body.username);
      const password = String(body.password || '');
      const displayName = safeString(body.displayName || username, 40);
      if (!username || password.length < 6) {
        sendJson(response, 400, { error: 'USERNAME_AND_PASSWORD_REQUIRED' });
        return;
      }
      if (statements.findUserByUsername.get(username)) {
        sendJson(response, 409, { error: 'USERNAME_TAKEN' });
        return;
      }
      const now = nowIso();
      statements.createUser.run(username, displayName, hashPassword(password), 0, now, now);
      const user = statements.findUserByUsername.get(username);
      sendJson(response, 201, createSessionPayload(user));
      return;
    }

    if (route === '/api/auth/login' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const username = cleanUsername(body.username);
      const password = String(body.password || '');
      const user = username ? statements.findUserByUsername.get(username) : null;
      if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
        sendJson(response, 401, { error: 'INVALID_CREDENTIALS' });
        return;
      }
      sendJson(response, 200, createSessionPayload(user));
      return;
    }

    if (route === '/api/auth/me' && request.method === 'GET') {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      sendJson(response, 200, { user: publicUser(auth.user) });
      return;
    }

    if (route === '/api/auth/logout' && request.method === 'POST') {
      const tokenHash = bearerTokenHash(request);
      if (tokenHash) statements.deleteSession.run(tokenHash);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (route === '/api/saves' && request.method === 'GET') {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      const saves = statements.listSaves.all(auth.user.id).map(row => ({
        slot: row.slot,
        name: row.name,
        clientVersion: row.client_version,
        summary: parseJsonOrNull(row.summary_json),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      sendJson(response, 200, { saves });
      return;
    }

    const saveMatch = route.match(/^\/api\/saves\/([^/]+)$/);
    if (saveMatch) {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      const slot = cleanSlot(saveMatch[1]);
      if (!slot) return sendJson(response, 400, { error: 'INVALID_SLOT' });

      if (request.method === 'GET') {
        const row = statements.getSave.get(auth.user.id, slot);
        if (!row) return sendJson(response, 404, { error: 'SAVE_NOT_FOUND' });
        sendJson(response, 200, saveRowToPayload(row, true));
        return;
      }

      if (request.method === 'PUT') {
        const body = await readJsonBody(request);
        if (!body.saveData || typeof body.saveData !== 'object') {
          return sendJson(response, 400, { error: 'SAVE_DATA_REQUIRED' });
        }
        const now = nowIso();
        const name = safeString(body.name, 80) || 'Default Save';
        const clientVersion = safeString(body.clientVersion, 40);
        const summaryJson = JSON.stringify(body.summary || summarizeSave(body.saveData));
        const saveJson = JSON.stringify(body.saveData);
        statements.upsertSave.run(auth.user.id, slot, name, clientVersion, summaryJson, saveJson, now, now);
        const row = statements.getSave.get(auth.user.id, slot);
        sendJson(response, 200, saveRowToPayload(row, false));
        return;
      }

      if (request.method === 'DELETE') {
        statements.deleteSave.run(auth.user.id, slot);
        sendJson(response, 200, { ok: true });
        return;
      }
    }

    if (route === '/api/ai/chat' && request.method === 'POST') {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      const body = await readJsonBody(request);
      if (!Array.isArray(body.messages)) {
        return sendJson(response, 400, { error: 'MESSAGES_REQUIRED' });
      }
      const payload = {
        model: safeString(body.model, 80) || config.deepseekModel,
        messages: body.messages.slice(0, 24),
        temperature: numberOrDefault(body.temperature, 0.7),
        max_tokens: numberOrDefault(body.max_tokens || body.maxTokens, 800),
        thinking: body.thinking || { type: config.deepseekThinking },
        stream: false
      };
      if (body.response_format) payload.response_format = body.response_format;
      if (body.reasoning_effort) payload.reasoning_effort = body.reasoning_effort;
      const result = await callDeepSeek(auth.user.id, 'chat', payload);
      sendJson(response, 200, result);
      return;
    }

    if (route === '/api/ai/dialogue' && request.method === 'POST') {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      const body = await readJsonBody(request);
      const dialogue = await generateDialogueWithDeepSeek(auth.user.id, body);
      sendJson(response, 200, { dialogue });
      return;
    }

    sendJson(response, 404, { error: 'NOT_FOUND' });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'INTERNAL_ERROR', message: error.message });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Sanguo backend listening at http://${config.host}:${config.port}`);
});

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function normalizeRoute(pathname) {
  const decoded = decodeURIComponent(pathname || '/');
  return decoded.length > 1 ? decoded.replace(/\/+$/, '') : decoded;
}

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function serveIndex(response) {
  const filePath = path.join(rootDir, 'index.html');
  const stat = statSync(filePath);
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': stat.size,
    'Cache-Control': 'no-store'
  });
  response.end(readFileSync(filePath));
}

function serveStaticAsset(route, response) {
  const [, publicDir] = route.split('/');
  if (!['assets', 'css', 'js'].includes(publicDir)) return false;

  const staticRoot = path.join(rootDir, publicDir);
  const filePath = path.resolve(rootDir, ...route.split('/').filter(Boolean));
  if (!filePath.startsWith(staticRoot + path.sep)) return false;
  if (!existsSync(filePath)) return false;

  const stat = statSync(filePath);
  if (!stat.isFile()) return false;

  response.writeHead(200, {
    'Content-Type': contentTypeFor(filePath),
    'Content-Length': stat.size,
    'Cache-Control': 'public, max-age=3600'
  });
  response.end(readFileSync(filePath));
  return true;
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  return contentTypes[extension] || 'application/octet-stream';
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  response.end(body);
}

async function readJsonBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > config.maxBodyBytes) {
      throw new Error('Request body too large');
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw);
}

function nowIso() {
  return new Date().toISOString();
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    isGuest: Boolean(user.is_guest),
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

function cleanUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9_.@-]{3,40}$/.test(username)) return '';
  return username;
}

function cleanTokenPart(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 80);
}

function cleanSlot(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 40);
}

function safeString(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function numberOrDefault(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, encoded) {
  const [scheme, salt, expected] = String(encoded || '').split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

function createSessionPayload(user) {
  statements.deleteExpiredSessions.run(nowIso());
  const token = `${randomBytes(24).toString('base64url')}.${user.id}`;
  const tokenHash = sha256(token);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  statements.createSession.run(user.id, tokenHash, expiresAt, createdAt);
  return { token, expiresAt, user: publicUser(user) };
}

function bearerTokenHash(request) {
  const header = request.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? sha256(match[1]) : '';
}

function authenticate(request) {
  const tokenHash = bearerTokenHash(request);
  if (!tokenHash) return null;
  const row = statements.findSession.get(tokenHash);
  if (!row || row.expires_at < nowIso()) {
    if (row) statements.deleteSession.run(tokenHash);
    return null;
  }
  return {
    tokenHash,
    user: {
      id: row.id,
      username: row.username,
      display_name: row.display_name,
      is_guest: row.is_guest,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  };
}

function sha256(value) {
  return createHash('sha256').update(`${config.sessionSecret}:${value}`).digest('hex');
}

function parseJsonOrNull(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function saveRowToPayload(row, includeSaveData) {
  const payload = {
    slot: row.slot,
    name: row.name,
    clientVersion: row.client_version,
    summary: parseJsonOrNull(row.summary_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  if (includeSaveData) payload.saveData = parseJsonOrNull(row.save_json);
  return payload;
}

function summarizeSave(saveData) {
  return {
    turn: saveData.turn ?? null,
    playerName: saveData.player?.name || '',
    playerIdentity: saveData.player?.identity || '',
    selectedCityId: saveData.selectedCityId || null,
    savedAt: nowIso()
  };
}

async function generateDialogueWithDeepSeek(userId, context) {
  const promptContext = compactDialogueContext(context);
  const payload = {
    model: config.deepseekModel,
    messages: [
      {
        role: 'system',
        content: [
          'You write controlled NPC dialogue for a Three Kingdoms strategy RPG.',
          'Return strict json only.',
          'Do not decide game mechanics, stats, recruitment success, trades, battles, or state changes.',
          'Only write text fields that the game can display.',
          'JSON shape: {"npcText":"...","npcIntent":"...","emotionalShift":"...","memorySummary":"...","suggestedPlayerChoices":["..."]}'
        ].join(' ')
      },
      {
        role: 'user',
        content: `Create one NPC response as json for this context:\n${JSON.stringify(promptContext)}`
      }
    ],
    response_format: { type: 'json_object' },
    thinking: { type: config.deepseekThinking },
    temperature: 0.75,
    max_tokens: 700,
    stream: false
  };
  const result = await callDeepSeek(userId, 'dialogue', payload);
  const content = result.choices?.[0]?.message?.content || '';
  const parsed = parseJsonOrNull(content) || { npcText: content };
  return normalizeDialoguePayload(parsed);
}

function compactDialogueContext(context) {
  const npc = context?.npc || {};
  return {
    conversationType: safeString(context?.conversationType, 40),
    player: {
      name: safeString(context?.player?.name, 40),
      identity: safeString(context?.player?.identity, 40),
      ambition: context?.player?.ambition,
      protection: context?.player?.protection
    },
    npc: {
      id: safeString(npc.id, 40),
      name: safeString(npc.name, 40),
      faction: safeString(npc.faction, 40),
      status: safeString(npc.status, 40),
      currentPlan: safeString(npc.currentPlan, 200),
      trustPlayer: npc.trustPlayer,
      suspicionOfPlayer: npc.suspicionOfPlayer,
      fearPlayer: npc.fearPlayer,
      respectPlayer: npc.respectPlayer,
      recruitmentDifficulty: npc.recruitmentDifficulty,
      personality: npc.personality,
      stats: npc.stats,
      agency: npc.npcAgency
    },
    turn: context?.gameState?.turn,
    recentMemory: Array.isArray(context?.recentMemory) ? context.recentMemory.slice(0, 6) : [],
    persona: safeString(context?.persona, 800),
    strategicContext: safeString(context?.strategicContext, 800),
    availableIntentions: Array.isArray(context?.availableIntentions) ? context.availableIntentions.slice(0, 12) : []
  };
}

function normalizeDialoguePayload(value) {
  return {
    npcText: safeString(value.npcText, 500) || '...',
    npcIntent: safeString(value.npcIntent, 120) || 'observe',
    emotionalShift: safeString(value.emotionalShift, 80) || 'neutral',
    memorySummary: safeString(value.memorySummary, 180) || safeString(value.npcText, 160) || 'dialogue',
    suggestedPlayerChoices: Array.isArray(value.suggestedPlayerChoices)
      ? value.suggestedPlayerChoices.slice(0, 4).map(choice => safeString(choice, 80)).filter(Boolean)
      : []
  };
}

async function callDeepSeek(userId, kind, payload) {
  const startedAt = Date.now();
  if (!config.deepseekApiKey) {
    statements.logAiRequest.run(
      userId,
      kind,
      payload.model || config.deepseekModel,
      'error',
      0,
      JSON.stringify(redactPayload(payload)),
      null,
      'DEEPSEEK_API_KEY is not configured',
      nowIso()
    );
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.deepseekTimeoutMs);

  try {
    const response = await fetch(`${config.deepseekBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.deepseekApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const text = await response.text();
    const data = parseJsonOrNull(text) || { raw: text };
    const latencyMs = Date.now() - startedAt;
    statements.logAiRequest.run(
      userId,
      kind,
      payload.model || config.deepseekModel,
      response.ok ? 'ok' : 'error',
      latencyMs,
      JSON.stringify(redactPayload(payload)),
      JSON.stringify(data).slice(0, 12000),
      response.ok ? null : `HTTP_${response.status}`,
      nowIso()
    );
    if (!response.ok) {
      const message = data.error?.message || `DeepSeek API returned HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    statements.logAiRequest.run(
      userId,
      kind,
      payload.model || config.deepseekModel,
      'error',
      latencyMs,
      JSON.stringify(redactPayload(payload)),
      null,
      error.message,
      nowIso()
    );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function redactPayload(payload) {
  return {
    ...payload,
    messages: Array.isArray(payload.messages)
      ? payload.messages.map(message => ({
          role: message.role,
          content: safeString(message.content, 1500)
        }))
      : []
  };
}
