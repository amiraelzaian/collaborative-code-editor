import { useState } from "react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptySate";
import Spinner from "../ui/Spinner";
import AddMemberModal from "./AddMemberModal";
import { useGetWorkspaceMembers, useDeleteWorkspaceMember } from "../../hooks/useWorkspace";
import { toList } from "../../lib/normalize";
import type { MemberListParams } from "../../types/workspace";
import type { MemberItem } from "../../types/view";

export default function MembersPanel({ workspaceId }: { workspaceId: string }) {
    const [open, setOpen] = useState(false);
    const params = { page: 1, limit: 50 } as unknown as MemberListParams;
    const { data, isLoading } = useGetWorkspaceMembers(workspaceId, params);
    const remove = useDeleteWorkspaceMember();
    const members = toList<MemberItem>(data);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Members</h2>
                <Button onClick={() => setOpen(true)}>Add member</Button>
            </div>

            {isLoading ? (
                <Spinner />
            ) : members.length === 0 ? (
                <EmptyState title="No members yet" description="Invite teammates by email." />
            ) : (
                <ul className="divide-y divide-zinc-900 rounded-xl border border-zinc-800">
                    {members.map((m) => {
                        const name = m.name ?? m.user?.name;
                        const email = m.email ?? m.user?.email;
                        return (
                            <li key={m.id} className="flex items-center justify-between gap-3 p-4">
                                <div className="flex items-center gap-3">
                                    <Avatar name={name ?? email} />
                                    <div>
                                        <p className="text-sm text-zinc-100">{name}</p>
                                        <p className="text-xs text-zinc-500">{email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {m.role && <Badge tone="indigo">{m.role}</Badge>}
                                    <Button
                                        variant="ghost"
                                        disabled={remove.isPending}
                                        onClick={() => {
                                            if (confirm("Remove this member?"))
                                                remove.mutate({ workspaceId, memberId: m.id });
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <AddMemberModal open={open} workspaceId={workspaceId} onClose={() => setOpen(false)} />
        </section>
    );
}