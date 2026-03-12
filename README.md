# Jimeng 4.0 Text-to-Image Web App (Minimal Viable Version)

A deployable Node.js + Express + plain frontend single-page app for calling the Jimeng 4.0 asynchronous text-to-image API.

## Feature Overview

- Chinese single-page UI: prompt + ratio + resolution + one-click generation
- Backend proxy for API calls; the frontend never touches AccessKey / SecretKey
- Password-gated access (lightweight session-based auth)
- Basic rate limiting and strict request validation
- Polling for asynchronous tasks until completion and returning image URLs

## Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy and edit:

```bash
cp .env.example .env
```

Required variables:

- `VOLC_ACCESS_KEY`
- `VOLC_SECRET_KEY`
- `APP_PASSWORD`
- `PORT` (default can be `3000`)
- `SESSION_SECRET` (strongly recommended)

### 3) Start the app

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Visit `http://localhost:3000`.

## API Routes

- `POST /api/login`: password login
- `POST /api/generate`: submit and poll the task, then return final image URLs
- `GET /api/health`: health check
- `GET /api/me`: current session login status
- `POST /api/logout`: logout

## Jimeng API Integration Notes

- Base URL: `https://visual.volcengineapi.com`
- Submit: `Action=CVSync2AsyncSubmitTask&Version=2022-08-31`
- Get Result: `Action=CVSync2AsyncGetResult&Version=2022-08-31`
- Fixed parameters:
  - `req_key = jimeng_t2i_v40`
  - `region = cn-north-1`
  - `service = cv`
  - `force_single = true`
  - For result polling, `req_json` is a JSON string with `return_url=true`

## Railway Deployment (Quick Version)

1. Push this repository to GitHub.
2. Create a new project in Railway and import the repository.
3. Configure environment variables in Railway Variables using the same names as in `.env`.
4. Use `npm start` as the Start Command.
5. Access the app using the Railway-generated domain after deployment.

See `DEPLOY.md` for details.

## Security Notes (Important)

- Secrets are stored only in server-side environment variables.
- The browser only calls your backend API and never directly accesses the Volcengine signed interface.
- Login state is maintained using `express-session` (no user management system).
- Login and generation endpoints are rate-limited to reduce brute-force and abuse.
- The backend enforces strict allowlist validation for `prompt` / `ratio` / `resolution`.

See `SECURITY.md` for details.
