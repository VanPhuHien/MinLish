users

| Field          | Ý nghĩa                                |
| :------------- | :------------------------------------- |
| `_id`          | ID duy nhất của user trong MongoDB.    |
| `email`        | Email đăng nhập, nên unique.           |
| `passwordHash` | Mật khẩu đã băm, không lưu plain text. |
| `name`         | Tên hiển thị của user.                 |
| `avatarUrl`    | Ảnh đại diện.                          |
| `role`         | Vai trò như `user`, `admin`            |
| `createdAt`    | Ngày tạo tài khoản.                    |
| `updatedAt`    | Ngày cập nhật gần nhất.                |
| `isVerified`   | Check verify email                     |
| `isActive`     | Ban/unban                              |
| `banReason`    | Lý do khóa tài khoản                   |

cerf_levels

| Field   | Ý nghĩa                         |
| :------ | :------------------------------ |
| `_id`   | ID tag.                         |
| `code`  | Mã ngắn, ví dụ `a1,a2` …        |
| `label` | Tên hiển thị, ví dụ `A1`, `A2`. |

tags

| Field   | Ý nghĩa                               |
| :------ | :------------------------------------ |
| `_id`   | ID tag.                               |
| `code`  | Mã ngắn, ví dụ `movie`, `daily,` …    |
| `label` | Tên hiển thị, ví dụ `Movie`, `Daily`. |

lessons

| Field          | Ý nghĩa                                            |
| :------------- | :------------------------------------------------- |
| `_id`          | ID lesson.                                         |
| `title`        | Tên bài học.                                       |
| `slug`         | Chuỗi URL thân thiện.                              |
| `description`  | Mô tả ngắn.                                        |
| `tagIds`       | Các tags                                           |
| `cefrLevelIds` | Các mức cerf_levels                                |
| `modes`        | Những mode hỗ trợ, ví dụ `dictation`, `shadowing`. |
| `status`       | Trạng thái như `draft`, `published`, `archived`.   |
| `publishedAt`  | Ngày công khai bài học.                            |
| `createdAt`    | Ngày tạo.                                          |
| `updatedAt`    | Ngày cập nhật.                                     |
| `sourceUrl`    | URL gốc để phát media.                             |
| `thumbnailUrl` | Ảnh thumbnail.                                     |

lesson_segments

| Field                   | Ý nghĩa                                             |
| :---------------------- | :-------------------------------------------------- |
| `_id`                   | ID segment.                                         |
| `lessonId`              | Segment thuộc lesson nào.                           |
| `order`                 | Thứ tự segment trong lesson, ví dụ câu 1, 2, 3\.    |
| `startMs`               | Thời điểm bắt đầu trong video, tính bằng mili giây. |
| `endMs`                 | Thời điểm kết thúc trong video.                     |
| `transcript.original`   | Câu gốc đầy đủ.                                     |
| `transcript.normalized` | Chuẩn hóa để so sánh                                |
| `translation`           | Bản dịch                                            |
| `createdAt`             | Ngày tạo.                                           |
| `updatedAt`             | Ngày cập nhật.                                      |

decks

| Field          | Ý nghĩa                                  |
| :------------- | :--------------------------------------- |
| `_id`          | ID bộ thẻ.                               |
| `title`        | Tên bộ thẻ.                              |
| `slug`         | URL thân thiện.                          |
| `description`  | Mô tả ngắn về deck.                      |
| `coverImage`   | Ảnh bìa.                                 |
| `tagIds`       | Các tag như `common`, `basic`, `oxford`. |
| `cefrLevelIds` | Các mức cerf_levels                      |
| `topicCount`   | Số topic con trong deck.                 |
| `cardCount`    | Tổng số thẻ.                             |
| `publishedAt`  | Ngày công khai.                          |

topics (“Bảng này là các nhóm nhỏ bên trong một deck. Ví dụ trong deck “1000 từ tiếng Anh thông dụng”, các nhóm con là Gia đình, Trường học, Công việc, Sức khỏe”)

| Field       | Ý nghĩa                      |
| :---------- | :--------------------------- |
| `_id`       | ID nhóm thẻ.                 |
| `deckId`    | Thuộc deck nào.              |
| `name`      | Tên nhóm, ví dụ `Gia đình`.  |
| `slug`      | URL thân thiện.              |
| `order`     | Thứ tự hiển thị bên sidebar. |
| `cardCount` | Số card trong nhóm.          |

cards (“Đây là dữ liệu gốc của từng flashcard/từ vựng”)

| Field                             | Ý nghĩa                                        |
| :-------------------------------- | :--------------------------------------------- |
| `_id`                             | ID card.                                       |
| `deckId`                          | Card thuộc deck nào.                           |
| `topicId`                         | Card thuộc nhóm nào trong deck (deck_topics ). |
| `order`                           | Thứ tự card trong nhóm.                        |
| `term`                            | Từ hoặc cụm từ chính cần học.                  |
| `pos`                             | Từ loại như noun, verb, adjective.             |
| `phonetics`                       | [{text, audio, locale}, ...]                   |
| `translation`                     | Nghĩa của từ dịch sang tiếng việt.             |
| `explanation.vi / explanation.en` | Giải thích                                     |
| `examples.vi / examples.en`       | Ví dụ câu dùng từ.                             |
| `imageUrl`                        | Ảnh minh họa từ                                |
| `createdAt`                       | Ngày tạo.                                      |
| `updatedAt`                       | Ngày cập nhật.                                 |

