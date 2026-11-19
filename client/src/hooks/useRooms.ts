import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as api from "../api/room.api";
import { getErrorMessage } from "../lib/errors";
import type { CreateRoomInput, RoomListParams, UpdateRoomInput } from "../types/room";

export const roomKeys = {
    all: ["rooms"] as const,
    workspace: (workspaceId: string) => [...roomKeys.all, workspaceId] as const,
    lists: (workspaceId: string) => [...roomKeys.workspace(workspaceId), "list"] as const,
    list: (workspaceId: string, params: RoomListParams) =>
        [...roomKeys.lists(workspaceId), params] as const,
    details: (workspaceId: string) => [...roomKeys.workspace(workspaceId), "detail"] as const,
    one: (workspaceId: string, roomId: string) =>
        [...roomKeys.details(workspaceId), roomId] as const,
};

export const useWorkspaceRooms = (workspaceId: string, params: RoomListParams) =>
    useQuery({
        queryKey: roomKeys.list(workspaceId, params),
        queryFn: () => api.getWorkspaceRooms(workspaceId, params),
        enabled: !!workspaceId,
        placeholderData: keepPreviousData,
    });

export const useWorkspaceRoom = (workspaceId: string, roomId: string) =>
    useQuery({
        queryKey: roomKeys.one(workspaceId, roomId),
        queryFn: () => api.getWorkspaceRoom(workspaceId, roomId),
        enabled: !!workspaceId && !!roomId,
    });

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateRoomInput }) =>
            api.createRoom(workspaceId, data),
        onSuccess: (_room, variables) => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists(variables.workspaceId) });
            toast.success("Room created successfully");
        },
        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            workspaceId,
            roomId,
            data,
        }: {
            workspaceId: string;
            roomId: string;
            data: UpdateRoomInput;
        }) => api.updateWorkspaceRoom(workspaceId, roomId, data),
        onSuccess: (_room, variables) => {
            queryClient.invalidateQueries({ queryKey: roomKeys.workspace(variables.workspaceId) });
            toast.success("Room updated successfully");
        },
        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ workspaceId, roomId }: { workspaceId: string; roomId: string }) =>
            api.deleteWorkspaceRoom(workspaceId, roomId),
        onSuccess: (_, variables) => {
            queryClient.removeQueries({ queryKey: roomKeys.one(variables.workspaceId, variables.roomId) });
            queryClient.invalidateQueries({ queryKey: roomKeys.lists(variables.workspaceId) });
            toast.success("Room deleted");
        },
        onError: (e) => toast.error(getErrorMessage(e)),
    });
};