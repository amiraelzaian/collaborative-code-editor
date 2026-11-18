import type { Paginated } from "../types/api";
import type {
    MemberListParams,
    MemberRole,
    Workspace,
    WorkspaceListParams,
    WorkspaceMember,
} from "../types/workspace";
import { api } from "./client";

export const createWorkspace = async (name: string) =>
    (await api.post<{ data: Workspace }>("/workspaces", { name })).data.data;

export const getWorkspace = async (id: string) =>
    (await api.get<{ data: Workspace }>(`/workspaces/${id}`)).data.data;

export const listWorkspaces = async (params: WorkspaceListParams) =>
    (await api.get<Paginated<Workspace>>("/workspaces", { params })).data;

export const updateWorkspaceName = async (id: string, name: string) =>
    (await api.patch<{ data: Workspace }>(`/workspaces/${id}`, { name })).data.data;

export const deleteWorkspace = async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`);
};

export const addMemberToWorkspace = async (id: string, email: string, role: MemberRole = "MEMBER") =>
    (await api.post<{ data: WorkspaceMember }>(`/workspaces/${id}/members`, { email, role })).data.data;

export const getWorkspaceMembers = async (id: string, params: MemberListParams) =>
    (await api.get<Paginated<WorkspaceMember>>(`/workspaces/${id}/members`, { params })).data;

export const deleteWorkspaceMember = async (workspaceId: string, memberId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
};

export const leaveWorkspace = async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}/members/leave`);
};