# basher-api

Backend service for [basher](https://kevintraywick.com/basher/) — evaluates startup business plans through a 4-stage pipeline (Frameworks → Pragmatic → Financials → PG Thinking) and renders an HTML report.

## How it works

1. `POST /evaluate` accepts a PDF/DOCX/TXT business plan.
2. Text is extracted and sent to Claude with a system prompt encoding all 47 evaluation criteria.
3. Claude returns structured JSON; the server renders five HTML pages (`index`, `frameworks`, `pragmatic`, `financials`, `pg-thinking`) onto the Railway volume at `/app/data/{slug}/`.
4. Reports are served at `/r/{slug}/` and zipped via `/r/{slug}/download`.
5. A sweeper deletes any report older than `BASHER_RETENTION_DAYS` (default 10) once an hour.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| POST | `/evaluate` | multipart, field `file`. Returns `{ slug, url, download_url, expires_at }`. |
| GET | `/reports` | List of active evaluations (slug, name, expiry). |
| GET | `/r/:slug/` | Report homepage. |
| GET | `/r/:slug/:file` | Sub-page (`frameworks.html`, etc) or `result.json`. |
| GET | `/r/:slug/download` | Zip of the report folder. |
| GET | `/health` | `{ ok: true, retention_days }`. |

## Required env vars

See `.env.example`. The two that matter on Railway:

- `ANTHROPIC_API_KEY`
- `PUBLIC_BASE_URL` — the public URL Railway gives the service (used to build links inside reports).

The volume **must mount at `/app/data`** — Railway has lost data here before when the mount path was wrong.

## Local dev

```bash
cp .env.example .env  # fill in ANTHROPIC_API_KEY
npm install
BASHER_DATA_DIR=./data npm run dev
```

Then `curl -F file=@plan.pdf http://localhost:3000/evaluate`.
