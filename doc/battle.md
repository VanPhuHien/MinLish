# Module Battle

## 1. Tổng quan

Module Battle cho phép 2 user đấu từ vựng 1v1 **real-time** qua WebSocket (socket.io). Server kiểm soát toàn bộ luồng game — thời gian, điểm số, kết quả. Client chỉ hiển thị và gửi đáp án.

Sau trận, hệ thống tự trao XP và tính streak qua Gamification module.

---

## 2. Kiến trúc

```
backend/
├── src/
│   ├── models/
│   │   └── battleMatch.model.js       MongoDB schema
│   ├── modules/battle/
│   │   ├── battle.service.js          generateQuestions, getHistory, getMatchById
│   │   ├── battle.controller.js       REST handlers
│   │   ├── battle.router.js           REST routes
│   │   └── battle.schema.js           Zod validation
│   └── socket/
│       ├── index.js                   initSocket, getIo, auth middleware
│       ├── auth.socket.js             JWT auth cho socket
│       └── battle/
│           ├── index.js               đăng ký socket event handlers
│           ├── matchmaking.js         queue + invite room
│           └── engine.js              game loop, scoring, disconnect handling

```

**Phân tách trách nhiệm:**

| Layer                      | Trách nhiệm                                              |
| :------------------------- | :------------------------------------------------------- |
| `matchmaking.js`           | Ghép trận (queue/invite)                                 |
| `engine.js`                | Game loop, tính điểm, xử lý disconnect/reconnect/forfeit |
| `battle.service.js`        | Sinh câu hỏi từ DB, truy vấn lịch sử trận                |
| `battle.router/controller` | 2 REST endpoints: lịch sử + chi tiết trận                |

---

## 3. Database

**Collection:** `battle_matches`

```
BattleMatch {
  mode:        'mcq' | 'typing'
  matchType:   'queue' | 'invite'
  roomCode:    String (sparse unique — chỉ có với invite)
  status:      'waiting' | 'in_progress' | 'finished' | 'abandoned'
  players: [
    { userId: ObjectId, score: Number, correctCount: Number, connected: Boolean }
  ]
  questions: [
    { cardId: ObjectId, term: String, correctAnswer: String, options: [String] }
    // options rỗng [] với typing mode
  ]
  winnerId:    ObjectId | null   (null = hòa hoặc abandoned)
  startedAt:   Date
  finishedAt:  Date
  timestamps:  true
}
```

**Nguồn câu hỏi:** Card từ **system decks** (`deck.ownerType = 'system'`, `deck.status = 'published'`). Không dùng deck của user.

---

## 4. Tính điểm

```
Đúng:  score = 100 + round(50 × remainingMs / 12000)
Sai:   score = 0
```

- Điểm tính **ngay lúc submit**, không phụ thuộc đối thủ.
- `remainingMs = deadlineTs - Date.now()` tại thời điểm server nhận answer.
- Speed bonus tối đa 50 điểm (trả lời ngay lập tức).
- Server là nguồn gốc sự thật — không thể gian lận bằng cách delay gửi packet.

---

## 5. Xử lý Disconnect

```
Player mất kết nối
       │
       ▼
server: player.connected = false
server: emit 'battle:opponentDisconnected' cho đối thủ
server: set graceTimer (15s)
       │
   ┌───┴──────────────────────────┐
   │ Trong 15s                    │ Sau 15s
   ▼                              ▼
Player emit 'battle:rejoin'    opponent.connected?
       │                        ├── Yes → finalizeAsForfeit (đối thủ thắng)
server: cancel graceTimer       └── No  → abandonMatch (status='abandoned')
server: rebind socket
server: emit 'battle:rejoined'
  { currentRound, total, term, mode, options, deadlineTs }   ← sync state hiện tại
Trận tiếp tục bình thường
```

**Forfeit** (`finalizeAsForfeit`): persist DB, emit `battle:opponentLeft`, trao XP nếu đã chơi ≥ 1 round.

**Abandon** (`abandonMatch`): persist `status='abandoned'`, emit `battle:abandoned`, **không trao XP**.

---

## 6. Reward sau trận

Tích hợp với `gamification.service.js`:

| Hành động     | XP  | Điều kiện                      |
| :------------ | :-- | :----------------------------- |
| `battle_play` | +15 | Cả 2 player, bất kể thắng/thua |
| `battle_win`  | +35 | Chỉ người thắng (winnerId)     |

**Idempotency:** Unique index `(userId, source, refId)` trong collection `xp_events` — `refId = matchId`. Gọi `recordActivity` nhiều lần với cùng matchId không bị cộng XP trùng.

Reward được wrap trong `try/catch` riêng — lỗi gamification không bao giờ crash kết quả trận.

---

## 7. Cấu hình (`gamification.config.js`)

| Constant                  | Giá trị | Ý nghĩa                             |
| :------------------------ | :------ | :---------------------------------- |
| `BATTLE.rounds`           | 10      | Số câu hỏi mỗi trận                 |
| `BATTLE.perQuestionMs`    | 12000   | Thời gian mỗi câu (ms)              |
| `BATTLE.speedBonusMax`    | 50      | Speed bonus tối đa mỗi câu          |
| `BATTLE.queueTimeoutMs`   | 30000   | Thời gian chờ ghép trận tối đa (ms) |
| `BATTLE.reconnectGraceMs` | 15000   | Thời gian reconnect (ms)            |

---

## 8. Tham chiếu

| File                                           | Vai trò                                |
| :--------------------------------------------- | :------------------------------------- |
| `backend/src/socket/battle/engine.js`          | Game loop chính                        |
| `backend/src/socket/battle/matchmaking.js`     | Queue + invite                         |
| `backend/src/modules/battle/battle.service.js` | Sinh câu hỏi, REST queries             |
| `backend/src/models/battleMatch.model.js`      | MongoDB schema                         |
| `backend/src/config/gamification.config.js`    | Constants BATTLE, XP                   |
| `doc/api.md`                                   | API reference (mục Battle)             |
| `doc/models.md`                                | Schema reference (bảng battle_matches) |
