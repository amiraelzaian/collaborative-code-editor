import { Router } from "express";
import { joinWithInvite } from "../controllers/invite.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { joinInviteSchema } from "../validators/invite.validator";

const router = Router();

router.post("/join", authenticate, validate(joinInviteSchema), joinWithInvite);

export default router;