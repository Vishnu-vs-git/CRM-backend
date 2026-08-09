import { Router } from "express";
import { leadController } from "../container/di";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { leadQuerySchema } from "../validators/lead-query.schema";

const router = Router();
router.post(
  "/query",
  authMiddleware,
  validate(leadQuerySchema),
  leadController.query.bind(leadController),
);

export default router;
