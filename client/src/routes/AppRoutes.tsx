import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LandingPage from "../pages/LandingPage";






export default function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
              <Route index element={<LandingPage/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/register" element ={<RegisterPage/>}/>


            </Routes>
        
        </BrowserRouter>
    )

}






