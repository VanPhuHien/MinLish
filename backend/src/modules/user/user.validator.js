import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const getLessonSegmentsProgressSchema = z.object({
  lessonId: objectIdSchema,
});

export const getSegmentProgressSchema = z.object({
  lessonId: objectIdSchema,
  segmentId: objectIdSchema,
});

export const updateSegmentProgressSchema = z.object({
  params: z.object({
    lessonId: objectIdSchema,
    segmentId: objectIdSchema,
  }),
  body: z
    .object({
      dictation: z
        .object({
          attemptCount: z.coerce.number().int().min(1),
          hintUsedCount: z.coerce.number().int().min(0),
        })
        .optional(),
      shadowing: z
        .object({
          attemptCount: z.coerce.number().int().min(1),
          latestAudioUrl: z.string().min(1),
        })
        .optional(),
    })
    .refine(
      (data) => data.dictation !== undefined || data.shadowing !== undefined,
      {
        message: 'Ít nhất phải có dictation hoặc shadowing',
      }
    ),
});

export const getCardStatesSchema = z.object({
  deckId: objectIdSchema.optional(),
  topicId: objectIdSchema.optional(),
  due: z
    .string()
    .transform((value) => value === 'true')
    .optional(), //nhận due, starred, hidden là string trả về true/false
  starred: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  hidden: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCardStateSchema = z.object({
  cardId: objectIdSchema,
});

const srsSchema = z.object({
  lastGrade: z.number().int().min(0).max(3),
});

const flagsSchema = z.object({
  starred: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

export const patchCardStateSchema = z.object({
  params: z.object({
    cardId: objectIdSchema,
  }),
  body: z.object({
    deckId: objectIdSchema.optional(),
    topicId: objectIdSchema.optional(),
    srs: srsSchema.optional(),
    flags: flagsSchema.optional(),
  }),
});
