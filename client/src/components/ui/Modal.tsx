import { useEffect, type ReactNode } from "react";

interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-800"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}