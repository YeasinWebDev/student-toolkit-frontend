import App from "@/App";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>
    },
    {
        path:'/signin',
        Component:SignIn
    },
    {
        path:'/signup',
        Component:SignUp
    }
])