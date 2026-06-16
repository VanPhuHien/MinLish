import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { generateToken } from '../../utils/jwt.js';

const testUserId = new mongoose.Types.ObjectId();
const validToken = generateToken(
  { id: testUserId, role: 'user', type: 'ACCESS' },
  '15m'
);

const url = '/api/v1/s3/presigned-url';

let app;

beforeAll(async () => {
  // Fake S3 creds so getSignedUrl can sign offline (no network / no AWS).
  process.env.AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || 'test-key';
  process.env.AWS_SECRET_ACCESS_KEY =
    process.env.AWS_SECRET_ACCESS_KEY || 'test-secret';
  process.env.BUCKET_NAME = process.env.BUCKET_NAME || 'test-bucket';
  process.env.BUCKET_REGION = process.env.BUCKET_REGION || 'ap-southeast-1';
  ({ default: app } = await import('../../app.js'));
});

describe('POST /api/v1/s3/presigned-url', () => {
  describe('authentication', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app)
        .post(url)
        .send({ contentType: 'audio/webm', purpose: 'shadowing-audio' });
      expect(res.status).toBe(401);
    });
  });

  describe('success', () => {
    it('signs an upload URL for shadowing audio', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ contentType: 'audio/webm', purpose: 'shadowing-audio' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Tạo presigned URL thành công.');
      expect(res.body.data.expiresIn).toBe(60);
      expect(res.body.data.key).toMatch(
        new RegExp(`^shadowing/${testUserId.toString()}/[0-9a-f]{32}\\.webm$`)
      );
      expect(res.body.data.uploadUrl).toContain('X-Amz-Signature');
      expect(res.body.data.uploadUrl).toContain(res.body.data.key);
    });

    it('scopes the key by purpose and content type (card image)', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ contentType: 'image/png', purpose: 'card-image' });

      expect(res.status).toBe(200);
      expect(res.body.data.key).toMatch(
        new RegExp(`^cards/${testUserId.toString()}/[0-9a-f]{32}\\.png$`)
      );
    });

    it('accepts a fileSize within the limit', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          contentType: 'audio/webm',
          purpose: 'shadowing-audio',
          fileSize: 1024 * 1024,
        });

      expect(res.status).toBe(200);
    });
  });

  describe('input validation', () => {
    it('returns 400 for an invalid purpose', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ contentType: 'audio/webm', purpose: 'whatever' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'purpose' })])
      );
    });

    it('returns 400 when contentType is not allowed for the purpose', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ contentType: 'image/png', purpose: 'shadowing-audio' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when fileSize exceeds the limit', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          contentType: 'audio/webm',
          purpose: 'shadowing-audio',
          fileSize: 20 * 1024 * 1024,
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 when contentType is missing', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ purpose: 'shadowing-audio' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when purpose is missing', async () => {
      const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ contentType: 'audio/webm' });

      expect(res.status).toBe(400);
    });
  });
});
