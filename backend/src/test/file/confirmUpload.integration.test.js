import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

// Mock S3 so HeadObject runs offline. Real getSignedUrl isn't exercised here.
const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));
vi.mock('@aws-sdk/client-s3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    S3Client: vi.fn(function S3Client() {
      return { send: mockSend };
    }),
  };
});

import app from '../../app.js';
import Deck from '../../models/deck.model.js';
import Topic from '../../models/topic.model.js';
import Card from '../../models/card.model.js';
import UserSegmentProgress from '../../models/userSegmentProgress.model.js';
import { generateToken } from '../../utils/jwt.js';

let mongod;
const adminId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();
const adminToken = generateToken(
  { id: adminId, role: 'admin', type: 'ACCESS' },
  '15m'
);
const userToken = generateToken(
  { id: userId, role: 'user', type: 'ACCESS' },
  '15m'
);

const BASE = 'https://cdn.test';
const url = '/api/v1/s3/confirm';

beforeAll(async () => {
  process.env.BUCKET_NAME = process.env.BUCKET_NAME || 'test-bucket';
  process.env.BUCKET_REGION = process.env.BUCKET_REGION || 'ap-southeast-1';
  process.env.AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || 'test-key';
  process.env.AWS_SECRET_ACCESS_KEY =
    process.env.AWS_SECRET_ACCESS_KEY || 'test-secret';
  process.env.S3_PUBLIC_BASE_URL = BASE;
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({}); // HeadObject: object exists by default
  await Promise.all([
    Deck.deleteMany({}),
    Topic.deleteMany({}),
    Card.deleteMany({}),
    UserSegmentProgress.deleteMany({}),
  ]);
});

const makeCard = async () => {
  const deck = await Deck.create({
    title: 'D',
    slug: `deck-${new mongoose.Types.ObjectId()}`,
    ownerType: 'system',
    status: 'published',
  });
  const topic = await Topic.create({
    deckId: deck._id,
    name: 'T',
    slug: `topic-${new mongoose.Types.ObjectId()}`,
    order: 1,
  });
  return Card.create({
    deckId: deck._id,
    topicId: topic._id,
    term: 'family',
    translation: 'gia đình',
    order: 1,
  });
};

const cardKey = (uid) => `cards/${uid}/${'a'.repeat(32)}.png`;
const shadowingKey = (uid) => `shadowing/${uid}/${'a'.repeat(32)}.webm`;

describe('POST /api/v1/s3/confirm', () => {
  describe('authentication', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app)
        .post(url)
        .send({ key: cardKey(adminId), purpose: 'card-image' });
      expect(res.status).toBe(401);
    });
  });

  describe('card-image (admin)', () => {
    it('confirms and stores the public URL on the card', async () => {
      const card = await makeCard();
      const key = cardKey(adminId);

      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key, purpose: 'card-image', resourceId: card._id });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('UPLOAD_CONFIRMED');
      expect(res.body.data.key).toBe(key);
      expect(res.body.data.url).toBe(`${BASE}/${key}`);

      const inDb = await Card.findById(card._id);
      expect(inDb.imageUrl).toBe(`${BASE}/${key}`);
      expect(mockSend).toHaveBeenCalledTimes(1); // HeadObject
    });

    it('returns 403 for a non-admin user', async () => {
      const card = await makeCard();
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ key: cardKey(userId), purpose: 'card-image', resourceId: card._id });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('returns 404 when the card does not exist', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: cardKey(adminId),
          purpose: 'card-image',
          resourceId: new mongoose.Types.ObjectId(),
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('shadowing-audio (user)', () => {
    it('confirms and stores the URL on the segment progress', async () => {
      const segmentId = new mongoose.Types.ObjectId();
      await UserSegmentProgress.create({
        userId,
        lessonId: new mongoose.Types.ObjectId(),
        segmentId,
      });
      const key = shadowingKey(userId);

      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ key, purpose: 'shadowing-audio', resourceId: segmentId });

      expect(res.status).toBe(200);
      expect(res.body.data.url).toBe(`${BASE}/${key}`);

      const inDb = await UserSegmentProgress.findOne({ userId, segmentId });
      expect(inDb.shadowing.latestAudioUrl).toBe(`${BASE}/${key}`);
    });

    it('returns 404 when no progress doc exists for the user/segment', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          key: shadowingKey(userId),
          purpose: 'shadowing-audio',
          resourceId: new mongoose.Types.ObjectId(),
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('ownership', () => {
    it('returns 403 when the key belongs to another user', async () => {
      const card = await makeCard();
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: cardKey(new mongoose.Types.ObjectId()), // someone else's prefix
          purpose: 'card-image',
          resourceId: card._id,
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('KEY_OWNERSHIP_MISMATCH');
    });
  });

  describe('object existence', () => {
    it('returns 404 when the object was never uploaded', async () => {
      const card = await makeCard();
      mockSend.mockRejectedValueOnce(new Error('NotFound')); // HeadObject fails

      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: cardKey(adminId), purpose: 'card-image', resourceId: card._id });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('UPLOAD_NOT_FOUND');
    });
  });

  describe('input validation', () => {
    it('returns 400 when resourceId is missing', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: cardKey(adminId), purpose: 'card-image' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('RESOURCE_ID_REQUIRED');
    });

    it('returns 400 for an unsupported purpose (deck-import)', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ key: 'imports/x/y.csv', purpose: 'deck-import', resourceId: '1' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when key is missing', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ purpose: 'card-image', resourceId: '1' });

      expect(res.status).toBe(400);
    });
  });
});
