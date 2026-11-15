import { api, setAccessToken } from "./api/client";

export default function App() {
  const test = async () => {
    const login = await api.post("/auth/login", {
      email: "user2@example.com",
      password: "pass123",
    });
    setAccessToken(login.data.accessToken);
    console.log("me:", (await api.get("/auth/me")).data);
    console.log("workspaces:", (await api.get("/workspace")).data);
  };

  return (
    <button className="m-8 rounded bg-indigo-600 px-4 py-2 text-white" onClick={test}>
      Test API
    </button>
  );
} 