-- Supabase project MỚI "chitieu2". Chạy thủ công trong SQL Editor khi bạn đã sẵn sàng.
-- Số dư ví KHÔNG được lưu: luôn tính từ opening_balance + giao dịch => không thể cộng/trừ trùng.

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  kind text not null default 'other' check (kind in ('cash','bank','other')),
  opening_balance bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  description text not null check (length(trim(description)) > 0),
  category text not null check (category in ('Ăn uống','Xăng xe','Mua sắm','Hóa đơn','Đi lại','Khác')),
  amount bigint not null check (amount > 0),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  hours numeric(5,1) not null check (hours > 0),
  orders integer not null default 0 check (orders >= 0),
  earnings bigint not null default 0 check (earnings >= 0),
  fuel_cost bigint not null default 0 check (fuel_cost >= 0),   -- phân bổ để tính lợi nhuận, KHÔNG trừ ví
  other_cost bigint not null default 0 check (other_cost >= 0),
  wallet_id uuid references public.wallets(id) on delete restrict, -- null = chưa nhận tiền
  created_at timestamptz not null default now()
);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  from_wallet uuid not null references public.wallets(id) on delete restrict,
  to_wallet uuid not null references public.wallets(id) on delete restrict,
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now(),
  check (from_wallet <> to_wallet)
);

create index on public.expenses (user_id, date);
create index on public.shifts (user_id, date);
create index on public.transfers (user_id, date);

alter table public.wallets enable row level security;
alter table public.expenses enable row level security;
alter table public.shifts enable row level security;
alter table public.transfers enable row level security;

create policy wallets_own on public.wallets for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Ví tham chiếu phải thuộc cùng người dùng (chặn trỏ sang ví của người khác).
create policy expenses_own on public.expenses for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));

create policy shifts_own on public.shifts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and (wallet_id is null or exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid())));

create policy transfers_own on public.transfers for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.wallets w where w.id = from_wallet and w.user_id = auth.uid())
    and exists (select 1 from public.wallets w where w.id = to_wallet and w.user_id = auth.uid()));
