import type { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";

export const requireWorkspaceRole =
    (...allowed: WorkspaceRole[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            const member = await prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId: req.params["workspaceId"] as string,
                        userId: req.user!.id,
                    },
                },
            });

            if (!member || (allowed.length > 0 && !allowed.includes(member.role))) {
                throw new ApiError("Forbidden", 403);
            }

            res.locals.member = member;
            next();
        };









