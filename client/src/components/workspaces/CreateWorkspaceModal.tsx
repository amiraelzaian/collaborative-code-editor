import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useCreateWorkspace } from "../../hooks/useWorkspace";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CreateWorkspaceModal({ open, onClose }: Props) {
    const [name, setName] = useState("");
    const create = useCreateWorkspace();

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        // Adjust the payload to match api.createWorkspace's parameter type.
        create.mutate(name , {
            onSuccess: () => {
                setName("");
                onClose();
            },
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Create workspace">
            <form onSubmit={submit} className="space-y-5">
                <Input
                    id="ws-name"
                    label="Workspace name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Engineering"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={create.isPending}>
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    );
}