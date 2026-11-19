import { api } from "./client";

export type RoomCodeParams = {
    workspaceId: string;
    roomId: string;
};

export type SaveCodeParams = RoomCodeParams & { content: string };

export type SaveCodeResult = {
    version: number;
    updatedAt: string;
};

export type RoomCode = {
    content: string;
    version: number;
    updatedAt: string | null;
};

const codeUrl = ({ workspaceId, roomId }: RoomCodeParams) =>
    `/workspaces/${workspaceId}/rooms/${roomId}/code`;

export const getCode = async (params: RoomCodeParams) =>
    (await api.get<{ data: RoomCode }>(codeUrl(params))).data.data;

export const saveCode = async ({ content, ...params }: SaveCodeParams) =>
    (await api.put<{ data: SaveCodeResult }>(codeUrl(params), { content })).data.data;