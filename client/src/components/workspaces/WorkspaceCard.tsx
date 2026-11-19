import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import { timeAgo } from "../../lib/normalize";
import type { WorkspaceItem } from "../../types/view";

export default function WorkspaceCard({ workspace }: { workspace: WorkspaceItem }) {
    return (
        <Link
            to={`/workspaces/${workspace.id}`}
            className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-indigo-500/60"
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-semibold text-zinc-100">{workspace.name}</h3>
                {workspace.role && <Badge tone="indigo">{workspace.role}</Badge>}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-zinc-400">
                {workspace.roomsCount !== undefined && <span>{workspace.roomsCount} rooms</span>}
                {workspace.membersCount !== undefined && <span>{workspace.membersCount} members</span>}
            </div>
            {workspace.updatedAt && (
                <p className="mt-3 text-xs text-zinc-500">Updated {timeAgo(workspace.updatedAt)}</p>
            )}
        </Link>
    );
}