-- Bỏ khái niệm ví: chi tiêu và ca ShopeeFood không còn gắn với ví nào.
-- Chạy MỘT LẦN trong SQL Editor của project chitieu2 (sau 0001_init.sql).
-- Không xóa dữ liệu: các bảng wallets/transfers cũ được giữ nguyên nhưng web không còn dùng.

alter table public.expenses alter column wallet_id drop not null;

drop policy if exists expenses_own on public.expenses;
create policy expenses_own on public.expenses for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
