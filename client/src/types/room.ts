export type Visibility = "PRIVATE" | "WORKSPACE";

export type Room = {
    id: string;
    workspaceId: string;
    name: string;
    language: string;
    visibility: Visibility;
    createdById: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateRoomInput = {
    name: string;
    language?: string;
    visibility?: Visibility;
};
export type UpdateRoomInput = Partial<CreateRoomInput>;

export type RoomListParams = {
    page?: number;
    limit?: number;
    search?: string;
    language?: string;
    visibility?: Visibility;
    mine?: "true" | "false";
    sort?: "newest" | "oldest" | "name";
};