import { Router } from "express";
import { validate } from "../middlewares/validate";
import { addMemberSchema, workspaceIdSchema } from "../validators/workspace.validator";
import { requireWorkspaceRole } from "../middlewares/requireWorkspaceRole";
import { addMemberToWorkspace } from "../controllers/workspace.controller";
import { authenticate } from "../middlewares/auth";





const router = Router({ mergeParams: true });

router.use(authenticate)

router.route("/").post(
    validate(workspaceIdSchema, 'params'),
    requireWorkspaceRole("OWNER", "ADMIN"),
    validate(addMemberSchema),
    addMemberToWorkspace
)




export default router;