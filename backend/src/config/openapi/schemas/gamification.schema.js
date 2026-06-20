export default {
  GamificationStreakData: {
    type: 'object',
    properties: {
      currentStreak: {
        type: 'integer',
        description: 'Số ngày học liên tiếp hiện tại.',
        example: 5,
      },
      longestStreak: {
        type: 'integer',
        description: 'Kỷ lục streak cao nhất từ trước đến nay.',
        example: 12,
      },
      lastActiveDayKey: {
        type: 'string',
        nullable: true,
        description: 'Ngày cuối cùng có hành động học (YYYY-MM-DD, UTC+7). null nếu chưa học.',
        example: '2026-06-20',
      },
      activeToday: {
        type: 'boolean',
        description: 'User đã có hành động học hôm nay hay chưa.',
        example: true,
      },
    },
  },
  GamificationStreakResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      code: { type: 'string', example: 'STREAK_FETCHED' },
      message: { type: 'string', example: 'Streak fetched' },
      data: { $ref: '#/components/schemas/GamificationStreakData' },
    },
  },

  GamificationProfileData: {
    type: 'object',
    properties: {
      totalXp: {
        type: 'integer',
        description: 'Tổng XP tích lũy all-time.',
        example: 340,
      },
      level: {
        type: 'integer',
        description: 'Cấp độ hiện tại, tính từ totalXp.',
        example: 2,
      },
      currentStreak: {
        type: 'integer',
        description: 'Số ngày học liên tiếp hiện tại.',
        example: 5,
      },
      longestStreak: {
        type: 'integer',
        description: 'Kỷ lục streak cao nhất từ trước đến nay.',
        example: 12,
      },
      xpIntoLevel: {
        type: 'integer',
        description: 'XP đã tích lũy bên trong level hiện tại (tính từ sàn của level).',
        example: 40,
      },
      xpForNextLevel: {
        type: 'integer',
        description: 'Tổng XP cần thiết để hoàn thành level hiện tại và lên cấp.',
        example: 200,
      },
      progressPct: {
        type: 'integer',
        description: 'Phần trăm tiến độ tới level kế (0–100).',
        example: 20,
      },
    },
  },
  GamificationProfileResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      code: { type: 'string', example: 'PROFILE_FETCHED' },
      message: { type: 'string', example: 'Profile fetched' },
      data: { $ref: '#/components/schemas/GamificationProfileData' },
    },
  },
};
