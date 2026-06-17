import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const defaultCorsOrigin = 'https://game.yddsfj.uk';

loadEnv(path.join(rootDir, '.env'));

const config = {
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 3001),
  databasePath: path.resolve(rootDir, process.env.DATABASE_PATH || './data/sanguo.sqlite'),
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  corsOrigin: process.env.CORS_ORIGIN || defaultCorsOrigin,
  allowAnyCors: /^(1|true|yes)$/i.test(process.env.ALLOW_ANY_CORS || ''),
  deepseekBaseUrl: (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, ''),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  deepseekThinking: process.env.DEEPSEEK_THINKING || 'disabled',
  deepseekTimeoutMs: Number(process.env.DEEPSEEK_TIMEOUT_MS || 12000),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 12 * 1024 * 1024),
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT || 5),
  accountAuthRateLimit: Number(process.env.ACCOUNT_AUTH_RATE_LIMIT || 8),
  aiRateLimit: Number(process.env.AI_RATE_LIMIT || 30),
  saveRateLimit: Number(process.env.SAVE_RATE_LIMIT || 40)
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

  CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    route TEXT,
    ip_hash TEXT,
    detail_json TEXT,
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
  `),
  logSecurityEvent: db.prepare(`
    INSERT INTO security_events (user_id, severity, category, action, route, ip_hash, detail_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  listSecurityEvents: db.prepare(`
    SELECT id, severity, category, action, route, detail_json, created_at
    FROM security_events
    WHERE user_id = ? OR user_id IS NULL
    ORDER BY id DESC
    LIMIT ?
  `),
  countSecurityEventsSince: db.prepare(`
    SELECT severity, COUNT(*) AS count
    FROM security_events
    WHERE (user_id = ? OR user_id IS NULL) AND created_at >= ?
    GROUP BY severity
  `),
  countAiRequestsSince: db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM ai_requests
    WHERE user_id = ? AND created_at >= ?
    GROUP BY status
  `)
};

const rateBuckets = new Map();

const server = createServer(async (request, response) => {
  try {
    setCorsHeaders(request, response);
    setSecurityHeaders(response);
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
        deepseekConfigured: Boolean(config.deepseekApiKey)
      });
      return;
    }

    if (route === '/api/auth/guest' && request.method === 'POST') {
      if (!checkRateLimit(request, response, `auth:${clientIpHash(request)}`, config.authRateLimit, 60_000, 'auth_rate_limit', route)) return;
      const body = await readJsonBody(request);
      const username = createGuestUsername();
      const displayName = safeString(body.displayName, 40) || 'Guest';
      const now = nowIso();
      statements.createUser.run(username, displayName, null, 1, now, now);
      const user = statements.findUserByUsername.get(username);
      sendJson(response, 200, createSessionPayload(user));
      return;
    }

    if (route === '/api/auth/register' && request.method === 'POST') {
      if (!checkRateLimit(request, response, `auth:${clientIpHash(request)}`, config.authRateLimit, 60_000, 'auth_rate_limit', route)) return;
      const body = await readJsonBody(request);
      const username = cleanUsername(body.username);
      if (username && !checkRateLimit(request, response, `auth-account:${username}`, config.accountAuthRateLimit, 15 * 60_000, 'auth_account_rate_limit', route)) return;
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
      if (!checkRateLimit(request, response, `auth:${clientIpHash(request)}`, config.authRateLimit, 60_000, 'auth_rate_limit', route)) return;
      const body = await readJsonBody(request);
      const username = cleanUsername(body.username);
      if (username && !checkRateLimit(request, response, `auth-account:${username}`, config.accountAuthRateLimit, 15 * 60_000, 'auth_account_rate_limit', route)) return;
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

    if (route === '/api/security/overview' && request.method === 'GET') {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      sendJson(response, 200, buildSecurityOverview(auth.user.id));
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
        if (!checkRateLimit(request, response, `save:${auth.user.id}`, config.saveRateLimit, 60_000, 'save_rate_limit', route, auth.user.id)) return;
        const body = await readJsonBody(request);
        if (!body.saveData || typeof body.saveData !== 'object') {
          return sendJson(response, 400, { error: 'SAVE_DATA_REQUIRED' });
        }
        const previous = statements.getSave.get(auth.user.id, slot);
        const validation = validateSaveData(body.saveData, previous ? parseJsonOrNull(previous.save_json) : null);
        if (validation.events.length) {
          validation.events.forEach(event => logSecurityEvent({
            request,
            userId: auth.user.id,
            severity: event.severity,
            category: 'save_integrity',
            action: event.action,
            route,
            detail: event.detail
          }));
        }
        if (validation.blocked) {
          return sendJson(response, 400, {
            error: 'SAVE_SECURITY_VALIDATION_FAILED',
            security: {
              blocked: true,
              findings: validation.events.map(event => ({
                severity: event.severity,
                action: event.action,
                detail: event.detail
              }))
            }
          });
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
      if (!checkRateLimit(request, response, `ai:${auth.user.id}`, config.aiRateLimit, 60_000, 'ai_rate_limit', route, auth.user.id)) return;
      const body = await readJsonBody(request);
      if (!Array.isArray(body.messages)) {
        return sendJson(response, 400, { error: 'MESSAGES_REQUIRED' });
      }
      const safety = inspectAiPayload(body);
      if (safety.blocked) {
        logSecurityEvent({ request, userId: auth.user.id, severity: safety.severity, category: 'ai_agent', action: 'prompt_blocked', route, detail: safety });
        return sendJson(response, 400, { error: 'AI_SECURITY_BLOCKED', security: safety });
      }
      if (safety.riskScore > 0) {
        logSecurityEvent({ request, userId: auth.user.id, severity: safety.severity, category: 'ai_agent', action: 'prompt_flagged', route, detail: safety });
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
      if (!checkRateLimit(request, response, `ai:${auth.user.id}`, config.aiRateLimit, 60_000, 'ai_rate_limit', route, auth.user.id)) return;
      const body = await readJsonBody(request);
      const safety = inspectAiPayload(body);
      if (safety.blocked) {
        logSecurityEvent({ request, userId: auth.user.id, severity: safety.severity, category: 'ai_agent', action: 'prompt_blocked', route, detail: safety });
        return sendJson(response, 400, { error: 'AI_SECURITY_BLOCKED', security: safety });
      }
      if (safety.riskScore > 0) {
        logSecurityEvent({ request, userId: auth.user.id, severity: safety.severity, category: 'ai_agent', action: 'prompt_flagged', route, detail: safety });
      }
      const dialogue = await generateDialogueWithDeepSeek(auth.user.id, body);
      sendJson(response, 200, { dialogue });
      return;
    }

    if (route === '/api/ai/content' && request.method === 'POST') {
      const auth = authenticate(request);
      if (!auth) return sendJson(response, 401, { error: 'UNAUTHORIZED' });
      if (!checkRateLimit(request, response, `ai:${auth.user.id}`, config.aiRateLimit, 60_000, 'ai_rate_limit', route, auth.user.id)) return;
      const body = await readJsonBody(request);
      const safety = inspectAiPayload(body);
      if (safety.blocked) {
        logSecurityEvent({ request, userId: auth.user.id, severity: safety.severity, category: 'ai_agent', action: 'prompt_blocked', route, detail: safety });
        return sendJson(response, 400, { error: 'AI_SECURITY_BLOCKED', security: safety });
      }
      if (safety.riskScore > 0) {
        logSecurityEvent({ request, userId: auth.user.id, severity: safety.severity, category: 'ai_agent', action: 'prompt_flagged', route, detail: safety });
      }
      const text = await generateContentWithDeepSeek(auth.user.id, body.context);
      sendJson(response, 200, { text });
      return;
    }

    sendJson(response, 404, { error: 'NOT_FOUND' });
  } catch (error) {
    console.error(error);
    const status = Number(error.statusCode || 500);
    sendJson(response, status, {
      error: status === 400 ? 'INVALID_JSON' : status === 413 ? 'REQUEST_BODY_TOO_LARGE' : 'INTERNAL_ERROR',
      message: status >= 500 ? 'Internal server error' : error.message
    });
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

function setCorsHeaders(request, response) {
  const origin = allowedCorsOrigin(request);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function allowedCorsOrigin(request) {
  const configured = String(config.corsOrigin || '').trim();
  if (configured === '*' && config.allowAnyCors) return '*';
  const origins = configured
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin && origin !== '*');
  const allowed = origins.length ? origins : [defaultCorsOrigin];
  const requestOrigin = String(request.headers.origin || '').trim();
  return requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : allowed[0];
}

function setSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
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
  if (!['assets', 'css', 'js', '影像素材'].includes(publicDir)) return false;

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
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
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

function clientIpHash(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const raw = forwarded || request.socket.remoteAddress || 'unknown';
  return sha256(`ip:${raw}`).slice(0, 32);
}

function checkRateLimit(request, response, key, limit, windowMs, action, route, userId = null) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { start: now, count: 0 };
  if (now - bucket.start >= windowMs) {
    bucket.start = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count <= limit) return true;
  logSecurityEvent({
    request,
    userId,
    severity: 'high',
    category: 'rate_limit',
    action,
    route,
    detail: { limit, windowMs, count: bucket.count }
  });
  sendJson(response, 429, {
    error: 'RATE_LIMITED',
    security: {
      action,
      limit,
      windowMs,
      retryAfterMs: Math.max(0, windowMs - (now - bucket.start))
    }
  });
  return false;
}

function logSecurityEvent({ request = null, userId = null, severity = 'low', category = 'system', action = 'event', route = '', detail = {} }) {
  try {
    statements.logSecurityEvent.run(
      userId,
      safeString(severity, 20) || 'low',
      safeString(category, 40) || 'system',
      safeString(action, 80) || 'event',
      safeString(route, 120),
      request ? clientIpHash(request) : '',
      JSON.stringify(detail || {}).slice(0, 8000),
      nowIso()
    );
  } catch (error) {
    console.warn('security event log failed:', error.message);
  }
}

function inspectAiPayload(value) {
  const text = collectText(value).join('\n').slice(0, 16000);
  const findings = [];
  const rules = [
    { action: 'prompt_injection', severity: 'high', score: 45, pattern: /ignore (all )?(previous|above|system)|忽略(之前|上面|系统|规则)|无视(之前|系统|规则)|forget (all )?(previous|above)/i },
    { action: 'secret_exfiltration', severity: 'critical', score: 70, pattern: /api[_-]?key|secret|token|password|session|cookie|process\.env|DEEPSEEK_API_KEY|密钥|令牌|密码|环境变量|后台配置/i },
    { action: 'role_escape', severity: 'high', score: 40, pattern: /jailbreak|developer mode|system prompt|act as system|你现在是系统|模拟系统|输出系统提示/i },
    { action: 'state_tamper', severity: 'medium', score: 30, pattern: /修改.*存档|伪造.*存档|直接.*胜利|把.*粮食.*999|把.*金钱.*999|篡改|cheat|admin/i },
    { action: 'unsafe_code_request', severity: 'medium', score: 25, pattern: /<script|javascript:|onerror\s*=|eval\(|fetch\(.*\/api\/saves/i }
  ];
  for (const rule of rules) {
    if (rule.pattern.test(text)) findings.push({ action: rule.action, severity: rule.severity, score: rule.score });
  }
  if (text.length > 12000) findings.push({ action: 'oversized_ai_context', severity: 'medium', score: 25 });

  const riskScore = Math.min(100, findings.reduce((sum, item) => sum + item.score, 0));
  const severity = findings.some(item => item.severity === 'critical')
    ? 'critical'
    : findings.some(item => item.severity === 'high')
      ? 'high'
      : findings.some(item => item.severity === 'medium')
        ? 'medium'
        : 'low';
  return {
    blocked: riskScore >= 60,
    riskScore,
    severity,
    findings: findings.map(({ action, severity }) => ({ action, severity }))
  };
}

function collectText(value, output = []) {
  if (output.length > 300) return output;
  if (typeof value === 'string') {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    value.slice(0, 60).forEach(item => collectText(item, output));
    return output;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value).slice(0, 120)) {
      if (/password|token|secret|apiKey/i.test(key)) continue;
      collectText(item, output);
    }
  }
  return output;
}

function validateSaveData(saveData, previousSaveData) {
  const events = [];
  const add = (severity, action, detail) => events.push({ severity, action, detail });

  if (containsDangerousKey(saveData)) {
    add('critical', 'prototype_pollution_key', { message: 'Save payload contains reserved object keys.' });
  }
  if (!Number.isInteger(Number(saveData.turn)) || Number(saveData.turn) < 1 || Number(saveData.turn) > 10000) {
    add('high', 'invalid_turn', { turn: saveData.turn });
  }

  const snapshot = buildSaveSecuritySnapshot(saveData);
  if (snapshot.invalidNumberCount > 0) {
    add('critical', 'non_finite_number', { invalidNumberCount: snapshot.invalidNumberCount });
  }
  if (snapshot.money > 5_000_000 || snapshot.food > 20_000_000 || snapshot.totalTroops > 2_000_000) {
    add('critical', 'resource_ceiling_exceeded', {
      money: snapshot.money,
      food: snapshot.food,
      totalTroops: snapshot.totalTroops
    });
  }
  if (snapshot.cityCount > 180 || snapshot.characterCount > 260) {
    add('high', 'entity_count_anomaly', {
      cityCount: snapshot.cityCount,
      characterCount: snapshot.characterCount
    });
  }

  if (previousSaveData) {
    const previous = buildSaveSecuritySnapshot(previousSaveData);
    const turnDelta = Math.max(1, snapshot.turn - previous.turn);
    const moneyDelta = snapshot.money - previous.money;
    const foodDelta = snapshot.food - previous.food;
    const troopDelta = snapshot.totalTroops - previous.totalTroops;
    if (moneyDelta > 600_000 * turnDelta) add('medium', 'money_jump', { previous: previous.money, current: snapshot.money, turnDelta });
    if (foodDelta > 1_500_000 * turnDelta) add('medium', 'food_jump', { previous: previous.food, current: snapshot.food, turnDelta });
    if (troopDelta > 120_000 * turnDelta) add('high', 'troop_jump', { previous: previous.totalTroops, current: snapshot.totalTroops, turnDelta });
    if (snapshot.turn + 3 < previous.turn) add('medium', 'turn_rollback', { previous: previous.turn, current: snapshot.turn });
  }

  return {
    blocked: events.some(event => event.severity === 'critical'),
    events
  };
}

function containsDangerousKey(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 10) return false;
  for (const [key, item] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') return true;
    if (containsDangerousKey(item, depth + 1)) return true;
  }
  return false;
}

function buildSaveSecuritySnapshot(saveData) {
  const numbers = [];
  collectNumbers(saveData, numbers);
  const invalidNumberCount = numbers.filter(value => !Number.isFinite(value)).length;
  const cities = saveData?.cities && typeof saveData.cities === 'object' ? Object.values(saveData.cities) : [];
  const money = Number(saveData?.player?.money || 0) + cities.reduce((sum, city) => sum + Number(city?.money || 0), 0);
  const food = Number(saveData?.player?.food || 0) + cities.reduce((sum, city) => sum + Number(city?.food || 0), 0);
  const totalTroops = cities.reduce((sum, city) => sum + troopTotal(city?.garrison), 0)
    + (Array.isArray(saveData?.campaigns) ? saveData.campaigns.reduce((sum, campaign) => sum + troopTotal(campaign?.army), 0) : 0);
  return {
    turn: Number(saveData?.turn || 0),
    money,
    food,
    totalTroops,
    cityCount: cities.length,
    characterCount: saveData?.characterRoster && typeof saveData.characterRoster === 'object' ? Object.keys(saveData.characterRoster).length : 0,
    invalidNumberCount
  };
}

function collectNumbers(value, output, depth = 0) {
  if (depth > 12 || output.length > 5000) return;
  if (typeof value === 'number') {
    output.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectNumbers(item, output, depth + 1));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectNumbers(item, output, depth + 1));
  }
}

function troopTotal(army) {
  if (!army || typeof army !== 'object') return 0;
  return ['infantry', 'archers', 'cavalry', 'navy', 'siege'].reduce((sum, key) => sum + Math.max(0, Number(army[key] || 0)), 0);
}

function buildSecurityOverview(userId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const severityRows = statements.countSecurityEventsSince.all(userId, since);
  const aiRows = statements.countAiRequestsSince.all(userId, since);
  const severityCounts = Object.fromEntries(severityRows.map(row => [row.severity, row.count]));
  const aiCounts = Object.fromEntries(aiRows.map(row => [row.status, row.count]));
  const events = statements.listSecurityEvents.all(userId, 12).map(row => ({
    id: row.id,
    severity: row.severity,
    category: row.category,
    action: row.action,
    route: row.route,
    detail: parseJsonOrNull(row.detail_json) || {},
    createdAt: row.created_at
  }));
  const riskScore = Math.min(100,
    Number(severityCounts.critical || 0) * 35 +
    Number(severityCounts.high || 0) * 20 +
    Number(severityCounts.medium || 0) * 10 +
    Number(severityCounts.low || 0) * 3
  );
  return {
    enabled: true,
    title: '天机司安全中枢',
    riskScore,
    riskLevel: riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 15 ? 'medium' : 'low',
    windowHours: 24,
    counters: {
      securityEvents: severityCounts,
      aiRequests: aiCounts
    },
    modules: [
      { id: 'auth', name: '玩家身份鉴权', status: 'active', summary: 'Bearer session、密码哈希、登录限流' },
      { id: 'aiAgent', name: 'Agent 行为安全', status: 'active', summary: '提示词注入、密钥窃取、越权改档检测' },
      { id: 'saveIntegrity', name: '数据交互校验', status: 'active', summary: '云端存档结构、资源上限和异常跃迁检测' },
      { id: 'ioa', name: '异常行为识别', status: 'active', summary: 'AI、登录、存档频率与风险事件汇总' }
    ],
    recentEvents: events
  };
}

async function readJsonBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > config.maxBodyBytes) {
      throwHttpError(413, 'Request body too large');
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    throwHttpError(400, 'Malformed JSON request body');
  }
}

function throwHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
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

function cleanSlot(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 40);
}

function createGuestUsername() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = `guest:${randomBytes(18).toString('base64url')}`;
    if (!statements.findUserByUsername.get(username)) return username;
  }
  throw new Error('Unable to allocate guest identity');
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
  const token = randomBytes(32).toString('base64url');
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
  const isLordSolicitation = promptContext.conversationType === 'solicitLord';
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
          'JSON shape: {"npcText":"...","npcIntent":"...","emotionalShift":"...","memorySummary":"...","suggestedPlayerChoices":["..."]}',
          isLordSolicitation ? [
            'This is lord solicitation, not ordinary recruitment.',
            'The target is a faction lord with dignity, retainers, territory, and political standing.',
            'Write negotiation about alignment, submission, accepting player-led order, retaining old troops/title/clan, or acknowledging the player as hegemon.',
            'Do not write ordinary employment, job-seeking, or "I will serve as your officer" language.',
            'Use ideas like 归附, 共奉大义, 奉你为盟主, 愿以州郡相托, 保留旧部.'
          ].join(' ') : ''
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

async function generateContentWithDeepSeek(userId, context) {
  const ctx = context || {};
  const type = safeString(ctx.type, 40) || 'battleReportDetail';
  const prompt = buildContentPrompt(type, ctx);

  const payload = {
    model: config.deepseekModel,
    messages: [
      {
        role: 'system',
        content: '你是一个三国策略游戏的叙事助手。你为玩家生成沉浸式的战报详情、谋士献策、NPC留言和信件正文。只返回纯文本内容，不要JSON。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    thinking: { type: config.deepseekThinking },
    temperature: 0.8,
    max_tokens: 600,
    stream: false
  };

  const result = await callDeepSeek(userId, 'content', payload);
  const text = result.choices?.[0]?.message?.content || '';
  return text.trim();
}

function buildContentPrompt(type, ctx) {
  const player = ctx.player || {};
  const payload = ctx.payload || {};
  const date = safeString(ctx.date, 40);

  if (type === 'advisorAdvice') {
    return [
      '你是一位三国谋士，请以谋士的口吻向主公分析当前局势并提出建议。',
      '当前日期：' + date,
      '主公：' + safeString(player.name, 20) + '，头衔：' + safeString(player.title, 30),
      '主公控制城池数：' + (player.cityCount || 0),
      '相关城池：' + safeString(payload.cityName || '', 30),
      '局势摘要：' + safeString(payload.summary || '', 300),
      payload.advisorHint ? '建议方向：' + safeString(payload.advisorHint, 300) : '',
      '请以谋士口吻输出200-400字的局势分析与建议，语气恭敬有礼。'
    ].filter(Boolean).join('\n');
  }

  if (type === 'npcMessage') {
    return [
      '你是一位三国时期的NPC角色，请以该角色的身份向玩家传话。',
      'NPC名称：' + safeString(payload.npcName || '', 20),
      '所属势力：' + safeString(payload.faction || '', 20),
      '传话主题：' + safeString(payload.summary || '', 300),
      '请以NPC的口吻输出100-250字的传话内容，体现角色性格。'
    ].join('\n');
  }

  if (type === 'letterBody') {
    return [
      '请为一封三国时期的书信撰写正文。',
      '写信人：' + safeString(payload.senderName || '', 20),
      '信件标题：' + safeString(payload.title || '', 60),
      '信件摘要：' + safeString(payload.summary || '', 300),
      '可选回复：' + (Array.isArray(payload.choices) ? payload.choices.join('、') : ''),
      '请输出200-400字的书信正文，使用文言文或半文言风格。'
    ].join('\n');
  }

  // battleReportDetail (default)
  return [
    '请为一条三国策略游戏的战报事件生成详细叙述。',
    '当前日期：' + date,
    '战报内容：' + safeString(payload.summary || '', 300),
    '事件基调：' + safeString(payload.tone || '', 20),
    '重要程度：' + safeString(payload.level || '', 20),
    '请输出150-300字的战报详情叙述，像史书或战地报告的风格。'
  ].join('\n');
}

function compactDialogueContext(context) {
  const npc = context?.npc || {};
  return {
    conversationType: safeString(context?.conversationType, 40),
    mode: safeString(context?.mode, 40),
    instruction: safeString(context?.instruction, 500),
    player: {
      name: safeString(context?.player?.name, 40),
      identity: safeString(context?.player?.identity, 40),
      title: safeString(context?.player?.title, 60),
      ambition: context?.player?.ambition,
      protection: context?.player?.protection,
      independent: !!context?.player?.independent,
      cityCount: context?.player?.cityCount
    },
    npc: {
      id: safeString(npc.id, 40),
      name: safeString(npc.name, 40),
      faction: safeString(npc.faction, 40),
      lordOfFaction: safeString(npc.lordOfFaction, 40),
      title: safeString(npc.title, 80),
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
    relationship: context?.relationship || null,
    powerComparison: context?.powerComparison || null,
    turn: context?.gameState?.turn,
    recentMemory: Array.isArray(context?.recentMemory) ? context.recentMemory.slice(0, 6) : [],
    recentEvents: Array.isArray(context?.recentEvents) ? context.recentEvents.slice(0, 4).map(item => safeString(item, 160)) : [],
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
