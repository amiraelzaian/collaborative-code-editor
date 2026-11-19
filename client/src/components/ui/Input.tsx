import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
    ({ label, error, className = "", id, ...rest }, ref) => (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm text-zinc-300">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                className={`w-full rounded-lg border bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-500 ${
                    error ? "border-red-500" : "border-zinc-800"
                } ${className}`}
                {...rest}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    ),
);

Input.displayName = "Input";
export default Input;