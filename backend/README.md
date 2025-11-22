# Backend dynamic data from frontend/data

This folder adds a dynamic data API that loads JSON files from `frontend/data` and exposes them via `/api/data/:table` endpoints. If `MONGO_URI` is provided in `.env` and `SEED_DB=true` the backend seeds the JSON data into MongoDB collections and uses the DB for CRUD.

Setup:
1. Copy `.env.example` to `.env` and fill `MONGO_URI` if you want DB mode.
2. Ensure `frontend/data` exists with JSON files.
3. Install dependencies in repo root or backend: `npm install`.

Run:
- `npm run dev` (nodemon) or `npm start`.

---
