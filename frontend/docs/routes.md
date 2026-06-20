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

### /decks (Trang danh sách bộ từ)
- **Mô tả**: Trang hiển thị danh sách các bộ từ vựng (flashcard decks) của hệ thống và bộ từ cá nhân của người dùng.
- **Quyền truy cập**: Hỗn hợp (Tab "Bộ từ hệ thống" là Public; Tab "Bộ từ của bạn" yêu cầu đăng nhập - Private).
- **Chức năng**:
  - Chuyển đổi linh hoạt giữa hai tab: "Bộ từ hệ thống" (ownerType = system) và "Bộ từ của bạn" (ownerType = user).
  - Ở tab "Bộ từ hệ thống": Hỗ trợ tìm kiếm theo tiêu đề/mô tả bộ từ (có debounce) và lọc theo trình độ CEFR/Chủ đề Tags nhờ tái sử dụng component `Filters`.
  - Ở tab "Bộ từ của bạn": Tối giản giao diện bằng cách ẩn toàn bộ thanh tìm kiếm và bộ lọc, chỉ hiển thị danh sách bộ từ cá nhân của người dùng hiện tại.
  - Hiển thị danh sách bộ từ dạng lưới (grid) responsive thông qua component `DeckCard` hiển thị tối giản (ảnh đại diện, huy hiệu số lượng từ, các nhãn cấp độ/chủ đề, tiêu đề, và mô tả).
  - Hỗ trợ phân trang danh sách bộ từ và xử lý các trạng thái tải dữ liệu (Loading, Error, Empty).

### /decks/:deckId (Trang chi tiết bộ từ vựng hệ thống)
- **Mô tả**: Trang chi tiết của một bộ từ vựng hệ thống giúp học từ mới theo chủ đề.
- **Quyền truy cập**: Private (Yêu cầu đăng nhập).
- **Tham số nhận vào**: `deckId` (ObjectId của bộ từ hệ thống).
- **Chức năng**:
  - Giao diện 2 cột: Cột bên trái hiển thị danh sách chủ đề (topics) kèm tiến độ học (số từ đã học / tổng số từ); cột bên phải hiển thị thanh tiến độ lớn tổng quan, bộ chuyển đổi chế độ học (FlashCard/Quiz) và khu vực học thẻ.
  - Cho phép người dùng học các từ mới (các từ có `userCardState === null` từ API).
  - Học qua 2 chế độ:
    - **FlashCard**: Hiển thị ảnh minh họa (vuông cố định `220px x 220px` ở trung tâm), từ vựng, phiên âm US/UK, nút phát âm, lật 3D xem nghĩa, ví dụ và 4 nút đánh giá SRS (Học lại, Khó, Tốt, Dễ).
    - **Quiz**: Giao diện câu hỏi trắc nghiệm chọn từ tương ứng nghĩa. Sau khi chọn đáp án, tự động phát âm thanh, hiển thị thông tin chi tiết từ vựng và 4 nút đánh giá SRS.
  - Tích hợp cơ chế tự động cập nhật tiến độ học của chủ đề ngay sau khi người dùng đánh giá thẻ thành công.
  - Hiển thị màn hình hoàn thành chúc mừng khi học hết tất cả từ mới trong chủ đề hiện tại.

### /profile/decks/:deckId (Trang quản lý chi tiết bộ từ cá nhân)
- **Mô tả**: Giao diện quản lý thông tin chi tiết, danh sách chủ đề (topic) và thẻ từ vựng (card) của bộ từ cá nhân do người dùng sở hữu.
- **Quyền truy cập**: Private (Yêu cầu đăng nhập).
- **Tham số nhận vào**: `deckId` (ObjectId của bộ từ cá nhân).
- **Chức năng**:
  - Cho phép chỉnh sửa tiêu đề và mô tả bộ từ cá nhân.
  - Quản lý danh sách các Chủ đề (Topic) cá nhân (Thêm chủ đề mới, Chỉnh sửa tên chủ đề, Xóa chủ đề thông qua các API riêng dành cho cá nhân).
  - Quản lý danh sách Thẻ từ vựng (Card) của chủ đề đang chọn (Thêm thẻ mới, Chỉnh sửa thông tin thẻ, Xóa thẻ).
  - Tích hợp tính năng Tìm kiếm từ vựng hệ thống (`/vocabulary/search`) có debounce 400ms và auto-complete để hỗ trợ điền nhanh thông tin thẻ mới.
  - Tái sử dụng component `Input` dùng chung của dự án có xử lý custom validity khi người dùng bỏ trống các trường bắt buộc (`required`).
  - Hỗ trợ đa ngôn ngữ (VI/EN).

---

## 3. Routes dành riêng cho Quản trị viên (Admin)

Các route trong nhóm này yêu cầu người dùng đã đăng nhập với vai trò `admin`. Toàn bộ khu vực admin sử dụng bố cục riêng (`AdminLayout`) với Sidebar điều hướng và Header thông tin quản trị viên — **không hiển thị Header/Footer công khai**.

### /admin (Trang tổng quan Admin)
- **Mô tả**: Trang chào mừng của khu vực quản trị.
- **Quyền truy cập**: Private — chỉ dành cho `role = admin`.
- **Chức năng**: Hiện tại chưa có nội dung (placeholder). Sẽ được phát triển sau thành trang thống kê tổng quan (số người dùng, bài học, bộ từ vựng).

### /admin/decks (Trang quản lý Bộ từ vựng)
- **Mô tả**: Giao diện quản lý toàn bộ bộ từ vựng trong hệ thống.
- **Quyền truy cập**: Private — chỉ dành cho `role = admin`.
- **Chức năng**:
  - Hiển thị danh sách tất cả bộ từ vựng dạng lưới (grid) kèm ảnh bìa, huy hiệu CEFR, thẻ danh mục, số lượng Topics và Cards.
  - Hỗ trợ tìm kiếm theo tiêu đề (có debounce 400ms) và lọc theo Trình độ CEFR, Danh mục (Tag).
  - Lưu trữ deck (archive): bấm icon archive sẽ chuyển trạng thái deck sang `archived`, deck bị làm mờ và hiển thị badge "Đã lưu trữ". Bấm icon bỏ lưu trữ để khôi phục về `draft`.
  - Thẻ "Tạo bộ từ vựng mới" cuối cùng trong lưới điều hướng sang `/admin/decks/new`.
  - Phân trang với hiển thị số lượng record hiện tại.
  - Gọi API `GET /api/v1/admin/decks` (yêu cầu Bearer token admin).

### /admin/decks/new (Trang tạo Bộ từ vựng mới)
- **Mô tả**: Form tạo mới một bộ từ vựng cho hệ thống.
- **Quyền truy cập**: Private — chỉ dành cho `role = admin`.
- **Chức năng**:
  - **Cột trái**: Nhập tiêu đề (bắt buộc, dùng component `Input` chung), mô tả chi tiết (textarea), khu vực tải ảnh bìa (hiển thị tượng trưng, chưa có chức năng).
  - **Cột phải**: Chọn trình độ CEFR (multi-select dạng pill — A1 đến C2), chọn thẻ danh mục (có autocomplete từ danh sách tag có sẵn, hiển thị dạng chip có thể xóa), chọn trạng thái (Bản nháp / Công khai).
  - Gọi API `POST /api/v1/admin/decks`. Thành công sẽ điều hướng về `/admin/decks` sau 1.2 giây.
  - Nút "Hủy" điều hướng trở lại `/admin/decks` không lưu dữ liệu.
