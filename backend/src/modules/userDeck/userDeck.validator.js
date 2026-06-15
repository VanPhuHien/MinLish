import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const deckIdParamSchema = z.object({
  deckId: objectIdSchema,
});

export const listMyDecksSchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createDeckSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tên bộ thẻ không được để trống')
    .max(100, 'Tên bộ thẻ tối đa 100 ký tự'),
  description: z.string().trim().max(500).optional(),
});

export const updateDeckSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Tên bộ thẻ không được để trống')
      .max(100, 'Tên bộ thẻ tối đa 100 ký tự')
      .optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: 'Cần cung cấp ít nhất một trường để cập nhật (title hoặc description)',
  });
