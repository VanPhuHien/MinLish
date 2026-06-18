import AppError from '../../utils/AppError.js';
import LessonSegment from '../../models/lessonSegment.model.js';
import Lesson from '../../models/lesson.model.js';
import UserLessonProgress from '../../models/userLessonProgress.model.js';
import UserSegmentProgress from '../../models/userSegmentProgress.model.js';

export const listLessons = async (filters, userId) => {
  const { tagId, cefrLevelId, mode, q, page, limit } = filters;

  // Lessons are public content — only published ones are listed.
  const query = { status: 'published' };
  if (tagId) query.tagIds = tagId;
  if (cefrLevelId) query.cefrLevelIds = cefrLevelId;
  if (mode) query.modes = mode;
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit;
  const [lessons, totalItems] = await Promise.all([
    Lesson.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    Lesson.countDocuments(query),
  ]);

  // Attach the current user's progress (one query, merged by lessonId).
  let progressMap = {};
  if (userId && lessons.length > 0) {
    const lessonIds = lessons.map((l) => l._id);
    const progresses = await UserLessonProgress.find({
      userId,
      lessonId: { $in: lessonIds },
    });
    progressMap = progresses.reduce((acc, p) => {
      acc[p.lessonId.toString()] = p;
      return acc;
    }, {});
  }

  const items = lessons.map((lesson) => ({
    lesson,
    userProgress: progressMap[lesson._id.toString()] || null,
  }));

  return {
    lessons: items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const getLessonById = async (lessonId, userId) => {
  // Only published lessons are publicly visible.
  const lesson = await Lesson.findOne({ _id: lessonId, status: 'published' });
  if (!lesson) throw new AppError('Không tìm thấy bài học', 404);

  // Attach the current user's progress when authenticated.
  let userProgress = null;
  if (userId) {
    userProgress = await UserLessonProgress.findOne({ userId, lessonId });
  }

  return { lesson, userProgress };
};

export const getSegmentsByLessonId = async (lessonId, userId) => {
  // Segments belong to a lesson — reject if the lesson is missing/unpublished.
  const lesson = await Lesson.findOne({ _id: lessonId, status: 'published' });
  if (!lesson) throw new AppError('Không tìm thấy bài học', 404);

  const segments = await LessonSegment.find({ lessonId }).sort({ startMs: 1 });

  // Merge the current user's per-segment progress (one query, keyed by segmentId).
  let progressMap = {};
  if (userId && segments.length > 0) {
    const progresses = await UserSegmentProgress.find({
      userId,
      lessonId,
      segmentId: { $in: segments.map((s) => s._id) },
    });
    progressMap = progresses.reduce((acc, p) => {
      acc[p.segmentId.toString()] = p;
      return acc;
    }, {});
  }

  // Spec LessonSegmentListResponse.data is an array of { segment, userProgress }.
  return segments.map((segment) => ({
    segment,
    userProgress: progressMap[segment._id.toString()] || null,
  }));
};

export const getSegmentById = async (lessonId, segmentId, userId) => {
  // Don't serve segments of missing/unpublished lessons.
  const lesson = await Lesson.findOne({ _id: lessonId, status: 'published' });
  if (!lesson) throw new AppError('Không tìm thấy segment', 404);

  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) throw new AppError('Không tìm thấy segment', 404);

  let userProgress = null;
  if (userId) {
    userProgress = await UserSegmentProgress.findOne({
      userId,
      lessonId,
      segmentId,
    });
  }

  return { segment, userProgress };
};
