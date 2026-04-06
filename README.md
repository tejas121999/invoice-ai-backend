# Invoice AI Backend

Modular Express REST API for an AI-driven invoice processing system (MVP scaffolding).

## Prerequisites

- Node.js 18+ recommended

## Setup

```bash
npm install
cp .env.example .env
```

## Scripts

| Script   | Description                    |
|----------|--------------------------------|
| `npm start` | Run production-style (`node`) |
| `npm run dev` | Run with file watching (`nodemon`) |

## Run

```bash
npm run dev
```

Health check: `GET http://localhost:3000/health`

API base path: `/api`

## Project layout

- `src/app.js` — Express app (middleware, routes, error handling)
- `src/server.js` — Loads `dotenv`, starts HTTP server
- `src/config/` — Environment-driven configuration
- `src/routes/` — Top-level routers (health + `/api` aggregator)
- `src/modules/*` — Feature modules (routes, controllers, services)
- `src/middlewares/` — Shared middleware
- `src/utils/` — Small reusable helpers
- `src/common/` — Shared types/errors
- `src/services/` — Optional cross-cutting services (empty stub for now)

## MVP notes

- No database, authentication, or file upload library yet — endpoints return structured placeholders and in-memory data where useful.
- PostgreSQL, multer, and Python OCR can plug into existing `*.service.js` files without changing route shape.

## Response shape

Success:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Errors use `success: false` and an appropriate HTTP status (handled by global error middleware).
