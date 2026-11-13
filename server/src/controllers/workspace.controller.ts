import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import type {
    AddMemberInput,
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
} from "../validators/workspace.validator";
import { success } from "zod";

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.user!.id;
    const { name } = req.body as CreateWorkspaceInput;

    const exists = await prisma.workspace.findFirst({ where: { ownerId, name } });
    if (exists) throw new ApiError("You already have a workspace with this name", 409);

    // workspace + owner membership are created together, or neither
    const workspace = await prisma.workspace.create({
        data: {
            name,
            ownerId,
            workspaceMembers: { create: { userId: ownerId, role: "OWNER" } },
        },
    });

    res.status(201).json({
        success: true,
        message: "Workspace created successfully",
        data: workspace,
    });
};

// any member (checked by requireWorkspaceRole in the route)
export const getWorkspace = async (req: Request, res: Response): Promise<void> => {
    const workspaceId = req.params["workspaceId"] as string;

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            workspaceMembers: {
                include: { user: { select: { id: true, name: true, email: true } } },
            },
        },
    });
    if (!workspace) throw new ApiError("Workspace not found", 404);

    res.status(200).json({
        success: true,
        message: "Workspace fetched successfully",
        data: workspace,
    });
};

// every workspace I belong to (owned or joined)
export const getAllMyWorkspaces = async (req: Request, res: Response): Promise<void> => {
    const memberships = await prisma.workspaceMember.findMany({
        where: { userId: req.user!.id },
        include: { workspace: true },
        orderBy: { joinedAt: "desc" },
    });

    const workspaces = memberships.map((m) => ({ ...m.workspace, myRole: m.role }));

    res.status(200).json({
        success: true,
        message: "Workspaces fetched successfully",
        count: workspaces.length,
        data: workspaces,
    });
};

// OWNER or ADMIN (checked in the route)
export const updateWorkspace = async (req: Request, res: Response): Promise<void> => {
    const workspaceId = req.params["workspaceId"] as string;
    const { name } = req.body as UpdateWorkspaceInput;

    const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { name },
    });

    res.status(200).json({
        success: true,
        message: "Workspace updated successfully",
        data: workspace,
    });
};

// OWNER only (checked in the route)
export const deleteWorkspace = async (req: Request, res: Response): Promise<void> => {
    await prisma.workspace.delete({
        where: { id: req.params["workspaceId"] as string },
    });
    res.status(204).send();
};

// Owner  or admin
export const addMemberToWorkspace = async (req: Request, res: Response): Promise<void> => {

    const workspaceId = req.params['workspaceId'] as string;
    const { email, role } = req.body as AddMemberInput;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError("No user with this email", 404);
    console.log(user)
    const existing = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: { workspaceId, userId: user.id }
        }
    })
    if (existing)
        throw new ApiError("User is already a member", 409);
    console.log('exist', existing)
    console.log(workspaceId, user.id, role)
    const member = await prisma.workspaceMember.create({
        data: { workspaceId, userId: user.id, role },
        include: { user: { select: { id: true, name: true, email: true } } }
    }

    )
    console.log('member', member)
    res.status(201).json({
        success: true,
        message: "Member added successfully",
        data: member
    })


};