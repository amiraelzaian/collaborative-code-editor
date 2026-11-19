import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useCreateRoom } from "../../hooks/useRooms";
import type { CreateRoomInput } from "../../types/room";

interface Props {
    open: boolean;
    workspaceId: string;
    onClose: () => void;
}

const LANGUAGES = ["typescript", "javascript", "python", "go", "java", "cpp", "html", "css"];

export default function CreateRoomModal({ open, workspaceId, onClose }: Props) {
    const [name, setName] = useState("");
    const [language, setLanguage] = useState("typescript");
    const create = useCreateRoom();

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        // Adjust fields to match your CreateRoomInput type.
        const data = { name: name.trim(), language } as unknown as CreateRoomInput;
        create.mutate(
            { workspaceId, data },
            {
                onSuccess: () => {
                    setName("");
                    onClose();
                },
            },
        );
    };

    return (
        <Modal open={open} onClose={onClose} title="Create room">
            <form onSubmit={submit} className="space-y-5">
                <Input
                    id="room-name"
                    label="Room name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="auth-refactor"
                    autoFocus
                />
                <div className="space-y-1.5">
                    <label htmlFor="room-lang" className="block text-sm text-zinc-300">
                        Language
                    </label>
                    <select
                        id="room-lang"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                </div>
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