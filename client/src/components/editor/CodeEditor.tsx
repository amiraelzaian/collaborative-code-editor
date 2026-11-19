import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useRoomCode, useSaveCode } from "../../hooks/useCode";
import { useDebounce } from "../../hooks/useDebounce";
import Spinner from "../ui/Spinner";

interface Props {
    workspaceId: string;
    roomId: string;
    language?: string;
}

export default function CodeEditor({ workspaceId, roomId, language = "typescript" }: Props) {
    const { data, isLoading } = useRoomCode(workspaceId, roomId);
    const save = useSaveCode();

    const [value, setValue] = useState("");
    const lastSaved = useRef<string>("");
    const hydrated = useRef(false);
    const debounced = useDebounce(value, 1500);

    // Load server content once.
    useEffect(() => {
        if (data && !hydrated.current) {
            const content = (data as { content?: string }).content ?? "";
            setValue(content);
            lastSaved.current = content;
            hydrated.current = true;
        }
    }, [data]);

    // Autosave after the user stops typing.
    useEffect(() => {
        if (!hydrated.current || debounced === lastSaved.current) return;
        lastSaved.current = debounced;
        save.mutate({ workspaceId, roomId, content: debounced } as Parameters<typeof save.mutate>[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);

    if (isLoading) return <Spinner label="Loading code…" />;

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
            <Editor
                height="70vh"
                theme="vs-dark"
                language={language}
                value={value}
                onChange={(v) => setValue(v ?? "")}
                options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
            />
            <div className="flex justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-500">
                <span>{language}</span>
                <span>{save.isPending ? "Saving…" : value === lastSaved.current ? "Saved" : "Unsaved changes"}</span>
            </div>
        </div>
    );
}