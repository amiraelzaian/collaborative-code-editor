import { z } from "zod";

export const MAX_CODE_LENGTH = 200_000;

export const saveCodeSchema = z.object({
    content: z.string().max(MAX_CODE_LENGTH, "Code is too large"),
});

export type SaveCodeInput = z.infer<typeof saveCodeSchema>;