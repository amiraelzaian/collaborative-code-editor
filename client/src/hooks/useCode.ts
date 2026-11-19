import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as api from "../api/code.api";
import { getErrorMessage } from "../lib/errors";
import { roomKeys } from "./useRooms";

export const codeKey = (workspaceId: string, roomId: string) =>
    [...roomKeys.one(workspaceId, roomId), 'code'] as const

export const useRoomCode = (workspaceId: string, roomId: string) =>
    useQuery({
        queryKey: codeKey(workspaceId, roomId),
        queryFn: () => api.getCode({ workspaceId, roomId }),
        enabled: !!workspaceId && !!roomId,
        staleTime: Infinity,
    })

export const useSaveCode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.saveCode,
        onSuccess: (result, variables) => {
            queryClient.setQueryData(
                codeKey(variables.workspaceId, variables.roomId), { content: variables.content, ...result },
            )
            toast.success("Saved")
        },
        onError: (e) => toast.error(getErrorMessage(e))
    })
}

