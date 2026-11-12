import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../generated/prisma/enums";
import { ApiError } from "../utils/apiError";
import { verifyAccessToken } from "../utils/token";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            role: UserRole;
        };
    }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        throw new ApiError("Authentication required", 401);
    }

    try {
        const payload = verifyAccessToken(header.slice(7));
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        throw new ApiError("Invalid or expired access token", 401);
    }
};

export const authorize =
    (...roles: UserRole[]) =>
        (req: Request, _res: Response, next: NextFunction): void => {
            if (!req.user || !roles.includes(req.user.role)) {
                throw new ApiError("You don't have this permission", 403);
            }
            next();
        };