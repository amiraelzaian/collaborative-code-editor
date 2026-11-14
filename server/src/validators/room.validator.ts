import { z } from "zod";

export const LANGUAGES = [
    "javascript", "typescript", "python", "java", "c", "cpp",
    "csharp", "go", "rust", "html", "css", "json", "sql",
] as const;

const fields = {
    name: z.string().trim().min(3, "Room name is too short").max(60),
    visibility: z.enum(["PRIVATE", "WORKSPACE"]),
    language: z.enum(LANGUAGES),
};

export const createRoomSchema = z.object({
    name: fields.name,
    visibility: fields.visibility.default("PRIVATE"),
    language: fields.language.default("javascript"),
});

export const updateRoomSchema = z
    .object({
        name: fields.name.optional(),
        visibility: fields.visibility.optional(),
        language: fields.language.optional(),
    })
    .refine((d) => Object.values(d).some((v) => v !== undefined), {
        message: "Provide at least one field to update",
    });

export const roomIdSchema = z.object({ roomId: z.uuid() });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomIdInput = z.infer<typeof roomIdSchema>;