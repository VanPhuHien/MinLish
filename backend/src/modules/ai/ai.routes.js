import { Router } from 'express';
import { responseQuestion } from './ai.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(protect);
router.post('/response', responseQuestion);

export default router;
