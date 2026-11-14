import { Router } from "express";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import { requireWorkspaceRole } from "../middlewares/requireWorkspaceRole";
import { requireRoomAccess } from "../middlewares/requireRoomAccess";
import { workspaceIdSchema } from "../validators/workspace.validator";
import {
    createRoomSchema,
    roomIdSchema,
    updateRoomSchema,
} from "../validators/room.validator";
import {
    createRoom,
    deleteRoom,
    getWorkspaceRoom,
    getWorkspaceRooms,
    updateRoom,
} from "../controllers/room.controller";
import { createInvite } from "../controllers/invite.controller";
import codeRouter from "./code.route"
import { listRoomsQuerySchema } from "../validators/query.validator";
const router = Router({ mergeParams: true });
router.use("/:roomId/code", codeRouter)


router.use(authenticate);
router.use(validate(workspaceIdSchema, "params"));
router
    .route("/")
    .post(requireWorkspaceRole(), validate(createRoomSchema), createRoom)
    .get(requireWorkspaceRole(), validate(listRoomsQuerySchema, 'query'), getWorkspaceRooms);

router
    .route("/:roomId")
    .get(validate(roomIdSchema, "params"), requireRoomAccess("view"), getWorkspaceRoom)
    .patch(
        validate(roomIdSchema, "params"),
        requireRoomAccess("manage"),
        validate(updateRoomSchema),
        updateRoom,
    )
    .delete(validate(roomIdSchema, "params"), requireRoomAccess("manage"), deleteRoom);

router.post(
    "/:roomId/invites",
    validate(roomIdSchema, "params"),
    requireRoomAccess("manage"),
    createInvite,
);

export default router;