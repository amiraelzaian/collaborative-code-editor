import { api } from "./client";

export type CreateInviteParams = {
    workspaceId: string;
    roomId: string;
};

export type RoomInvite = {
    token: string;
    link: string; // http://localhost:5173/join/token/
    expiresAt: string;
};

export type JoinResult = {
    workspaceId: string;
    roomId: string;
};

export const createInvite = async ({ workspaceId, roomId }: CreateInviteParams) =>
    (await api.post<{ data: RoomInvite }>(`/workspaces/${workspaceId}/rooms/${roomId}/invites`)).data
        .data;

export const joinRoom = async (token: string) =>
    (await api.post<{ data: JoinResult }>("/invites/join", { token })).data.data;