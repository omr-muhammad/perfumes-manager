import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AuthLayout } from "./features/Auth/AuthLayout";
import { AuthNavigator } from "./features/Auth/AuthNavigator";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <h1>There's no war in Ba Sing Se.</h1>,
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
