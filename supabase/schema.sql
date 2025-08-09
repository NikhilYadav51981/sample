-- Enable required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- Messages table for chat + image logs
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


