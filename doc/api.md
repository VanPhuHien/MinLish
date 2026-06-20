# **Cấu trúc:**

/api/v1

# **Public API**

## **Auth**

Cơ chế access token \+ refresh token  
(access token lưu localstorage / refresh token lưu cookie \- chỉ đính kèm với api refresh)

POST /auth/login  
POST /auth/signup
POST /auth/refresh (kèm cookie refresh token)  
POST /auth/logout

Cơ chế otp: cache redis

POST /auth/otp/send kèm payload { "email": "user@example.com", "purpose": "verify_email" }  
POST /auth/otp/verify kèm payload { "email": "user@example.com", "otp": "482913", "purpose": "verify_email" }  
forgot-password, reset-password tương tự

## **Lessons công khai**

- GET /api/v1/lessons — danh sách lesson đã publish; hỗ trợ filter theo tagId, cefrLevelId, mode, q, page, limit.

## **Decks công khai**

- GET /api/v1/decks — danh sách deck hệ thống (ownerType = system) đã publish; hỗ trợ filter theo tagId, cefrLevelId, q, page, limit. Không bắt buộc đăng nhập. Deck cá nhân của user truy cập qua /users/me/decks.

# **Cần token API**

## **Lessons**

- GET /api/v1/lessons/{lessonId} — chi tiết một lesson đã publish. Yêu cầu đăng nhập.
- GET /api/v1/lessons/{lessonId}/segments — danh sách segment của lesson, sắp xếp theo startMs tăng dần. Yêu cầu đăng nhập.
- GET /api/v1/lessons/{lessonId}/segments/{segmentId} — chi tiết một segment. Yêu cầu đăng nhập.

## **Profile**

- GET /api/v1/users/me — lấy thông tin user hiện tại.
- PUT /api/v1/users/me — cập nhật hồ sơ cá nhân như name, avatarUrl.

## **Metadata công khai**

- GET /api/v1/cefr-levels — lấy danh sách level CEFR để filter lesson/deck.
- GET /api/v1/tags — lấy danh sách tag. Tùy chọn ?usedBy=lesson|deck để chỉ lấy tag đang được lesson/deck (đã publish) sử dụng; không truyền = tất cả tag.

## **Decks**

- GET /api/v1/decks/{deckId} — chi tiết deck.
- GET /api/v1/decks/{deckId}/topics — danh sách topic trong deck kèm tiến độ topic của user.
- GET /api/v1/decks/{deckId}/topics/{topicId}/cards — danh sách card trong topic kèm trạng thái học của user. Card hệ thống trả về thêm `quizOptions [{word, isCorrect}]` để render trắc nghiệm.

## **Deck của user (ownerType = user)**

- GET /api/v1/users/me/decks — danh sách deck do user hiện tại sở hữu; hỗ trợ filter q, page, limit.
- POST /api/v1/users/me/decks — tạo deck mới thuộc sở hữu user hiện tại (luôn published; body chỉ gồm title, description). Tối đa 3 deck/user.
- GET /api/v1/users/me/decks/{deckId} — chi tiết một deck của user.
- PUT /api/v1/users/me/decks/{deckId} — cập nhật deck (chỉ chủ sở hữu).
- DELETE /api/v1/users/me/decks/{deckId} — xóa deck kèm toàn bộ topic và card bên trong (chỉ chủ sở hữu).

## **Topics trong deck của user**

- GET /api/v1/users/me/decks/{deckId}/topics — danh sách topic trong deck của user.
- POST /api/v1/users/me/decks/{deckId}/topics — tạo topic mới trong deck.
- GET /api/v1/users/me/decks/{deckId}/topics/{topicId} — chi tiết topic.
- PUT /api/v1/users/me/decks/{deckId}/topics/{topicId} — cập nhật topic.
- DELETE /api/v1/users/me/decks/{deckId}/topics/{topicId} — xóa topic kèm toàn bộ card bên trong.

## **Cards trong deck của user**

