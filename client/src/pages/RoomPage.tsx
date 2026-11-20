import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import CodeEditor from "../components/editor/CodeEditor";
import { useAuth } from "../hooks/useAuth";
import { useWorkspace } from "../hooks/useWorkspace";
import { useUpdateRoom, useWorkspaceRoom } from "../hooks/useRooms";
import { useCreateInvite } from "../hooks/useInvite";
import { usePresence } from "../hooks/usePresence"; // NEW

const copyText = (text: string) =>
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.success("Link copied"))
    .catch(() => toast.error("Couldn't copy, please copy the link manually"));

export default function RoomPage() {
  const { workspaceId = "", roomId = "" } = useParams();
  const { user } = useAuth();
  const workspace = useWorkspace(workspaceId).data;
  const { data: room, isLoading, isError } = useWorkspaceRoom(workspaceId, roomId);
  const invite = useCreateInvite();
  const updateRoom = useUpdateRoom();
  const onlineUsers = usePresence(workspaceId, roomId); 
  const [link, setLink] = useState("");

  if (isLoading) return <Spinner />;
  if (isError || !room) {
    return (
      <EmptyState
        title="Room not found"
        action={<Link to={`/workspaces/${workspaceId}`}>Back to workspace</Link>}
      />
    );
  }

  // same rule as the server's requireRoomAccess("manage")
  const myRole = workspace?.myRole ?? (workspace?.ownerId === user?.id ? "OWNER" : "MEMBER");
  const canManage = myRole === "OWNER" || myRole === "ADMIN" || room.createdById === user?.id;
  const isShared = room.visibility === "WORKSPACE";

  const toggleVisibility = () =>
    updateRoom.mutate({
      workspaceId,
      roomId,
      data: { visibility: isShared ? "PRIVATE" : "WORKSPACE" },
    });

  const createLink = () =>
    invite.mutate(
      { workspaceId, roomId },
      {
        onSuccess: ({ token }) => {
          const url = `${window.location.origin}/join/${token}`;
          setLink(url);
          copyText(url);
        },
      },
    );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={`/workspaces/${workspaceId}`} className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Back
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold">{room.name}</h1>
            {room.language && <Badge tone="green">{room.language}</Badge>}
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <Button
              onClick={createLink}
              loading={invite.isPending}
              disabled={!isShared}
              title={isShared ? undefined : "Make the room shared with the workspace to invite people"}
            >
              Share invite
            </Button>
            <Button variant="secondary" onClick={toggleVisibility} loading={updateRoom.isPending}>
              {isShared ? "Make private" : "Share with workspace"}
            </Button>
          </div>
        )}
      </div>


      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
        <span>Online now:</span>
        {onlineUsers.map((u) => (
          <Badge key={u.id} tone="green">
            {u.id === user?.id ? "You" : u.name}
          </Badge>
        ))}
      </div>

      {link && (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
          <code className="flex-1 truncate text-indigo-300">{link}</code>
          <Button variant="secondary" onClick={() => copyText(link)}>
            Copy
          </Button>
        </div>
      )}

      <CodeEditor  roomId={roomId} language={room.language} />
    </div>
  );
}