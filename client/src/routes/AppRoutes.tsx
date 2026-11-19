import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import JoinPage from "../pages/JoinPage";
import NotFoundPage from "../pages/NotFoundPage";
import WorkspacesPage from "../pages/WorkspacesPage";
import WorkspacePage from "../pages/WorkspacePage";
import RoomPage from "../pages/RoomPage";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoutes from "./ProtectedRoute";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoutes />}>
                    <Route path="/join/:token" element={<JoinPage />} />
                    <Route element={<AppLayout />}>
                        <Route path="/workspaces" element={<WorkspacesPage />} />
                        <Route path="/workspaces/:workspaceId" element={<WorkspacePage />} />
                        <Route
                            path="/workspaces/:workspaceId/rooms/:roomId"
                            element={<RoomPage />}
                        />
                    </Route>
                </Route>

                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </BrowserRouter>
    );
}