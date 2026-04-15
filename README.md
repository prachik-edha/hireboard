# HireBoard — AI Job Application Tracker

Track job applications on a Kanban board, score your resume against job descriptions using Claude AI, and generate tailored email drafts.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Framer Motion, @dnd-kit
- **Auth**: Clerk
- **Database**: MongoDB Atlas + Mongoose
- **AI**: Anthropic Claude API
- **Deployment**: Vercel (single platform)

---

## Local Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Clerk account (free tier works)
- Anthropic API key

---

### Step 1 — Clone and install

```bash
git clone <your-repo-url> hireboard
cd hireboard
npm install
```

---

### Step 2 — Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0 Sandbox)
3. Click **Connect** → **Drivers**
4. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
5. Add `/hireboard` before the `?` so it becomes:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hireboard?retryWrites=true&w=majority`
6. In **Network Access**, add `0.0.0.0/0` (allow from anywhere) for local dev

---

### Step 3 — Set up Clerk

1. Go to https://dashboard.clerk.com → Create Application
2. Enable **Email** and **Google** sign-in
3. From the dashboard copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

### Step 4 — Create .env.local

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/hireboard?retryWrites=true&w=majority

ANTHROPIC_API_KEY=sk-ant-...

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=any_random_string_you_choose
```

---

### Step 5 — Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create hireboard --public --push
# OR: create repo on github.com, then git remote add origin ... && git push
```

### Step 2 — Import to Vercel

1. Go to https://vercel.com/new
2. Click **Import** next to your `hireboard` repo
3. Framework preset will auto-detect as **Next.js**
4. Click **Environment Variables** and add ALL variables from `.env.local`
   - Change `NEXT_PUBLIC_APP_URL` to your Vercel URL (you can update after first deploy)
5. Click **Deploy**

### Step 3 — Update Clerk redirect URLs

In Clerk dashboard → **Paths** → set:
- Sign-in URL: `https://your-app.vercel.app/sign-in`
- Sign-up URL: `https://your-app.vercel.app/sign-up`
- After sign-in: `https://your-app.vercel.app/dashboard`
- After sign-up: `https://your-app.vercel.app/dashboard`

Also in Clerk → **Domains** → add your Vercel domain.

### Step 4 — Update MongoDB Atlas network access

In Atlas → **Network Access** → confirm `0.0.0.0/0` is allowed
(Vercel uses dynamic IPs so you need to allow all)

### That's it — your app is live! 🚀

---

## Project Structure

```
hireboard/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── dashboard/page.tsx          ← Kanban board
│   ├── jobs/[id]/page.tsx          ← Job detail + AI match
│   ├── resume/page.tsx             ← Resume upload
│   └── api/
│       ├── jobs/route.ts           ← List + create jobs
│       ├── jobs/[id]/route.ts      ← Get, update, delete job
│       ├── ai/match/route.ts       ← AI resume match scoring
│       ├── ai/draft/route.ts       ← AI email draft generation
│       ├── user/resume/route.ts    ← Save resume text
│       ├── user/resume/parse/      ← PDF parsing
│       └── cron/update/route.ts    ← Stale job nudges
├── components/
│   ├── Sidebar.tsx
│   ├── KanbanBoard.tsx
│   ├── ScoreRing.tsx
│   ├── JobModal.tsx
│   └── EmailDraftModal.tsx
├── lib/
│   ├── mongodb.ts
│   └── claude.ts
├── models/
│   ├── Job.ts
│   └── User.ts
└── middleware.ts
```

## Features

- **Kanban Board** — 5-column drag-and-drop pipeline (Wishlist → Applied → Interview → Offer → Rejected)
- **AI Resume Match** — Paste any job description, get a 0–100 score with skill/experience/keyword breakdown
- **AI Email Drafts** — Generate cold outreach, follow-up, or thank-you emails in 3 tones
- **Resume Manager** — Upload PDF or paste text; used automatically for all AI features
- **Notes** — Add timestamped notes to any application
- **Cron Nudges** — Auto-flags stale applications with no activity in 7+ days
