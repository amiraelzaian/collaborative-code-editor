import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

export default function Topbar() {
    const auth = useAuth();
    const navigate = useNavigate();
    const user = auth.user as { name?: string; email?: string } | null | undefined;
    const logout = (auth as { logout?: () => void | Promise<void> }).logout;

    const handleLogout = async () => {
        await logout?.();
        navigate("/login", { replace: true });
    };

    return (
        <header className="flex h-14 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-5">
            <span className="text-sm text-zinc-400">Collaborative code editor</span>
            <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                    <p className="text-sm text-zinc-100">{user?.name}</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                </div>
                <Avatar name={user?.name} />
                {logout && (
                    <Button variant="ghost" onClick={handleLogout}>
                        Log out
                    </Button>
                )}
            </div>
        </header>
    );
}