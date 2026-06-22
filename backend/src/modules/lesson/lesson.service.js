import AppError from '../../utils/AppError.js';
import {
  LESSON,
  COMMON,
  ADMIN,
  MESSAGES,
} from '../../constants/codes/index.js';
import LessonSegment from '../../models/lessonSegment.model.js';
import Lesson from '../../models/lesson.model.js';
import UserLessonProgress from '../../models/userLessonProgress.model.js';
import UserSegmentProgress from '../../models/userSegmentProgress.model.js';
import { generateSlug } from '../../utils/generate.js';
import { getDurationMsViaYtdlp } from '../../utils/videoUrlReadder.util.js';

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
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);

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
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);

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
  if (!lesson) throw new AppError(LESSON.SEGMENT_NOT_FOUND, 404);

  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) throw new AppError(LESSON.SEGMENT_NOT_FOUND, 404);

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

export const listAdminLessons = async (filters) => {
  const { status, tagId, cefrLevelId, mode, q, page, limit } = filters;
  const query = {};
  if (status) query.status = status;
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
  return {
    lessons,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

const validateData = (data) => {
  const errors = [];
  if (!data.title) {
    errors.push({ field: 'title', message: 'The title field is required.' });
  }
  if (!data.sourceUrl) {
    errors.push({
      field: 'sourceUrl',
      message: 'The sourceURL field is required.',
    });
  }
  if (
    data.status &&
    !['draft', 'published', 'archived'].includes(data.status)
  ) {
    errors.push({
      field: 'status',
      message: 'The status field must be draft, published or archived.',
    });
  }
  if (errors.length > 0) {
    throw new AppError(COMMON.INVALID_DATA, 400, errors);
  }
};

export const createAdminLesson = async (data) => {
  validateData(data);
  let slug = data.slug;
  if (!data.slug) slug = generateSlug(data.title);
  const existing = await Lesson.findOne({ slug });
  if (existing) {
    throw new AppError(ADMIN.LESSON_SLUG_EXISTS, 400, {
      field: 'slug',
      message: MESSAGES[ADMIN.LESSON_SLUG_EXISTS],
    });
  }

  const durationMs = await getDurationMsViaYtdlp(data.sourceUrl);

  const lesson = await Lesson.create({
    title: data.title,
    slug,
    description: data.description || '',
    tagIds: data.tagIds || [],
    cefrLevelIds: data.cefrLevelIds || [],
    modes: ['dictation', 'shadowing'],
    status: data.status || 'draft',
    sourceUrl: data.sourceUrl,
    thumbnailUrl: data.thumbnailUrl || '',
    ...(durationMs !== null && { durationMs }),
  });
  return lesson;
};

export const getAdminLessonById = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  return lesson;
};

export const updateAdminLesson = async (lessonId, data) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  validateData(data);

  let slug = data.slug;
  if (!data.slug) slug = generateSlug(data.title);
  const existing = await Lesson.findOne({ slug, _id: { $ne: lessonId } });
  if (existing) {
    throw new AppError(ADMIN.LESSON_SLUG_EXISTS, 400, {
      field: 'slug',
      message: MESSAGES[ADMIN.LESSON_SLUG_EXISTS],
    });
  }
  lesson.slug = slug;
  lesson.title = data.title;

  if (data.description !== undefined) lesson.description = data.description;
  if (data.tagIds !== undefined) lesson.tagIds = data.tagIds;
  if (data.cefrLevelIds !== undefined) lesson.cefrLevelIds = data.cefrLevelIds;
  if (data.status !== undefined) lesson.status = data.status;

  if (data.sourceUrl !== undefined) {
    if (lesson.sourceUrl !== data.sourceUrl) {
      lesson.sourceUrl = data.sourceUrl;
      const durationMs = await getDurationMsViaYtdlp(data.sourceUrl);
      if (durationMs !== null) {
        lesson.durationMs = durationMs;
      }
    } else {
      lesson.sourceUrl = data.sourceUrl;
    }
  }

  if (data.thumbnailUrl !== undefined) lesson.thumbnailUrl = data.thumbnailUrl;
  await lesson.save();
  return lesson;
};

export const deleteAdminLesson = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  lesson.status = 'archived';
  await lesson.save();
  return lesson;
};

