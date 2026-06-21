import AppError from '../../utils/AppError.js';
import LessonSegment from '../../models/lessonSegment.model.js';
import UserSegmentProgress from '../../models/userSegmentProgress.model.js';
import UserLessonProgress from '../../models/userLessonProgress.model.js';
import { recordActivity } from '../gamification/gamification.service.js';

const DICTATION_PASS_THRESHOLD = 80;

/**
 * @param {string} userId
 * @param {string} lessonId
 * @param {string} segmentId
 * @param {string} userInput
 */
export const submitDictationProgress = async (
  userId,
  lessonId,
  segmentId,
  userInput
) => {
  // Lấy transcript gốc để tính điểm
  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) throw new AppError('Segment not found', 404);

  // Tính điểm
  const score = calculateDictationScore(
    userInput,
    segment.transcript.normalized
  );
  const completed = score >= DICTATION_PASS_THRESHOLD;

  // Upsert user_segment_progress
  const existing = await UserSegmentProgress.findOne({ userId, segmentId });

  const dictationUpdate = {
    attemptCount: (existing?.dictation?.attemptCount ?? 0) + 1,
    bestScore: Math.max(score, existing?.dictation?.bestScore ?? 0),
    completed: existing?.dictation?.completed || completed,
    // Không bao giờ reset về false -> Ghi nhận "Sự tiến bộ" của người học
    hintUsedCount: existing?.dictation?.hintUsedCount ?? 0,
  };

  const progress = await UserSegmentProgress.findOneAndUpdate(
    { userId, segmentId, lessonId },
    { $set: { dictation: dictationUpdate, updatedAt: new Date() } },
    { upsert: true, new: true }
  );

  // Recalculate lesson-level progress
  await recalculateLessonProgress(userId, lessonId, segment.startMs);

  if (dictationUpdate.completed) {
    try {
      await recordActivity(userId, 'segment_complete', segmentId.toString());
    } catch (e) {
      console.warn(
        '[gamification] recordActivity failed for segment_complete:',
        e.message
      );
    }
  }

  return { score, completed, progress };
};

/**
 * Word-level accuracy score (0–100)
 * @param {string} userInput
 * @param {string} normalized
 */
const calculateDictationScore = (userInput, normalized) => {
  const clean = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/);
  // Xóa ký tự đặc biệt, chỉ giữ a->z, 0->9, khoảng trắng (\s)
  // Tách thành mảng chứa từng cụm từ

  const userWords = clean(userInput);
  const refWords = clean(normalized);

  let matched = 0;
  const refCopy = [...refWords];

  for (const w of userWords) {
    const idx = refCopy.indexOf(w);
    if (idx !== -1) {
      matched++;
      refCopy.splice(idx, 1); // xóa cụm từ tại vị trí idx bắt đầu, xóa "1" từ
    }
  }

  return Math.round((matched / refWords.length) * 100);
  // >= 0.5: Sẽ được làm tròn lên số nguyên tiếp theo; < 0.5: Làm tròn xuống
};

/**
 * @param {string} userId
 * @param {string} lessonId
 * @param {number} currentSegmentStartMs
 */
const recalculateLessonProgress = async (
  userId,
  lessonId,
  currentSegmentStartMs
) => {
  const [allSegments, completedSegments] = await Promise.all([
    // -> Chạy song song - Nhanh hơn viết 2 dòng await
    LessonSegment.countDocuments({ lessonId }),
    UserSegmentProgress.countDocuments({
      userId,
      lessonId,
      'dictation.completed': true,
    }),
  ]);

  const progressPercent = Math.round((completedSegments / allSegments) * 100);

  await UserLessonProgress.findOneAndUpdate(
    { userId, lessonId },
    {
      $set: {
        'dictation.progressPct': progressPercent,
        'dictation.lastStartMs': currentSegmentStartMs,
        'dictation.status':
          progressPercent === 100 ? 'completed' : 'in_progress',
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
};
