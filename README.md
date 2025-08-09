# ChatGPT Clone
link ->  https://sample-tan-five.vercel.app/chat

A modern, mobile-first ChatGPT clone built with Next.js, tRPC, Supabase, and Gemini AI.

## Features

- 🤖 **Real AI Responses** - Powered by Google's Gemini AI
- 📱 **Mobile-First Design** - Optimized for mobile devices
- 💬 **Real-time Chat** - Live typing indicators and instant responses
- 🔄 **Restart Chat** - Start fresh conversations anytime
- 💾 **Message Persistence** - Messages saved to Supabase database
- ⚡ **Fast & Responsive** - Built with Next.js App Router and tRPC

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chatgpt-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Gemini API Key
   GEMINI_API_KEY_TEXT=your_gemini_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker
```bash
docker build -t chatgpt-clone .
docker run -p 3000:3000 --env-file .env.local chatgpt-clone
```

### Manual Deployment
```bash
npm run build
npm start
```

## Environment Setup Instructions

### 1. Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your environment variables

### 2. Supabase Setup
1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings → API to get your URL and anon key
3. Run the SQL schema in your Supabase SQL Editor:
   ```sql
   -- Enable required extension for gen_random_uuid()
   create extension if not exists pgcrypto;

   -- Messages table for chat
   create table if not exists public.messages (
     id uuid primary key default gen_random_uuid(),
     user_id text,
     text text,
     image_url text,
     type text check (type in ('text', 'image')) not null default 'text',
     created_at timestamptz not null default now()
   );

   -- Helpful index for recency queries
   create index if not exists idx_messages_created_at on public.messages (created_at desc);
   create index if not exists idx_messages_user on public.messages (user_id);
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **API**: tRPC, TanStack React Query
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Styling**: Bootstrap + Custom CSS

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── chat/           # Chat interface
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
├── lib/               # Utility libraries
└── server/            # tRPC server setup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