export const publishAdminLesson = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);

  if (lesson.status === 'published') {
    throw new AppError(
      COMMON.INVALID_DATA,
      400,
      undefined,
      'Lesson is already published'
    );
  }

  const segmentCount = await LessonSegment.countDocuments({ lessonId });
  if (segmentCount === 0) {
    throw new AppError(
      COMMON.INVALID_DATA,
      400,
      undefined,
      'Cannot publish a lesson with no segments'
    );
  }

  lesson.status = 'published';
  lesson.publishedAt = new Date();
  await lesson.save();
  return lesson;
};

export const listAdminLessonSegments = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  const segments = await LessonSegment.find({ lessonId }).sort({ startMs: 1 });
  return segments;
};

const validateSegmentData = (data) => {
  const errors = [];
  if (
    data.startMs === undefined ||
    typeof data.startMs !== 'number' ||
    data.startMs < 0
  ) {
    errors.push({
      field: 'startMs',
      message: 'The startMs field is mandatory, must be a number and >= 0.',
    });
  }
  if (data.endMs === undefined || typeof data.endMs !== 'number') {
    errors.push({
      field: 'endMs',
      message: 'The endMs field is mandatory and must be a number.',
    });
  } else {
    if (data.endMs <= 0) {
      errors.push({
        field: 'endMs',
        message: 'The endMs field must be > 0.',
      });
    }

    if (data.endMs <= data.startMs) {
      errors.push({
        field: 'endMs',
        message: 'The endMs field must be larger than the startMs field.',
      });
    }
  }
  if (!data.transcript?.original) {
    errors.push({
      field: 'transcript.original',
      message: 'The original field is required.',
    });
  }
  if (!data.transcript?.normalized) {
    errors.push({
      field: 'transcript.normalized',
      message: 'The normalized field is required.',
    });
  }
  if (!data.translation) {
    errors.push({
      field: 'translation',
      message: 'The translation field is required.',
    });
  }
  if (errors.length > 0) {
    throw new AppError(COMMON.INVALID_DATA, 400, errors);
  }
};

export const createAdminLessonSegment = async (lessonId, data) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  validateSegmentData(data);

  if (
    lesson.durationMs &&
    lesson.durationMs > 0 &&
    data.endMs > lesson.durationMs
  ) {
    throw new AppError(COMMON.INVALID_DATA, 400, [
      {
        field: 'endMs',
        message:
          'The endMs field must not exceed the audio length of the lesson.',
      },
    ]);
  }

  const overlappingSegments = await LessonSegment.find({
    lessonId,
    startMs: { $lt: data.endMs },
    endMs: { $gt: data.startMs },
  });
  if (overlappingSegments.length > 0) {
    throw new AppError(COMMON.INVALID_DATA, 400, [
      {
        field: 'startMs/endMs',
        message:
          'The time allocated for this segment overlaps with that of other segments.',
      },
    ]);
  }

  const segment = await LessonSegment.create({
    lessonId,
    startMs: data.startMs,
    endMs: data.endMs,
    transcript: {
      original: data.transcript.original,
      normalized: data.transcript.normalized,
    },
    translation: data.translation,
  });
  return segment;
};

export const getAdminLessonSegmentById = async (lessonId, segmentId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) throw new AppError(LESSON.SEGMENT_NOT_FOUND, 404);
  return segment;
};

export const updateAdminLessonSegment = async (lessonId, segmentId, data) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) throw new AppError(LESSON.SEGMENT_NOT_FOUND, 404);
  validateSegmentData(data);

  if (
    lesson.durationMs &&
    lesson.durationMs > 0 &&
    data.endMs > lesson.durationMs
  ) {
    throw new AppError(COMMON.INVALID_DATA, 400, [
      {
        field: 'endMs',
        message:
          'The endMs field must not exceed the audio length of the lesson.',
      },
    ]);
  }

  const overlappingSegments = await LessonSegment.find({
    lessonId,
    _id: { $ne: segmentId },
    startMs: { $lt: data.endMs },
    endMs: { $gt: data.startMs },
  });
  if (overlappingSegments.length > 0) {
    throw new AppError(COMMON.INVALID_DATA, 400, [
      {
        field: 'startMs/endMs',
        message:
          'The time allocated for this segment overlaps with that of other segments.',
      },
    ]);
  }

  segment.startMs = data.startMs;
  segment.endMs = data.endMs;
  segment.transcript = {
    original: data.transcript.original,
    normalized: data.transcript.normalized,
  };
  segment.translation = data.translation;
  await segment.save();
  return segment;
};

export const deleteAdminLessonSegment = async (lessonId, segmentId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) throw new AppError(LESSON.SEGMENT_NOT_FOUND, 404);
  await LessonSegment.deleteOne({ _id: segmentId });
};
