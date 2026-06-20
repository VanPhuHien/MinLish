import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import * as controller from './user.controller.js';

const router = Router();
router.use(protect);
router.get(
  '/me/lessons/:lessonId/segments-progress',
  controller.getLessonSegmentsProgress
);

router.get(
  '/me/lessons/:lessonId/segments/:segmentId/progress',
  controller.getSegmentProgress
);

router.patch(
  '/me/lessons/:lessonId/segments/:segmentId/progress',
  controller.updateSegmentProgress
);
export default router;