import { useLocation } from "react-router-dom";

export function useRedirectTarget(fallback = '/workspaces') {
    const location = useLocation();
    const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from
    return from?.pathname ? `${from.pathname}${from.search ?? ""}` : fallback
}