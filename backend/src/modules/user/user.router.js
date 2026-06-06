import { Router } from "express";
import * as controller from "./user.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { validateAvatar } from "../../middlewares/fileValidate.middleware.js";
import { putProfileSchema } from "./user.schema.js";

const router = Router();

router.get("/profile/:id", protect, controller.getOtherProfile);
router.get("/profile", protect, controller.getSelfProfile);
router.post(
  "/profile",
  protect,
  validateAvatar,
  validate(putProfileSchema),
  controller.postProfile,
);

export default router;
