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

### /lessons (Trang danh sách bài học)
- **Mô tả**: Trang hiển thị danh sách các bài học công khai của hệ thống.
- **Quyền truy cập**: Public (Công khai).
- **Chức năng**:
  - Tìm kiếm bài học theo tiêu đề có áp dụng cơ chế trì hoãn (debounce) để tối ưu hiệu năng gọi API.
  - Lọc bài học linh hoạt theo cấp độ CEFR và các nhãn chủ đề.
  - Hiển thị danh sách các bài học dưới dạng lưới (grid) có khả năng tự động co giãn kích thước (responsive), mỗi bài học biểu thị rõ các chế độ học hỗ trợ (Dictation, Shadowing).
  - Phân trang bài học để dễ dàng quản lý số lượng bài hiển thị.
### /forgot-password (Trang quên mật khẩu)
- **Mô tả**: Giao diện yêu cầu khôi phục mật khẩu tài khoản qua email.
- **Quyền truy cập**: Public (Công khai).
- **Chức năng**:
  - Nhập Email đã đăng ký để hệ thống kiểm tra sự tồn tại của tài khoản.
  - Sau khi xác thực hợp lệ và bấm gửi, ứng dụng sẽ gọi API `/auth/forgot-password` để gửi mã OTP 6 chữ số qua email của người dùng.
  - Chuyển hướng sang trang đặt lại mật khẩu `/reset-password` kèm theo email đã nhập.

### /reset-password (Trang đặt lại mật khẩu)
- **Mô tả**: Giao diện xác thực mã OTP quên mật khẩu và thiết lập mật khẩu mới.
- **Quyền truy cập**: Public (Công khai).
- **Tham số nhận vào**: Địa chỉ email cần khôi phục mật khẩu.
- **Chức năng**:
  - **Bước 1: Xác thực OTP**: Nhập mã OTP 6 chữ số đã được gửi qua email (hỗ trợ tự động chuyển focus và dán mã nhanh). Đồng thời tích hợp cơ chế đếm ngược gửi lại mã OTP (cooldown).
  - **Bước 2: Thiết lập mật khẩu mới**: Nhập mật khẩu mới (yêu cầu ít nhất 6 ký tự) và xác nhận lại mật khẩu mới. Hỗ trợ nút bật/tắt hiển thị mật khẩu.
  - Gọi API `/auth/reset-password` để kiểm tra OTP và cập nhật mật khẩu mới. Thành công sẽ tự động chuyển hướng về trang đăng nhập `/login` sau 1.5 giây.

