import { Router } from "express";
import { LeadController } from "../controllers/lead.controller";
import { validate } from "../middlewares/validate.middleware";
import { leadQuerySchema } from "../validators/lead-query.schema";

const router = Router();

const leadController = new LeadController();

router.post(
  "/query",
  validate(leadQuerySchema),
  leadController.query.bind(leadController),
);

export default router;