- GET /api/v1/users/me/decks/{deckId}/cards — danh sách card trong deck; hỗ trợ filter topicId, q, page, limit.
- POST /api/v1/users/me/decks/{deckId}/cards — tạo card mới trong deck. Body đơn giản: topicId, term, translation (bắt buộc); definition, example, pos (tùy chọn). definition lưu vào explanation.vi, example lưu vào examples.en; order tự gán.
- GET /api/v1/users/me/decks/{deckId}/cards/{cardId} — chi tiết card.
- PUT /api/v1/users/me/decks/{deckId}/cards/{cardId} — cập nhật term, translation, definition, example, pos (gửi ít nhất một). Thẻ giữ nguyên topic, không hỗ trợ chuyển nhóm.
- DELETE /api/v1/users/me/decks/{deckId}/cards/{cardId} — xóa card.

## **Tra cứu từ vựng hệ thống**

- GET /api/v1/vocabulary/search — tìm card trong các deck hệ thống đã publish theo term (query q bắt buộc, limit tùy chọn 1..50 mặc định 10). Trả về shape phẳng (term, translation, pos, definition, example, sourceCardId) để điền sẵn form tạo/sửa thẻ.

## **Upload file (S3)**

Vòng đời upload 2 bước: (1) xin presigned PUT → (2) client PUT bytes thẳng lên S3. Sau đó gửi `url` (trả về từ bước 1) trực tiếp vào body của endpoint cập nhật resource; backend validate quyền sở hữu + HeadObject tại đó, không cần bước confirm riêng.

- POST /api/v1/s3/presigned-url — tạo URL PUT ký sẵn (hết hạn 60s) để client upload file trực tiếp lên S3. Body: contentType (bắt buộc), purpose (bắt buộc: shadowing-audio | deck-import | card-image), fileSize (bắt buộc, bytes). Key sinh ở server theo userId; backend không nhận bytes. `fileSize` được bake vào chữ ký → S3 reject upload sai kích thước. Trả về uploadUrl + key + url (public/CDN) + expiresIn. Client dùng url này để gửi kèm khi cập nhật resource. **Phân quyền theo purpose:** `card-image` yêu cầu role `admin` (403 nếu user thường); `shadowing-audio` và `deck-import` cho phép mọi user đã xác thực.

## **Progress của user**

- GET /api/v1/users/me/lesson-progress — danh sách tiến độ lesson của user.
- GET /api/v1/users/me/lesson-progress/{lessonId} — chi tiết tiến độ một lesson.
- PUT /api/v1/users/me/lesson-progress/{lessonId} — upsert toàn bộ tiến độ lesson.
- GET /api/v1/users/me/lessons/{lessonId}/segments-progress — lấy toàn bộ tiến độ segment của một lesson.
- GET /api/v1/users/me/lessons/{lessonId}/segments/{segmentId}/progress — lấy tiến độ một segment.
- PATCH /api/v1/users/me/lessons/{lessonId}/segments/{segmentId}/progress - upsert/cập nhật một phần block dictation hoặc shadowing (nếu chưa có sẽ tự tạo mới tiến độ cho câu này).
- GET /api/v1/users/me/card-states — danh sách trạng thái card; hỗ trợ deckId, topicId, due, starred, page, limit.
- GET /api/v1/users/me/card-states/{cardId} — lấy trạng thái một card.
- PUT /api/v1/users/me/card-states/{cardId} — upsert toàn bộ state card.
- PATCH /api/v1/users/me/card-states/{cardId} — cập nhật srs và flags

## **Gamification**

### Streak

- GET /api/v1/gamification/streak — lấy trạng thái streak của user hiện tại. Trả về `{ currentStreak, longestStreak, lastActiveDayKey, activeToday }`. Streak chỉ tăng bởi hành động học thật (hoàn thành segment, review card qua SRS grade, chơi battle) — không có write endpoint.

### Profile & Level

- GET /api/v1/gamification/me — hồ sơ gamification của user. Trả về `{ totalXp, level, currentStreak, longestStreak, xpIntoLevel, xpForNextLevel, progressPct }`. `progressPct` trong `[0, 100]`. Nếu chưa có hoạt động, trả về defaults (`xp=0, level=1`).

### Leaderboard _(Module 2.2 — chưa triển khai)_

- GET /api/v1/gamification/leaderboard?page=1&limit=20 — bảng xếp hạng global all-time theo tổng XP giảm dần. Trả về `{ items: [{ rank, userId, name, avatarUrl, totalXp, level }], page, limit, total }`. Hòa điểm phân định bằng `_id` asc. `limit` tối đa 100.

