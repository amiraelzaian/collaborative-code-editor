import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptySate";
import Spinner from "../components/ui/Spinner";
import RoomCard from "../components/rooms/RoomCard";
import CreateRoomModal from "../components/rooms/CreateRoomModal";
import MembersPanel from "../components/workspaces/MembersPanel";
import WorkspaceFilters from "../components/workspaces/WorkspaceFilters";
import { useWorkspace, useDeleteWorkspace, useLeaveWorkspace } from "../hooks/useWorkspace";
import { useWorkspaceRooms, useDeleteRoom } from "../hooks/useRooms";
import { useDebounce } from "../hooks/useDebounce";
import { toList } from "../lib/normalize";
import type { RoomListParams } from "../types/room";
import type { RoomItem, WorkspaceItem } from "../types/view";

type Tab = "rooms" | "members";

export default function WorkspacePage() {
    const { workspaceId = "" } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>("rooms");
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const debounced = useDebounce(search, 400);

    const { data: wsData, isLoading } = useWorkspace(workspaceId);
    const workspace = wsData as WorkspaceItem | undefined;

    const roomParams = { search: debounced, page: 1, limit: 50 } as unknown as RoomListParams;
    const { data: roomsData, isLoading: roomsLoading } = useWorkspaceRooms(workspaceId, roomParams);
    const rooms = toList<RoomItem>(roomsData);

    const deleteRoom = useDeleteRoom();
    const deleteWorkspace = useDeleteWorkspace();
    const leaveWorkspace = useLeaveWorkspace();

    if (isLoading) return <Spinner />;
    if (!workspace)
        return <EmptyState title="Workspace not found" action={<Link to="/workspaces">Back</Link>} />;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Link to="/workspaces" className="text-sm text-zinc-400 hover:text-zinc-200">
                    ← Workspaces
                </Link>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold">{workspace.name}</h1>
                    <div className="flex gap-2">
                        <Button onClick={() => setCreateOpen(true)}>New room</Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (confirm("Leave this workspace?"))
                                    leaveWorkspace.mutate(workspaceId, {
                                        onSuccess: () => navigate("/workspaces"),
                                    });
                            }}
                        >
                            Leave
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                if (confirm("Delete this workspace and all its rooms?"))
                                    deleteWorkspace.mutate(workspaceId, {
                                        onSuccess: () => navigate("/workspaces"),
                                    });
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex gap-1 border-b border-zinc-900">
                {(["rooms", "members"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`border-b-2 px-4 py-2 text-sm capitalize ${
                            tab === t
                                ? "border-indigo-500 text-zinc-100"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "rooms" ? (
                <div className="space-y-4">
                    <WorkspaceFilters
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Filter rooms…"
                    />
                    {roomsLoading ? (
                        <Spinner />
                    ) : rooms.length === 0 ? (
                        <EmptyState
                            title="No rooms yet"
                            description="Create a room to start coding together."
                            action={<Button onClick={() => setCreateOpen(true)}>Create room</Button>}
                        />
                    ) : (
                        <div className="space-y-3">
                            {rooms.map((r) => (
                                <RoomCard
                                    key={r.id}
                                    workspaceId={workspaceId}
                                    room={r}
                                    deleting={deleteRoom.isPending}
                                    onDelete={(roomId) => deleteRoom.mutate({ workspaceId, roomId })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <MembersPanel workspaceId={workspaceId} />
            )}

            <CreateRoomModal
                open={createOpen}
                workspaceId={workspaceId}
                onClose={() => setCreateOpen(false)}
            />
        </div>
    );
}