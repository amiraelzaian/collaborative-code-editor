import type { Request, Response } from "express";
import type { WorkspaceRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import { SaveCodeInput } from "../validators/code.validator";


export const getCode = async (req: Request, res: Response): Promise<void> => {
    const roomId = req.params['roomId'] as string;

    const snapshot = await prisma.documentSnapshot.findUnique({ where: { roomId } });

    res.status(200).json({
        success: true,
        message: "Code fetched successfully",
        data: {
            content: snapshot ? new TextDecoder().decode(snapshot.state) : "",
            version: snapshot?.version ?? 0,
            updatedAt: snapshot?.updatedAt ?? null

        }

    })

}
export const saveCode = async (req: Request, res: Response): Promise<void> => {

    const { content } = req.body as SaveCodeInput;
    const roomId = req.params['roomId'] as string;
    // convert string into bytes
    const state = new TextEncoder().encode(content)
    const snapshot = await prisma.documentSnapshot.upsert({
        where: {
            roomId
        },
        create: { roomId, state },
        update: { state, version: { increment: 1 } },
        select: { version: true, updatedAt: true }// never send bytes back just version&updatedAt
    })
    res.status(200).json({
        success: true,
        message: "Code saved successfully",
        data: snapshot
    })
}




