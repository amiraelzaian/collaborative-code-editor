
export type workspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type Workspace = {
    id: string;
    name: string;
    ownerId: string;
    createAt: string;
    updatedAt: string;
    myRole?: workspaceRole;
}

export type WorkspaceListParams = {
    page?: number;
    limit?: number;
    search?: string;
    role?: workspaceRole;
    sort?: "newest" | "oldest" | "name";
}