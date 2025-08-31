import App from "@/App";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import BudgetTracker from "@/pages/dashboard/BudgetTracker";
import ScheduleTracker from "@/pages/dashboard/Schedule";
import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
       {
        index: true, // when path is "/"
        element: <Navigate to="/schedule" replace />,
      },
      {
        path: "/schedule",
        Component: ScheduleTracker,
      },
      {
        path:'budget',
        Component:BudgetTracker
      }
    ],
  },
  {
    path: "/signin",
    Component: SignIn,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "*",
    Component: SignIn,
  }
]);
