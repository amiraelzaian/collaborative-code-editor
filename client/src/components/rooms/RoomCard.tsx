import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { timeAgo } from "../../lib/normalize";
import type { RoomItem } from "../../types/view";

interface Props {
    workspaceId: string;
    room: RoomItem;
    onDelete: (roomId: string) => void;
    deleting?: boolean;
}

export default function RoomCard({ workspaceId, room, onDelete, deleting }: Props) {
    
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <Link to={`/workspaces/${workspaceId}/rooms/${room.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium text-zinc-100">{room.name}</h3>
                    {room.language && <Badge tone="green">{room.language}</Badge>}
                    {room.visibility && <Badge>{room.visibility}</Badge>}
                </div>
                {room.updatedAt && (
                    <p className="mt-1 text-xs text-zinc-500">Updated {timeAgo(room.updatedAt)}</p>
                )}
            </Link>
            <div className="flex gap-2">
                <Link
                    to={`/workspaces/${workspaceId}/rooms/${room.id}`}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
                >
                    Open
                </Link>
                <Button
                    variant="ghost"
                    disabled={deleting}
                    onClick={() => {
                        if (confirm(`Delete room "${room.name}"?`)) onDelete(room.id);
                    }}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}