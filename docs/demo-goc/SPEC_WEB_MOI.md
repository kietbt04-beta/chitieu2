# Đặc tả website MỚI — Bùi Thế Kiệt: Chi tiêu & ShopeeFood

## 1. Phạm vi

Tạo website hoàn toàn độc lập dựa trên giao diện gốc `index.html` và ảnh trong `design/`.
Không truy cập/sửa dự án cũ; không tái sử dụng database cũ, dữ liệu cũ, tài khoản hệ thống cũ, remote Git hoặc Vercel cũ.

## 2. Trang

1. Tổng quan: tổng chi tiêu, tổng thu nhập ShopeeFood, lợi nhuận ước tính ShopeeFood, số dư ví; biểu đồ theo kỳ, chi tiêu theo danh mục, khoản chi gần đây.
2. Chi tiêu hằng ngày: thêm/sửa/xóa giao dịch, ngày/giờ/danh mục/giá trị/ví, tìm kiếm, lọc theo ngày/tuần/tháng/quý/năm.
3. Danh mục chi tiêu: nhóm khoản chi, tỷ trọng, không tính trùng.
4. Tài xế ShopeeFood: ghi nhận ca/ngày, giờ, đơn, tiền công/thưởng/tip, xăng/chi phí, lợi nhuận; không cần theo dõi từng khách thanh toán tiền mặt hay nạp ví app.
5. Ví và tài khoản: Tiền mặt, Ngân hàng, có thể thêm ví; số dư mở đầu và giao dịch; chuyển tiền giữa ví không là thu/chi, đối chiếu an toàn.
6. Báo cáo tháng: theo dõi tiền đã chi vào đâu, thu nhập ShopeeFood và kết quả thu chi.

## 3. Dòng tiền & chống trùng

- Số dư mở đầu là mốc bắt đầu theo dõi, không phải thu nhập tháng.
- Thu/chi thực tế thay đổi ví đúng một lần. Thay đổi hoặc xóa bản ghi liên quan phải đồng bộ số dư bằng transaction.
- Chuyển giữa hai ví không tăng thu nhập/chi phí.
- Thu nhập ShopeeFood đã kiếm được tách khỏi khoản tiền thực nhận vào ví; tiền khách thanh toán hộ không được mặc định là thu nhập của tài xế.
- Ví ShopeeFood trong app KHÔNG nằm trong phạm vi theo dõi.
- Tiền xăng đổ 100k là khoản thực chi một lần; khi phân bổ 30k cho ca A và 20k cho ca B để tính lợi nhuận thì KHÔNG trừ thêm tiền ví hoặc cộng thêm tiền thực chi.
- Không tự động nhập dữ liệu cũ. Có màn hình khởi tạo số dư ví mới.

## 4. Bảo mật

- Supabase project hoàn toàn mới. Auth/RLS để mỗi người chỉ truy cập dữ liệu của mình; không dùng service-role secret ở trình duyệt.
- Mật khẩu và kết nối DB là bí mật, không đưa vào repo, ảnh chụp hoặc chat.
- Lưu trữ dữ liệu tài chính thật ở database mới, hỗ trợ xem trên nhiều thiết bị.
- Test những tình huống dữ liệu sai/transaction đồng thời/xóa/sửa/không tính trùng.

## 5. Giao diện

- Giữ sát demo đã duyệt: nền lavender nhạt, thẻ trắng bo tròn, KPI gradient, font Be Vietnam Pro, responsive desktop/mobile, light/dark.
- Sidebar cố định trên desktop, drawer trên mobile.
- 6 trang ở mục 2. Không có lương văn phòng, dự báo lương hay ví app ShopeeFood.
- Bộ lọc ngày/tuần/tháng/quý/năm đồng nhất với dữ liệu thật, không hardcode ngày demo.

## 6. Tách biệt triển khai

- Tạo repository GitHub mới. Tạo Vercel project mới gắn với repository đó.
- Tạo Supabase project mới với tên khác (ví dụ: buikiet-chitieu).
- Dùng environment variables của project mới; không copy `.env.local` từ website cũ.
- Không push đến `kietbt04-beta/quanlychitieu`, không deploy vào `buithekiet.vercel.app`.
- Không sao chép bất kỳ dữ liệu người dùng cũ nào, trừ khi người dùng yêu cầu cụ thể sau này.

## 7. Kế hoạch thực thi

(1) Xây giao diện và dữ liệu demo ở thư mục mới. (2) Thiết kế schema + RLS cho Supabase mới, chờ người dùng tạo project và cấp biến môi trường an toàn. (3) Kết nối và test nghiệp vụ. (4) Review cả desktop/mobile. (5) GitHub repo mới + Vercel project mới. (6) Dữ liệu mới từ số 0.
