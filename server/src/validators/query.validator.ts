import { z } from "zod"
import { LANGUAGES } from "./room.validator"
import { Visibility, WorkspaceRole } from "../generated/prisma/enums";

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10)
})

const search = z.string().trim().max(60).optional();
const sort = z.enum(['newest', 'oldest', 'name']).default('newest')


export const listWorkspacesQuerySchema = paginationSchema.extend({
    search,
    role: z.enum(WorkspaceRole).optional(),
    sort,
})

export const listRoomsQuerySchema = paginationSchema.extend({
    search,
    language: z.enum(LANGUAGES).optional(),
    visibility: z.enum(Visibility).optional(),
    mine: z.enum(['true', 'false']).optional(),// rooms i owned/ i created
    sort,
})

export const listMembersQuerySchema = paginationSchema.extend({
    search,
    role: z.enum(WorkspaceRole).optional()
})


export type ListWorkspacesQuery = z.infer<typeof listWorkspacesQuerySchema>
export type ListRoomsQuery = z.infer<typeof listRoomsQuerySchema>
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>


