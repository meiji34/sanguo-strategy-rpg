# Sanguo backend

Run the backend:

```bash
cp .env.example .env
npm start
```

The server uses only Node built-ins plus `node:sqlite`, so there are no npm
dependencies to install for the first backend prototype.

## Endpoints

- `GET /api/health`
- `POST /api/auth/guest`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/saves`
- `GET /api/saves/:slot`
- `PUT /api/saves/:slot`
- `DELETE /api/saves/:slot`
- `GET /api/security/overview`
- `POST /api/ai/chat`
- `POST /api/ai/dialogue`
- `POST /api/ai/content`

All save and AI endpoints use `Authorization: Bearer <token>`.
Security overview also requires `Authorization: Bearer <token>`.
