import { initials } from "../../lib/normalize";

interface Props {
    name?: string;
    size?: "sm" | "md";
}

export default function Avatar({ name, size = "md" }: Props) {
    const dim = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
    return (
        <span
            title={name}
            className={`inline-flex ${dim} items-center justify-center rounded-full bg-indigo-500/20 font-semibold text-indigo-300`}
        >
            {initials(name)}
        </span>
    );
}