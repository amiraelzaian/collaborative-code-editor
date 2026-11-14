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

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(validate(workspaceIdSchema, "params"));
router
    .route("/")
    .post(requireWorkspaceRole(), validate(createRoomSchema), createRoom)
    .get(requireWorkspaceRole(), getWorkspaceRooms);

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

export default router;