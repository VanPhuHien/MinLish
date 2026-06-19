import { z } from 'zod';

export const presignedUrlSchema = z.object({
  contentType: z.string().trim().min(1, 'contentType is required'),
  purpose: z.enum(['shadowing-audio', 'deck-import', 'card-image'], {
    errorMap: () => ({ message: 'Invalid purpose' }),
  }),
  fileSize: z.coerce.number().int().positive().optional(),
});

export const confirmUploadSchema = z.object({
  key: z.string().trim().min(1, 'key is required'),
  purpose: z.enum(['shadowing-audio', 'card-image'], {
    errorMap: () => ({ message: 'Invalid purpose' }),
  }),
  resourceId: z.string().trim().min(1).optional(),
});
