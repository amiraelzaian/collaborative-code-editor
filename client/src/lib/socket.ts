import { io, type Socket } from "socket.io-client";
import { getAccessToken, refreshSession, setAccessToken } from "../api/client";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
const SOCKET_URL = new URL(apiUrl).origin;

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => cb({ token: getAccessToken() })
})

//if the token expired while we were offline, refresh once and retry
socket.on("connect_error", async (e) => {
    if (e.message === 'Invalid or expired token') {
        try {
            setAccessToken(await refreshSession());
            socket.connect();
        } catch {
            window.dispatchEvent(new Event("auth:logout"))
        }
    }
})

export const connectSocket = () => {
    const token = getAccessToken();
    console.log("[socket] connectSocket called, token?", !!token, "connected?", socket.connected);
    if (!socket.connected && token) socket.connect();
};
socket.on("connect", () => console.log("[socket] connected", socket.id));
socket.on("connect_error", (e) => console.log("[socket] connect_error:", e.message));


export const disconnectSocket = () => {
    socket.disconnect();
}
