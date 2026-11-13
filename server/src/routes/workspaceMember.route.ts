import { Router } from "express";
import { validate } from "../middlewares/validate";
import { addMemberSchema, removeMemberSchema, workspaceIdSchema } from "../validators/workspace.validator";
import { requireWorkspaceRole } from "../middlewares/requireWorkspaceRole";
import { addMemberToWorkspace, addUserIdToParams, removeMemberFromWorkspace } from "../controllers/workspace.controller";
import { authenticate } from "../middlewares/auth";





const router = Router({ mergeParams: true });

router.use(authenticate)

router.route("/").post(
    validate(workspaceIdSchema, 'params'),
    requireWorkspaceRole("OWNER", "ADMIN"),
    validate(addMemberSchema),
    addMemberToWorkspace
)
router.delete(
    "/leave",
    addUserIdToParams,
    validate(removeMemberSchema, "params"),
    removeMemberFromWorkspace
);

router.route("/:memberId").delete(
    validate(removeMemberSchema, 'params'),
    requireWorkspaceRole("OWNER", "ADMIN"),
    removeMemberFromWorkspace

)




export default router;