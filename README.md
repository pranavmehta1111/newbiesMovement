# The Newbies Movement Challenge

A community fitness tracker web application for February 2026, built with React, Tailwind CSS, and Supabase.

## Features

- 📱 **Phone-based authentication** - No passwords needed
- 🐶🐱🐦 **Evolving champions** - Watch your companion grow as you progress
- 📊 **Progress tracking** - Visual progress bar with milestone markers
- 📅 **February 2026 calendar** - Track your activity days
- 🏆 **Real-time leaderboards** - Compete across four categories
- 🔥 **Daily streaks** - Stay motivated with streak tracking
- 🌙 **Dark/Light mode** - System-detected theming
- 👤 **Admin panel** - Manage user categories

## Categories

| Category | Goal |
|----------|------|
| The resting Underdog | 25 km |
| The cool Normie | 50 km |
| The future Rockstar | 75 km |
| The Superhuman | 100 km |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from Settings → API
4. Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure Admin Numbers

Edit `src/lib/supabase.js` and update the `ADMIN_PHONES` array with the actual phone numbers for Pranav, Sudha, and Ujjwal.

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions

## Project Structure

```
newbies-challenge/
├── src/
│   ├── components/
│   │   ├── PhoneLogin.jsx      # Phone authentication
│   │   ├── Onboarding.jsx      # User setup flow
│   │   ├── Dashboard.jsx       # Main app container
│   │   ├── ProgressBar.jsx     # Evolution progress bar
│   │   ├── Calendar.jsx        # February 2026 calendar
│   │   ├── ActivityLog.jsx     # Add/delete activities
│   │   ├── Leaderboard.jsx     # Category leaderboards
│   │   └── AdminPanel.jsx      # Admin user management
│   ├── lib/
│   │   └── supabase.js         # Database client & helpers
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind + custom styles
├── supabase-schema.sql         # Database setup script
├── .env.example                # Environment template
└── package.json
```

## License

MIT
