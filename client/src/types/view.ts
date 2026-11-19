// Minimal "view" shapes the UI reads. Adjust field names to match your API responses.
export interface WorkspaceItem {
    id: string;
    name: string;
    role?: string;
    membersCount?: number;
    roomsCount?: number;
    updatedAt?: string;
    createdAt?: string;
}

export interface RoomItem {
    id: string;
    name: string;
    language?: string;
    visibility?: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface MemberItem {
    id: string;
    role?: string;
    name?: string;
    email?: string;
    user?: { id?: string; name?: string; email?: string };
}