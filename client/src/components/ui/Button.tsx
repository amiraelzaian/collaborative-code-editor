import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    loading?: boolean;
}

const styles: Record<Variant, string> = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-400",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
    ghost: "text-zinc-300 hover:bg-zinc-800",
    danger: "bg-red-600 text-white hover:bg-red-500",
};

export default function Button({
    variant = "primary",
    loading,
    disabled,
    className = "",
    children,
    ...rest
}: Props) {
    return (
        <button
            disabled={disabled || loading}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
            {...rest}
        >
            {loading ? "Please wait…" : children}
        </button>
    );
}