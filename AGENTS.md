# AGENTS Instructions for Jimeng_AI_API_PAGE

## Project scope
These instructions apply to the whole repository.

## Architecture constraints
- Keep stack minimal: Node.js + Express backend, plain HTML/CSS/vanilla JS frontend.
- Do not introduce React/Next.js/TypeScript/database unless explicitly requested.
- Keep all API credentials server-side only in environment variables.

## Security constraints
- Never hardcode or log `VOLC_ACCESS_KEY`, `VOLC_SECRET_KEY`, or `APP_PASSWORD`.
- Preserve password-gated access flow and session-based auth.
- Preserve backend request validation and rate limiting.

## Code organization
- Backend files live under `src/` with folders:
  - `routes/`
  - `services/`
  - `middleware/`
  - `config/`
- Frontend static files live in `public/`.
- Prefer small, readable modules and avoid over-engineering.

## Change policy
- For new features, implement the smallest production-usable version first.
- Update `README.md` when setup, routes, env vars, or deploy steps change.
- Keep Chinese UI text and user-facing errors in Simplified Chinese.
