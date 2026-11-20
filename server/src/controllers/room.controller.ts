import type { Request, Response } from "express";
import type { WorkspaceRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import type { CreateRoomInput, UpdateRoomInput } from "../validators/room.validator";
import { ListRoomsQuery } from "../validators/query.validator";
import { getPagination, paginationMeta } from "../utils/pagination";


export type RoomAccessMode = 'view' | "manage";

interface RoomAccessParams {
    userId: string;
    roomId: string;
    workspaceId?: string | undefined;
    mode: RoomAccessMode;
}
export async function assertRoomAccess({ userId, roomId, workspaceId, mode }: RoomAccessParams) {
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) throw new ApiError("Room not found", 404);

    if (workspaceId && room.workspaceId !== workspaceId) {
        throw new ApiError("Room not found", 404)
    }

    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: room.workspaceId, userId } }
    })
    if (!member) throw new ApiError("Room not found", 404)

    const isManger = member.role === "ADMIN" || member.role === 'OWNER';
    const isCreator = room.createdById === userId;

    if (mode === 'view' && room.visibility === 'PRIVATE' && !isManger && !isCreator) {
        throw new ApiError("Room not found", 404)
    }
    if (mode === 'manage' && !isManger && !isCreator) {
        throw new ApiError("Forbidden", 403)
    }
    return room
}


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
    const { page, limit, search, language, visibility, mine, sort } = res.locals.query as ListRoomsQuery;
    const isManager = member.role === "OWNER" || member.role === "ADMIN";
    const userId = req.user!.id;

    const where = {
        workspaceId,
        AND: [
            ...(isManager ? [] : [
                { OR: [{ visibility: "WORKSPACE" as const }, { createdById: userId }] }
            ]),
            ...(search ? [{ name: { contains: search, mode: "insensitive" as const } }] : []),
            ...(language ? [{ language }] : []),
            ...(visibility ? [{ visibility }] : []),
            ...(mine === 'true' ? [{ createdById: userId }] : [])
        ],
    };

    const orderBy =
        sort === 'name' ? { name: 'asc' as const }
            : { createdAt: sort === 'oldest' ? ('asc' as const) : ("desc" as const) }

    const [rooms, total] = await prisma.$transaction([
        prisma.room.findMany({ where, orderBy, ...getPagination(page, limit) }),
        prisma.room.count({ where })
    ])

    res.status(200).json({
        success: true,
        message: "Rooms fetched successfully",
        data: rooms,
        paginatin: paginationMeta(total, page, limit)
    })

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