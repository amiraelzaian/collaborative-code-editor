import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAddMemberToWorkspace } from "../../hooks/useWorkspace";
import type { MemberRole } from "../../types/workspace";

interface Props {
    open: boolean;
    workspaceId: string;
    onClose: () => void;
}

export default function AddMemberModal({ open, workspaceId, onClose }: Props) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const add = useAddMemberToWorkspace();

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        add.mutate(
            { workspaceId, email: email.trim(), role: role as MemberRole },
            {
                onSuccess: () => {
                    setEmail("");
                    onClose();
                },
            },
        );
    };

    return (
        <Modal open={open} onClose={onClose} title="Add member">
            <form onSubmit={submit} className="space-y-5">
                <Input
                    id="member-email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    autoFocus
                />
                <div className="space-y-1.5">
                    <label htmlFor="member-role" className="block text-sm text-zinc-300">
                        Role
                    </label>
                    <select
                        id="member-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                    >
                        {/* Align these values with your MemberRole type */}
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={add.isPending}>
                        Add
                    </Button>
                </div>
            </form>
        </Modal>
    );
}