### My Rank _(Module 2.3 — chưa triển khai)_

- GET /api/v1/gamification/me/rank — thứ hạng của user hiện tại. Trả về `{ rank, totalXp, totalPlayers }`. `rank = (số người có totalXp > của mình) + 1`.

## **Admin API**

## **User management**

- GET /api/v1/admin/users — danh sách user, filter theo role, q, page, limit.
- GET /api/v1/admin/users/{userId} — chi tiết một user.
- PATCH /api/v1/admin/users/{userId} — cập nhật thông tin hoặc role.
- DELETE /api/v1/admin/users/{userId} — khóa user.

## **CEFR Levels management**

- GET /api/v1/admin/cefr-levels — danh sách level CEFR.
- POST /api/v1/admin/cefr-levels — tạo level mới.
- GET /api/v1/admin/cefr-levels/{id} — chi tiết một level.
- PUT /api/v1/admin/cefr-levels/{id} — cập nhật level.
- DELETE /api/v1/admin/cefr-levels/{id} — xóa level.

## **Tags management**

- GET /api/v1/admin/tags — danh sách tag.
- POST /api/v1/admin/tags — tạo tag.
- GET /api/v1/admin/tags/{id} — chi tiết tag.
- PUT /api/v1/admin/tags/{id} — cập nhật tag.
- DELETE /api/v1/admin/tags/{id} — xóa tag.

## **Lessons management**

- GET /api/v1/admin/lessons — danh sách tất cả lesson, gồm draft, published, archived; hỗ trợ filter status, tagId, cefrLevelId, mode, q, page, limit.
- POST /api/v1/admin/lessons — tạo lesson mới.
- GET /api/v1/admin/lessons/{lessonId} — chi tiết lesson bất kể trạng thái.
- PUT /api/v1/admin/lessons/{lessonId} — cập nhật lesson.
- DELETE /api/v1/admin/lessons/{lessonId} — xóa hoặc archive lesson.
- POST /api/v1/admin/lessons/{lessonId}/publish — publish lesson.

## **Lesson segments management**

- GET /api/v1/admin/lessons/{lessonId}/segments — danh sách segment của lesson.
- POST /api/v1/admin/lessons/{lessonId}/segments — tạo segment mới.
- GET /api/v1/admin/lessons/{lessonId}/segments/{segmentId} — chi tiết segment.
- PUT /api/v1/admin/lessons/{lessonId}/segments/{segmentId} — cập nhật segment như startMs, endMs, transcript, translation.
- DELETE /api/v1/admin/lessons/{lessonId}/segments/{segmentId} — xóa segment.

## **Decks management**

- GET /api/v1/admin/decks — danh sách tất cả deck; hỗ trợ filter tagId, cefrLevelId, q, page, limit.
- POST /api/v1/admin/decks — tạo deck mới.
- GET /api/v1/admin/decks/{deckId} — chi tiết deck.
- PUT /api/v1/admin/decks/{deckId} — cập nhật deck.
- DELETE /api/v1/admin/decks/{deckId} — xóa mềm deck (đổi status sang archived).

## **Deck topics management**

- GET /api/v1/admin/decks/{deckId}/topics — danh sách topic của deck.
- POST /api/v1/admin/decks/{deckId}/topics — tạo topic mới.
- GET /api/v1/admin/decks/{deckId}/topics/{topicId} — chi tiết topic.
- PUT /api/v1/admin/decks/{deckId}/topics/{topicId} — cập nhật topic.
- DELETE /api/v1/admin/decks/{deckId}/topics/{topicId} — xóa topic.
- PATCH /api/v1/admin/decks/{deckId}/topics/reorder — sắp xếp lại topic theo order.

## **Cards management**

- GET /api/v1/admin/decks/{deckId}/cards — danh sách card của deck; hỗ trợ topicId, q, page, limit.
- POST /api/v1/admin/decks/{deckId}/cards — tạo card mới.
- GET /api/v1/admin/decks/{deckId}/cards/{cardId} — chi tiết card.
- PUT /api/v1/admin/decks/{deckId}/cards/{cardId} — cập nhật term, pos, phonetics, translation, explanation, examples, imageUrl.
- DELETE /api/v1/admin/decks/{deckId}/cards/{cardId} — xóa card.
