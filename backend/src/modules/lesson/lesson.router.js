import { Router } from 'express';
import * as controller from './lesson.controller.js';
import { protectOptional } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', protectOptional, controller.listLessons);
router.get('/:lessonId', protectOptional, controller.getLessonById);
router.get('/:lessonId/segments', protectOptional, controller.getSegments);

export default router;
