import { createBrowserRouter, Link } from "react-router";

import { AuthLayout } from "./features/Auth/components/AuthLayout";
import { AuthNavigator } from "./features/Auth/components/AuthNavigator";
import { Login } from "./features/Auth/components/Login";
import { Signup } from "./features/Auth/components/Signup";
import { AppLayout } from "./ui/AppLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Perfumes } from "./features/perfumes/Perfumes";
import { Companies } from "./features/Companies/Companies";
import { Compounds } from "./features/Compounds/Compounds";
import { Shops } from "./features/Shops/Shops";
import { Settings } from "./features/Settings/Settings";
import { UpdateUser } from "./features/users/UpdateUser";
import { UpdateUserPassword } from "./features/users/UpdateUserPassword";

import { authLoader } from "./features/Auth/loaders";
import { loadNs } from "./i18/loadNs";

export const router = createBrowserRouter([
  // /dashboard
  {
    path: "/dashboard",
    loader: authLoader,
    ErrorBoundary: () => (
      <h1>
        Error here <Link to="/dashboard">Back</Link>
      </h1>
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          {
            path: "perfumes",
            loader: loadNs("perfumes"),
            element: <Perfumes />,
          },
          { path: "companies", element: <Companies /> },
          {
            path: "compounds",
            loader: loadNs("compounds", "countries"),
            element: <Compounds />,
          },
          { path: "settings", element: <Settings /> },
          {
            path: "profile",
            element: (
              <>
                <UpdateUser /> <UpdateUserPassword />
              </>
            ),
          },
        ],
      },
      {
        path: "shops",
        element: <AppLayout whichNav="shops" />,
        children: [
          { index: true, element: <Shops /> },
          { path: "shop-compounds", element: <h1>Shop Compounds</h1> },
          { path: "staff", element: <h1>Staff</h1> },
        ],
      },
    ],
  },

  // /auth
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AuthNavigator />,
      },
      {
        path: "login",
        element: <Login />,
        handle: {
          title: "Log in to your account",
          subtitle: "Welcome back — enter your details to continue.",
        },
      },
      {
        path: "signup",
        element: <Signup />,
        handle: {
          title: "Create your account",
          subtitle: "Set up your shop's account to get started.",
        },
      },
    ],
  },
]);
