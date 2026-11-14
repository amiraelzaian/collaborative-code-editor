import type { Request, Response } from "express";
import type { WorkspaceRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import type { CreateRoomInput, UpdateRoomInput } from "../validators/room.validator";

export const createRoom = async (req: Request, res: Response): Promise<void> => {
    const workspaceId = req.params["workspaceId"] as string;
    const { name, language, visibility } = req.body as CreateRoomInput;

    const existing = await prisma.room.findFirst({ where: { workspaceId, name } });
    if (existing) {
        throw new ApiError("A room with this name already exists in this workspace", 409);
    }

    const room = await prisma.room.create({
        data: { workspaceId, name, language, visibility, createdById: req.user!.id },
    });

    res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: room,
    });
};

export const getWorkspaceRooms = async (req: Request, res: Response): Promise<void> => {
    const workspaceId = req.params["workspaceId"] as string;
    const member = res.locals.member as { role: WorkspaceRole };
    const isManager = member.role === "OWNER" || member.role === "ADMIN";

    const rooms = await prisma.room.findMany({
        where: {
            workspaceId,
            // regular members see WORKSPACE rooms plus the ones they created
            ...(isManager
                ? {}
                : { OR: [{ visibility: "WORKSPACE" as const }, { createdById: req.user!.id }] }),
        },
        orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
        success: true,
        message: "Rooms fetched successfully",
        count: rooms.length,
        data: rooms,
    });
};

// access already checked by requireRoomAccess("view")
export const getWorkspaceRoom = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
        success: true,
        message: "Room fetched successfully",
        data: res.locals.room,
    });
};

// access already checked by requireRoomAccess("manage")
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
    const roomId = req.params["roomId"] as string;
    const { name, language, visibility } = req.body as UpdateRoomInput;

    const room = await prisma.room.update({
        where: { id: roomId },
        data: { name, language, visibility },
    });

    res.status(200).json({
        success: true,
        message: "Room updated successfully",
        data: room,
    });
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
    await prisma.room.delete({ where: { id: req.params["roomId"] as string } });
    res.status(204).send();
};