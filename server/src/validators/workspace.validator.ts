import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(3).max(60)
});

export const updateWorkspaceSchema = createWorkspaceSchema;

export const workspaceIdSchema = z.object({
    workspaceId: z.uuid(),
});

export const addMemberSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
export const removeMemberSchema = z.object({
    workspaceId: z.uuid(),
    memberId: z.uuid()
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;