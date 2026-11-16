import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LandingPage from "../pages/LandingPage";
import ProtectedRoutes from "./ProtectedRoute";






export default function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
              <Route index element={<LandingPage/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/register" element ={<RegisterPage/>}/>
              <Route element={<ProtectedRoutes/>} >
                <Route path="/workspaces">
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        
        </BrowserRouter>
    )

}






