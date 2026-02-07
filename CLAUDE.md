# CLAUDE.md — MamaKokoro Project Guide

## What is this project?

MamaKokoro (ママココロ) is an AI-powered companion app for mothers experiencing postpartum depression (PPD). It was built for the **Vibe Coding with Memory Hackathon** (Feb 7, 2026, Shibuya Hikarie) and uses the **memU memory framework** to provide personalized, context-aware mental health support.

The core differentiator: mothers begin using the app **during pregnancy**, building a relationship with the AI companion "Kokoro." After giving birth, Kokoro already knows their history — fears, coping strategies, support network — enabling deeply personalized postpartum support.

**Live site:** https://mama-kokoro.vercel.app
**Repository:** https://github.com/Gentle-mann/mama-kokoro

---

## Tech Stack

| Layer       | Technology                                                  |
|-------------|-------------------------------------------------------------|
| Frontend    | React 18 + TypeScript + Vite 6 + Tailwind CSS 3            |
| Backend     | Express 4 (serverless on Vercel)                            |
| Database    | Supabase (PostgreSQL + Auth)                                |
| Memory      | memU Cloud API (`api.memu.so`) by NevaMind-AI               |
| AI          | Google Gemini (`gemini-2.0-flash`) → OpenAI (`gpt-4o-mini`) fallback → structured response fallback |
| State       | Zustand with persist middleware                             |
| Deployment  | Vercel (frontend static + API serverless functions)         |
| Styling     | Tailwind with custom color palette + Lucide React icons     |

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and fill in keys
cp .env.example .env

# Run dev server (Vite on :5173 + Express on :3000)
npm run dev

# Type check
npm run check

# Build for production
npm run build
```

### Required Environment Variables

| Variable                  | Description                                      |
|---------------------------|--------------------------------------------------|
| `SUPABASE_URL`            | Supabase project URL                             |
| `SUPABASE_ANON_KEY`       | Supabase anonymous key (public)                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only)    |
| `VITE_SUPABASE_URL`       | Same as SUPABASE_URL (for Vite frontend)         |
| `VITE_SUPABASE_ANON_KEY`  | Same as SUPABASE_ANON_KEY (for Vite frontend)    |
| `GOOGLE_API_KEY`          | Google Gemini API key                            |
| `MEMU_API_URL`            | memU API base URL (`https://api.memu.so`)        |
| `MEMU_API_KEY`            | memU API key (starts with `mu_`)                 |
| `JWT_SECRET`              | Secret for JWT token signing                     |

Optional: `BYTEPLUS_API_KEY`, `WAVESPEED_API_KEY`, `OPENAI_API_KEY` (for fallback AI)

---

## Project Structure

```
mama-kokoro/
├── api/                        # Express backend (serverless on Vercel)
│   ├── config/
│   │   └── supabase.ts         # Supabase client initialization
│   ├── data/
│   │   └── settlement_guide.json
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts             # Login, register, /me endpoints
│   │   ├── chat.ts             # AI chat with crisis detection + memU context
│   │   ├── categories.ts       # Content categories
│   │   ├── journal.ts          # Journal entries → memU storage
│   │   ├── mood.ts             # Mood tracking + PHQ-2 → memU storage
│   │   ├── screening.ts        # EPDS screening → memU storage
│   │   └── tips.ts             # Community tips CRUD
│   ├── services/
│   │   ├── geminiAI.ts         # Google Gemini streaming (primary AI)
│   │   ├── openaiService.ts    # OpenAI streaming (fallback AI)
│   │   ├── memuService.ts      # memU Cloud API client (singleton)
│   │   ├── byteplusAI.ts       # BytePlus AI (unused, placeholder)
│   │   ├── locationService.ts  # Location helpers
│   │   └── waveSpeedAI.ts      # WaveSpeed AI image generation
│   ├── index.ts                # Vercel serverless entry point
│   └── server.ts               # Local dev server entry point
├── src/                        # React frontend
│   ├── components/
│   │   ├── ChatInterface.tsx   # Main chat UI with phase-aware prompts
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Empty.tsx           # Empty state component
│   │   └── MapComponent.tsx    # Map display
│   ├── pages/
│   │   ├── Home.tsx            # Landing page (phase-aware)
│   │   ├── Onboarding.tsx      # Phase selection (pregnant/postpartum)
│   │   ├── Chat.tsx            # Chat page wrapper
│   │   ├── MoodTracker.tsx     # Daily mood + PHQ-2 screening
│   │   ├── Journal.tsx         # Guided journaling
│   │   ├── Screening.tsx       # EPDS self-check (10 questions)
│   │   ├── Resources.tsx       # Crisis resources + hotlines
│   │   ├── Profile.tsx         # User profile + phase transition
│   │   ├── Login.tsx           # Login form
│   │   ├── Register.tsx        # Registration form
│   │   ├── Category.tsx        # Category detail page
│   │   └── Community.tsx       # Community tips page
│   ├── stores/
│   │   └── authStore.ts        # Zustand auth + phase state
│   ├── hooks/
│   │   └── useTheme.ts         # Theme hook
│   ├── lib/
│   │   ├── supabase.ts         # Frontend Supabase client
│   │   └── utils.ts            # Utility functions (cn)
│   ├── App.tsx                 # Router + OnboardingGuard
│   ├── main.tsx                # React entry point
│   └── index.css               # Tailwind base styles
├── supabase/migrations/        # Database migration SQL files
├── vercel.json                 # Vercel routing config
├── tailwind.config.js          # Custom color palette
├── tsconfig.json               # TypeScript config (strict: false)
└── vite.config.ts              # Vite + proxy config
```

