import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-100">
            <p className="text-6xl font-bold text-indigo-400">404</p>
            <p className="text-zinc-400">This page doesn't exist.</p>
            <Link to="/" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white">
                Back home
            </Link>
        </div>
    );
}