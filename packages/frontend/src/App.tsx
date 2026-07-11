import { createBrowserRouter, Link } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AuthLayout } from "./features/Auth/AuthLayout";
import { AuthNavigator } from "./features/Auth/AuthNavigator";
import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./ui/AppLayout";
import { Dashboard } from "./features/Dashboard/Dashboard";
import { Companies } from "./features/Companies/Companies";
import { Perfumes } from "./features/Perfumes/Perfumes";
import { queryClient } from "./lib/queryClient";
import { authLoader } from "./features/Auth/loaders";
import { Compounds } from "./features/Compounds/Compounds";
import { Shops } from "./features/Shops/Shops";
import { Settings } from "./features/Settings/Settings";

const router = createBrowserRouter([
  {
    path: "/dashboard",
    loader: authLoader,
    ErrorBoundary: () => <h1>Error here <Link to="/dashboard">Back</Link></h1>,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "perfumes", element: <Perfumes /> },
          { path: "companies", element: <Companies /> },
          { path: "compounds", element: <Compounds /> },
          { path: "settings", element: <Settings /> },
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

export default function App() {
  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />

        <Toaster position="top-center" reverseOrder={false} />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Suspense>
  );
  // return <RouterProvider router={router} />;
}
