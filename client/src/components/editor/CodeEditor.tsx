import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as MonacoNS from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { useAuth } from "../../hooks/useAuth";
import { useYjsRoom } from "../../hooks/useYjsRoom";
import Spinner from "../ui/Spinner";

interface Props {
  roomId: string;
  language?: string;
}

export default function CodeEditor({ roomId, language = "typescript" }: Props) {
  const { user } = useAuth();
  const { doc, awareness, status, peers, editors } = useYjsRoom(roomId, {
    id: user?.id ?? "anon",
    name: user?.name ?? "Anonymous",
  });
  const editorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const bind = () => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!editor || !model || !doc || !awareness) return;
    bindingRef.current?.destroy();
    bindingRef.current = new MonacoBinding(
      doc.getText("code"),
      model,
      new Set([editor]),
      awareness, // this is what draws the other people's cursors
    );
  };

  useEffect(() => {
    bind();
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, awareness]);

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
    bind();
  };

  if (!doc) return <Spinner label="Loading code…" />;

  const names = editors.map((p) => p.name).join(", ");

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      {/* y-monaco only gives each cursor a class per client id; we color + label them here */}
 <style>
  {peers
    .map(
      (p, i) => `
    .yRemoteSelection-${p.clientId} { background-color: ${p.color}33; }
    .yRemoteSelectionHead-${p.clientId} {
      position: absolute;
      border-left: 2px solid ${p.color};
      height: 100%;
      box-sizing: border-box;
    }
    .yRemoteSelectionHead-${p.clientId}::after {
      content: "${p.name.replace(/["\\\n]/g, "")}";
      position: absolute;
      top: calc(-1.5em - ${i * 1.6}em);
      left: -2px;
      padding: 0 5px;
      font-size: 11px;
      line-height: 1.5;
      color: #000;
      background: ${p.color};
      border-radius: 3px;
      white-space: nowrap;
      z-index: 10;
    }`,
    )
    .join("\n")}
</style>

      <Editor
        height="70vh"
        theme="vs-dark"
        language={language}
        onMount={onMount}
        options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
      />

      <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-500">
        <span>{language}</span>
        <span className="text-indigo-300">
          {editors.length > 0 ? `${names} ${editors.length > 1 ? "are" : "is"} editing…` : ""}
        </span>
        <span>{status === "synced" ? "Live" : "Connecting…"}</span>
      </div>
    </div>
  );
}
