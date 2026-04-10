## Project: Trading Journal

## What's built so far
- User auth (register/login) with JWT tokens stored in localStorage
- Protected trade routes — all trades are scoped to the logged-in user
- Add trade form: symbol, direction (LONG/SHORT), quantity, entry price, exit price, date, notes
- Trades table with P/L calculated client-side
- Delete trade

## Stack
- **Frontend**: React 19 + Vite, plain inline styles (no CSS framework), single-file App.jsx
- **Backend**: Node.js + Express 5, PostgreSQL via `pg`, bcrypt + JWT auth
- **DB**: Postgres, connection via `DATABASE_URL` env var
- **Auth**: JWT (7d expiry), `JWT_SECRET` in `.env`

## Project structure
```
trading-journal/
  frontend/       # React app (port 5173 via Vite dev server)
    src/App.jsx   # Entire frontend in one file
  backend/
    index.js      # Entire backend in one file (port 3000)
    .env          # DATABASE_URL, JWT_SECRET
```

## Current state
- Core CRUD is functional: add, list, delete trades
- All logic lives in `App.jsx` (single component, no routing, no component split)
- No edit/update trade functionality yet
- No analytics or summary stats yet
- Frontend hits `http://localhost:3000` hardcoded

## What's next
- Edit/update a trade
- Summary stats (total P/L, win rate, best/worst trade)
- Filter/sort trades by date, symbol, direction
- Split App.jsx into components as it grows

## Rules for Claude
- Don't add new dependencies without flagging it
- Keep components clean and readable
- Backend lives in `backend/index.js`, frontend in `frontend/src/App.jsx` — don't restructure unless asked
- No CSS frameworks; keep using inline styles to match existing style
