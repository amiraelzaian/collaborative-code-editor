import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <p className="p-8">Loading session...</p>;

  return (
    <div className="space-y-4 p-8">
      <p>{user ? `Signed in as ${user.name} (${user.email})` : "Signed out"}</p>
      {user ? (
        <button className="rounded bg-red-600 px-4 py-2 text-white" onClick={logout}>
          Logout
        </button>
      ) : (
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white"
          onClick={() => login("user1@example.com", "pass123")}
        >
          Login
        </button>
      )}
    </div>
  );
}