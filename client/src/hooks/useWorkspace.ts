import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/workspace.api";
import type { WorkspaceListParams } from "../types/workspace";
import toast from "react-hot-toast";
import { getErrorMessage } from "../lib/errors";


export const workspaceKeys = {
    all: ["workspaces"] as const,

    lists: () => [...workspaceKeys.all, "list"] as const,

    list: (params: WorkspaceListParams) =>
        [...workspaceKeys.lists(), params] as const,

    details: () => [...workspaceKeys.all, "detail"] as const,

    one: (workspaceId: string) =>
        [...workspaceKeys.details(), workspaceId] as const,

    members: (workspaceId: string) =>
        [...workspaceKeys.one(workspaceId), "members"] as const,

    memberList: (
        workspaceId: string,
        params: WorkspaceListParams
    ) => [...workspaceKeys.members(workspaceId), params] as const,
};


export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.createWorkspace,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.all,
            });

            toast.success("Workspace created");
        },

        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useWorkspaces = (params: WorkspaceListParams) => {
    return useQuery({
        queryKey: workspaceKeys.list(params),
        queryFn: () => api.listWorkspaces(params),
        placeholderData: keepPreviousData,
    });
};

export const useWorkspace = (workspaceId: string) => {
    return useQuery({
        queryKey: workspaceKeys.one(workspaceId),
        queryFn: () => api.getWorkspace(workspaceId),
        enabled: !!workspaceId,
    });
};

export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workspaceId,
            name,
        }: {
            workspaceId: string;
            name: string;
        }) => api.updateWorkspaceName(workspaceId, name),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.one(variables.workspaceId),
            });

            queryClient.invalidateQueries({
                queryKey: workspaceKeys.all,
            });

            toast.success("Workspace updated successfully");
        },

        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.deleteWorkspace,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.all,
            });

            toast.success("Workspace deleted");
        },

        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useAddMemberToWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workspaceId,
            email,
            role,
        }: {
            workspaceId: string;
            email: string;
            role?: string;
        }) =>
            api.addMemberToWorksapce(workspaceId, email, role),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.members(variables.workspaceId),
            });

            queryClient.invalidateQueries({
                queryKey: workspaceKeys.one(variables.workspaceId),
            });

            toast.success("Member added successfully");
        },

        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useGetWorkspaceMembers = (
    workspaceId: string,
    params: WorkspaceListParams
) => {
    return useQuery({
        queryKey: workspaceKeys.memberList(workspaceId, params),
        queryFn: () => api.getWorkspaceMembers(workspaceId, params),
        enabled: !!workspaceId,
        placeholderData: keepPreviousData,
    });
};

export const useDeleteWorkspaceMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workspaceId,
            memberId,
        }: {
            workspaceId: string;
            memberId: string;
        }) =>
            api.deleteWorkspaceMember(workspaceId, memberId),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.members(variables.workspaceId),
            });

            queryClient.invalidateQueries({
                queryKey: workspaceKeys.one(variables.workspaceId),
            });

            toast.success("Workspace member deleted");
        },

        onError: (e) => toast.error(getErrorMessage(e)),
    });
};

export const useLeaveWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId: string) =>
            api.leaveWorkspace(workspaceId),

        onSuccess: (_, workspaceId) => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.one(workspaceId),
            });

            queryClient.invalidateQueries({
                queryKey: workspaceKeys.all,
            });

            toast.success("You left the workspace");
        },

        onError: (e) => toast.error(getErrorMessage(e)),
    });
};
