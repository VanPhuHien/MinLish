# Danh sách các Routes của Frontend MinLish

Tài liệu này mô tả chi tiết các đường dẫn (routes) hiện có trong ứng dụng frontend của MinLish, cơ chế định tuyến, trạng thái phân quyền (Public/Private) và các tham số đi kèm.

---

## 1. Cơ chế định tuyến (Routing)

Hiện tại, ứng dụng sử dụng cơ chế định tuyến tùy chỉnh dạng Single Page Application (SPA) thông qua React State (`currentPath` trong `App.jsx`) và phương thức `window.history.pushState`. 

Hàm điều hướng:
- `navigate(path, param)`: Cập nhật URL trên trình duyệt không gây tải lại trang, đồng thời đồng bộ hóa component tương ứng.

---

## 2. Danh sách Routes chi tiết

### / (Trang chủ)
- **Mô tả**: Trang giới thiệu (Landing Page) của MinLish.
- **Quyền truy cập**: Public (Công khai).
- **Chức năng**:
  - Giới thiệu tổng quan về phương pháp học tiếng Anh (Dictation & Shadowing).
  - Trình bày ba tính năng cốt lõi của ứng dụng (Luyện nghe chép chính tả, Nhại giọng Shadowing, Học từ vựng qua Flashcards).
  - Nút kêu gọi hành động dẫn sang trang Đăng nhập.

### /login (Trang đăng nhập)
- **Mô tả**: Giao diện đăng nhập tài khoản người dùng.
- **Quyền truy cập**: Public (Công khai).
- **Chức năng**:
  - Nhập Email và Mật khẩu để xác thực tài khoản qua API `/auth/login`.
  - Đăng nhập thành công sẽ lưu `accessToken` và thông tin người dùng vào `localStorage`, chuyển hướng về trang chủ `/`.
  - Nếu gặp lỗi `403` hoặc `400` kèm thông báo tài khoản chưa kích hoạt, hệ thống sẽ tự động gọi API gửi yêu cầu OTP mới và điều hướng sang `/verify-email` kèm theo email tương ứng.

### /signup (Trang đăng ký)
- **Mô tả**: Giao diện đăng ký tài khoản mới.
- **Quyền truy cập**: Public (Công khai).
- **Chức năng**:
  - Nhập Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu.
  - Kiểm tra tính hợp lệ dữ liệu ở client trước khi gửi lên API `/auth/signup`.
  - Ánh xạ trực quan các lỗi chi tiết từ server (như trùng lặp email) dưới từng trường nhập liệu.
  - Đăng ký thành công sẽ tự động chuyển hướng sang trang `/verify-email` kèm theo email đã đăng ký.

### /verify-email (Trang xác thực email)
- **Mô tả**: Giao diện nhập mã OTP để kích hoạt tài khoản.
- **Quyền truy cập**: Public (Công khai).
- **Tham số nhận vào**: Địa chỉ email cần xác thực.
- **Chức năng**:
  - Gồm 6 ô nhập mã OTP tách biệt với cơ chế tự nhảy tiêu điểm (focus) thông minh.
  - Đồng hồ đếm ngược gửi lại mã dựa trên cấu hình `.env` (mặc định 60 giây).
  - Gọi API `/auth/verify-email` để kích hoạt tài khoản. Thành công sẽ hiển thị thông báo và tự động chuyển về `/login` sau 1.5 giây.

### /profile (Trang thông tin cá nhân)
- **Mô tả**: Trang quản lý hồ sơ thông tin cá nhân của người dùng.
- **Quyền truy cập**: Private (Yêu cầu đăng nhập).
- **Chức năng**:
  - Xem và chỉnh sửa thông tin cá nhân.
  - Được liên kết truy cập trực tiếp từ menu dropdown của người dùng trên Header khi đã đăng nhập thành công.
