import { Router } from 'express';
import * as controller from './vocabulary.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/search', protect, controller.searchVocabulary);
router.post('/manual-create', controller.createManualCard);
router.put('/:cardId', controller.updateCard);
router.delete('/:cardId', controller.deleteCard);
router.get('/me', controller.getCardsByUserId);

export default router;
