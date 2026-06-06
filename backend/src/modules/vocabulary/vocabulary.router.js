import { Router } from 'express';
import * as controller from './vocabulary.controller.js';

const router = Router();

router.post("/manual-create", createManualCard);
router.put('/:cardId', updateCard);
router.delete('/:cardId', deleteCard);
router.get("/", getCards);
router.get("/me", getCardsByUserId);

export default router;
