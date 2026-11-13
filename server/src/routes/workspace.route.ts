
import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
    createWorkspace,
    deleteWorkspace,
    getAllMyWorkspaces,
    getWorkspace,
    updateWorkspace,
} from "../controllers/workspace.controller";
import { validate } from "../middlewares/validate";
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceIdSchema,
} from "../validators/workspace.validator";
import { requireWorkspaceRole } from "../middlewares/requireWorkspaceRole";
import membersRouter from "./workspaceMember.route"

const router = Router();

router.use(authenticate);

router.use("/:workspaceId/members", membersRouter)

router.route("/")
    .post(validate(createWorkspaceSchema), createWorkspace)
    .get(getAllMyWorkspaces);

router.route("/:workspaceId")
    .get(
        validate(workspaceIdSchema, "params"),
        getWorkspace
    )
    .patch(
        validate(workspaceIdSchema, "params"),
        validate(updateWorkspaceSchema),
        requireWorkspaceRole("ADMIN", "OWNER"),
        updateWorkspace
    )
    .delete(
        validate(workspaceIdSchema, "params"),
        requireWorkspaceRole("OWNER"),
        deleteWorkspace
    );

export default router;
