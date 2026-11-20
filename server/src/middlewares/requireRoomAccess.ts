import type { Request, Response, NextFunction } from "express";
import { assertRoomAccess, type RoomAccessMode } from "../controllers/room.controller";

export const requireRoomAccess = (mode: RoomAccessMode) =>
    async (req: Request, res: Response, next: NextFunction) => {
        res.locals.room = await assertRoomAccess({
            userId: req.user!.id,
            roomId: req.params["roomId"] as string,
            workspaceId: req.params["workspaceId"] as string,
            mode,
        });
        next();
    };