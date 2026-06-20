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
  body: z.object({
    dictation: z.object({
      attemptCount: z.coerce.number().int().min(1),
      hintUsedCount: z.coerce.number().int().min(0),
    }).optional(),
    shadowing: z.object({
      attemptCount: z.coerce.number().int().min(1),
      latestAudioUrl: z.string().min(1),
    }).optional(),
  }).refine((data) => data.dictation !== undefined || data.shadowing !== undefined, {
    message: "Ít nhất phải có dictation hoặc shadowing",
  }),
});
