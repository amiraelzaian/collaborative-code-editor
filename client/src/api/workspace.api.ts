import type { Paginated } from "../types/api"
import type { Workspace, WorkspaceListParams } from "../types/workspace"
import { api } from "./client"

export const createWorkspace = async (name: string) =>
    (await api.post<{ data: Workspace }>("/workspaces", { name })).data

export const getWorkspace = async (id: string) =>
    (await api.get<{ data: Workspace }>(`/workspaces/${id}`)).data;

export const listWorkspaces = async (params: WorkspaceListParams) =>
    (await api.get<Paginated<Workspace>>("/workspaces", { params })).data

export const updateWorkspaceName = async (id: string, name: string) =>
    (await api.patch<{ data: Workspace }>(`/workspaces/${id}`, { name })).data

export const deleteWorkspace = async (id: string) =>
    await api.delete(`/workspaces/${id}`)

export const addMemberToWorksapce = async (id: string, email: string, role: string = "MEMBER") =>
    (await api.post(`/workspaces/${id}/members`, { email, role })).data

export const getWorkspaceMembers = async (id: string, params: WorkspaceListParams) =>
    (await api.get(`/workspaces/${id}/members`, { params })).data

export const deleteWorkspaceMember = async (workspaceId: string, memberId: string) =>
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)

export const leaveWorkspace = async (id: string) =>
    await api.delete(`/workspaces/${id}/members/leave`)