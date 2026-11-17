# Bùi Thế Kiệt — Chi tiêu & ShopeeFood

**Đây là dự án giao diện khởi đầu RIÊNG BIỆT**, được tách từ bản demo đã được duyệt, không kết nối hay sửa bất kỳ dự án cũ nào.

## Dùng thử ngay

Mở `index.html` bằng Chrome. Chuyển các trang, thử thêm chi tiêu/ca ShopeeFood/chuyển ví bằng số liệu minh họa.

**QUAN TRỌNG:** Hiện đây là bản giao diện chạy HTML/JavaScript độc lập và dữ liệu minh họa trong bộ nhớ trình duyệt, **chưa phải ứng dụng tài chính Production**. Thao tác không ghi dữ liệu vào database và có thể mất sau khi tải lại trang. Không sử dụng để lưu giao dịch tài chính thật.

## Phát triển thành website sử dụng hằng ngày

Dùng Claude Code trên laptop của bạn; mở đúng folder mới `D:\Code AI\buikiet-chitieu`, đọc `SPEC_WEB_MOI.md`, rồi xây ứng dụng mới (ví dụ Next.js) dựa trên giao diện `index.html` và các ảnh trong `design`.

Để đồng bộ số liệu giữa điện thoại và máy tính, bạn cần **tạo Supabase project MỚI** và thiết kế dữ liệu, chính sách RLS riêng. Không lấy URL, key, mật khẩu hoặc số liệu từ dự án Supabase cũ.

Sau khi kiểm thử, tạo **GitHub repository MỚI** và **Vercel project MỚI**. Không đổi `origin` của repo cũ hoặc thay deploy domain cũ.

## Triển khai nhanh riêng giao diện (chưa có lưu trữ thật)

Có thể tải folder này lên Vercel Drop: https://vercel.com/drop. Vercel tạo một dự án và địa chỉ web mới. Đừng sử dụng bản này để lưu giao dịch thật vì chưa có backend.

## Tách biệt bắt buộc

- Dự án cũ: `D:\Code AI\moneyflow` — KHÔNG SỬA.
- Website cũ: `https://buithekiet.vercel.app/` — KHÔNG ĐỔI.
- Repo cũ: `kietbt04-beta/quanlychitieu` — KHÔNG ĐỤNG.
- Supabase cũ: `buithekiet-finance` — KHÔNG KẾT NỐI.
- Dự án mới: `D:\Code AI\buikiet-chitieu`.

Tham khảo `SPEC_WEB_MOI.md` để chuyển bản demo thành ứng dụng độc lập đầy đủ.
