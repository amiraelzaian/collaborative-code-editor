import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

export type PresenceUser = { id: string; name: string };

export function usePresence(workspaceId: string, roomId: string) {
    const [users, setUsers] = useState<PresenceUser[]>([]);

    useEffect(() => {
        const join = () => {
            console.log("[presence] emitting room:join", { workspaceId, roomId });
            socket.emit(
                "room:join",
                { workspaceId, roomId },
                (res: { ok: boolean; error?: string }) => {
                    console.log("[presence] room:join ack:", res);
                },
            );
        };

        const onPresence = (p: { roomId: string; users: PresenceUser[] }) => {
            console.log("[presence] got room:presence", p);
            if (p.roomId === roomId) setUsers(p.users);
        };

        socket.on("room:presence", onPresence);
        socket.on("connect", join);
        if (socket.connected) join();

        return () => {
            socket.off("room:presence", onPresence);
            socket.off("connect", join);
            socket.emit("room:leave", { roomId });
        };
    }, [workspaceId, roomId]);

    return users;
}