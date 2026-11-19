import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const link = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            isActive ? "bg-indigo-500/15 text-indigo-300" : "text-zinc-400 hover:bg-zinc-900"
        }`;

    return (
        <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 p-4 md:flex">
            <div className="mb-8 flex items-center gap-2 px-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500 text-sm font-bold text-white">
                    C
                </span>
                <span className="font-semibold text-zinc-100">CodeSync</span>
            </div>
            <nav className="space-y-1">
                <NavLink to="/workspaces" className={link}>
                    Workspaces
                </NavLink>
            </nav>
        </aside>
    );
}