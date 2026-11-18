-- Thu nhập thêm từ công việc khác + Khoản nợ (và các lần trả nợ).
-- Chạy MỘT LẦN trong SQL Editor của project chitieu2.

create table public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  source text not null check (length(trim(source)) > 0),
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  total bigint not null check (total > 0),
  date date not null,
  created_at timestamptz not null default now()
);

create table public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  date date not null,
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index on public.incomes (user_id, date);
create index on public.debt_payments (user_id, date);

alter table public.incomes enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

create policy incomes_own on public.incomes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy debts_own on public.debts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Lần trả nợ phải thuộc khoản nợ của chính người dùng.
create policy debt_payments_own on public.debt_payments for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (select 1 from public.debts d where d.id = debt_id and d.user_id = auth.uid()));
