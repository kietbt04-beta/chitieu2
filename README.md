# Bùi Thế Kiệt — Chi tiêu & ShopeeFood (chitieu2)

Next.js 15 + TypeScript + Tailwind CSS + Supabase. Dự án **độc lập** với website cũ (moneyflow / quanlychitieu / buithekiet-finance / buithekiet.vercel.app).

## Chạy local
```bash
npm install
npm run dev     # http://localhost:3000
```
Chưa có `.env.local` → **chế độ cục bộ**: dữ liệu lưu trong trình duyệt (xem thử giao diện, chưa đồng bộ thiết bị).

## Nối Supabase mới `chitieu2`
1. Supabase Dashboard → project `chitieu2` → **Project Settings → API**: lấy **Project URL** và **Publishable key** (`sb_publishable_...`). Không dùng secret/service-role key.
2. Sao chép `.env.example` thành `.env.local` và điền hai giá trị.
3. **SQL Editor** → chạy lần lượt `supabase/migrations/0001_init.sql` rồi `0002_bo_vi.sql` (mỗi file một lần, chỉ trên project chitieu2).
4. **Authentication → Providers → Email** bật; nếu muốn đăng ký không cần xác nhận email, tắt "Confirm email" (tùy bạn).
5. Chạy lại `npm run dev` và tạo tài khoản ở trang đăng nhập.

## Nguyên tắc chống trùng tiền
Không có ví: chỉ ghi tổng chi tiêu và thu nhập ShopeeFood. Xăng phân bổ cho ca chỉ để tính lợi nhuận, không cộng thêm vào tiền đã chi.

Tài liệu gốc & ảnh thiết kế: `docs/demo-goc/`.
