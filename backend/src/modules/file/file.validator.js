import { z } from 'zod';

export const presignedUrlSchema = z.object({
  contentType: z
    .string()
    .trim()
    .min(1, 'contentType không được để trống'),
  purpose: z.enum(['shadowing-audio', 'deck-import', 'card-image'], {
    errorMap: () => ({ message: 'purpose không hợp lệ' }),
  }),
  fileSize: z.coerce.number().int().positive().optional(),
});
