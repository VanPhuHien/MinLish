import { Router } from 'express';
import * as controller from './userDeck.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', protect, controller.listMyDecks);
router.post('/', protect, controller.createDeck);
router.get('/:deckId', protect, controller.getMyDeckById);
router.put('/:deckId', protect, controller.updateMyDeck);
router.delete('/:deckId', protect, controller.deleteMyDeck);

// Topics
router.get('/:deckId/topics', protect, controller.getMyDeckTopics);
router.post('/:deckId/topics', protect, controller.createMyDeckTopic);
router.get('/:deckId/topics/:topicId', protect, controller.getMyDeckTopic);
router.put('/:deckId/topics/:topicId', protect, controller.updateMyDeckTopic);
router.delete(
  '/:deckId/topics/:topicId',
  protect,
  controller.deleteMyDeckTopic
);

// Cards
router.get('/:deckId/cards', protect, controller.listMyDeckCards);
router.post('/:deckId/cards', protect, controller.createMyDeckCard);

export default router;
