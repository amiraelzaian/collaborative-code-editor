import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";

export const requireRoomAccess = (mode: "view" | "manage") =>
    async (req: Request, res: Response, next: NextFunction) => {
        const room = await prisma.room.findUnique({
            where: { id: req.params['roomId'] as string }
        })
        if (!room) throw new ApiError("Room not found", 404);
        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: { workspaceId: room.workspaceId, userId: req.user!.id }
            }
        })
        if (!member) throw new ApiError("Room not found", 404);

        const isManager = member.role === "ADMIN" || member.role === 'OWNER';
        const isCreator = room.createdById === req.user!.id;
        const urlWorkspaceId = req.params["workspaceId"];

        if (urlWorkspaceId && room.workspaceId !== urlWorkspaceId) {
            throw new ApiError("Room not found", 404);
        }
        if (mode === 'view' && room.visibility === 'PRIVATE' && !isManager && !isCreator) {
            throw new ApiError("Room is not found", 404)
        }
        if (mode === "manage" && !isManager && !isCreator) {
            throw new ApiError("Forbidden", 403);
        }

        res.locals.room = room;
        next();

    }

