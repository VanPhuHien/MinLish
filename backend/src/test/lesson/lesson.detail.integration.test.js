import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import Lesson from '../../models/lesson.model.js';
import UserLessonProgress from '../../models/userLessonProgress.model.js';
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
  await Promise.all([Lesson.deleteMany({}), UserLessonProgress.deleteMany({})]);
});

const makeLesson = (over = {}) =>
  Lesson.create({
    title: over.title || 'Lesson',
    slug: over.slug || `lesson-${new mongoose.Types.ObjectId()}`,
    sourceUrl: 'https://example.com/a.mp3',
    status: 'published',
    ...over,
  });

describe('GET /api/v1/lessons/:lessonId', () => {
  describe('optional auth', () => {
    it('returns a published lesson without a token (userProgress null)', async () => {
      const lesson = await makeLesson({ title: 'Coffee', slug: 'coffee' });

      const res = await request(app).get(`/api/v1/lessons/${lesson._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.lesson.title).toBe('Coffee');
      expect(res.body.data.userProgress).toBeNull();
    });

    it('treats an invalid token as anonymous (200, not 401)', async () => {
      const lesson = await makeLesson({ slug: 'x' });

      const res = await request(app)
        .get(`/api/v1/lessons/${lesson._id}`)
        .set('Authorization', 'Bearer not.a.valid.token');

      expect(res.status).toBe(200);
      expect(res.body.data.userProgress).toBeNull();
    });
  });

  describe('userProgress', () => {
    it("attaches the current user's progress when authenticated", async () => {
      const lesson = await makeLesson({ slug: 'x' });
      await UserLessonProgress.create({
        userId: testUserId,
        lessonId: lesson._id,
        status: 'in_progress',
        progressPct: 35,
        lastStartMs: 4000,
        selectedMode: 'dictation',
      });

      const res = await request(app)
        .get(`/api/v1/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      const up = res.body.data.userProgress;
      expect(up).not.toBeNull();
      expect(up.progressPct).toBe(35);
      expect(up.lastStartMs).toBe(4000);
      expect(up.selectedMode).toBe('dictation');
    });

    it("does not attach another user's progress", async () => {
      const lesson = await makeLesson({ slug: 'x' });
      await UserLessonProgress.create({
        userId: otherUserId,
        lessonId: lesson._id,
        progressPct: 99,
      });

      const res = await request(app)
        .get(`/api/v1/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.body.data.userProgress).toBeNull();
    });
  });

  describe('visibility', () => {
    it('returns 404 for a draft lesson', async () => {
      const lesson = await makeLesson({ slug: 'draft', status: 'draft' });

      const res = await request(app)
        .get(`/api/v1/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 for an archived lesson', async () => {
      const lesson = await makeLesson({ slug: 'arch', status: 'archived' });

      const res = await request(app).get(`/api/v1/lessons/${lesson._id}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 when lesson does not exist', async () => {
      const ghostId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/v1/lessons/${ghostId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('input validation', () => {
    it('returns 400 for invalid lessonId', async () => {
      const res = await request(app).get('/api/v1/lessons/notanid');

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'lessonId' })])
      );
    });
  });

  describe('response shape', () => {
    it('returns correct envelope', async () => {
      const lesson = await makeLesson({
        title: 'Coffee',
        slug: 'coffee',
        modes: ['dictation', 'shadowing'],
      });

      const res = await request(app).get(`/api/v1/lessons/${lesson._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Lấy chi tiết bài học thành công.',
        data: {
          lesson: { title: 'Coffee', slug: 'coffee' },
        },
      });
      expect(res.body.data).toHaveProperty('userProgress');
      expect(res.body.data.lesson._id).toBe(lesson._id.toString());
    });
  });
});
