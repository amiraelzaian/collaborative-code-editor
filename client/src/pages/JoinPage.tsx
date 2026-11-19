import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { useJoinRoom } from "../hooks/useInvite";

export default function JoinPage() {
    const { token = "" } = useParams();
    const navigate = useNavigate();
    const join = useJoinRoom();

    const handleJoin = () => {
        // Adjust the payload to match api.joinRoom's parameter type.
        join.mutate(token as Parameters<typeof join.mutate>[0], {
            onSuccess: (res) => {
                const r = res as { workspaceId?: string; roomId?: string } | undefined;
                navigate(
                    r?.workspaceId && r?.roomId
                        ? `/workspaces/${r.workspaceId}/rooms/${r.roomId}`
                        : "/workspaces",
                    { replace: true },
                );
            },
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-100">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center shadow-xl">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-xl text-indigo-300">
                    {"</>"}
                </div>

                <p className="text-xs font-medium uppercase tracking-widest text-indigo-300">
                    CodeSync collaborative
                </p>
                <h1 className="mt-2 text-2xl font-semibold">You're invited to collaborate</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Join this room to code together in real time.
                </p>

                <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Invite code</p>
                    <p className="mt-1 truncate font-mono text-sm text-zinc-200">{token}</p>
                </div>

                {join.isError && (
                    <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                        This invite is invalid or has expired.
                    </p>
                )}

                <div className="mt-6 space-y-3">
                    <Button
                        className="w-full"
                        onClick={handleJoin}
                        loading={join.isPending}
                        disabled={!token}
                    >
                        Join room
                    </Button>
                    <Link
                        to="/workspaces"
                        className="block text-sm text-zinc-400 hover:text-zinc-200"
                    >
                        Decline invitation
                    </Link>
                </div>
            </div>
        </div>
    );
}