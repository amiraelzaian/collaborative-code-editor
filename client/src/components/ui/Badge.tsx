import type { ReactNode } from "react";

type Tone = "neutral" | "indigo" | "green" | "amber" | "red";

const tones: Record<Tone, string> = {
    neutral: "bg-zinc-800 text-zinc-300",
    indigo: "bg-indigo-500/15 text-indigo-300",
    green: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
    red: "bg-red-500/15 text-red-300",
};

export default function Badge({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: Tone;
}) {
    return (
        <span
            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${tones[tone]}`}
        >
            {children}
        </span>
    );
}