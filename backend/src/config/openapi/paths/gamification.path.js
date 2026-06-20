import { bearerAuth } from '../helpers/security.js';

const TAG = 'Gamification';

export default {
  '/gamification/streak': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy trạng thái streak của user',
      description:
        'Trả về chuỗi ngày học liên tiếp hiện tại, kỷ lục, và trạng thái hôm nay. Streak chỉ tăng khi có hành động học thật (hoàn thành segment, review card qua SRS grade, chơi battle) — không có write endpoint, không có heartbeat.',
      responses: {
        200: {
          description: 'Lấy streak thành công.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GamificationStreakResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/gamification/me': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy hồ sơ gamification của user',
      description:
        'Trả về tổng XP, cấp độ hiện tại, streak, và tiến độ đến level kế tiếp. Nếu user chưa có hoạt động, trả về defaults (xp=0, level=1). Level tính theo công thức lũy tiến: requiredXpForLevel(L) = 50 * L * (L+1).',
      responses: {
        200: {
          description: 'Lấy hồ sơ thành công.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GamificationProfileResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
