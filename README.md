# F1Info

F1Info is an unofficial educational Formula 1 hub built with React, Express, and MongoDB. It combines season information, standings, teams, race results, a reaction game, and a persistent fictional manager career.

It is not affiliated with Formula One Group. Real-world data in the seed file is demonstration data and must be reviewed before publication.

## Project structure

```text
F1_React/
├─ f1-app/                 React 19 + Vite frontend
│  ├─ src/api/             Shared API client
│  ├─ src/components/      Navigation, footer, admin and shared UI
│  ├─ src/game/            Pure manager data and simulation logic
│  ├─ src/pages/           Route-level features
│  └─ tests/               Node-based simulation tests
└─ backend/                Express 5 + Mongoose API
   ├─ handlers/            Validated CRUD handlers
   ├─ middleware/          Authentication and security middleware
   ├─ models/              MongoDB schemas
   ├─ routes/              Public and admin endpoints
   ├─ tests/               Model/helper tests
   └─ seed.js              Protected development seed command
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB connection string

## Setup

Install each application:

```bash
npm run install:all
```

Copy the environment template:

```bash
copy backend\.env.example backend\.env.local
```

Update the admin password and JWT secret in `backend/.env.local`. Never put either value in a frontend `VITE_` variable.

The frontend defaults to same-origin `/api` requests. During Vite development those requests are proxied to `http://localhost:5000`. To use a separately hosted API, copy `f1-app/.env.example` to `f1-app/.env.local` and set `VITE_API_URL`.

Start the two processes in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Open `http://localhost:5173`.

## Database seed

Seeding replaces the teams, races, standings, and results collections. It is intentionally blocked unless `SEED_CONFIRM=replace` is present in the backend environment.

```bash
npm --prefix backend run seed
```

Do not run the seed command against a production database without taking a backup and reviewing the dataset.

## Authentication

`POST /api/admin/session` verifies the admin password on the server and returns a signed, two-hour bearer token. The admin password is never bundled into the frontend. All create, update, and delete routes require that token.

For production, generate a bcrypt password hash and use `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD`. Use a long random value for `ADMIN_JWT_SECRET` and restrict `CLIENT_ORIGINS` to the deployed frontend origins.

## Public API

```text
GET /api/health
GET /api/teams
GET /api/teams/:id
GET /api/races
GET /api/races/:id
GET /api/race-results
GET /api/race-results/:id
GET /api/standings/drivers
GET /api/standings/teams
```

Team, race, and race-result mutations require `Authorization: Bearer <token>`. Standings are updated through the authenticated `/api/admin/standings/*` routes.

## Quality checks

Run the full repository verification:

```bash
npm run verify
```

This executes frontend linting, backend syntax checks, frontend and backend tests, and the production build. CI performs the same checks for pushes and pull requests.

## Deployment

Build the frontend with `npm --prefix f1-app run build` and deploy `f1-app/dist`.

The frontend uses `BrowserRouter`; configure the static host to serve `index.html` for routes that do not match a real file. Proxy `/api/*` to the backend, or set `VITE_API_URL` before building.

Deploy the backend with `npm --prefix backend start`. Configure `MONGODB_URI`, `CLIENT_ORIGINS`, `ADMIN_JWT_SECRET`, and either `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD` in the hosting platform. Do not deploy `.env.local`.

## Content note

The Guides page contains original educational explainers and a browser-local editor. Local edits are not shared with other users. Review all real-world data and image licensing before using the project commercially.
