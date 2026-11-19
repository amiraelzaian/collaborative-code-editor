
export function toList<T = unknown>(res: unknown): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res && typeof res === 'object') {
        const r = res as Record<string, unknown>;
        for (const key of ['data', 'items', 'results', 'workspaces', 'rooms', 'members']) {
            if (Array.isArray(r[key])) return r[key] as T[]
        }
    }
    return []
}

export function initials(name?: string) {
    if (!name) return "?";
    return name
        .split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("")

}

export function timeAgo(date?: string) {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`
}