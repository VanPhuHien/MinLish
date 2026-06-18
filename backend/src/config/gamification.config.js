const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

function validateTz(tz) {
  try {
    Intl.DateTimeFormat('en-CA', { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

export const TZ = validateTz(process.env.GAMIFY_TZ || DEFAULT_TZ);

export const XP = {
  segmentComplete: 10,
  flashcardReview: 3,
  mcqAnswer: 3,
  battlePlay: 15,
  battleWin: 35,
  dailyStreakBonus: 20,
};

export const BATTLE = {
  rounds: 10,
  perQuestionMs: 12000,
  speedBonusMax: 50,
  queueTimeoutMs: 30000,
  reconnectGraceMs: 15000,
};

export function getDayKey(date = new Date()) {
  return Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date);
}

export function requiredXpForLevel(level) {
  return 50 * level * (level + 1);
}

export function computeLevel(totalXp) {
  if (totalXp < 0) return 1;
  let level = 1;
  while (totalXp >= requiredXpForLevel(level)) {
    level++;
  }
  return level;
}
