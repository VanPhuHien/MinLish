import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import * as adminController from './admin.controller.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));
router.get('/cefr-levels', adminController.listCefrLevels);
router.post('/cefr-levels', adminController.createCefrLevel);
router.get('/cefr-levels/:id', adminController.getCefrLevelById);
router.put('/cefr-levels/:id', adminController.updateCefrLevel);
router.delete('/cefr-levels/:id', adminController.deleteCefrLevel);

export default router;
