import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import {
    Awareness,
    applyAwarenessUpdate,
    encodeAwarenessUpdate,
    removeAwarenessStates,
} from "y-protocols/awareness";
import { socket } from "../lib/socket";

export type SyncStatus = "connecting" | "synced";
export type Peer = { clientId: number; name: string; color: string; editing: boolean };
type Me = { id: string; name: string };

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#818cf8", "#e879f9"];
const colorFor = (id: string) => {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return COLORS[h % COLORS.length]!;
};

export function useYjsRoom(roomId: string, me: Me) {
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const [awareness, setAwareness] = useState<Awareness | null>(null);
    const [status, setStatus] = useState<SyncStatus>("connecting");
    const [peers, setPeers] = useState<Peer[]>([]);
    const meRef = useRef(me);
    meRef.current = me;

    useEffect(() => {
        const ydoc = new Y.Doc();
        const aw = new Awareness(ydoc);
        aw.setLocalStateField("user", {
            name: meRef.current.name,
            color: colorFor(meRef.current.id),
        });
        aw.setLocalStateField("editing", false);
        setDoc(ydoc);
        setAwareness(aw);
        setStatus("connecting");

        // ---- document updates ----
        const onLocalUpdate = (update: Uint8Array, origin: unknown) => {
            if (origin === "remote") return;
            socket.emit("yjs:update", { roomId, update });
        };
        ydoc.on("update", onLocalUpdate);

        const onRemoteUpdate = (p: { roomId: string; update: Uint8Array }) => {
            if (p.roomId !== roomId) return;
            Y.applyUpdate(ydoc, new Uint8Array(p.update), "remote");
        };
        socket.on("yjs:update", onRemoteUpdate);

        // ---- "I am editing" flag: true while typing, false 1.5s after the last key ----
        let editTimer: ReturnType<typeof setTimeout> | undefined;
        const onTyping = (_u: Uint8Array, origin: unknown) => {
            if (origin === "remote") return;
            if (aw.getLocalState()?.["editing"] !== true) aw.setLocalStateField("editing", true);
            clearTimeout(editTimer);
            editTimer = setTimeout(() => aw.setLocalStateField("editing", false), 1500);
        };
        ydoc.on("update", onTyping);

        // ---- awareness over the socket ----
        const onAwarenessChange = (
            c: { added: number[]; updated: number[]; removed: number[] },
            origin: unknown,
        ) => {
            if (origin === "remote") return;
            socket.emit("yjs:awareness", {
                roomId,
                update: encodeAwarenessUpdate(aw, [...c.added, ...c.updated, ...c.removed]),
            });
        };
        aw.on("update", onAwarenessChange);

        const onRemoteAwareness = (p: { roomId: string; update: Uint8Array }) => {
            if (p.roomId !== roomId) return;
            applyAwarenessUpdate(aw, new Uint8Array(p.update), "remote");
        };
        socket.on("yjs:awareness", onRemoteAwareness);

        // someone new joined: re-announce ourselves
        const onAwarenessRequest = (p: { roomId: string }) => {
            if (p.roomId !== roomId) return;
            socket.emit("yjs:awareness", {
                roomId,
                update: encodeAwarenessUpdate(aw, [ydoc.clientID]),
            });
        };
        socket.on("yjs:awareness:request", onAwarenessRequest);

        // peers list for the UI
        const refreshPeers = () => {
            const list: Peer[] = [];
            aw.getStates().forEach((state, clientId) => {
                if (clientId === ydoc.clientID) return;
                const u = state["user"] as { name: string; color: string } | undefined;
                if (!u) return;
                list.push({ clientId, name: u.name, color: u.color, editing: state["editing"] === true });
            });
            setPeers(list);
        };
        aw.on("change", refreshPeers);

        // ---- initial sync (same as before) ----
        const sync = () => {
            socket.emit(
                "yjs:sync",
                { roomId, stateVector: Y.encodeStateVector(ydoc) },
                (res: { ok: boolean; update?: Uint8Array; stateVector?: Uint8Array }) => {
                    if (!res.ok || !res.update || !res.stateVector) return;
                    Y.applyUpdate(ydoc, new Uint8Array(res.update), "remote");
                    const missing = Y.encodeStateAsUpdate(ydoc, new Uint8Array(res.stateVector));
                    socket.emit("yjs:update", { roomId, update: missing });
                    setStatus("synced");
                    // announce ourselves + ask others to announce themselves
                    onAwarenessRequest({ roomId });
                    socket.emit("yjs:awareness:request", { roomId });
                },
            );
        };

        const onPresence = (p: { roomId: string }) => {
            if (p.roomId === roomId) sync();
        };
        const onConnect = () => socket.once("room:presence", onPresence);
        socket.once("room:presence", onPresence);
        socket.on("connect", onConnect);
        if (socket.connected) sync();

        return () => {
            clearTimeout(editTimer);
            // tell the others we left, so our cursor disappears immediately
            removeAwarenessStates(aw, [ydoc.clientID], "local");
            socket.off("yjs:update", onRemoteUpdate);
            socket.off("yjs:awareness", onRemoteAwareness);
            socket.off("yjs:awareness:request", onAwarenessRequest);
            socket.off("room:presence", onPresence);
            socket.off("connect", onConnect);
            ydoc.off("update", onLocalUpdate);
            ydoc.off("update", onTyping);
            aw.destroy();
            ydoc.destroy();
            setPeers([]);
        };
    }, [roomId]);

    const editors = useCallback(() => peers.filter((p) => p.editing), [peers]);

    return { doc, awareness, status, peers, editors: editors() };
}