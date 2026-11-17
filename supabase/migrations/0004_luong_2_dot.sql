-- Lương nhận 2 đợt mỗi tháng. Chạy MỘT LẦN trong SQL Editor (sau 0003_luong.sql).
-- Các khoản lương đã nhập trước đó được coi là đợt 1.

alter table public.salaries add column installment smallint not null default 1 check (installment in (1, 2));
alter table public.salaries drop constraint if exists salaries_user_id_month_key;
alter table public.salaries add constraint salaries_user_month_installment_key unique (user_id, month, installment);
