import "dotenv/config";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { UserRole } from "../generated/prisma/enums";

export interface AccessPayload {
    sub: string;
    role: UserRole;
}

const accessSecret = process.env["JWT_ACCESS_SECRET"]!;
const refreshSecret = process.env["JWT_REFRESH_SECRET"]!;

export const signAccessToken = (payload: AccessPayload): string =>
    jwt.sign(payload, accessSecret, { expiresIn: 15 * 60 }); // 15 minutes

export const verifyAccessToken = (token: string): AccessPayload =>
    jwt.verify(token, accessSecret) as unknown as AccessPayload;

export const signRefreshToken = (userId: string): string =>
    jwt.sign({ sub: userId, jti: crypto.randomUUID() }, refreshSecret, {
        expiresIn: 7 * 24 * 60 * 60,
    });

export const verifyRefreshToken = (token: string): { sub: string } =>
    jwt.verify(token, refreshSecret) as unknown as { sub: string };


export const hashtoken = (token: string): string =>
    crypto.createHash("sha256").update(token).digest("hex");