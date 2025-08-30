import App from "@/App";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ScheduleTracker from "@/pages/dashboard/Schedule";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/schedule",
    element: <App />,
    children: [
      {
        index: true,
        path: "/schedule",
        Component: ScheduleTracker,
      },
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
