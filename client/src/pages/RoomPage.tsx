import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptySate";
import Spinner from "../components/ui/Spinner";
import CodeEditor from "../components/editor/CodeEditor";
import { useUpdateRoom, useWorkspaceRoom } from "../hooks/useRooms";
import { useCreateInvite } from "../hooks/useInvite";
import type { RoomItem } from "../types/view";

export default function RoomPage() {
    const { workspaceId = "", roomId = "" } = useParams();
    const { data, isLoading } = useWorkspaceRoom(workspaceId, roomId);
    const invite = useCreateInvite();
    const [link, setLink] = useState("");
    const room = data as RoomItem | undefined;

    const{mutate:ChangeVisibiliy,isPending:isUpdating}= useUpdateRoom()

   const reverseVisibiliy=()=>{
      if(room?.visibility==="PRIVATE"){
         ChangeVisibiliy({workspaceId,roomId:room.id,data:{visibility:"WORKSPACE"}})
      }else{
         ChangeVisibiliy({workspaceId,roomId:room.id,data:{visibility:"PRIVATE"}})

      }


   }

    const createLink = () => {
        // Adjust the payload to match api.createInvite's parameter type.
        invite.mutate({ workspaceId, roomId } as Parameters<typeof invite.mutate>[0], {
            onSuccess: (res) => {
                const r = res as { token?: string; url?: string; inviteToken?: string };
                const token = r.token ?? r.inviteToken;
                const url = r.url ?? (token ? `${window.location.origin}/join/${token}` : "");
                if (!url) return toast.error("Invite response has no token");
                setLink(url);
                navigator.clipboard?.writeText(url).then(() => toast.success("Invite link copied"));
            },
        });
    };

    if (isLoading) return <Spinner />;
    if (!room)
        return (
            <EmptyState
                title="Room not found"
                action={<Link to={`/workspaces/${workspaceId}`}>Back to workspace</Link>}
            />
        );

    return (
        <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link
                        to={`/workspaces/${workspaceId}`}
                        className="text-sm text-zinc-400 hover:text-zinc-200"
                    >
                        ← Back
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                        <h1 className="text-xl font-semibold">{room.name}</h1>
                        {room.language && <Badge tone="green">{room.language}</Badge>}
                    </div>
                </div>
                <div className="flex flex-end gap-3">
                  <Button onClick={createLink} loading={invite.isPending}>
                    Share invite
                </Button>
                <Button onClick={reverseVisibiliy} loading={isUpdating} variant = "secondary">
                   {room.visibility==="WORKSPACE"?"change to private":"change to workspace"}
                </Button>
                </div>
            </div>

            {link && (
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
                    <code className="flex-1 truncate text-indigo-300">{link}</code>
                    <Button
                        variant="secondary"
                        onClick={() => navigator.clipboard?.writeText(link).then(() => toast.success("Copied"))}
                    >
                        Copy
                    </Button>
                </div>
            )}

            <CodeEditor workspaceId={workspaceId} roomId={roomId} language={room.language} />
        </div>
    );
}