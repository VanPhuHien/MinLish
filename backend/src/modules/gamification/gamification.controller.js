import { successResponse } from '../../utils/response.js';
import { GAMIFICATION } from '../../constants/codes/index.js';
import * as service from './gamification.service.js';
import {
  getDayKey,
  requiredXpForLevel,
} from '../../config/gamification.config.js';

export const getMe = async (req, res, next) => {
  try {
    const profile = await service.getProfile(req.user.id);
    const { totalXp, level, currentStreak, longestStreak } = profile;

    const xpFloor = requiredXpForLevel(level - 1);
    const xpCeil = requiredXpForLevel(level);
    const xpIntoLevel = totalXp - xpFloor;
    const xpForNextLevel = xpCeil - xpFloor;
    const progressPct = Math.min(
      100,
      Math.round((xpIntoLevel / xpForNextLevel) * 100)
    );

    res.json(
      successResponse(GAMIFICATION.PROFILE_FETCHED, {
        totalXp,
        level,
        currentStreak,
        longestStreak,
        xpIntoLevel,
        xpForNextLevel,
        progressPct,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const getStreak = async (req, res, next) => {
  try {
    const profile = await service.getProfile(req.user.id);
    const activeToday = profile.lastActiveDayKey === getDayKey();
    res.json(
      successResponse(GAMIFICATION.STREAK_FETCHED, {
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActiveDayKey: profile.lastActiveDayKey,
        activeToday,
      })
    );
  } catch (err) {
    next(err);
  }
};
