import UserSegmentProgress from '../../models/userSegmentProgress.model.js';
import LessonSegment from '../../models/lessonSegment.model.js';
import Lesson from '../../models/lesson.model.js';
import AppError from '../../utils/AppError.js';
import { evaluatePronunciation } from '../../services/azureSpeech.service.js';

export const getLessonSegmentsProgress = async (userId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }
  return await UserSegmentProgress.find({ userId, lessonId });
};

export const getSegmentProgress = async (userId, lessonId, segmentId) => {
  const progress = await UserSegmentProgress.findOne({
    userId,
    lessonId,
    segmentId,
  });

  if (!progress) {
    throw new AppError('Segment progress not found', 404);
  }
  return progress;
};

export const updateSegmentProgress = async (
  userId,
  lessonId,
  segmentId,
  data
) => {
  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) {
    throw new AppError('Segment not found in this lesson', 404);
  }

  const set = {};
  const max = {};
  if (data.dictation) {
    if (data.dictation.attemptCount !== undefined) {
      set['dictation.attemptCount'] = data.dictation.attemptCount;
    }
    if (data.dictation.hintUsedCount !== undefined) {
      set['dictation.hintUsedCount'] = data.dictation.hintUsedCount;
    }
    
    // Tính điểm Dictation dựa vào số lần thử và số lần dùng gợi ý
    const attempt = data.dictation.attemptCount || 1;
    const hints = data.dictation.hintUsedCount || 0;
    const score = Math.max(0, 100 - (attempt - 1) * 10 - hints * 5);
    max['dictation.bestScore'] = score;
  }
  
  if (data.shadowing) {
    if (data.shadowing.attemptCount !== undefined) {
      set['shadowing.attemptCount'] = data.shadowing.attemptCount;
    }
    if (data.shadowing.latestAudioUrl !== undefined) {
      set['shadowing.latestAudioUrl'] = data.shadowing.latestAudioUrl;
    }
    
    // Đánh giá phát âm qua Azure Speech API
    let aiScore = 0;
    if (data.shadowing.latestAudioUrl) {
      const referenceText = segment.transcript.normalized || segment.transcript.original;
      aiScore = await evaluatePronunciation(data.shadowing.latestAudioUrl, referenceText);
    }

    const attempt = data.shadowing.attemptCount || 1;
    const finalScore = Math.max(0, Math.round(aiScore) - (attempt - 1) * 10);
    max['shadowing.bestScore'] = finalScore;
  }
  set.updatedAt = new Date();

  const updatePayload = { $set: set };
  if (Object.keys(max).length > 0) {
    updatePayload.$max = max;
  }

  const progress = await UserSegmentProgress.findOneAndUpdate(
    { userId, lessonId, segmentId },
    updatePayload,
    { new: true, upsert: true }
  );
  return progress;
};