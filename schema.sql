-- Estrutura inicial sugerida para futura persistência Supabase/Postgres.
create table if not exists shop_notes (
  id uuid primary key default gen_random_uuid(),
  note_number text not null unique,
  customer_name text not null,
  issued_at timestamptz,
  pickup_person text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','sent','cancelled','delivered')),
  source_system text,
  cancel_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists shop_note_events (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references shop_notes(id),
  event_type text not null,
  actor text,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
