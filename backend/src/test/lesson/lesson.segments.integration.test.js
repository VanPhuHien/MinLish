import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import Lesson from '../../models/lesson.model.js';
import LessonSegment from '../../models/lessonSegment.model.js';
import UserSegmentProgress from '../../models/userSegmentProgress.model.js';
import { generateToken } from '../../utils/jwt.js';

let mongod;
const testUserId = new mongoose.Types.ObjectId();
const otherUserId = new mongoose.Types.ObjectId();
const validToken = generateToken(
  { id: testUserId, role: 'user', type: 'ACCESS' },
  '15m'
);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([
    Lesson.deleteMany({}),
    LessonSegment.deleteMany({}),
    UserSegmentProgress.deleteMany({}),
  ]);
});

const makeLesson = (over = {}) =>
  Lesson.create({
    title: over.title || 'Lesson',
    slug: over.slug || `lesson-${new mongoose.Types.ObjectId()}`,
    sourceUrl: 'https://example.com/a.mp3',
    status: 'published',
    ...over,
  });

const makeSegment = (lessonId, order) =>
  LessonSegment.create({
    lessonId,
    order,
    startMs: order * 1000,
    endMs: order * 1000 + 500,
    transcript: { original: `line ${order}`, normalized: `line ${order}` },
    translation: `dòng ${order}`,
  });

const url = (lessonId) => `/api/v1/lessons/${lessonId}/segments`;

describe('GET /api/v1/lessons/:lessonId/segments', () => {
  describe('data shape (spec: data is an array of {segment, userProgress})', () => {
    it('returns segments ordered by order as a flat array', async () => {
      const lesson = await makeLesson();
      await makeSegment(lesson._id, 2);
      await makeSegment(lesson._id, 1);

      const res = await request(app).get(url(lesson._id));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.map((i) => i.segment.order)).toEqual([1, 2]);
      expect(res.body.data[0]).toHaveProperty('segment');
      expect(res.body.data[0]).toHaveProperty('userProgress');
    });

    it('uses the spec message', async () => {
      const lesson = await makeLesson();
      await makeSegment(lesson._id, 1);

      const res = await request(app).get(url(lesson._id));

      expect(res.body.message).toBe('Lấy segments thành công');
    });
  });

  describe('optional auth + userProgress', () => {
    it('returns userProgress null for anonymous request', async () => {
      const lesson = await makeLesson();
      const seg = await makeSegment(lesson._id, 1);
      await UserSegmentProgress.create({
        userId: testUserId,
        lessonId: lesson._id,
        segmentId: seg._id,
        dictation: { bestScore: 90, completed: true },
      });

      const res = await request(app).get(url(lesson._id));

      expect(res.status).toBe(200);
      expect(res.body.data[0].userProgress).toBeNull();
    });

    it("attaches the current user's segment progress when authenticated", async () => {
      const lesson = await makeLesson();
      const seg = await makeSegment(lesson._id, 1);
      await UserSegmentProgress.create({
        userId: testUserId,
        lessonId: lesson._id,
        segmentId: seg._id,
        dictation: { attemptCount: 2, bestScore: 86, completed: true },
      });

      const res = await request(app)
        .get(url(lesson._id))
        .set('Authorization', `Bearer ${validToken}`);

      const up = res.body.data[0].userProgress;
      expect(up).not.toBeNull();
      expect(up.dictation.bestScore).toBe(86);
      expect(up.dictation.completed).toBe(true);
    });

    it("does not attach another user's progress", async () => {
      const lesson = await makeLesson();
      const seg = await makeSegment(lesson._id, 1);
      await UserSegmentProgress.create({
        userId: otherUserId,
        lessonId: lesson._id,
        segmentId: seg._id,
        dictation: { bestScore: 99 },
      });

      const res = await request(app)
        .get(url(lesson._id))
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.body.data[0].userProgress).toBeNull();
    });

    it('treats an invalid token as anonymous (200, not 401)', async () => {
      const lesson = await makeLesson();
      await makeSegment(lesson._id, 1);

      const res = await request(app)
        .get(url(lesson._id))
        .set('Authorization', 'Bearer not.a.valid.token');

      expect(res.status).toBe(200);
      expect(res.body.data[0].userProgress).toBeNull();
    });
  });

  describe('visibility', () => {
    it('returns 404 for a draft lesson', async () => {
      const lesson = await makeLesson({ status: 'draft' });
      await makeSegment(lesson._id, 1);

      const res = await request(app).get(url(lesson._id));

      expect(res.status).toBe(404);
    });

    it('returns 404 when lesson does not exist', async () => {
      const ghostId = new mongoose.Types.ObjectId();
      const res = await request(app).get(url(ghostId));
      expect(res.status).toBe(404);
    });

    it('returns empty array for a published lesson with no segments', async () => {
      const lesson = await makeLesson();

      const res = await request(app).get(url(lesson._id));

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('input validation', () => {
    it('returns 400 for invalid lessonId', async () => {
      const res = await request(app).get('/api/v1/lessons/notanid/segments');

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'lessonId' })])
      );
    });
  });
});
