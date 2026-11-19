
export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type MemberRole = "ADMIN" | "MEMBER";
export type Workspace = {
    id: string;
    name: string;
    ownerId: string;
    createAt: string;
    updatedAt: string;
    myRole?: WorkspaceRole;
}

export type WorkspaceListParams = {
    page?: number;
    limit?: number;
    search?: string
    role?: WorkspaceRole;
    sort?: "newest" | "oldest" | "name";
}


export type WorkspaceMember = {
    id: string;
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    joinedAt: string;
    user: { id: string; name: string; email: string };
};

export type MemberListParams = {
    page?: number;
    limit?: number;
    search?: string;
    role?: WorkspaceRole;
};