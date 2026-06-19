import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import 'dotenv';
import sharp from 'sharp';
import AppError from '../../utils/AppError.js';
import { FILE } from '../../constants/codes/index.js';

const bucketName = process.env.BUCKET_NAME;
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

const UPLOAD_CONFIG = {
  'shadowing-audio': {
    prefix: 'shadowing',
    allowedTypes: [
      'audio/webm',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/ogg',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  'deck-import': {
    prefix: 'imports',
    allowedTypes: ['text/csv', 'application/json'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  'card-image': {
    prefix: 'cards',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024,
  },
};

const EXT_BY_TYPE = {
  'audio/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'text/csv': 'csv',
  'application/json': 'json',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Sign a one-time PUT URL so the client uploads straight to S3.
// The key is generated server-side (scoped by userId) — never taken
// from the client — and the contentType is baked into the signature.
export const createUploadPresignedUrl = async (
  { contentType, purpose, fileSize },
  userId
) => {
  const config = UPLOAD_CONFIG[purpose];
  if (!config) throw new AppError(FILE.INVALID_PURPOSE, 400);

  if (!config.allowedTypes.includes(contentType)) {
    throw new AppError(
      FILE.CONTENT_TYPE_NOT_ALLOWED,
      400,
      [],
      `Content type is not allowed for "${purpose}"`
    );
  }

  if (fileSize !== undefined && fileSize > config.maxSize) {
    throw new AppError(
      FILE.FILE_TOO_LARGE,
      400,
      [],
      `File exceeds the ${config.maxSize / (1024 * 1024)}MB limit`
    );
  }

  const ext = EXT_BY_TYPE[contentType] || 'bin';
  const key = `${config.prefix}/${userId}/${randomImageName(16)}.${ext}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 } // 60 seconds
  );

  return { uploadUrl, key, expiresIn: 60 };
};

/**
 * @param {User} data
 * @returns {String}
 */
const resolveAvatarKey = (data) => {
  if (!data) return null;
  return data.profile?.avatarName || data.avatarName || null;
};

const checkValidImageExtensionFile = (file) => {
  return file.mimetype === 'image/jpeg' || file.mimetype === 'image/png';
};

export const getImagePresignedUrl = async (data) => {
  const key = resolveAvatarKey(data);
  if (!key) return null;

  const getObjectParams = {
    Bucket: bucketName,
    Key: key,
  };
  return await getSignedUrl(s3, new GetObjectCommand(getObjectParams), {
    expiresIn: 60, // 60 seconds
  });
};

/**
 * @param {User} data
 */
export const deleteOldAndInsertNewImageInS3 = async (data, file) => {
  if (!checkValidImageExtensionFile(file))
    throw new AppError(FILE.INVALID_IMAGE_FORMAT, 400);

  const oldKey = resolveAvatarKey(data);
  if (oldKey) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: oldKey,
      })
    );
  }

  const imageName = randomImageName();
  const buffer = await sharp(file.buffer)
    .resize({ height: 500, width: 500, fit: 'contain' })
    .toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: file.mimetype,
    })
  );
  return imageName;
};
