import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as api from "../api/invite.api";
import { getErrorMessage } from "../lib/errors";
import { workspaceKeys } from "./useWorkspace";
import { roomKeys } from "./useRooms";

export const useCreateInvite = () =>
    useMutation({
        mutationFn: api.createInvite,
        onError: (e) => toast.error(getErrorMessage(e))
    })


export const useJoinRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.joinRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: roomKeys.all });
            toast.success("Joined successfully");
        },
        onError: (e) => toast.error(getErrorMessage(e))
    })
}