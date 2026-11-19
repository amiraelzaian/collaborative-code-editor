import type { Paginated } from "../types/api";
import type { CreateRoomInput, Room, RoomListParams, UpdateRoomInput } from "../types/room";
import { api } from "./client";

const base = (workspaceId: string) => `/workspaces/${workspaceId}/rooms`;

export const createRoom = async (workspaceId: string, payload: CreateRoomInput) =>
    (await api.post<{ data: Room }>(base(workspaceId), payload)).data.data;

export const getWorkspaceRooms = async (workspaceId: string, params: RoomListParams) =>
    (await api.get<Paginated<Room>>(base(workspaceId), { params })).data;

export const getWorkspaceRoom = async (workspaceId: string, roomId: string) =>
    (await api.get<{ data: Room }>(`${base(workspaceId)}/${roomId}`)).data.data;

export const updateWorkspaceRoom = async (
    workspaceId: string,
    roomId: string,
    payload: UpdateRoomInput,
) => (await api.patch<{ data: Room }>(`${base(workspaceId)}/${roomId}`, payload)).data.data;

export const deleteWorkspaceRoom = async (workspaceId: string, roomId: string): Promise<void> => {
    await api.delete(`${base(workspaceId)}/${roomId}`);
};