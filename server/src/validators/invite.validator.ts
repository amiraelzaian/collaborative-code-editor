

import { z } from "zod";

export const joinInviteSchema = z.object({
    token: z.string().min(20).max(200)
})