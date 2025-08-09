# ChatGPT Clone

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
   GEMINI_API_KEY_IMAGE=your_gemini_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Auth0 Configuration (Optional)
   AUTH0_SECRET=your_auth0_secret
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your_domain.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   AUTH0_DOMAIN=your_domain.auth0.com
   APP_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Network Access (For Testing on Other Devices)

To make your app accessible from other devices on your local network:

1. **Run the network server**
   ```bash
   npm run dev-network
   ```

2. **Find your IP address**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. **Access from other devices**
   - Other devices on the same network can access: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://10.62.204.132:3000`

## Setup Instructions

### 1. Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env.local` file

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

### 3. Auth0 Setup (Optional)
1. Create an Auth0 application
2. Configure callback URLs: `http://localhost:3000/api/auth/callback`
3. Add your Auth0 credentials to `.env.local`

## Available Scripts

- `npm run dev` - Start development server (localhost only)
- `npm run dev-network` - Start development server (accessible from network)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **API**: tRPC, TanStack React Query
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Styling**: Bootstrap + Custom CSS
- **Authentication**: Auth0 (optional)

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

## License

MIT License
