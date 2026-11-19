import Input from "../ui/Input";

interface Props {
    search: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
}

export default function WorkspaceFilters({
    search,
    onSearchChange,
    placeholder = "Search workspaces…",
}: Props) {
    return (
        <div className="max-w-sm">
            <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Search"
            />
        </div>
    );
}