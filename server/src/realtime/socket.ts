import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import * as Y from "yjs";
import { verifyAccessToken } from "../utils/token";
import { prisma } from "../lib/prisma";
import { assertRoomAccess } from "../controllers/room.controller";
import { ApiError } from "../utils/apiError";
import { acquireDoc, getDoc, releaseDoc } from "./yjsRooms";

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
        } catch (err) {
            console.error("[socket] auth failed:", err);
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`[socket] connected ${socket.id} (user ${socket.data.user.id})`);

        // rooms whose Y.Doc this socket holds a reference to
        socket.data.docRooms = new Set<string>();

        const leaveDoc = (roomId: string) => {
            if (socket.data.docRooms.delete(roomId)) {
                void releaseDoc(roomId).catch((err) => console.error("[yjs] release failed:", err));
            }
        };

        socket.on("room:join", async (payload, ack) => {
            const reply = typeof ack === "function" ? ack : () => { };

            if (
                typeof payload?.workspaceId !== "string" ||
                typeof payload?.roomId !== "string"
            ) {
                return reply({ ok: false, error: "Invalid payload" });
            }
            const roomId: string = payload.roomId;

            try {
                await assertRoomAccess({
                    userId: socket.data.user.id,
                    roomId,
                    workspaceId: payload.workspaceId,
                    mode: "view",
                });
            } catch (err) {
                const message = err instanceof ApiError ? err.message : "Server error";
                return reply({ ok: false, error: message });
            }

            if (!socket.data.docRooms.has(roomId)) {
                try {
                    await acquireDoc(roomId);
                } catch (err) {
                    console.error("[yjs] load failed:", err);
                    return reply({ ok: false, error: "Could not load document" });
                }
                if (socket.disconnected) {
                    void releaseDoc(roomId).catch(console.error);
                    return;
                }
                socket.data.docRooms.add(roomId);
            }

            await socket.join(roomId);
            reply({ ok: true });
            await broadcastPresence(roomId);
        });

        socket.on("room:leave", async (payload) => {
            if (typeof payload?.roomId !== "string") return;
            leaveDoc(payload.roomId);
            await socket.leave(payload.roomId);
            await broadcastPresence(payload.roomId);
        });

        // client sends its state vector, server answers with what the client is missing
        socket.on("yjs:sync", async (payload, ack) => {
            const reply = typeof ack === "function" ? ack : () => { };
            if (
                typeof payload?.roomId !== "string" ||
                !(payload.stateVector instanceof Uint8Array)
            ) {
                return reply({ ok: false, error: "Invalid payload" });
            }
            if (!socket.data.docRooms.has(payload.roomId)) {
                return reply({ ok: false, error: "Join the room first" });
            }
            const doc = await getDoc(payload.roomId);
            if (!doc) return reply({ ok: false, error: "Document not loaded" });

            try {
                reply({
                    ok: true,
                    update: Y.encodeStateAsUpdate(doc, payload.stateVector),
                    stateVector: Y.encodeStateVector(doc),
                });
            } catch {
                reply({ ok: false, error: "Invalid state vector" });
            }
        });

        // live edit: apply to the server copy, forward to everyone else
        socket.on("yjs:update", async (payload) => {
            if (
                typeof payload?.roomId !== "string" ||
                !(payload.update instanceof Uint8Array)
            ) {
                return;
            }
            if (!socket.data.docRooms.has(payload.roomId)) return;
            const doc = await getDoc(payload.roomId);
            if (!doc) return;

            try {
                Y.applyUpdate(doc, payload.update, socket.id);
            } catch {
                return; // malformed update
            }
            socket.to(payload.roomId).emit("yjs:update", {
                roomId: payload.roomId,
                update: payload.update,
            });
        });

        // awareness = temporary info (cursor, name, color). Relayed only, never saved.
        socket.on("yjs:awareness", (payload) => {
            if (
                typeof payload?.roomId !== "string" ||
                !(payload.update instanceof Uint8Array)
            ) {
                return;
            }
            if (!socket.data.docRooms.has(payload.roomId)) return;
            socket.to(payload.roomId).emit("yjs:awareness", {
                roomId: payload.roomId,
                update: payload.update,
            });
        });

        // a newcomer asks everyone to re-announce themselves
        socket.on("yjs:awareness:request", (payload) => {
            if (typeof payload?.roomId !== "string") return;
            if (!socket.data.docRooms.has(payload.roomId)) return;
            socket.to(payload.roomId).emit("yjs:awareness:request", { roomId: payload.roomId });
        });

        socket.on("disconnecting", () => {
            for (const roomId of [...socket.data.docRooms]) leaveDoc(roomId);
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