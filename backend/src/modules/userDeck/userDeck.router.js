import { Router } from 'express';
import * as controller from './userDeck.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', protect, controller.listMyDecks);
router.post('/', protect, controller.createDeck);
router.get('/:deckId', protect, controller.getMyDeckById);
router.put('/:deckId', protect, controller.updateMyDeck);

export default router;
