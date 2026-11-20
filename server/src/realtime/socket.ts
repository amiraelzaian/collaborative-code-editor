import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/token";
import { prisma } from "../lib/prisma";
import { assertRoomAccess } from "../controllers/room.controller"
import { ApiError } from "../utils/apiError";

export function initSocket(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env["CLIENT_URL"] ?? "http://localhost:5173",
            credentials: true,
        },
    });

    // who is online in a room (one line per person, not per tab)
    const broadcastPresence = async (roomId: string) => {
        const sockets = await io.in(roomId).fetchSockets();
        const seen = new Set<string>();
        const users: { id: string; name: string }[] = [];
        for (const s of sockets) {
            const user = s.data.user as { id: string; name: string };
            if (seen.has(user.id)) continue;
            seen.add(user.id);
            users.push({ id: user.id, name: user.name });
        }
        io.to(roomId).emit("room:presence", { roomId, users });
    };

    // runs ONCE per connection attempt, before "connection" fires
    io.use(async (socket, next) => {
        const token = socket.handshake.auth["token"];
        if (typeof token !== "string") {
            return next(new Error("Authentication required"));
        }

        try {
            const payload = verifyAccessToken(token);
            const dbUser = await prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, name: true },
            });
            if (!dbUser) return next(new Error("Invalid or expired token"));

            socket.data.user = { id: dbUser.id, name: dbUser.name, role: payload.role };
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`[socket] connected ${socket.id} (user ${socket.data.user.id})`);

        socket.on("room:join", async (payload, ack) => {
            const reply = typeof ack === "function" ? ack : () => { };

            if (
                typeof payload?.workspaceId !== "string" ||
                typeof payload?.roomId !== "string"
            ) {
                return reply({ ok: false, error: "Invalid payload" });
            }

            try {
                await assertRoomAccess({
                    userId: socket.data.user.id,
                    roomId: payload.roomId,
                    workspaceId: payload.workspaceId,
                    mode: "view",
                });
            } catch (err) {
                const message = err instanceof ApiError ? err.message : "Server error";
                return reply({ ok: false, error: message });
            }

            await socket.join(payload.roomId);
            reply({ ok: true });
            await broadcastPresence(payload.roomId);
        });

        socket.on("room:leave", async (payload) => {
            if (typeof payload?.roomId !== "string") return;
            await socket.leave(payload.roomId);
            await broadcastPresence(payload.roomId);
        });

        socket.on("disconnecting", () => {
            for (const roomId of socket.rooms) {
                if (roomId !== socket.id) {
                    setImmediate(() => void broadcastPresence(roomId));
                }
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`[socket] disconnected ${socket.id}: ${reason}`);
        });
    });

    return io;
}