-- Lương tháng: mỗi tháng một khoản thu nhập (ngoài thu nhập ShopeeFood).
-- Chạy MỘT LẦN trong SQL Editor của project chitieu2.

create table public.salaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  amount bigint not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.salaries enable row level security;

create policy salaries_own on public.salaries for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
