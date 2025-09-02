import App from "@/App";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import BudgetTracker from "@/pages/dashboard/BudgetTracker";
import QuestionGenerator from "@/pages/dashboard/QuestionGenerator";
import ScheduleTracker from "@/pages/dashboard/Schedule";
import StudyPlanner from "@/pages/dashboard/StudyPlanner";
import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
       {
        index: true,
        element: <Navigate to="/schedule" replace />,
      },
      {
        path: "/schedule",
        Component: ScheduleTracker,
      },
      {
        path:'budget',
        Component:BudgetTracker
      },
      {
        path:"question",
        Component:QuestionGenerator
      },
      {
        path:'planner',
        Component:StudyPlanner
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
