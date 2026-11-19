import crypto from "node:crypto";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import { hashtoken } from "../utils/token";
import { CreateRoomInput } from "../validators/room.validator";


const INVITE_MS = 24 * 60 * 60 * 1000;

export const createInvite = async (req: Request, res: Response): Promise<void> => {
    const room = res.locals.room as { id: string; workspaceId: string; visibility: string }

    if (room.visibility !== 'WORKSPACE')
        throw new ApiError("Set the room visibility to Workspace before inviting", 400);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_MS);

    await prisma.roomInvite.create({
        data: {
            roomId: room.id,
            tokenHash: hashtoken(token),
            expiresAt,
            createdById: req.user!.id
        }
    })

    const clientUrl = process.env["CLIENT_URL"] ?? "http://localhost:5173"
    res.status(201).json({
        success: true,
        message: "Invite created",
        data: { token, link: `${clientUrl}/join/${token}`, expiresAt }
    })

}


export const joinWithInvite = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body as { token: string };

    const invite = await prisma.roomInvite.findUnique({
        where: { tokenHash: hashtoken(token) },
        include: { room: true },
    })
    if (!invite || invite.expiresAt < new Date()) {
        throw new ApiError("Invite is    invalid or expired", 404)
    }
    await prisma.workspaceMember.upsert({
        where: {
            workspaceId_userId: { workspaceId: invite.room.workspaceId, userId: req.user!.id },

        }, create: {
            workspaceId: invite.room.workspaceId, userId: req.user!.id, role: "MEMBER"
        },
        update: {}
    })
    res.status(200).json({
        success: true,
        message: "Joined successfully",
        data: { workspaceId: invite.room.workspaceId, roomId: invite.room.id },
    });

}


