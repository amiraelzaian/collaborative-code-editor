import { useState } from "react";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptySate";
import Spinner from "../components/ui/Spinner";
import WorkspaceCard from "../components/workspaces/WorkspaceCard";
import WorkspaceFilters from "../components/workspaces/WorkspaceFilters";
import CreateWorkspaceModal from "../components/workspaces/CreateWorkspaceModal";
import { useWorkspaces } from "../hooks/useWorkspace";
import { useDebounce } from "../hooks/useDebounce";
import { toList } from "../lib/normalize";
import type { WorkspaceListParams } from "../types/workspace";
import type { WorkspaceItem } from "../types/view";

export default function WorkspacesPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const debouncedSearch = useDebounce(search, 400);

    // Adjust param names to match WorkspaceListParams.
    const params = { search: debouncedSearch, page: 1, limit: 20 } as unknown as WorkspaceListParams;
    const { data, isLoading, isError } = useWorkspaces(params);
    const workspaces = toList<WorkspaceItem>(data);

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Your workspaces</h1>
                    <p className="text-sm text-zinc-400">Shared environments for your team.</p>
                </div>
                <Button onClick={() => setOpen(true)}>New workspace</Button>
            </div>

            <WorkspaceFilters search={search} onSearchChange={setSearch} />

            {isLoading ? (
                <Spinner />
            ) : isError ? (
                <EmptyState title="Couldn't load workspaces" description="Please try again." />
            ) : workspaces.length === 0 ? (
                <EmptyState
                    title="No workspaces found"
                    description="Create your first workspace to get started."
                    action={<Button onClick={() => setOpen(true)}>Create workspace</Button>}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((w) => (
                        <WorkspaceCard key={w.id} workspace={w} />
                    ))}
                </div>
            )}

            <CreateWorkspaceModal open={open} onClose={() => setOpen(false)} />
        </div>
    );
}