---

## Architecture

### Phase System

Users choose their phase during onboarding. Phase is stored in Zustand (persisted to localStorage) — no database migration needed.

```
Register → Onboarding → Phase Selection
                          ├── "I'm Pregnant" → pregnancy weeks + due date
                          └── "I've Had My Baby" → baby name + baby age
```

Phase determines:
- **Chat system prompt**: `buildPregnancySystemPrompt()` vs `buildPPDSystemPrompt()` in `api/routes/chat.ts`
- **Suggested topics**: pregnancy-specific vs postpartum-specific in `ChatInterface.tsx`
- **Welcome message**: phase-aware greeting in `ChatInterface.tsx`
- **Home page**: different subtitle, quick actions, and gentle reminders
- **EPDS availability**: postpartum only (pregnant users directed to chat instead)

Phase transition happens on `Profile.tsx` — "I've Had My Baby!" button stores a milestone in memU.

### OnboardingGuard

`src/App.tsx` wraps all routes in `OnboardingGuard`. If a user is authenticated but has no `phase` set, they're redirected to `/onboarding`. Exempt paths: `/onboarding`, `/login`, `/register`.

### AI Chat Pipeline

```
User message
  → Client-side crisis keyword detection
  → POST /api/chat/stream (with phase + phaseContext)
  → Server-side crisis detection (double-check)
  → If crisis: stream crisis response with hotline numbers
  → Retrieve personalized context from memU
  → Build system prompt (pregnancy or PPD)
  → Try Gemini streaming → fallback to OpenAI → fallback to structured response
  → Stream response to client
  → Fire-and-forget: store conversation in memU
```

### Crisis Detection (4 tiers)

| Level  | Keywords                                                            | Action                                    |
|--------|---------------------------------------------------------------------|-------------------------------------------|
| Red    | suicide, kill myself, hurt my baby, self-harm, etc.                 | Immediate crisis hotlines in response      |
| Orange | hopeless, worthless, can't go on, everyone better without me        | Encourage professional support             |
| Yellow | so sad, can't stop crying, feel nothing, failing as a mother        | Validate + coping strategies               |
| Green  | Everything else                                                     | Normal supportive response                 |

Crisis detection runs on both client (`ChatInterface.tsx`) and server (`chat.ts`).

### memU Integration

`api/services/memuService.ts` is a singleton class wrapping the memU Cloud API (`api.memu.so/api/v3/`).

**7 Memory Categories:**
- `mood_patterns` — daily mood entries, emotional trends
- `triggers` — situations/times that affect mood
- `coping_strategies` — what helps, what doesn't
- `baby_milestones` — baby age, development, sleep/feeding
- `screening_history` — EPDS/PHQ-2 scores over time
- `personal_context` — support network, living situation, background
- `conversation_insights` — themes and breakthroughs from chat

**Key methods:**
- `memorize(content, userId)` — store conversation as memory
- `createMemoryItem(item, userId)` — store structured data (mood, journal, screening)
- `retrieve(query, userId)` — RAG retrieval of relevant memories
- `getPersonalizedContext(userId, message)` — formatted context string for AI prompts
- `storeMoodEntry()`, `storeJournalEntry()`, `storeScreeningResult()`, `storeConversation()` — convenience methods

memU gracefully degrades when API key is not configured (logs warning, returns empty).

### EPDS Screening