user_decks

| Field          | Ý nghĩa                                  |
| :------------- | :--------------------------------------- |
| `_id`          | ID bộ thẻ.                               |
| `title`        | Tên bộ thẻ.                              |
| `slug`         | URL thân thiện.                          |
| `description`  | Mô tả ngắn về deck.                      |
| `coverImage`   | Ảnh bìa.                                 |
| `tagIds`       | Các tag như `common`, `basic`, `oxford`. |
| `cefrLevelIds` | Các mức cerf_levels                      |
| `topicCount`   | Số topic con trong deck.                 |
| `cardCount`    | Tổng số thẻ.                             |
| `publishedAt`  | Ngày công khai.                          |

user_topics (“Bảng này là các nhóm nhỏ bên trong một deck. Ví dụ trong deck “1000 từ tiếng Anh thông dụng”, các nhóm con là Gia đình, Trường học, Công việc, Sức khỏe” do user tạo)

| Field       | Ý nghĩa                      |
| :---------- | :--------------------------- |
| `_id`       | ID nhóm thẻ.                 |
| `deckId`    | Thuộc deck nào.              |
| `name`      | Tên nhóm, ví dụ `Gia đình`.  |
| `slug`      | URL thân thiện.              |
| `order`     | Thứ tự hiển thị bên sidebar. |
| `cardCount` | Số card trong nhóm.          |

user_cards (“Đây là dữ liệu gốc của từng flashcard/từ vựng tạo bởi user”)

| Field                             | Ý nghĩa                                        |
| :-------------------------------- | :--------------------------------------------- |
| `_id`                             | ID card.                                       |
| `deckId`                          | Card thuộc deck nào.                           |
| `topicId`                         | Card thuộc nhóm nào trong deck (deck_topics ). |
| `order`                           | Thứ tự card trong nhóm.                        |
| `term`                            | Từ hoặc cụm từ chính cần học.                  |
| `pos`                             | Từ loại như noun, verb, adjective.             |
| `phonetics`                       | [{text, audio, locale}, ...]                   |
| `translation`                     | Nghĩa của từ dịch sang tiếng việt.             |
| `explanation.vi / explanation.en` | Giải thích                                     |
| `examples.vi / examples.en`       | Ví dụ câu dùng từ.                             |
| `imageUrl`                        | Ảnh minh họa từ                                |
| `createdAt`                       | Ngày tạo.                                      |
| `updatedAt`                       | Ngày cập nhật.                                 |

user_lesson_progress

| Field              | Ý nghĩa                                                 |
| :----------------- | :------------------------------------------------------ |
| `_id`              | ID bản ghi tiến độ.                                     |
| `userId`           | User nào.                                               |
| `lessonId`         | Lesson nào.                                             |
| `status`           | Trạng thái như `in_progress`, `completed`.              |
| `progressPct`      | Phần trăm hoàn thành lesson.                            |
| `lastSegmentOrder` | Lần gần nhất user đang ở segment số mấy.                |
| `selectedMode`     | Mode đang học gần nhất như `dictation` hay `shadowing`. |
| `updatedAt`        | Cập nhật gần nhất.                                      |

user_segment_progress (“Bảng này lưu tiến độ của user ở mức từng segment. Vì Dictation và Shadowing diễn ra theo từng câu”)

| Field       | Ý nghĩa                                                                                                                                                                |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`       | ID bản ghi.                                                                                                                                                            |
| `userId`    | User nào.                                                                                                                                                              |
| `lessonId`  | Thuộc lesson nào.                                                                                                                                                      |
| `segmentId` | Thuộc segment nào.                                                                                                                                                     |
| `dictation` | Trạng thái Dictation cho segment này. attemptCount: số lần thử. bestScore: điểm tốt nhất. completed: đã vượt qua hay chưa. hintUsedCount: đã dùng gợi ý bao nhiêu lần. |
| `shadowing` | Trạng thái Shadowing cho segment này. attemptCount bestOverallScore latestAudioUrl completed                                                                           |
| `updatedAt` | Lần cập nhật gần nhất.                                                                                                                                                 |

user_card_states

| Field       | Ý nghĩa                                         |
| :---------- | :---------------------------------------------- |
| `_id`       | ID state.                                       |
| `userId`    | User nào.                                       |
| `cardId`    | Card nào.                                       |
| `deckId`    | Thuộc deck nào.                                 |
| `topicId`   | Thuộc nhóm nào.                                 |
| `srs`       | {easeFactor, interval, lastGrade, nextReviewAt} |
| `flags`     | Cờ đặc biệt như đánh dấu sao, tạm ẩn.           |
| `createdAt` | Ngày bắt đầu học card này.                      |
| `updatedAt` | Ngày cập nhật gần nhất.                         |
