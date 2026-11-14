import { Router } from "express";
import { validate } from "../middlewares/validate";
import { requireRoomAccess } from "../middlewares/requireRoomAccess";
import { roomIdSchema } from "../validators/room.validator";
import { getCode, saveCode } from "../controllers/code.controller";
import { saveCodeSchema } from "../validators/code.validator";
import { authenticate } from "../middlewares/auth";



const router = Router({ mergeParams: true })
router.use(authenticate)
router
    .route("/")
    .get(validate(roomIdSchema, "params"), requireRoomAccess("view"), getCode)
    .put(
        validate(roomIdSchema, "params"),
        requireRoomAccess("view"),
        validate(saveCodeSchema),
        saveCode,
    );


export default router;


