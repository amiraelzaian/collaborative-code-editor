import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";



export default function ProtectedRoutes(){

 const {user}=useAuth()
// 1- not logged in --> login page

if(!user) return <Navigate to="/" replace/>

//3- allowed --> render the child routes

return <Outlet/>



}