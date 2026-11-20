import type { ReactNode } from "react";

interface Props {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 px-6 py-14 text-center">
            <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-zinc-400">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}