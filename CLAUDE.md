## Project: Ledger

## What's built so far
- User auth (register/login) with JWT tokens stored in localStorage
- Protected routes — all data scoped to the logged-in user
- **Trading**: add/edit/delete trades (symbol, direction, entry/exit price, qty, date, notes), P/L calculated client-side, stats panel
- **Gambling**: full session tracking with per-game stake/outcome (Blackjack, Roulette, Baccarat, Slots)
  - Games played in order of selection — order matters for carry-over logic
  - Overall stake distributed evenly across selected games
  - Overall outcome auto-fills using carry-over formula: `(overall_stake − sum_game_stakes) + sum_game_outcomes`
  - Earnings column per game (outcome − stake), Profits field at bottom (outcome − overall_stake)
  - Partner Mode: split stake/outcome per player per game, profit split with Outcome (net game earnings) + Return (proportional share of total returned)
  - Partner can over-stake (borrow from other player's winnings); return calculation uses raw game-level sums
  - Session dashboard: Date, Mode (Solo/Partner badge), Games, Stake (clickable for partner breakdown dropdown), Outcome, P/L, Result, Notes
- **Sport Betting**: page exists, no content yet
- Sidebar navigation (opens via logo click): Trading, Gambling, Sport Betting, Logout
- Modal for add/edit forms — scrollable body, pinned header, wide mode for partner
- Date fix: `pg` DATE columns returned as plain strings via `types.setTypeParser(1082, val => val)` to avoid UTC timezone shift in Sydney

## Stack
- **Frontend**: React 19 + Vite, CSS Modules (.module.css), no CSS framework
- **Backend**: Node.js + Express 5, PostgreSQL via `pg`, bcrypt + JWT auth
- **DB**: Postgres (`postgresql://localhost/trading_journal`), `DATABASE_URL` in `.env`
- **Auth**: JWT (7d expiry), `JWT_SECRET` in `.env`

## Project structure
```
trading-journal/
  frontend/src/
    App.jsx                          # Auth state + sidebar + tab routing only
    App.css                          # Non-module global app wrapper styles
    index.css                        # CSS variables and resets
    pages/
      TradingPage/                   # Trades CRUD, stats, form/table
      GamblingPage/                  # Sessions CRUD, stats, partner mode toggle
      ComingSoonPage/                # Sport Betting placeholder
    components/
      Header/                        # Logo button (opens sidebar) + page title
      Sidebar/                       # Slide-in nav: Trading, Gambling, Sport Betting, Logout
      Auth/                          # Login/register forms
      Modal/                         # Reusable modal (title, headerExtra, wide, scrollable body)
      StatsPanel/                    # Trading stats cards
      TradeForm/                     # Add/edit trade form
      TradeTable/                    # Trades table with P/L
      GamblingStatsPanel/            # Gambling stats cards
      GamblingForm/                  # Add/edit session form (solo + partner mode)
      GamblingTable/                 # Sessions table with stake dropdown portal
  backend/
    index.js      # Express server (port 3000) — all routes
    .env          # DATABASE_URL, JWT_SECRET
```

## DB tables
- `users` — id, email, password
- `trades` — id, user_id, symbol, direction, quantity, entry_price, exit_price, trade_date, notes
- `gambling_sessions` — id, user_id, session_date (DATE), games (JSONB), notes, partner (JSONB), created_at

## Rules for Claude
- No new dependencies without flagging it
- No CSS frameworks — CSS Modules only
- Keep components clean; don't restructure unless asked
- Frontend hits `http://localhost:3000` hardcoded
