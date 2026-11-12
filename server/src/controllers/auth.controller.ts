import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import {
    hashtoken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../utils/token";
import type { LoginInput, RegisterInput } from "../validators/auth.validator";

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict" as const,
    maxAge: REFRESH_MS,
    path: "/api/v1/auth",
};

// removes the password hash before sending a user to the client
const toSafeUser = <T extends { password: string }>(user: T) => {
    const { password: _omit, ...safeUser } = user;
    return safeUser;
};

const issueTokens = async (userId: string, role: UserRole, res: Response) => {
    const accessToken = signAccessToken({ sub: userId, role });
    const refreshToken = signRefreshToken(userId);

    await prisma.refreshToken.create({
        data: {
            tokenHash: hashtoken(refreshToken),
            userId,
            expiresAt: new Date(Date.now() + REFRESH_MS),
        },
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);
    return accessToken;
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, name, password } = req.body as RegisterInput;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError("User already exists", 409);

    // role is NOT taken from the request, it always starts as USER
    const newUser = await prisma.user.create({
        data: { name, email, password: await bcrypt.hash(password, 10) },
    });

    const accessToken = await issueTokens(newUser.id, newUser.role, res);

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        accessToken,
        data: toSafeUser(newUser),
    });
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && (await bcrypt.compare(password, user.password));
    if (!user || !valid) throw new ApiError("Invalid email or password", 401);

    const accessToken = await issueTokens(user.id, user.role, res);

    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        accessToken,
        data: toSafeUser(user),
    });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.["refreshToken"] as string | undefined;
    if (token) {
        await prisma.refreshToken.deleteMany({ where: { tokenHash: hashtoken(token) } });
    }
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.status(204).send();
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError("User not found, please login again", 401);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError("User not found, please login again", 401);

    res.status(200).json({
        success: true,
        message: "User loaded successfully",
        data: toSafeUser(user),
    });
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.["refreshToken"] as string | undefined;
    if (!token) throw new ApiError("Refresh token not found, please login again", 401);

    let userId: string;
    try {
        userId = verifyRefreshToken(token).sub;
    } catch {
        throw new ApiError("Invalid or expired refresh token, please login again", 401);
    }

    const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash: hashtoken(token) },
        include: { user: true }, // needed to read the current role
    });
    if (!stored || stored.expiresAt < new Date()) {
        throw new ApiError("Invalid or expired refresh token", 401);
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const accessToken = await issueTokens(userId, stored.user.role, res);

    res.status(200).json({ success: true, accessToken });
};