Edinburgh Postnatal Depression Scale implementation in `src/pages/Screening.tsx`:
- 10 items, scored 0-3 each (total 0-30)
- Japan-specific cutoff: score >= 9 indicates possible PPD
- Item 10 specifically screens for self-harm thoughts
- Results stored in memU via `POST /api/screening/epds`
- Only available for postpartum phase

---

## Design System

### Color Palette (Tailwind custom colors)

| Name     | Hex       | Usage                            |
|----------|-----------|----------------------------------|
| Lavender | `#B8A9C9` | Primary brand, buttons, active states |
| Peach    | `#F5D5C8` | Accents, warm highlights         |
| Cream    | `#FFF8F0` | Background                       |
| Sage     | `#A8C5A0` | Pregnancy phase, success states  |

Full color scales defined in `tailwind.config.js` (50-700 shades).

### UI Patterns
- Rounded corners: `rounded-2xl` for cards, `rounded-3xl` for hero elements
- Glassmorphism: `bg-white/80 backdrop-blur-sm` on cards
- Gradients: `bg-gradient-to-br from-lavender-400 to-peach-300` for brand elements
- Icons: Lucide React throughout
- Toasts: Sonner for notifications
- Animations: Framer Motion available (imported but lightly used)

---

## API Routes

All API routes require JWT authentication via `Authorization: Bearer <token>` header (except `/api/auth/login`, `/api/auth/register`, `/api/health`).

| Method | Path                    | Description                           |
|--------|-------------------------|---------------------------------------|
| GET    | `/api/health`           | Health check                          |
| POST   | `/api/auth/login`       | Login (email + password)              |
| POST   | `/api/auth/register`    | Register (email + password + name)    |
| GET    | `/api/auth/me`          | Validate token                        |
| POST   | `/api/chat/stream`      | Streaming AI chat (accepts `phase`, `phaseContext`) |
| POST   | `/api/chat/message`     | Non-streaming AI chat                 |
| GET    | `/api/chat/conversations` | Get conversation history             |
| POST   | `/api/mood`             | Store mood entry                      |
| POST   | `/api/mood/phq2`        | Store PHQ-2 result                    |
| GET    | `/api/mood/trend`       | Get mood trend                        |
| POST   | `/api/journal`          | Store journal entry                   |
| GET    | `/api/journal/insights` | Get journal insights                  |
| POST   | `/api/screening/epds`   | Store EPDS result                     |
| GET    | `/api/screening/history`| Get screening history                 |
| GET    | `/api/tips`             | List community tips                   |
| POST   | `/api/tips`             | Create tip                            |
| GET    | `/api/tips/my-posts`    | Get user's own tips                   |

---

## Deployment

### Vercel

The project deploys as a Vite static site + Express serverless functions.

- `vercel.json` rewrites `/api/*` to the serverless handler at `api/index.ts`
- All other routes rewrite to `index.html` (SPA routing)
- Environment variables must be set in Vercel dashboard or via `vercel env add`

```bash
# Deploy to production
vercel deploy --prod

# Check env vars
vercel env ls
```

### Local Development

`npm run dev` runs both servers via `concurrently`:
- Vite dev server on `http://localhost:5173` (frontend)
- Express dev server on `http://localhost:3000` (API)
- Vite proxies `/api/*` requests to Express (configured in `vite.config.ts`)

---

## Important Notes

### Safety
- This is a mental health app. All AI responses must validate feelings before advising.
- Crisis detection must NEVER be removed or weakened.
- Japan crisis hotlines: **Yorisoi Hotline 0120-279-338** (24/7), **TELL Lifeline 03-5774-0992** (English)
- Emergency: **119** (Japan)
- The AI must NEVER diagnose, prescribe medication, or replace professional care.

### TypeScript
- `tsconfig.json` has `strict: false` — the project compiles with zero errors
- Run `npm run check` (which runs `tsc --noEmit`) to verify

### Auth Flow
- JWT-based authentication (not Supabase Auth)
- Tokens stored in Zustand persist (localStorage)
- `App.tsx` validates token on mount via `GET /api/auth/me`
- Registration sends `name` (not `username`) to the API

### Known Architectural Decisions
- Phase stored in Zustand persist only (no database column) — intentional to avoid Supabase migrations during hackathon
- memU stores all longitudinal data (mood, journal, screening) — Supabase handles auth and community tips only
- AI fallback chain: Gemini → OpenAI → hardcoded structured responses (ensures chat always works)
- `memuService` is a singleton — import from `api/services/memuService.ts`
