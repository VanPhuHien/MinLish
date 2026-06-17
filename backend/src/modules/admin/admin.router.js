import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import * as adminController from './admin.controller.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));
router.get('/tags', adminController.listTags);
router.post('/tags', adminController.createTag);
router.get('/tags/:id', adminController.getTagById);
router.put('/tags/:id', adminController.updateTag);
router.delete('/tags/:id', adminController.deleteTag);

export default router;
