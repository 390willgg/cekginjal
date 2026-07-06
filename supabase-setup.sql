-- Jalankan di Supabase Dashboard → SQL Editor → New query → paste → Run

create table history (
  id bigint primary key,
  device_id uuid not null default auth.uid(),
  item jsonb not null,
  created_at timestamptz not null default now()
);

alter table history enable row level security;

create policy "device owns its history"
  on history
  for all
  using (device_id = auth.uid())
  with check (device_id = auth.uid());
